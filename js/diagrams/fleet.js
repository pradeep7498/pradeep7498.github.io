/**
 * Fleet telematics: a vehicle drives the route while a speed widget fills.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawFleetDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.5  trip telemetry");
  const readout = addCaption(container, "read", "0 km/h");
  const routeD = "M30 270 C 90 270, 90 180, 160 180 S 230 90, 300 110 S 380 230, 450 60";
  svgEl("path", { d: routeD, class: "sx-r", "stroke-width": 8, stroke: "var(--rule)" }, svg);
  const route = svgEl("path", { d: routeD, class: "sx-m", "stroke-dasharray": "4 6" }, svg);
  const trail = svgEl("path", { d: routeD, class: "sx-d" }, svg);
  const routeLength = route.getTotalLength();
  trail.style.strokeDasharray = `${routeLength}`;
  trail.style.strokeDashoffset = `${routeLength}`;
  const vehicle = svgEl("g", {}, svg);
  svgEl("rect", { x: -7, y: -5, width: 14, height: 10, class: "fx-p" }, vehicle);
  svgRect(svg, 330, 220, 130, 80, "sx-m");
  const bars = Array.from({ length: 10 }, (_, index) =>
    svgEl(
      "rect",
      { x: 340 + index * 11.5, y: 290, width: 7, height: 0, class: index === 9 ? "fx-s" : "fx-d" },
      svg,
    ),
  );
  svgText(svg, 340, 236, "speed widget");
  const progress = { v: 0 };
  const timeline = gsap.timeline({ repeat: -1, paused: true });
  timeline
    .fromTo(
      progress,
      { v: 0 },
      {
        v: 1,
        duration: 5,
        ease: "none",
        onUpdate: () => {
          const point = route.getPointAtLength(progress.v * routeLength);
          const ahead = route.getPointAtLength(Math.min(routeLength, progress.v * routeLength + 2));
          const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
          vehicle.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
          trail.style.strokeDashoffset = `${routeLength * (1 - progress.v)}`;
          const speed = Math.round(38 + Math.sin(progress.v * 14) * 22 + progress.v * 20);
          readout.textContent = `${speed} km/h`;
          const barIndex = Math.floor(progress.v * 10) % 10;
          bars[barIndex].setAttribute("height", speed * 0.9);
          bars[barIndex].setAttribute("y", 290 - speed * 0.9);
        },
      },
    )
    .to({}, { duration: 0.6 });
  return timeline;
}
