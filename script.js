// Select the body
const body = document.getElementById('mainBody');

// Set initial mode (light by default)
let isDarkMode = false;

// Add event listener for double-click to toggle dark and light modes
body.addEventListener('dblclick', () => {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
  }
});

// Initialize in light mode
body.classList.add('light-mode');
