/**
 * Unified user management: a role x permission grid lights up.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawPermissionsDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.6  who can do what");
  const readout = addCaption(container, "read", "0 grants");
  const roles = ["admin", "lead", "analyst", "viewer"];
  const permissions = ["read", "write", "export", "approve", "manage"];
  permissions.forEach((permission, index) =>
    svgText(svg, 170 + index * 56, 60, permission, "tx", "middle"),
  );
  const cells = [];
  roles.forEach((role, row) => {
    svgText(svg, 110, 104 + row * 50, role, "tx", "end");
    permissions.forEach((permission, col) => {
      const cell = svgRect(svg, 152 + col * 56, 86 + row * 50, 36, 30, "sx-r");
      const granted = col <= 4 - row + (row === 3 ? -1 : 0);
      cells.push({ c: cell, on: granted, i: row, j: col });
    });
  });
  svgEl("circle", { cx: 60, cy: 290, r: 9, class: "sx" }, svg);
  svgEl("path", { d: "M69 290 L110 290 M100 290 L100 298 M92 290 L92 296", class: "sx" }, svg);
  svgText(svg, 120, 294, "keycloak sso");
  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true });
  let grants = 0;
  timeline.call(() => {
    grants = 0;
    readout.textContent = "0 grants";
    cells.forEach((cell) => cell.c.setAttribute("class", "sx-r"));
  });
  cells
    .filter((cell) => cell.on)
    .forEach((cell, index) => {
      timeline.call(
        () => {
          cell.c.setAttribute("class", cell.j === 4 ? "fx-s" : "fx-d");
          grants++;
          readout.textContent = `${grants} grants`;
        },
        null,
        0.3 + index * 0.12,
      );
    });
  timeline.to({}, { duration: 1.4 });
  return timeline;
}
