/**
 * Page-load sequence: boot terminal, then the hero title, tags and header slide in
 * while the particles fade up and the particle counter counts.
 * Uses: runBootScreen (js/boot-screen.js), particleField (field-sections.js), gsap
 */

/** Wraps each hero title line in a <span> so it can slide up from below. */
function wrapHeroLines() {
  return $$(".hero__title .line").map((line) => {
    const inner = document.createElement("span");
    inner.innerHTML = line.innerHTML;
    line.innerHTML = "";
    line.appendChild(inner);
    return inner;
  });
}

async function playIntro() {
  const heroLines = wrapHeroLines();
  const boot = $(".boot");

  if (prefersReducedMotion) {
    boot.remove();
    if (particleField) particleField.uniforms.uAlpha.value = 1;
    if (particleCountEl && particleField) {
      particleCountEl.textContent = particleField.count.toLocaleString("en-IN");
    }
    return;
  }

  smoothScroller?.stop();
  await runBootScreen(boot);
  smoothScroller?.start();

  const intro = gsap.timeline();
  intro
    .from(heroLines, { yPercent: 110, duration: 1.2, stagger: 0.08, ease: "expo.out" })
    .from(".hero__tag", { opacity: 0, y: 12, duration: 0.8, stagger: 0.06 }, "<0.2")
    .from(".hero__frame i", { scale: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }, "<")
    .from(
      ".hdr .cell",
      { yPercent: -100, opacity: 0, duration: 0.8, stagger: 0.05, ease: "expo.out" },
      "<",
    );

  if (particleField) {
    particleField.uniforms.uState.value = 0.35;
    intro
      .to(particleField.uniforms.uAlpha, { value: 1, duration: 1.6 }, 0)
      .to(particleField.uniforms.uState, { value: 0, duration: 2.4, ease: "expo.out" }, "<");

    const counter = { v: 0 };
    intro.to(
      counter,
      {
        v: particleField.count,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          if (particleCountEl)
            particleCountEl.textContent = Math.round(counter.v).toLocaleString("en-IN");
        },
      },
      "<",
    );
  }
}
