"use strict";

import { ROWS, COLS, LETTER_STATES } from './game.js';

export class GameUI {
    constructor() {
        this.elements = {
            grid: document.getElementById('grid'),
            keyboard: document.getElementById('keyboard'),
            gameStatus: document.getElementById('gameStatus'),
            newGameBtn: document.getElementById('newGameBtn'),
            reviewBtn: document.getElementById('reviewBtn'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            hardModeToggle: document.getElementById('hardModeToggle'),
            reviewModal: document.getElementById('reviewModal'),
            closeModal: document.querySelector('.close-modal'),
            guessHistory: document.getElementById('guessHistory'),
            reviewAnswer: document.getElementById('reviewAnswer'),
            reviewAttempts: document.getElementById('reviewAttempts'),
            reviewResult: document.getElementById('reviewResult')
        };

        this.KEYBOARD_LAYOUT = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    }

    buildGrid() {
        // Create all rows and cells in a single DocumentFragment
        const fragment = document.createDocumentFragment();
        const rows = [];
        
        // Create all rows first
        for (let r = 0; r < ROWS; r++) {
            const row = document.createElement('div');
            row.className = 'row';
            rows.push(row);
            fragment.appendChild(row);
        }
        
        // Create all cells in a single pass
        const cells = [];
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cells.push(cell);
                rows[r].appendChild(cell);
            }
        }
        
