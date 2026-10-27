/**
 * Isometric drawing kit: turns shapes into SVG markup strings.
 * renderSolid() draws an extruded block, renderLine() a single path.
 */

const escapeAttr = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attrsToString = (attrs) =>
  Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== false)
    .map(([name, value]) => ` ${name}="${escapeAttr(String(value))}"`)
    .join("");
function renderSolid(
  shape,
  {
    tone = "hi",
    crease = "faint",
    halo = false,
    lit = false,
    flat = false,
    className,
    inner = "",
  } = {},
) {
  const parts = [];
  if (halo) {
    parts.push(`<path class="iso-halo" d="${shape.fill}"/>`);
  }
  parts.push(`<path class="iso-fill" d="${shape.fill}"/>`);
  if (!flat) {
    shape.shades.forEach((shadePath, index) => {
      if (shadePath) {
        parts.push(`<path class="iso-shade" data-shade="${index}" d="${shadePath}"/>`);
      }
    });
    parts.push(`<path class="iso-top" d="${shape.top}"/>`);
  }
  if (crease !== "none" && shape.crease) {
    parts.push(`<path class="iso-line iso-crease" data-tone="${crease}" d="${shape.crease}"/>`);
  }
  if (crease !== "none" && shape.bevel) {
    parts.push(`<path class="iso-line iso-bevel" data-tone="${crease}" d="${shape.bevel}"/>`);
  }
  if (inner) {
    parts.push(inner);
  }
  parts.push(`<path class="iso-line iso-edge" data-tone="${tone}" d="${shape.outline}"/>`);
  return `<g${attrsToString({ class: className ? `iso-solid ${className}` : "iso-solid", "data-lit": lit ? "" : undefined, "data-seamless": shape.seamless ? "" : undefined })}>${parts.join("")}</g>`;
}
function renderLine(
  pathData,
  { tone = "lo", dotted = false, dashed = false, flow = false, className, free } = {},
) {
  return pathData
    ? `<path${attrsToString({ class: className ? `iso-line ${className}` : "iso-line", "data-tone": tone, "data-free": free === true ? "" : free || undefined, "data-dotted": dotted ? "" : undefined, "data-dashed": dashed ? "" : undefined, "data-flow": flow ? "" : undefined, d: pathData })}/>`
    : "";
}
