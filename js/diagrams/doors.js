/**
 * Connected doors: the door opens, then a firmware update rolls out.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawDoorDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.4  door, sensor, portal");
  const readout = addCaption(container, "read", "fw 2.4.1");
  svgRect(svg, 60, 60, 220, 220);
  svgRect(svg, 60, 40, 220, 20, "sx-m");
  svgRect(svg, 150, 62, 40, 10, "sx");
  const sensorWaves = [0, 1, 2].map((index) =>
    svgEl(
      "path",
      {
        d: `M${152 - index * 12} ${80 + index * 10} Q170 ${96 + index * 14} ${188 + index * 12} ${80 + index * 10}`,
        class: "sx-d",
        opacity: 0,
      },
      svg,
    ),
  );
  const leftDoor = svgRect(svg, 64, 74, 104, 202, "sx");
  const rightDoor = svgRect(svg, 172, 74, 104, 202, "sx");
  svgEl("line", { x1: 40, y1: 280, x2: 300, y2: 280, class: "sx-m" }, svg);
  svgEl("path", { d: "M280 50 L330 50 L330 130 L360 130", class: "sx-r" }, svg);
  svgRect(svg, 360, 100, 100, 120);
  const statusDots = ["status", "firmware", "certificate"].map((label, index) => {
    svgText(svg, 370, 126 + index * 30, label);
    return svgEl("circle", { cx: 448, cy: 122 + index * 30, r: 4, class: "fx-d" }, svg);
  });
  const progressBar = svgEl("rect", { x: 370, y: 200, width: 0, height: 4, class: "fx-s" }, svg);
  const packet = svgEl("circle", { r: 3, class: "fx-s", cx: 280, cy: 50, opacity: 0 }, svg);
  const timeline = gsap.timeline({ repeat: -1, paused: true });
  timeline
    .to(sensorWaves, { opacity: 1, duration: 0.2, stagger: 0.12 })
    .to(leftDoor, { attr: { x: 4 }, duration: 0.9, ease: "power2.inOut" }, 0.3)
    .to(rightDoor, { attr: { x: 232 }, duration: 0.9, ease: "power2.inOut" }, 0.3)
    .to(sensorWaves, { opacity: 0, duration: 0.3 }, 1.2)
    .to(leftDoor, { attr: { x: 64 }, duration: 0.9, ease: "power2.inOut" }, 2)
    .to(rightDoor, { attr: { x: 172 }, duration: 0.9, ease: "power2.inOut" }, 2)
    .set(packet, { opacity: 1, attr: { cx: 360, cy: 130 } }, 2.4)
    .to(packet, { attr: { cx: 330 }, duration: 0.2, ease: "none" }, 2.4)
    .to(packet, { attr: { cy: 50 }, duration: 0.35, ease: "none" })
    .to(packet, { attr: { cx: 190 }, duration: 0.4, ease: "none" })
    .set(packet, { opacity: 0 })
    .to(progressBar, { attr: { width: 80 }, duration: 1, ease: "power1.inOut" }, 2.6)
    .call(
      () => {
        readout.textContent = "fw 2.4.2";
        statusDots[1].setAttribute("class", "fx-s");
      },
      null,
      3.6,
    )
    .call(
      () => {
        statusDots[2].setAttribute("class", "fx-s");
      },
      null,
      3.9,
    )
    .to({}, { duration: 1.2 })
    .call(() => {
      readout.textContent = "fw 2.4.1";
      statusDots.forEach((dot) => dot.setAttribute("class", "fx-d"));
    })
    .set(progressBar, { attr: { width: 0 } });
  svgEl(
    "rect",
    { x: 64, y: 74, width: 212, height: 202 },
    svgEl("clipPath", { id: "door-clip" }, svg),
  );
  leftDoor.setAttribute("clip-path", "url(#door-clip)");
  rightDoor.setAttribute("clip-path", "url(#door-clip)");
  return timeline;
}
