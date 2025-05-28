import { getFeedbackPattern } from './feedbackUtils.js';
import { findBestGuess, scoreGuess } from './guessScorer.js';

/**
 * Solver class that handles word guessing logic consistently across the game
 */
export class WordleSolver {
    constructor(allWords, answerWords) {
        this.allWords = allWords;
        this.answerWords = answerWords;
        this.remainingCandidates = [...answerWords];
        this.guessHistory = [];
        this.hardMode = false;
    }

    /**
     * Reset the solver state for a new game
     * @param {boolean} hardMode - Whether hard mode is enabled
     */
    reset(hardMode = false) {
        this.remainingCandidates = [...this.answerWords];
        this.guessHistory = [];
        this.hardMode = hardMode;
    }

    /**
     * Update the solver state based on a guess and its feedback
     * @param {string} guess - The word that was guessed
     * @param {string[]} feedback - Array of feedback states ('correct', 'present', 'absent')
     */
    updateState(guess, feedback) {
        this.guessHistory.push({ guess, feedback });
        this.remainingCandidates = this.filterCandidates(guess, feedback);
    }

    /**
     * Filter candidates based on a guess and its feedback
     * @param {string} guess - The word that was guessed
     * @param {string[]} feedback - Array of feedback states
     * @returns {string[]} Filtered list of possible words
     */
    filterCandidates(guess, feedback) {
        return this.remainingCandidates.filter(word => {
            // First check if the word matches the current guess's feedback pattern
            const pattern = getFeedbackPattern(guess, word);
            const feedbackPattern = feedback.map(f => {
                switch(f) {
                    case 'correct': return 'g';
                    case 'present': return 'y';
                    case 'absent': return 'b';
                    default: return 'b';
                }
            }).join('');
            
            if (pattern !== feedbackPattern) {
                return false;
            }

            // If hard mode is enabled, check against all previous guesses
            if (this.hardMode) {
                // Skip the current guess as we've already checked it
                for (let i = 0; i < this.guessHistory.length - 1; i++) {
                    const { guess: prevGuess, feedback: prevFeedback } = this.guessHistory[i];
                    
                    // Check green letters (must be in same position)
                    for (let pos = 0; pos < prevGuess.length; pos++) {
                        if (prevFeedback[pos] === 'correct' && word[pos] !== prevGuess[pos]) {
                            return false;
                        }
                    }
                    
                    // Check yellow letters (must be present but not in same position)
                    for (let pos = 0; pos < prevGuess.length; pos++) {
                        if (prevFeedback[pos] === 'present') {
                            const letter = prevGuess[pos];
                            if (!word.includes(letter) || word[pos] === letter) {
                                return false;
                            }
                        }
                    }
                    
                    // Check gray letters (must not appear unless it was a duplicate)
                    for (let pos = 0; pos < prevGuess.length; pos++) {
                        if (prevFeedback[pos] === 'absent') {
                            const letter = prevGuess[pos];
                            // Count how many times this letter appears in the original guess
                            const letterCount = prevGuess.split('').filter(l => l === letter).length;
                            // Count how many times this letter appears in positions marked correct or present
                            const usedCount = prevGuess.split('').filter((l, i) => 
                                l === letter && (prevFeedback[i] === 'correct' || prevFeedback[i] === 'present')
                            ).length;
                            
                            // If all instances of this letter were used in correct/present positions,
                            // then it shouldn't appear in the word
                            if (usedCount === letterCount && word.includes(letter)) {
                                return false;
                            }
                        }
                    }
                }
            }
            
            return true;
        });
    }

    /**
     * Get the top N guesses based on current game state
     * @param {number} count - Number of top guesses to return (default: 5)
     * @returns {string[]} Array of top guesses, sorted by score
     */
    getTopGuesses(count = 5) {
        if (this.remainingCandidates.length === 0) {
            return [];
        }

        // If we have very few candidates, return them all
        if (this.remainingCandidates.length <= count) {
            return [...this.remainingCandidates];
        }

        // Filter out words that don't respect hard mode constraints
        const validGuesses = this.hardMode ? 
            this.allWords.filter(guess => {
                // Check against all previous guesses
                for (const { guess: prevGuess, feedback: prevFeedback } of this.guessHistory) {
                    // Check green letters (must be in same position)
                    for (let pos = 0; pos < prevGuess.length; pos++) {
                        if (prevFeedback[pos] === 'correct' && guess[pos] !== prevGuess[pos]) {
                            return false;
                        }
                    }
                    
                    // Check yellow letters (must be present but not in same position)
                    for (let pos = 0; pos < prevGuess.length; pos++) {
                        if (prevFeedback[pos] === 'present') {
                            const letter = prevGuess[pos];
                            if (!guess.includes(letter) || guess[pos] === letter) {
                                return false;
                            }
                        }
                    }
                    
                    // Check gray letters (must not appear unless it was a duplicate)
                    for (let pos = 0; pos < prevGuess.length; pos++) {
                        if (prevFeedback[pos] === 'absent') {
                            const letter = prevGuess[pos];
                            // Count how many times this letter appears in the original guess
                            const letterCount = prevGuess.split('').filter(l => l === letter).length;
                            // Count how many times this letter appears in positions marked correct or present
                            const usedCount = prevGuess.split('').filter((l, i) => 
                                l === letter && (prevFeedback[i] === 'correct' || prevFeedback[i] === 'present')
                            ).length;
                            
                            // If all instances of this letter were used in correct/present positions,
                            // then it shouldn't appear in the word
                            if (usedCount === letterCount && guess.includes(letter)) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }) :
            this.allWords;

        // Score all possible guesses
        const scoredGuesses = validGuesses.map(guess => ({
            word: guess,
            score: scoreGuess(guess, this.remainingCandidates)
        }));

        // Sort by score (lower is better) and take top N
        return scoredGuesses
            .sort((a, b) => a.score - b.score)
            .slice(0, count)
            .map(g => g.word);
    }

    /**
     * Get the top guesses for a specific point in the game history
     * @param {number} historyIndex - The index in the guess history to analyze
     * @param {number} count - Number of top guesses to return (default: 5)
     * @returns {string[]} Array of top guesses that would have been made at that point
     */
    getHistoricalTopGuesses(historyIndex, count = 5) {
        // Create a temporary solver state up to the specified history point
        const tempSolver = new WordleSolver(this.allWords, this.answerWords);
        tempSolver.hardMode = this.hardMode;
        
        // Apply all guesses up to the specified index
        for (let i = 0; i <= historyIndex; i++) {
            const { guess, feedback } = this.guessHistory[i];
            tempSolver.updateState(guess, feedback);
        }

        // Get the top guesses for that state
        return tempSolver.getTopGuesses(count);
    }

    /**
     * Get the current number of remaining possible words
     * @returns {number} Count of remaining candidates
     */
    getRemainingWordCount() {
        return this.remainingCandidates.length;
    }

    /**
     * Get the list of remaining possible words
     * @returns {string[]} Array of remaining candidate words
     */
    getRemainingWords() {
        return [...this.remainingCandidates];
    }
}

// Example usage:
// resetSolver();
// const firstGuess = getNextGuess(); // e.g. 'stare'
// updateCandidates('stare', 'gybbg');
// const nextGuess = getNextGuess(); // optimal next guess based on feedback 