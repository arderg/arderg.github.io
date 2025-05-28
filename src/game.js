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
    }

    initKeyboardState() {
        this.keyboardState = {};
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
            this.keyboardState[letter] = null;
        });
    }

    updateKeyboardState(guess, feedback) {
        const guessArr = guess.toUpperCase().split('');
        
        guessArr.forEach((letter, index) => {
            const currentState = this.keyboardState[letter];
            const newState = feedback[index];
            
            // Only upgrade the state (gray -> yellow -> green)
            if (currentState === null || 
                (currentState === LETTER_STATES.ABSENT && newState !== LETTER_STATES.ABSENT) ||
                (currentState === LETTER_STATES.PRESENT && newState === LETTER_STATES.CORRECT)) {
                this.keyboardState[letter] = newState;
            }
        });
    }

    reset(hardMode = false) {
        this.currentRow = 0;
        this.currentCol = 0;
        this.history = [];
        this.bestGuesses = []; // Reset best guesses
        this.isGameActive = false;
        this.hardMode = hardMode;
        
        if (!this.solver) {
            throw new Error('Solver not initialized');
        }
        
        this.solver.reset(hardMode);
        this.initKeyboardState();
        
        if (this.currentRow === 0) {
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
        }
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

        const result = this.evaluateGuess(guess);
        
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