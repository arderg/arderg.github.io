import { resetSolver, updateCandidates, getNextGuess } from './src/solver.js';

document.addEventListener('DOMContentLoaded', () => {
  const mainBody = document.getElementById('mainBody');
  
  // Initialize solver
  resetSolver();
  
  // Get initial guess
  const initialGuess = getNextGuess();
  console.log('Suggested first guess:', initialGuess);

  // Toggle dark mode on double-click
  mainBody.addEventListener('dblclick', () => {
    if (mainBody.classList.contains('dark-mode')) {
      mainBody.classList.remove('dark-mode');
      mainBody.classList.add('light-mode');
    } else {
      mainBody.classList.remove('light-mode');
      mainBody.classList.add('dark-mode');
    }
  });
});

document.getElementById('contactButton').addEventListener('click', function(event) {
  event.preventDefault(); // Prevent default behavior of the link

  const contactSection = document.getElementById('contact');
  const overlay = contactSection.querySelector('.overlay');

  // Scroll smoothly to the contact section
  contactSection.scrollIntoView({ behavior: 'smooth' });

  // Show the overlay
  overlay.classList.add('visible');

  // Hide the overlay after 2 seconds
  setTimeout(function() {
      overlay.classList.remove('visible');
  }, 2000);
});

// Add this function to your existing game logic
function handleGuessFeedback(guess, pattern) {
    updateCandidates(guess, pattern);
    const nextGuess = getNextGuess();
    console.log('Suggested next guess:', nextGuess);
    return nextGuess;
}
