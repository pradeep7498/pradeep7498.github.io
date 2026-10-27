/**
 * APWRIMS: rainfall bars and reservoir levels rise and fall.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawWaterDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.8  live water levels");
  const readout = addCaption(container, "read", "storage 0%");
  const tankX = [60, 200, 340];
  const waterRects = [];
  tankX.forEach((x, index) => {
    const clip = svgEl("clipPath", { id: `tank${index}` }, svg);
    svgEl("path", { d: `M${x} 150 L${x + 90} 150 L${x + 76} 280 L${x + 14} 280 Z` }, clip);
    const water = svgEl(
      "rect",
      {
        x,
        y: 280,
        width: 90,
        height: 140,
        class: "fx-d",
        opacity: 0.35,
        "clip-path": `url(#tank${index})`,
      },
      svg,
    );
    waterRects.push(water);
    svgEl(
      "path",
      { d: `M${x} 150 L${x + 14} 280 L${x + 76} 280 L${x + 90} 150`, class: "sx" },
      svg,
    );
    for (let tick = 0; tick < 5; tick++) {
      svgEl(
        "line",
        {
          x1: x + 90 - tick * 2.8,
          y1: 160 + tick * 26,
          x2: x + 98,
          y2: 160 + tick * 26,
          class: "sx-m",
        },
        svg,
      );
    }
    svgEl(
      "line",
      { x1: x + 4, y1: 190, x2: x + 86, y2: 190, class: "sx-s", "stroke-dasharray": "3 3" },
      svg,
    );
  });
  svgEl(
    "line",
    { x1: 60, y1: 312, x2: 84, y2: 312, class: "sx-s", "stroke-dasharray": "3 3" },
    svg,
  );
  svgText(svg, 92, 315, "full reservoir level", "tx-s");
  const rainBars = Array.from({ length: 24 }, (_, index) =>
    svgEl(
      "rect",
      { x: 60 + index * 15.8, y: 110, width: 8, height: 0, class: "fx-p", opacity: 0.6 },
      svg,
    ),
  );
  svgEl("line", { x1: 54, y1: 110, x2: 436, y2: 110, class: "sx-m" }, svg);
  svgText(svg, 60, 36, "rainfall, last 24 h");
  const fillLevels = [0.62, 0.84, 0.48];
  const timeline = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.6, paused: true });
  rainBars.forEach((bar, index) => {
    const barHeight =
      6 + Math.abs(Math.sin(index * 0.9) * 50) * (index > 8 && index < 16 ? 1.4 : 0.6);
    timeline.to(
      bar,
      { attr: { y: 110 - barHeight, height: barHeight }, duration: 0.25, ease: "power2.out" },
      index * 0.05,
    );
  });
  waterRects.forEach((water, index) => {
    timeline.fromTo(
      water,
      { attr: { y: 280 } },
      { attr: { y: 280 - 90 * fillLevels[index] }, duration: 2.2, ease: "power2.inOut" },
      0.6,
    );
  });
  const storage = { v: 0 };
  timeline.to(
    storage,
    {
      v: 74,
      duration: 2.2,
      onUpdate: () => (readout.textContent = `storage ${Math.round(storage.v)}%`),
    },
    0.6,
  );
  return timeline;
}
