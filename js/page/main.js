/**
 * Starts the page. Everything else only defines functions; this file runs them,
 * in this order (the order matters for the scroll triggers).
 */

gsap.registerPlugin(ScrollTrigger, SplitText);

initSmoothScroll(); // smooth-scroll.js
initParticleField(); // field-sections.js
initHeaderBackground(); // header.js
initClock(); // header.js
initMenu(); // menu.js
initContactForm(); // contact-form.js
initProjectDiagrams(); // projects.js

// Wait for the fonts so text is measured correctly, then play the intro.
document.fonts
  .load('20px "VT323"')
  .catch(() => {})
  .then(() => document.fonts.ready)
  .then(() => {
    playIntro(); // intro.js
    setupScrollAnimations(); // scroll-animations.js
    ScrollTrigger.refresh();
  });
