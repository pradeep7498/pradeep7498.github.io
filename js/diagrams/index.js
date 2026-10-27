/**
 * Which diagram belongs to which project.
 * Keys match data-viz="..." on each <article class="proj"> in index.html.
 * Load this after all the diagram files.
 */

const PROJECT_DIAGRAMS = {
  aware: drawAwareDiagram,
  kavach: drawKavachDiagram,
  flow: drawFlowDiagram,
  door: drawDoorDiagram,
  fleet: drawFleetDiagram,
  keys: drawPermissionsDiagram,
  builder: drawBuilderDiagram,
  water: drawWaterDiagram,
};
