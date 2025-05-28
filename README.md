# Mini Wordle

A minimal Wordle-style game built with plain HTML, CSS, and JavaScript.

## Table of Contents

- [Demo](#demo)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Project Report](#project-report)  
  - [1. Introduction](#1-introduction)  
  - [2. Project Objectives](#2-project-objectives)  
  - [3. Overall Approach](#3-overall-approach)  
  - [4. Difficulties Encountered](#4-difficulties-encountered)  
  - [5. Third-Party Components vs Custom Code](#5-third-party-components-vs-custom-code)  
  - [6. Limitations & Future Work](#6-limitations--future-work)  
  - [7. Conclusion](#7-conclusion)  
- [License](#license)  

---

## Usage

1. Click **Start Game**.
2. Enter guesses via keyboard or on-screen keys.
3. Tiles will colorize:

   * 🟩 Correct letter in correct position
   * 🟨 Correct letter in wrong position
   * ⬜ Absent letter
4. You have six attempts.
5. Toggle Dark Mode with the 🌓 button or double-click beside the grid.
6. Enable **Hard Mode** before starting to enforce all revealed constraints.

---

## Project Report

### 1. Introduction

This mini-Wordle game replicates the core mechanics of the popular puzzle: guess a five-letter word in six tries. Feedback is provided via colored tiles and an on-screen keyboard, implemented entirely with vanilla HTML, CSS, and JavaScript.

### 2. Project Objectives

* **Fundamentals**: Strengthen skills in HTML layout, CSS styling, and JavaScript logic.
* **Mechanics**: Build Wordle feedback, keyboard state, and guess validation from scratch.
* **Modularity**: Keep game logic, UI rendering, and utilities separate.
* **Enhancements**: Add dark mode, hard mode, and mobile-friendly layout without heavy frameworks.

### 3. Overall Approach

1. **Game Logic**

   * Select a random solution from a static word list.
   * Compare each guess to the solution to generate status flags (correct/present/absent).
   * Maintain a filtered list of possible solutions; compute best guesses by minimizing the largest feedback pattern group.
2. **Rendering & UI**

   * Build grid and keyboard via DOM APIs.
   * Apply CSS classes (`.tile--correct`, `.tile--present`, `.tile--absent`) and update key styles dynamically.
   * Dark mode via root CSS class; responsive layout using CSS Grid and relative units.
3. **Enhancements**

   * **Hard Mode**: Enforce guesses to respect all known letter constraints.
   * **Best-Guess Suggestions**: Display top 5 next guesses by expected information gain.
   * **Dark Mode Toggle**: Button plus double-click beside the grid.
   * **Mobile Keyboard Scaling**: Dynamically calculate key widths for any viewport.

### 4. Difficulties Encountered

* **Performance**

  * Initial grid build and word-list parsing introduce noticeable lag.
  * Computing EV partitions over thousands of words is CPU-intensive.
* **Best-Guess Algorithm**

  * Naïve grouping by feedback patterns was very slow.
  * Inconsistencies between live suggestions and review mode revealed caching bugs.
* **Hard Mode Enforcement**

  * Tracking excluded/required letters and filtering legal guesses added complexity.
  * Integrating hard-mode rules into the suggestion generator to avoid illegal words.
* **Keyboard Feedback Persistence**

  * Preventing a key from “downgrading” (e.g., green → yellow) required a global letter-state map.
* **Responsive Design**

  * Precisely scaling keys on narrow viewports required real-time container width measurement.
  * Touch event handling differences across mobile browsers demanded fallbacks.
* **Dark Mode Implementation**

  * Double-click events sometimes conflicted with text selection or tap delays on touch devices.
  * Synchronizing CSS variable overrides in inline styles and external stylesheets took extra iteration.

### 5. Third-Party Components vs Custom Code

**Custom Code**

* Word-list loader (`words.json` parsing).
* Core Wordle logic: guess evaluation, feedback generation, and hard-mode checks.
* UI rendering for grid and keyboard.
* Best-guess algorithm and EV computations.
* Dark mode toggle and CSS variable management.
* Mobile keyboard scaling scripts.

**Third-Party Code**

* Static word list sourced from an open word-game repository (data only).
* Minimal polyfills for older browser support (`classList` shim).
* **No** CSS frameworks (Bootstrap, Tailwind) or JS libraries (jQuery, React) were used.

### 6. Limitations & Future Work

* **Loading Speed**: Migrate the word list into a binary trie or WebAssembly for faster lookups.
* **Modularity**: Refactor suggestion and evaluation logic into ES6 modules for clearer separation and easier testing.
* **Accessibility**: Add ARIA labels and keyboard-only navigation.
* **Persistence**: Store game state in `localStorage` to preserve across sessions.
* **Statistics & Sharing**: Track win rates, guess distributions, and enable social sharing of results.
* **Internationalization**: Support additional languages and word lists.

### 7. Conclusion

Building this mini-Wordle from scratch solidified core web development skills and highlighted challenges in algorithm design, performance optimization, and responsive UI. Although there is room for further enhancements, the current version demonstrates proficiency in HTML, CSS, and JavaScript fundamentals.

---

## License

This project is licensed under the [MIT License](./LICENSE).

```
```
