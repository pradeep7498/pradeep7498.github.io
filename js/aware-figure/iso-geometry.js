/**
 * Isometric drawing kit: projection and polygon math.
 * Turns flat shapes (x, y) plus a height into isometric SVG path strings.
 * A "view" is { origin, scale, azimuth, elevation }.
 */

const DEG = Math.PI / 180;
const ISO_SCALE = Math.sqrt(1.6);
function isoAngles({ scale, azimuth = 45, elevation = 30 }) {
  const azimuthRad = azimuth * DEG;
  const elevationRad = elevation * DEG;
  return {
    sinA: Math.sin(azimuthRad),
    cosA: Math.cos(azimuthRad),
    sinE: Math.sin(elevationRad),
    cosE: Math.cos(elevationRad),
    k: scale * ISO_SCALE,
  };
}
function isoProject([x, y, z], view) {
  const { origin } = view;
  const { sinA, cosA, sinE, cosE, k } = isoAngles(view);
  return [
    origin[0] + (x * sinA - y * cosA) * k,
    origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k,
  ];
}
function isoViewDirection(view) {
  const { sinA, cosA } = isoAngles(view);
  return [cosA, sinA];
}
function isoDepth([x, y, z], view) {
  const { sinA, cosA, sinE, cosE } = isoAngles(view);
  return (x * cosA + y * sinA) * cosE + z * sinE;
}
const formatCoord = (value) => {
  const text = (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
  return text === "-0" ? "0" : text;
};
function toPathData(points, closed = false) {
  return points.length
    ? points
        .map(([x, y], index) => `${index ? "L" : "M"}${formatCoord(x)} ${formatCoord(y)}`)
        .join("") + (closed ? "Z" : "")
    : "";
}
function roundedRectPoints({ x: left, y: top, w: width, d: depth, r: radius }, segments = 8) {
  const cornerRadius = Math.max(0, Math.min(radius, width / 2, depth / 2));
  const corners = [
    [left + width - cornerRadius, top + cornerRadius, -90],
    [left + width - cornerRadius, top + depth - cornerRadius, 0],
    [left + cornerRadius, top + depth - cornerRadius, 90],
    [left + cornerRadius, top + cornerRadius, 180],
  ];
  const points = [];
  for (const [cx, cy, startAngle] of corners) {
    const steps = cornerRadius > 0 ? segments : 0;
    for (let step = 0; step <= steps; step++) {
      const angle = (startAngle + (steps ? (90 * step) / steps : 45)) * DEG;
      points.push([cx + cornerRadius * Math.cos(angle), cy + cornerRadius * Math.sin(angle)]);
    }
  }
  return points;
}
function signedArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}
const toPositiveWinding = (points) => (signedArea(points) < 0 ? [...points].reverse() : points);
function convexHull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) {
    return sorted;
  }
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const point of sorted) {
    for (
      ;
      lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0;
    ) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const point = sorted[i];
    for (
      ;
      upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0;
    ) {
      upper.pop();
    }
    upper.push(point);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
function findRuns(flags, value) {
  const count = flags.length;
  const runs = [];
  const start = flags.findIndex((flag, index) => flag !== flags[(index + count - 1) % count]);
  if (start < 0) {
    return flags[0] === value
      ? [Array.from({ length: count + 1 }, (_, index) => index % count)]
      : [];
  }
  let run = null;
  for (let step = 0; step < count; step++) {
    const index = (start + step) % count;
    if (flags[index] === value) {
      run ||= [index];
      run.push((index + 1) % count);
    } else {
      run &&= (runs.push(run), null);
    }
  }
  if (run) {
    runs.push(run);
  }
  return runs;
}
function extrudePolygon(points, baseZ, height, view, options = {}) {
  const convex = options.convex ?? true;
  const count = points.length;
  const isCounterClockwise = signedArea(points) > 0;
  const [viewX, viewY] = isoViewDirection(view);
  const { sinA, cosA } = isoAngles(view);
  const normals = points.map(([x, y], index) => {
    const [nextX, nextY] = points[(index + 1) % count];
    const dx = nextX - x;
    const dy = nextY - y;
    const len = Math.hypot(dx, dy) || 1;
    return isCounterClockwise ? [dy / len, -dx / len] : [-dy / len, dx / len];
  });
  const facing = normals.map(([nx, ny]) => nx * viewX + ny * viewY > 1e-9);
  const topPoints = points.map(([x, y]) => isoProject([x, y, baseZ + height], view));
  const bottomPoints = points.map(([x, y]) => isoProject([x, y, baseZ], view));
  const outlines = [];
  const creases = [];
  for (const run of findRuns(facing, false)) {
    outlines.push(toPathData(run.map((index) => topPoints[index])));
  }
  for (const run of findRuns(facing, true)) {
    creases.push(toPathData(run.map((index) => topPoints[index])));
    if (height > 0) {
      outlines.push(toPathData(run.map((index) => bottomPoints[index])));
    }
  }
  if (height > 0) {
    for (let i = 0; i < count; i++) {
      if (facing[(i + count - 1) % count] !== facing[i]) {
        outlines.push(toPathData([topPoints[i], bottomPoints[i]]));
      }
    }
  }
  let fill;
  if (convex) {
    fill = toPathData(convexHull([...topPoints, ...bottomPoints]), true);
  } else {
    const parts = [
      toPathData(toPositiveWinding(topPoints), true),
      toPathData(toPositiveWinding(bottomPoints), true),
    ];
    for (let i = 0; i < count; i++) {
      if (!facing[i]) {
        continue;
      }
      const next = (i + 1) % count;
      parts.push(
        toPathData(
          toPositiveWinding([topPoints[i], topPoints[next], bottomPoints[next], bottomPoints[i]]),
          true,
        ),
      );
    }
    fill = parts.join("");
  }
  const shades = Array.from({ length: 4 }, () => []);
  if (height > 0) {
    const [lightX, lightY] = [-sinA, cosA];
    for (let i = 0; i < count; i++) {
      if (!facing[i]) {
        continue;
      }
      const [nx, ny] = normals[i];
      const lightness = (nx * lightX + ny * lightY + 1) / 2;
      const band = Math.min(3, Math.max(0, Math.floor(lightness * 4)));
      const next = (i + 1) % count;
      shades[band].push(
        toPathData(
          toPositiveWinding([topPoints[i], topPoints[next], bottomPoints[next], bottomPoints[i]]),
          true,
        ),
      );
    }
  }
  let bevel;
  if (options.bevel && options.bevel > 0) {
    const inset = options.bevel;
    const insetPoints = points
      .map(([x, y], index) => {
        const [prevNx, prevNy] = normals[(index + count - 1) % count];
        const [curNx, curNy] = normals[index];
        const bisX = prevNx + curNx;
        const bisY = prevNy + curNy;
        const bisLen = Math.hypot(bisX, bisY) || 1;
        return [x - (bisX / bisLen) * inset, y - (bisY / bisLen) * inset];
      })
      .map(([x, y]) => isoProject([x, y, baseZ + height], view));
    bevel = findRuns(facing, true)
      .map((run) =>
        toPathData([
          topPoints[run[0]],
          ...run.slice(1, -1).map((index) => insetPoints[index]),
          topPoints[run[run.length - 1]],
        ]),
      )
      .join("");
  }
  return {
    fill,
    outline: outlines.join(""),
    crease: creases.join(""),
    top: toPathData(toPositiveWinding(topPoints), true),
    shades: shades.map((list) => list.join("")),
    bevel,
  };
}
const rectOutline = (rect, segments = 8) => roundedRectPoints(rect, segments);
function extrudeRoundedRect(rect, baseZ, height, view, segments = 8, bevel = 0) {
  return extrudePolygon(rectOutline(rect, segments), baseZ, height, view, { convex: true, bevel });
}
function circlePoints(cx, cy, radius, count = 40) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });
}
function extrudeCylinder(cx, cy, radius, baseZ, height, view, segments = 32, bevel = 0) {
  return extrudePolygon(circlePoints(cx, cy, radius, segments), baseZ, height, view, {
    convex: true,
    bevel,
  });
}
const insetRect = ({ x: left, y: top, w: width, d: depth, r: radius }, amount) => ({
  x: left + amount,
  y: top + amount,
  w: width - amount * 2,
  d: depth - amount * 2,
  r: Math.max(0, radius - amount),
});
function projectedPath(points, z, view, closed = false) {
  return toPathData(
    points.map(([x, y]) => isoProject([x, y, z], view)),
    closed,
  );
}
const rectOutlinePath = (rect, z, view, segments = 8) =>
  projectedPath(rectOutline(rect, segments), z, view, true);
const linePath = (from, to, z, view) => projectedPath([from, to], z, view);
const rectFillPath = (rect, baseZ, height, view) =>
  extrudeRoundedRect(rect, baseZ, height, view).fill;
function isoOffset(view, [x, y, z]) {
  const origin = isoProject([0, 0, 0], view);
  const point = isoProject([x, y, z], view);
  return [point[0] - origin[0], point[1] - origin[1]];
}
const round2 = (value) => Math.round(value * 100) / 100;
function isoTranslate(view, point) {
  const [dx, dy] = isoOffset(view, point);
  return `translate(${round2(dx)} ${round2(dy)})`;
}
