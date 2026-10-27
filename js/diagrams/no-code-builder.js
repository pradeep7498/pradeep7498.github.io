/**
 * No-code builder: components drop from the palette into a phone.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawBuilderDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.7  canvas to app");
  const readout = addCaption(container, "read", "0 components");
  svgRect(svg, 30, 40, 120, 250, "sx-m");
  svgText(svg, 40, 58, "components");
  const components = [
    ["header", 30],
    ["image", 70],
    ["text", 26],
    ["button", 26],
    ["list", 54],
  ];
  components.forEach(([name], index) => {
    svgRect(svg, 42, 70 + index * 42, 96, 30, "sx-r");
    svgText(svg, 90, 89 + index * 42, name, "tx", "middle");
  });
  svgEl("rect", { x: 300, y: 24, width: 150, height: 290, rx: 18, class: "sx" }, svg);
  svgEl("line", { x1: 358, y1: 36, x2: 392, y2: 36, class: "sx-m" }, svg);
  svgEl("ellipse", { cx: 225, cy: 270, rx: 26, ry: 8, class: "sx-m" }, svg);
  svgEl("path", { d: "M199 270 L199 298 A 26 8 0 0 0 251 298 L251 270", class: "sx-m" }, svg);
  svgText(svg, 225, 320, "model", "tx", "middle");
  const placed = [];
  let nextY = 54;
  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true });
  components.forEach(([name, height], index) => {
    const block = svgEl(
      "rect",
      {
        x: 42,
        y: 70 + index * 42,
        width: 96,
        height: 30,
        class: index === 3 ? "fx-s" : "fx-d",
        opacity: 0,
      },
      svg,
    );
    placed.push(block);
    const targetY = nextY;
    nextY += height + 8;
    timeline
      .set(
        block,
        { opacity: 0.9, attr: { x: 42, y: 70 + index * 42, width: 96, height: 30 } },
        index * 0.7,
      )
      .to(
        block,
        { attr: { x: 312, y: targetY, width: 126, height }, duration: 0.55, ease: "power3.inOut" },
        index * 0.7 + 0.05,
      )
      .call(() => (readout.textContent = `${index + 1} components`), null, index * 0.7 + 0.6);
  });
  timeline
    .to(placed, { opacity: 0.25, duration: 0.3 }, "+=1.2")
    .call(() => (readout.textContent = "0 components"));
  return timeline;
}
