/**
 * AWARE: data streams become department alerts.
 * Only used if the isometric AWARE figure (js/aware-figure) is missing.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawAwareDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.1  stream to alert");
  const readout = addCaption(container, "read", "alerts 0");
  const sources = ["weather", "rainfall", "crops", "health"];
  const departments = ["disaster", "agri", "health"];
  sources.forEach((source, index) => {
    const y = 40 + index * 64;
    svgRect(svg, 24, y, 70, 34);
    svgText(svg, 59, y + 21, source, "tx", "middle");
    svgEl("path", { d: `M94 ${y + 17} C 120 ${y + 17}, 120 165, 146 165`, class: "sx-r" }, svg);
  });
  svgRect(svg, 146, 150, 120, 30, "sx-m");
  svgText(svg, 206, 198, "topic", "tx", "middle");
  for (let i = 0; i < 9; i++) {
    svgEl("line", { x1: 156 + i * 12, y1: 150, x2: 156 + i * 12, y2: 180, class: "sx-r" }, svg);
  }
  svgRect(svg, 290, 125, 74, 80);
  svgText(svg, 327, 220, "window", "tx", "middle");
  svgEl("path", { d: "M302 180 A 25 25 0 0 1 352 180", class: "sx-m" }, svg);
  svgEl("line", { x1: 344, y1: 162, x2: 349, y2: 158, class: "sx-s" }, svg);
  const needle = svgEl("line", { x1: 327, y1: 180, x2: 327, y2: 158, class: "sx" }, svg);
  svgEl("circle", { cx: 327, cy: 180, r: 2.5, class: "fx-p" }, svg);
  svgEl("line", { x1: 266, y1: 165, x2: 290, y2: 165, class: "sx-m" }, svg);
  const deptLamps = departments.map((dept, index) => {
    const y = 70 + index * 80;
    svgEl("path", { d: `M364 165 C 380 165, 380 ${y + 17}, 396 ${y + 17}`, class: "sx-r" }, svg);
    svgRect(svg, 396, y, 64, 34);
    svgText(svg, 428, y + 54, dept, "tx", "middle");
    return svgEl(
      "circle",
      { cx: 428, cy: y + 17, r: 6, class: "fx-i", stroke: "var(--muted)" },
      svg,
    );
  });
  const packets = Array.from({ length: 6 }, () =>
    svgEl("rect", { x: -6, y: -3, width: 8, height: 6, class: "fx-d" }, svg),
  );
  const timeline = gsap.timeline({ repeat: -1, paused: true });
  let alertCount = 0;
  packets.forEach((packet, index) => {
    const lane = index % 4;
    const deptIndex = index % 3;
    const isAlert = index % 2 == 0;
    const start = index * 0.7;
    timeline
      .fromTo(
        packet,
        { attr: { x: 94, y: 54 + lane * 64 } },
        { attr: { x: 150, y: 162 }, duration: 0.5, ease: "power1.inOut" },
        start,
      )
      .to(packet, { attr: { x: 282 }, duration: 0.6, ease: "none" }, start + 0.5)
      .to(
        needle,
        {
          attr: { x2: isAlert ? 346 : 315, y2: isAlert ? 163 : 160 },
          duration: 0.35,
          ease: "power2.out",
        },
        start + 1.1,
      )
      .to(packet, { opacity: 0, duration: 0.15 }, start + 1.15)
      .set(packet, { opacity: 1, attr: { x: -20 } }, start + 1.3);
    if (isAlert) {
      timeline
        .to(
          deptLamps[deptIndex],
          {
            attr: { class: "fx-s" },
            duration: 0.01,
            onStart: () => {
              alertCount++;
              readout.textContent = `alerts ${alertCount}`;
            },
          },
          start + 1.35,
        )
        .to(deptLamps[deptIndex], { attr: { class: "fx-i" }, duration: 0.01 }, start + 2.2);
    }
  });
  timeline.to(needle, { attr: { x2: 327, y2: 158 }, duration: 0.6 }, "+=0.1");
  return timeline;
}
