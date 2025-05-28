Project Report
1. Introduction
This repository contains a minimal Wordle-style game implemented in plain HTML, CSS, and JavaScript. The goal was to deepen understanding of core web technologies by building a small, self-contained guessing game that mirrors the popular Wordle mechanics: a five-letter word is chosen at random, and the player has six tries to guess it. Feedback is provided via colored tiles and an on-screen keyboard.

2. Project Objectives
Reinforce fundamentals of HTML/CSS layout and styling, and vanilla JavaScript logic.

Replicate Wordle mechanics (letter matching, tile coloring, keyboard feedback) from scratch.

Design for modularity, so that game logic, UI rendering, and utility functions are clearly separated.

Experiment with enhancements (hard mode, dark mode, mobile-friendly layout) without relying heavily on external frameworks.

3. Overall Approach
Game Logic

On load, pick a random solution from a static list of valid words.

Capture each guess, compare against the solution letter by letter, and generate an array of “tile statuses” (green/yellow/grey).

Maintain a set of possible solutions; compute “best guesses” by evaluating each candidate word’s ability to partition the solution set (minimize largest feedback-pattern group).

Rendering & UI

Build the grid and on-screen keyboard via DOM manipulation.

Update tile classes (.tile--correct, .tile--present, .tile--absent) and keyboard key styles after each guess.

Implement dark mode by toggling a root CSS class, and mobile responsiveness via flexible CSS grid and vw/vh units.

Enhancements

Hard Mode: enforce that each new guess must respect all revealed information (green letters in fixed positions, yellow letters somewhere, and banned letters nowhere).

Best-Guess Suggestions: after each guess (or on review), show the top 5 next guesses by expected information gain.

Dark Mode Toggle: both via a button and by double-clicking beside the game grid.

Mobile Keyboard Scaling: calculate key width dynamically so the on-screen keyboard always fills the available width on narrow viewports.

4. Difficulties Encountered
Performance:

On desktop the initial grid-build and word list loading take noticeable time.

Computing expected-value partitions for best-guess suggestions over thousands of words can be CPU-intensive.

Best-Guess Algorithm:

Naïvely grouping by feedback pattern for each possible word led to very slow response.

Reconciling differences between “live” best guesses and the “review” mode exposed inconsistency bugs (some patterns were cached incorrectly).

Hard Mode Enforcement:

Validating that each new guess fully uses prior feedback required tracking excluded and required letters, then filtering legal guess list accordingly.

Integrating hard-mode logic into the suggestion algorithm so illegal words aren’t offered.

Keyboard Feedback Persistence:

Ensuring that once a key turns green or grey it never “downgrades” (e.g. from green back to yellow) involved maintaining a letter-state map outside of individual tile updates.

Responsive Design:

Scaling the keyboard keys precisely on narrow viewports required measurement of the container width and real-time style adjustments.

Some mobile browsers handle CSS grid and click events differently, necessitating fallbacks.

Dark Mode Implementation:

Double-click event handling sometimes conflicted with text selection or tap delays on touch devices.

Synchronizing CSS variable overrides (for colors) in both inline styles and external style sheets took extra passes.

5. Third-Party Components vs Custom Code
Custom Code

Word-list loader (fetching and parsing the local words.json).

Core Wordle logic: guess evaluation, feedback pattern generation, hard-mode validation.

UI rendering routines for grid and keyboard.

Best-guess algorithm implementation and EV computations.

Dark mode toggle logic and CSS custom-property management.

Mobile scaling scripts for keyboard layout.

Third-Party Code

Static word list sourced from an open word-game repository (used as data only).

Minimal polyfills for older browser support (e.g. Element.classList shim).

No CSS frameworks (Bootstrap, Tailwind) or JS libraries (jQuery, React) were used—everything is handwritten in plain CSS and vanilla JS.

6. Limitations & Future Work
Loading Speed: moving the word list to a binary trie or WebAssembly module could speed up best-guess calculations.

Code Modularity: further refactor suggestion and evaluation logic into ES6 modules for clearer separation and easier testing.

Accessibility: add ARIA attributes for screen readers, and keyboard-only navigation.

Persistence: store game state in localStorage to enable “resume” after page reload.

Statistics & Share-ability: record player stats (win rate, guess distribution) and allow sharing results via generated text or links.

Internationalization: support word lists and layouts for other languages.

7. Conclusion
This mini-Wordle project reinforced core web development skills by building a nontrivial game entirely from scratch. The process highlighted key challenges in performance optimization, algorithm design, responsive UI, and feature toggles. Future improvements will continue refining modularity, speed, and user experience, but the current version already serves as a solid demonstration of proficiency in HTML, CSS, and JavaScript.

