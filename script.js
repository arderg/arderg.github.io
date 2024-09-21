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