        // Single DOM update
        this.elements.grid.appendChild(fragment);
    }

    buildKeyboard() {
        const BACKSPACE = '\u232B';  // ⌫
        // Create all keyboard elements in a single pass
        const keyboardHTML = this.KEYBOARD_LAYOUT.map((rowStr, i) => {
            const keys = rowStr.split('').map(char => 
                `<div class="key" data-key="${char}">${char}</div>`
            ).join('');
            
            return `
                <div class="key-row" id="row${i+1}">
                    ${i === 2 ? '<div class="key wide" data-key="Enter">Enter</div>' : ''}
                    ${keys}
                    ${i === 2 ? `<div class="key wide backspace" data-key="Backspace" aria-label="Backspace">${BACKSPACE}</div>` : ''}
                </div>
            `;
        }).join('');
        
        // Single DOM update
        this.elements.keyboard.innerHTML = keyboardHTML;
    }

    createKey(label, extraClass='') {
        const key = document.createElement('div');
        key.textContent = label;
        key.className = 'key ' + extraClass;
        key.setAttribute('data-key', label);
        return key;
    }

    updateKeyboardUI(keyboardState) {
        // Batch keyboard updates using requestAnimationFrame
        requestAnimationFrame(() => {
            Object.entries(keyboardState).forEach(([letter, state]) => {
                const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
                if (keyElement) {
                    const currentState = keyElement.classList.contains('correct') ? 'correct' :
                                       keyElement.classList.contains('present') ? 'present' :
                                       keyElement.classList.contains('absent') ? 'absent' : null;
                    
                    // Remove existing state classes
                    keyElement.classList.remove('absent', 'present', 'correct');
                    
                    // Add new state class if it exists
                    if (state) {
                        keyElement.classList.add(state);
                    }
                }
            });
        });
    }

    updateGrid(row, result) {
        // Batch class updates using requestAnimationFrame
        requestAnimationFrame(() => {
            const cells = Array.from(row.children);
            cells.forEach((cell, i) => {
                cell.classList.add(result[i]);
            });
        });
    }

    showSolverSuggestion(topGuesses, remainingCount) {
        let suggestion = document.querySelector('.solver-suggestion');
        if (!suggestion) {
            suggestion = document.createElement('div');
            suggestion.className = 'solver-suggestion';
            document.querySelector('#buttonContainer').insertAdjacentElement('beforebegin', suggestion);
        }

        suggestion.innerHTML = `
            <strong>Top guesses:</strong> ${topGuesses.map(word => word.toUpperCase()).join(', ')}
            <br>
            <small>Based on ${remainingCount} possible words</small>
        `;
    }

    showReview(gameState) {
        if (!gameState.history || gameState.history.length === 0) {
            this.elements.gameStatus.textContent = 'No game history available.';
            return;
        }

        try {
            this.elements.guessHistory.innerHTML = '';
            
            const fragment = document.createDocumentFragment();
            gameState.history.forEach((guess, index) => {
                const guessItem = this.createGuessItem(guess, index, gameState);
                fragment.appendChild(guessItem);
            });
            
            this.elements.guessHistory.appendChild(fragment);
            this.updateReviewSummary(gameState);
            this.elements.reviewModal.style.display = 'block';
        } catch (error) {
            console.error('Error showing review:', error);
            this.elements.gameStatus.textContent = 'Error showing review. Please try again.';
        }
    }

    createGuessItem(guess, index, gameState) {
        const guessItem = document.createElement('div');
        guessItem.className = 'guess-item';
        
        try {
            const guessQuality = gameState.evaluateGuessQuality(guess.guess, guess.bestGuesses || []);
            const isCorrect = guess.guess === gameState.answer.toUpperCase();
            
            guessItem.innerHTML = `
                <div class="guess-header">
                    <div class="guess-number">Guess ${index + 1}</div>
                    <div class="guess-grid">
                        ${Array.from({length: COLS}, (_, i) => `
                            <div class="guess-cell ${guess.result[i]}">${guess.guess[i]}</div>
                        `).join('')}
                    </div>
                    <div class="guess-result ${isCorrect ? 'correct' : 'incorrect'}">
                        ${isCorrect ? 'Correct!' : 'Incorrect'}
                    </div>
                </div>
                <div class="guess-analysis">
                    <div class="guess-comparison">
                        <div class="user-guess">
                            <div class="label">Your Guess</div>
                            <div class="word">${guess.guess}</div>
                            ${guessQuality === 'optimal' ? 
                                '<div class="optimal">✓ Optimal Choice!</div>' : 
                                guessQuality === 'good' ? 
                                '<div class="optimal">✓ Good Choice!</div>' :
                                '<div class="suboptimal">Could be improved</div>'
                            }
                        </div>
                        <div class="best-guess">
                            <div class="label">Best Guesses Available</div>
                            <div class="word">${(guess.bestGuesses || []).map(word => word.toUpperCase()).join(', ')}</div>
                            <div class="word-count">${guess.remainingWords.length} words remain</div>
                        </div>
                    </div>
                    <div class="remaining-words">
                        <div class="word-count">Remaining Possible Words:</div>
                        <div class="possible-words">${(guess.remainingWords || []).slice(0, 10).join(', ')}${(guess.remainingWords || []).length > 10 ? '...' : ''}</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error creating guess item:', error);
            guessItem.innerHTML = `
                <div class="guess-header">
                    <div class="guess-number">Guess ${index + 1}</div>
                    <div class="guess-grid">
                        ${Array.from({length: COLS}, (_, i) => `
                            <div class="guess-cell ${guess.result[i]}">${guess.guess[i]}</div>
                        `).join('')}
                    </div>
                    <div class="guess-result">Error displaying analysis</div>
                </div>
            `;
        }
        
        return guessItem;
    }

    updateReviewSummary(gameState) {
        this.elements.reviewAnswer.textContent = gameState.answer.toUpperCase();
        this.elements.reviewAttempts.textContent = gameState.history.length;
        this.elements.reviewResult.textContent = 
            gameState.history[gameState.history.length - 1].guess === gameState.answer.toUpperCase() ? 'Win' : 'Loss';
    }

    resetUI() {
        this.elements.grid.innerHTML = '';
        const isHardMode = this.elements.hardModeToggle.checked;
        this.elements.gameStatus.textContent = isHardMode ? 'Hard Mode - Use all revealed hints!' : 'Practice Mode - Try to guess the word!';
        
        // Add null checks for elements that might not exist
        if (this.elements.reviewBtn) {
            this.elements.reviewBtn.style.display = 'none';
        }
        if (this.elements.playAgainBtn) {
            this.elements.playAgainBtn.style.display = 'none';
        }
        
        // Reset keyboard state
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('absent', 'present', 'correct');
        });
    }

    showGameOver(isWin) {
        this.elements.gameStatus.textContent = isWin ? 'You Win!' : 'Game Over!';
        if (this.elements.reviewBtn) {
            this.elements.reviewBtn.style.display = 'inline-block';
        }
        if (this.elements.playAgainBtn) {
            this.elements.playAgainBtn.style.display = 'inline-block';
        }
    }

    showError(message) {
        this.elements.gameStatus.textContent = message;
    }
} 