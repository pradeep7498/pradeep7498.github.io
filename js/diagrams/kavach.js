/**
 * Railway Kavach: a scan line checks tag spacing and flags one violation.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawKavachDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.2  tag layout check");
  const readout = addCaption(container, "read", "checking…");
  for (let x = 20; x < 470; x += 14) {
    svgEl("line", { x1: x, y1: 140, x2: x, y2: 190, class: "sx-r" }, svg);
  }
  svgEl("line", { x1: 12, y1: 150, x2: 468, y2: 150, class: "sx" }, svg);
  svgEl("line", { x1: 12, y1: 180, x2: 468, y2: 180, class: "sx" }, svg);
  svgEl("line", { x1: 40, y1: 140, x2: 40, y2: 76, class: "sx" }, svg);
  svgRect(svg, 32, 56, 16, 26);
  svgEl("circle", { cx: 40, cy: 63, r: 4, class: "fx-s" }, svg);
  svgEl("circle", { cx: 40, cy: 75, r: 4, class: "fx-i", stroke: "var(--muted)" }, svg);
  svgEl("line", { x1: 60, y1: 236, x2: 440, y2: 236, class: "sx-m" }, svg);
  const tagPositions = [80, 160, 240, 334, 400];
  const markerPositions = [80, 160, 240, 320, 400];
  tagPositions.forEach((tagX, index) => {
    svgEl(
      "line",
      { x1: markerPositions[index], y1: 230, x2: markerPositions[index], y2: 242, class: "sx-m" },
      svg,
    );
    svgText(svg, markerPositions[index], 258, `${index * 120} m`, "tx", "middle");
  });
  const tags = tagPositions.map((x) =>
    svgEl("rect", { x: x - 7, y: 160, width: 14, height: 10, class: "sx" }, svg),
  );
  const expectedTag = svgEl(
    "rect",
    { x: 313, y: 160, width: 14, height: 10, class: "sx-m", "stroke-dasharray": "2 2", opacity: 0 },
    svg,
  );
  const note = svgEl("g", { opacity: 0 }, svg);
  svgEl("path", { d: "M334 156 L334 108 L352 108", class: "sx-s" }, note);
  svgText(note, 356, 104, "expected 360 m", "tx-s");
  svgText(note, 356, 118, "actual 381 m", "tx-s");
  const scanLine = svgEl("line", { x1: 20, y1: 128, x2: 20, y2: 200, class: "sx-d" }, svg);
  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
  timeline
    .call(() => (readout.textContent = "checking…"))
    .set([note, expectedTag], { opacity: 0 })
    .set(tags, { attr: { class: "sx" } })
    .fromTo(
      scanLine,
      { attr: { x1: 20, x2: 20 } },
      { attr: { x1: 460, x2: 460 }, duration: 3.2, ease: "none" },
    );
  tagPositions.forEach((x, index) => {
    const time = ((x - 20) / 440) * 3.2;
    timeline.to(
      tags[index],
      { attr: { class: index === 3 ? "sx-s" : "sx-d" }, duration: 0.01 },
      time,
    );
  });
  timeline
    .to(expectedTag, { opacity: 1, duration: 0.3 }, 2.3)
    .to(note, { opacity: 1, duration: 0.3 }, 2.4)
    .call(() => (readout.textContent = "1 violation"), null, 2.4)
    .to({}, { duration: 1.4 });
  return timeline;
}
