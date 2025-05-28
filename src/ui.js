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
        const fragment = document.createDocumentFragment();
        for (let r = 0; r < ROWS; r++) {
            const row = document.createElement('div');
            row.className = 'row';
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                row.appendChild(cell);
            }
            fragment.appendChild(row);
        }
        this.elements.grid.appendChild(fragment);
    }

    buildKeyboard() {
        this.KEYBOARD_LAYOUT.forEach((rowStr, i) => {
            const rowDiv = document.getElementById('row' + (i+1));
            rowDiv.innerHTML = '';
            
            const fragment = document.createDocumentFragment();
            if (i === 2) {
                fragment.appendChild(this.createKey('Enter', 'wide'));
            }
            
            for (const char of rowStr) {
                fragment.appendChild(this.createKey(char));
            }
            
            if (i === 2) {
                fragment.appendChild(this.createKey('Backspace', 'wide'));
            }
            
            rowDiv.appendChild(fragment);
        });
    }

    createKey(label, extraClass='') {
        const key = document.createElement('div');
        key.textContent = label;
        key.className = 'key ' + extraClass;
        key.setAttribute('data-key', label);
        return key;
    }

    updateKeyboardUI(keyboardState) {
        Object.entries(keyboardState).forEach(([letter, state]) => {
            const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
            if (keyElement) {
                // Remove existing state classes
                keyElement.classList.remove('gray', 'yellow', 'green');
                
                // Add new state class if any
                if (state) {
                    keyElement.classList.add(state);
                }
            }
        });
    }

    updateGrid(row, result) {
        Array.from(row.children).forEach((cell, i) => {
            cell.classList.add(result[i]);
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
        this.elements.gameStatus.textContent = 'Practice Mode - Try to guess the word!';
        this.elements.reviewBtn.style.display = 'none';
        this.elements.playAgainBtn.style.display = 'none';
    }

    showGameOver(isWin) {
        this.elements.gameStatus.textContent = isWin ? 'You Win!' : 'Game Over!';
        this.elements.reviewBtn.style.display = 'inline-block';
        this.elements.playAgainBtn.style.display = 'inline-block';
    }

    showError(message) {
        this.elements.gameStatus.textContent = message;
    }
} 