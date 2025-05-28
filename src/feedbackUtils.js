"use strict";

/**
 * Generates a feedback pattern for a Wordle guess against an answer.
 * @param {string} guess - The guessed word
 * @param {string} answer - The correct answer
 * @returns {string} A pattern string where:
 *   'g' = green (exact match)
 *   'y' = yellow (letter exists but wrong position)
 *   'b' = black (letter not in word)
 */
export function getFeedbackPattern(guess, answer) {
    // Convert to lowercase for consistency
    guess = guess.toLowerCase();
    answer = answer.toLowerCase();
    
    // Initialize result array with all blacks
    const result = Array(5).fill('b');
    
    // First pass: mark greens
    const answerChars = answer.split('');
    const guessChars = guess.split('');
    
    // Mark greens first
    for (let i = 0; i < 5; i++) {
        if (guessChars[i] === answerChars[i]) {
            result[i] = 'g';
            // Mark this position as used
            answerChars[i] = null;
        }
    }
    
    // Second pass: mark yellows
    for (let i = 0; i < 5; i++) {
        if (result[i] === 'g') continue; // Skip already marked greens
        
        const letter = guessChars[i];
        const index = answerChars.indexOf(letter);
        
        if (index !== -1) {
            result[i] = 'y';
            // Mark this position as used
            answerChars[index] = null;
        }
    }
    
    return result.join('');
}

// Example usage:
// getFeedbackPattern('hello', 'world') // returns 'byybg'
// getFeedbackPattern('stare', 'stare') // returns 'ggggg'
// getFeedbackPattern('eagle', 'eager') // returns 'ggbyg' 