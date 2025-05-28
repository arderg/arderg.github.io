"use strict";

import { getFeedbackPattern } from './feedbackUtils.js';

/**
 * Scores a guess by finding the size of its largest pattern bucket.
 * Early exits if any bucket exceeds the current best score.
 * @param {string} guess - The word to score
 * @param {string[]} candidates - List of possible answer words
 * @param {number} currentBest - Current best worst-bucket size
 * @returns {number} Size of the largest pattern bucket, or Infinity if early-exited
 */
export function scoreGuess(guess, candidates, currentBest = Infinity) {
    // Create a map to count patterns
    const patternCounts = new Map();
    
    // For each candidate answer, get the pattern and count it
    for (const answer of candidates) {
        const pattern = getFeedbackPattern(guess, answer);
        const newCount = (patternCounts.get(pattern) || 0) + 1;
        patternCounts.set(pattern, newCount);
        
        // Early exit if this bucket exceeds current best
        if (newCount > currentBest) {
            return Infinity;
        }
    }
    
    // Find the size of the largest bucket
    return Math.max(...patternCounts.values());
}

/**
 * Finds the best guess that minimizes the worst-case scenario.
 * @param {string[]} allGuesses - All valid guess words
 * @param {string[]} candidates - List of possible answer words
 * @returns {string} The word that produces the smallest worst-case bucket
 */
export function findBestGuess(allGuesses, candidates) {
    let bestGuess = null;
    let bestScore = Infinity;
    
    // Try each possible guess
    for (const guess of allGuesses) {
        const score = scoreGuess(guess, candidates, bestScore);
        
        // Update if this guess is better
        if (score < bestScore) {
            bestScore = score;
            bestGuess = guess;
        }
    }
    
    return bestGuess;
}

// Example usage:
// const candidates = ['stare', 'stark', 'start', 'stars'];
// const allGuesses = ['stare', 'stark', 'start', 'stars', 'other'];
// console.log(findBestGuess(allGuesses, candidates)); // might return 'stare'
// console.log(scoreGuess('stare', candidates)); // returns size of largest pattern bucket 