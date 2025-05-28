import { getFeedbackPattern } from './feedbackUtils.js';
import { findBestGuess } from './guessScorer.js';

// Load word lists
const answerList = await fetch('/data/answers.txt').then(r => r.text()).then(t => t.split('\n'));
const allWords = await fetch('/data/words.txt').then(r => r.text()).then(t => t.split('\n'));

let remainingCandidates = [...answerList];

/**
 * Updates the remaining candidates based on the last guess and its feedback
 * @param {string} guess - The word that was guessed
 * @param {string} pattern - The feedback pattern (e.g. 'gybbg')
 */
export function updateCandidates(guess, pattern) {
    remainingCandidates = remainingCandidates.filter(candidate => 
        getFeedbackPattern(guess, candidate) === pattern
    );
}

/**
 * Gets the next optimal guess
 * @returns {string} The best word to guess next
 */
export function getNextGuess() {
    return findBestGuess(allWords, remainingCandidates);
}

/**
 * Resets the solver state for a new game
 */
export function resetSolver() {
    remainingCandidates = [...answerList];
}

// Example usage:
// resetSolver();
// const firstGuess = getNextGuess(); // e.g. 'stare'
// updateCandidates('stare', 'gybbg');
// const nextGuess = getNextGuess(); // optimal next guess based on feedback 