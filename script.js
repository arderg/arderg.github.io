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

document.querySelector('.btn-primary').addEventListener('click', function() {
  const contactSection = document.getElementById('contact');
  
  // Scroll smoothly to the contact section
  contactSection.scrollIntoView({ behavior: 'smooth' });
  
  // Add the highlight class
  contactSection.classList.add('highlight');

  // Remove the highlight class after 2 seconds
  setTimeout(function() {
    contactSection.classList.remove('highlight');
  }, 2000);
});
