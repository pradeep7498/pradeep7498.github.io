/**
 * Wise-Flow: a dot travels through chatbot blocks at runtime.
 * Returns a paused GSAP timeline; js/page/projects.js plays it while on screen.
 */

function drawFlowDiagram(container) {
  const svg = createDiagramSvg(container);
  addCaption(container, "fig", "fig. 2.3  a flow at runtime");
  const readout = addCaption(container, "read", "step trigger");
  const positions = {
    trigger: [30, 140],
    prompt: [130, 140],
    cond: [230, 140],
    action: [340, 70],
    know: [340, 210],
    reply: [430, 140],
  };
  const labels = {
    trigger: "trigger",
    prompt: "prompt",
    cond: "if",
    action: "action",
    know: "knowledge",
    reply: "reply",
  };
  const edges = [
    ["trigger", "prompt"],
    ["prompt", "cond"],
    ["cond", "action"],
    ["cond", "know"],
    ["action", "reply"],
    ["know", "reply"],
  ];
  const edgePaths = {};
  edges.forEach(([from, to]) => {
    const [fromX, fromY] = positions[from];
    const [toX, toY] = positions[to];
    const startX = fromX + 22;
    const endX = toX - 22;
    const pathD = `M${startX} ${fromY} C ${(startX + endX) / 2} ${fromY}, ${(startX + endX) / 2} ${toY}, ${endX} ${toY}`;
    edgePaths[from + to] = svgEl("path", { d: pathD, class: "sx-r" }, svg);
  });
  const nodes = {};
  for (const key in positions) {
    const [x, y] = positions[key];
    const group = svgEl("g", {}, svg);
    if (key === "cond") {
      svgEl(
        "path",
        { d: `M${x} ${y - 22} L${x + 22} ${y} L${x} ${y + 22} L${x - 22} ${y} Z`, class: "sx" },
        group,
      );
    } else {
      svgRect(group, x - 22, y - 16, 44, 32);
    }
    svgEl("circle", { cx: x - 22, cy: y, r: 2.5, class: "fx-p" }, group);
    svgEl("circle", { cx: x + 22, cy: y, r: 2.5, class: "fx-p" }, group);
    svgText(svg, x, y + (key === "cond" ? 40 : 34), labels[key], "tx", "middle");
    nodes[key] = group;
  }
  const dot = svgEl("circle", { r: 4, class: "fx-s" }, svg);
  const routeFor = (branch) => [
    "triggerprompt",
    "promptcond",
    branch === "a" ? "condaction" : "condknow",
    branch === "a" ? "actionreply" : "knowreply",
  ];
  const timeline = gsap.timeline({ repeat: -1, paused: true });
  ["a", "b"].forEach((branch) => {
    routeFor(branch).forEach((edgeKey) => {
      const path = edgePaths[edgeKey];
      const length = path.getTotalLength();
      const progress = { v: 0 };
      timeline.to(progress, {
        v: 1,
        duration: 0.55,
        ease: "power1.inOut",
        onStart: () => {
          path.setAttribute("class", "sx-d");
          readout.textContent = `step ${edgeKey.replace(/^(trigger|prompt|cond|action|know)/, "")}`;
        },
        onUpdate: () => {
          const point = path.getPointAtLength(progress.v * length);
          dot.setAttribute("cx", point.x);
          dot.setAttribute("cy", point.y);
        },
        onComplete: () => path.setAttribute("class", "sx-r"),
      });
    });
    timeline.to({}, { duration: 0.4 });
  });
  return timeline;
}
