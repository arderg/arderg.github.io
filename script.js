<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.0/gsap.min.js"></script>

document.addEventListener('mousemove', function(e) {
    gsap.to(".hero", {
      duration: 1,
      x: (e.clientX - window.innerWidth / 2) / 20,
      y: (e.clientY - window.innerHeight / 2) / 20,
      ease: "power3.out"
    });
  });
  