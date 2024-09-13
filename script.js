document.addEventListener('DOMContentLoaded', () => {
  const mainBody = document.getElementById('mainBody');

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
