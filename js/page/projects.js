/**
 * Puts an animated diagram into each project in "Selected work".
 * AWARE gets the isometric figure; the others use PROJECT_DIAGRAMS (js/diagrams).
 * Diagrams only play while they are on screen.
 * Uses: AWARE_FIGURE_MARKUP, animateAwareFigure (js/aware-figure), PROJECT_DIAGRAMS, ScrollTrigger
 */

function initProjectDiagrams() {
  const awareViz = $('.proj[data-viz="aware"] .proj__viz');
  if (awareViz) {
    awareViz.classList.add("proj__viz--iso");
    awareViz.dataset.built = "1";
    const wrapper = document.createElement("div");
    wrapper.className = "iso";
    wrapper.innerHTML = AWARE_FIGURE_MARKUP;
    awareViz.appendChild(wrapper);
    animateAwareFigure(wrapper);
  }

  $$(".proj").forEach((project) => {
    const viz = $(".proj__viz", project);
    const draw = PROJECT_DIAGRAMS[project.dataset.viz];
    if (!viz || !draw || viz.dataset.built) return;

    const timeline = draw(viz);
    if (prefersReducedMotion) {
      timeline.progress(0.6).pause(); // show a still frame
    } else {
      ScrollTrigger.create({
        trigger: viz,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? timeline.play() : timeline.pause()),
      });
    }
  });
}
