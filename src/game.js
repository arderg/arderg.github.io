import { WordleSolver } from './solver.js';

// Game Constants
export const ROWS = 6;
export const COLS = 5;
export const LETTER_STATES = {
    CORRECT: 'correct',
    PRESENT: 'present',
    ABSENT: 'absent'
};

export class GameState {
    constructor() {
        this.answer = '';
        this.words = [];
        this.answers = [];
        this.currentRow = 0;
        this.currentCol = 0;
        this.history = [];
        this.solver = null;
        this.isGameActive = false;
        this.hardMode = false;
        this.keyboardState = {};
        this.bestGuesses = []; // Store best guesses for each move
        this.knownGreens = {}; // Track fixed green letters: {position: letter}
        this.requiredYellows = new Set(); // Track required yellow letters
    }

    initKeyboardState() {
        this.keyboardState = Object.fromEntries(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => [letter, null])
        );
    }

    updateKeyboardState(guess, feedback) {
        const guessArr = guess.toUpperCase().split('');
        
        // First, mark all letters in the guess as absent
        guessArr.forEach(letter => {
            if (this.keyboardState[letter] === null) {
                this.keyboardState[letter] = LETTER_STATES.ABSENT;
            }
        });
        
        // Then update with the actual feedback
        guessArr.forEach((letter, index) => {
            const currentState = this.keyboardState[letter];
            const newState = feedback[index];
            
            // Only upgrade the state (absent -> present -> correct)
            if (currentState === LETTER_STATES.ABSENT && newState !== LETTER_STATES.ABSENT) {
                this.keyboardState[letter] = newState;
            } else if (currentState === LETTER_STATES.PRESENT && newState === LETTER_STATES.CORRECT) {
                this.keyboardState[letter] = newState;
            }
        });
    }

    reset(hardMode = false) {
        // Batch state updates
        Object.assign(this, {
            currentRow: 0,
            currentCol: 0,
            history: [],
            bestGuesses: [],
            isGameActive: false,
            hardMode: hardMode,
            knownGreens: {},
            requiredYellows: new Set()
        });
        
        if (!this.solver) {
            throw new Error('Solver not initialized');
        }
        
        // Initialize solver and keyboard state in parallel
        Promise.all([
            new Promise(resolve => {
                this.solver.reset(hardMode);
                resolve();
            }),
            new Promise(resolve => {
                this.initKeyboardState();
                resolve();
            })
        ]).then(() => {
            if (this.currentRow === 0) {
                // Select answer and compute initial guesses in a separate task
                setTimeout(() => {
                    const randomIndex = Math.floor(Math.random() * this.answers.length);
                    this.answer = this.answers[randomIndex];
                    if (!this.answer) {
                        throw new Error('Failed to select a valid word');
                    }
                    
                    // Compute initial best guesses
                    const initialGuesses = this.solver.getTopGuesses();
                    if (!initialGuesses || initialGuesses.length === 0) {
                        throw new Error('Failed to compute initial guesses');
                    }
                    this.bestGuesses.push(initialGuesses);
                }, 0);
            }
        });
    }

    evaluateGuess(guess) {
        const answerArr = this.answer.split('');
        const guessArr = guess.split('');
        const result = Array(COLS).fill(LETTER_STATES.ABSENT);
        
        // Check for correct letters
        for (let i = 0; i < COLS; i++) {
            if (guessArr[i] === answerArr[i]) {
                result[i] = LETTER_STATES.CORRECT;
                answerArr[i] = null;
            }
        }
        
        // Check for present letters
        for (let i = 0; i < COLS; i++) {
            if (result[i] !== LETTER_STATES.CORRECT) {
                const idx = answerArr.indexOf(guessArr[i]);
                if (idx !== -1) {
                    result[i] = LETTER_STATES.PRESENT;
                    answerArr[idx] = null;
                }
            }
        }
        
        return result;
    }

    processGuess(guess) {
        if (!this.words.includes(guess)) {
            return { valid: false, error: 'Not in word list!' };
        }

        // Check hard mode constraints
        if (this.hardMode) {
            // Check green letters
            for (const [pos, letter] of Object.entries(this.knownGreens)) {
                if (guess[pos] !== letter) {
                    return { 
                        valid: false, 
                        error: `Hard mode: Letter ${letter} must be in position ${parseInt(pos) + 1}` 
                    };
                }
            }

            // Check yellow letters
            for (const letter of this.requiredYellows) {
                if (!guess.includes(letter)) {
                    return { 
                        valid: false, 
                        error: `Hard mode: Must use revealed letter ${letter}` 
                    };
                }
            }
        }

        const result = this.evaluateGuess(guess);
        
        // Update known hints for hard mode
        if (this.hardMode) {
            // Update green letters
            for (let i = 0; i < result.length; i++) {
                if (result[i] === LETTER_STATES.CORRECT) {
                    this.knownGreens[i] = guess[i];
                }
            }
            
            // Update yellow letters
            for (let i = 0; i < result.length; i++) {
                if (result[i] === LETTER_STATES.PRESENT) {
                    this.requiredYellows.add(guess[i]);
                }
            }
        }
        
        // Store current best guesses before updating solver state
        const currentBestGuesses = this.bestGuesses[this.currentRow] || [];
        
        this.solver.updateState(guess, result);
        
        this.history.push({
            guess: guess.toUpperCase(),
            result: result,
            remainingWords: this.solver.getRemainingWords(),
            bestGuesses: currentBestGuesses // Store the best guesses that were available for this move
        });
        
        // Compute and store best guesses for next move
        const nextBestGuesses = this.solver.getTopGuesses();
        if (nextBestGuesses && nextBestGuesses.length > 0) {
            this.bestGuesses.push(nextBestGuesses);
        }
        
        this.updateKeyboardState(guess, result);

        const isWin = guess === this.answer;
        const isGameOver = isWin || this.currentRow >= ROWS - 1;

        if (!isGameOver) {
            this.currentRow++;
            this.currentCol = 0;
        }

        return {
            valid: true,
            isWin,
            isGameOver,
            result
        };
    }

    isValidGuess(guess) {
        return this.words.includes(guess);
    }

    getCurrentGuess(row) {
        return Array.from(row.children)
            .map(cell => cell.textContent.toLowerCase())
            .join('');
    }

    // Helper method to evaluate if a guess was good
    evaluateGuessQuality(guess, bestGuesses) {
        if (!bestGuesses || bestGuesses.length === 0) return 'unknown';
        const guessLower = guess.toLowerCase();
        if (bestGuesses[0].toLowerCase() === guessLower) return 'optimal';
        if (bestGuesses.slice(0, 5).some(g => g.toLowerCase() === guessLower)) return 'good';
        return 'suboptimal';
    }
} 