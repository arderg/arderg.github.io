"use strict";

import { GameState } from './game.js';
import { GameUI } from './ui.js';
import { WordleSolver } from './solver.js';

class Game {
    constructor() {
        this.gameState = new GameState();
        this.ui = new GameUI();
        this.setupEventListeners();
    }

    async init() {
        try {
            await this.loadWordLists();
            this.startGame();
        } catch (error) {
            console.error('Error initializing game:', error);
            // Use default words if loading fails
            this.gameState.words = ['apple', 'berry', 'mango', 'peach', 'grape'];
            this.gameState.answers = ['apple', 'berry', 'mango', 'peach', 'grape'];
            this.gameState.solver = new WordleSolver(this.gameState.words, this.gameState.answers);
            this.startGame();
        }
    }

    async loadWordLists() {
        try {
            this.ui.showError('Loading game data...');
            
            // Load both word lists in parallel
            const [wordsResponse, answersResponse] = await Promise.all([
                fetch('./data/words.txt'),
                fetch('./data/answers.txt')
            ]);
            
            if (!wordsResponse.ok || !answersResponse.ok) {
                throw new Error(`Failed to load word lists: ${wordsResponse.ok ? 'answers.txt' : 'words.txt'} not found`);
            }
            
            // Parse responses in parallel
            const [wordsText, answersText] = await Promise.all([
                wordsResponse.text(),
                answersResponse.text()
            ]);
            
            const words = wordsText.split(/\r?\n/).filter(w => w.length === 5);
            const answers = answersText.split(/\r?\n/).filter(w => w.length === 5);
            
            if (words.length === 0 || answers.length === 0) {
                throw new Error('No valid words found in word lists');
            }
            
            // Initialize game state
            this.gameState.words = words;
            this.gameState.answers = answers;
            this.gameState.solver = new WordleSolver(words, answers);
            
            // Enable UI after data is loaded
            this.ui.elements.newGameBtn.disabled = false;
            this.ui.showError('Click "New Game" to start!');
            
            // Start the game automatically after loading
            this.startGame();
            
        } catch (error) {
            console.error('Error loading word lists:', error);
            this.ui.showError(`Error loading game data: ${error.message}`);
            throw error; // Re-throw to be caught by init()
        }
    }

    startGame() {
        try {
            const hardMode = this.ui.elements.hardModeToggle.checked;
            
            // Check if solver is initialized
            if (!this.gameState.solver) {
                throw new Error('Solver not initialized. Please refresh the page.');
            }
            
            // Check if word lists are loaded
            if (!this.gameState.words || !this.gameState.answers || 
                this.gameState.words.length === 0 || this.gameState.answers.length === 0) {
                throw new Error('Word lists not loaded. Please refresh the page.');
            }
            
            this.gameState.reset(hardMode);
            this.ui.resetUI();
            this.ui.buildGrid();
            this.ui.buildKeyboard();
            
            // Set up keyboard click listeners after building the keyboard
            document.querySelectorAll('.key').forEach(key => {
                key.addEventListener('click', () => this.handleKey(key.textContent));
            });
            
            this.gameState.isGameActive = true;
            
            // Show hard mode status message if enabled
            if (hardMode) {
                this.ui.showError('Hard Mode: You must use all revealed hints in your guesses!');
            } else {
                this.ui.showError('Click "New Game" to start!');
            }
        } catch (error) {
            console.error('Error starting game:', error);
            this.ui.showError(`Error starting game: ${error.message}`);
        }
    }

    setupEventListeners() {
        // Keyboard input
        document.onkeydown = e => this.handleKey(e.key);
        
        // Button clicks
        this.ui.elements.newGameBtn.addEventListener('click', () => this.startGame());
        this.ui.elements.reviewBtn.addEventListener('click', () => this.ui.showReview(this.gameState));
        
        // Hard mode toggle
        this.ui.elements.hardModeToggle.addEventListener('change', () => {
            if (this.gameState.isGameActive) {
                this.ui.showError('Hard Mode setting will apply to the next game');
            }
        });

        // Modal controls
        document.getElementById('modalPlayAgainBtn').addEventListener('click', () => {
            this.ui.elements.reviewModal.style.display = 'none';
            this.startGame();
        });
        this.ui.elements.closeModal.addEventListener('click', () => {
            this.ui.elements.reviewModal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.reviewModal) {
                this.ui.elements.reviewModal.style.display = 'none';
            }
        });
    }

    handleKey(key) {
        if (!this.gameState.isGameActive) return;
        if (this.gameState.currentRow >= 6) return;
        
        const row = this.ui.elements.grid.children[this.gameState.currentRow];
        if (!row) return;
        
        if (key === 'Backspace' || key === '⌫') {
            this.handleBackspace(row);
        } else if (key === 'Enter') {
            if (this.gameState.currentCol === 5) this.processGuess(row);
        } else if (/^[a-zA-Z]$/.test(key)) {
            this.handleLetter(key, row);
        }
    }

    handleBackspace(row) {
        if (this.gameState.currentCol > 0) {
            this.gameState.currentCol--;
            const cell = row.children[this.gameState.currentCol];
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('filled');
            }
        }
    }

    handleLetter(key, row) {
        if (this.gameState.currentCol < 5) {
            const cell = row.children[this.gameState.currentCol];
            cell.textContent = key.toUpperCase();
            cell.classList.add('filled');
            this.gameState.currentCol++;
        }
    }

    processGuess(row) {
        const guess = this.gameState.getCurrentGuess(row);
        const result = this.gameState.processGuess(guess);
        
        if (!result.valid) {
            this.ui.showError(result.error);
            return;
        }

        this.ui.updateGrid(row, result.result);
        this.ui.updateKeyboardUI(this.gameState.keyboardState);
        
        if (result.isGameOver) {
            this.gameState.isGameActive = false;
            this.ui.showGameOver(result.isWin);
        }
    }
}

// Initialize the game
const game = new Game();
game.init(); 