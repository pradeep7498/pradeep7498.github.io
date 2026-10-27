/**
 * Small helpers for the animated project diagrams.
 * Every diagram is an SVG of DIAGRAM_WIDTH x DIAGRAM_HEIGHT plus two captions:
 *   .fig (figure title) and .read (live readout text).
 * Styling classes: sx* = strokes, fx* = fills, tx* = text (see css/diagrams.css).
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const DIAGRAM_WIDTH = 480;
const DIAGRAM_HEIGHT = 330;
function svgEl(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const name in attrs) {
    el.setAttribute(name, attrs[name]);
  }
  if (parent) {
    parent.appendChild(el);
  }
  return el;
}
function svgText(parent, x, y, text, className = "tx", anchor = "start") {
  const el = svgEl("text", { x, y, class: className, "text-anchor": anchor }, parent);
  el.textContent = text;
  return el;
}
function createDiagramSvg(container) {
  const svg = svgEl("svg", {
    viewBox: `0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`,
    preserveAspectRatio: "xMidYMid meet",
    role: "img",
  });
  container.appendChild(svg);
  return svg;
}
function addCaption(container, className, text) {
  const p = document.createElement("p");
  p.className = `${className} mono`;
  p.textContent = text;
  container.appendChild(p);
  return p;
}
function svgRect(parent, x, y, width, height, className = "sx") {
  return svgEl("rect", { x, y, width, height, class: className }, parent);
}
