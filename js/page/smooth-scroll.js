/**
 * Smooth scrolling (Lenis) and in-page links like href="#work".
 * Uses: Lenis, gsap, ScrollTrigger, closeMenu() from menu.js
 */

/** The Lenis instance, or null when reduced motion is on. */
let smoothScroller = null;

function initSmoothScroll() {
  if (!prefersReducedMotion) {
    smoothScroller = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    smoothScroller.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => smoothScroller.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Links to "#section" scroll smoothly instead of jumping.
  $$('a[href^="#"]').forEach((link) =>
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (href.length >= 2) {
        event.preventDefault();
        closeMenu();
        scrollToTarget(href === "#top" ? document.body : href);
      }
    }),
  );
}

/** Scroll to an element or a selector such as "#contact". */
function scrollToTarget(target) {
  const el = typeof target == "string" ? $(target) : target;
  if (!el) return;
  if (smoothScroller) {
    smoothScroller.scrollTo(el, { duration: 1.4 });
  } else {
    el.scrollIntoView();
  }
}
