/**
 * Connects the particle background to the page sections.
 * Each <section data-state="0..3" data-look="..."> changes the particle shape
 * (sphere, stream, lattice, orbit), brightness and horizontal position.
 * Uses: createParticleField() from js/particle-field, gsap, ScrollTrigger
 */

/** { uniforms, count } from createParticleField, or null without WebGL. */
let particleField = null;
/** Hero readouts: "particles: 14,000 · state: sphere". */
let particleCountEl = null;
let fieldStateEl = null;

const FIELD_STATE_NAMES = ["sphere", "stream", "lattice", "orbit"];

function initParticleField() {
  particleField = createParticleField($("#field"), { reduced: prefersReducedMotion });
  particleCountEl = $('[data-read="count"]');
  fieldStateEl = $('[data-read="state"]');

  if (!particleField) {
    $(".hero__read")?.remove();
    return;
  }

  const uniforms = particleField.uniforms;
  const isMobile = matchMedia("(max-width: 900px)").matches;
  // a = brightness, x = sideways shift (fraction of the screen) per section
  const looks = {
    hero: { a: 1, x: 0 },
    about: { a: 0.7, x: isMobile ? 0 : 0.24 },
    work: { a: 0.32, x: 0 },
    stack: { a: 0.5, x: 0 },
    path: { a: 0.5, x: isMobile ? 0 : 0.26 },
    contact: { a: isMobile ? 0.45 : 0.85, x: isMobile ? 0 : 0.02 },
  };

  $$("[data-state]").forEach((section) => {
    const state = parseFloat(section.dataset.state);
    ScrollTrigger.create({
      trigger: section,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (!self.isActive) return;

        gsap.to(uniforms.uState, {
          value: state,
          duration: prefersReducedMotion ? 0 : 2.2,
          ease: "power2.inOut",
          overwrite: true,
        });
        const look = looks[section.dataset.look] || looks.hero;
        gsap.to(uniforms.uAlpha, { value: look.a, duration: 1.2, overwrite: true });
        gsap.to(uniforms.uShift.value, {
          x: look.x,
          duration: prefersReducedMotion ? 0 : 2,
          ease: "power2.inOut",
          overwrite: true,
        });
        if (fieldStateEl) {
          fieldStateEl.textContent = FIELD_STATE_NAMES[Math.round(Math.min(state, 3))];
        }
      },
    });
  });
}
