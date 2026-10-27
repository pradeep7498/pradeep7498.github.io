/**
 * Animates the isometric AWARE figure (samples measured and sorted).
 * Expects the markup from aware-figure-markup.js to be inside `root`.
 * Pauses on hover/focus and when scrolled out of view.
 */

function animateAwareFigure(root) {
  const view = {
    origin: [340.4296838754101, 220.75399852147126],
    scale: 1.3779963373071642,
    azimuth: 40,
    elevation: 30,
  };
  const sampleSizes = [42, 128, 76, 156, 64, 121, 38, 94, 141, 57, 88, 133];
  const slotX = [-96, -48, 0, 48, 96, 144];
  const sampleRect = { x: -8, y: -9, w: 16, d: 18, r: 1.2 };
  const lampPos = [72, 50];
  const stage = root.querySelector(".iso-stage");
  const svg = stage.querySelector("svg");
  const sortLayer = svg.querySelector("[data-sort]");
  const plunger = svg.querySelector('[data-part="plunger"]');
  const pusher = svg.querySelector('[data-part="pusher"]');
  const needle = svg.querySelector('[data-part="needle"]');
  const lamp = svg.querySelector('[data-part="lamp"]');
  const readout = root.querySelector("[data-readout]");
  const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const renderSample = (mm) => {
    const height = mm / 10;
    return (
      `<path class="iso-halo" d="${rectFillPath(sampleRect, 4, 0.1, view)}" style="filter:blur(3px)"/>` +
      renderSolid(extrudeRoundedRect(sampleRect, 4, height, view, 3, 0.5), {
        tone: "hi",
        crease: "lo",
      }) +
      renderLine(rectOutlinePath(insetRect(sampleRect, 2.2), 4 + height, view, 3), {
        tone: "faint",
      })
    );
  };
  const renderLamp = (lit) =>
    renderSolid(extrudeCylinder(lampPos[0], lampPos[1], 4.2, 28, 7, view, 28, 0.5), {
      tone: "hi",
      lit,
      className: lit ? "aw-on" : "",
    });
  const needlePath = (value) => {
    const angle =
      -2.6179938779914944 + (Math.max(0, Math.min(200, value)) / 200) * 5.235987755982989;
    return linePath(
      [-Math.sin(angle) * 3.2, Math.cos(angle) * 3.2],
      [Math.sin(angle) * 12, -Math.cos(angle) * 12],
      78.2,
      view,
    );
  };
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  let sampleCounter = 0;
  let nextOffset = 1204;
  const samples = [];
  function spawnSample(slot) {
    const mm = sampleSizes[sampleCounter++ % sampleSizes.length];
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.innerHTML = renderSample(mm);
    sortLayer.appendChild(group);
    const sample = {
      g: group,
      mm,
      slot,
      x: slotX[slot],
      y: 0,
      alpha: 1,
      off: nextOffset++,
      binned: false,
      gone: false,
    };
    samples.push(sample);
    return sample;
  }
  for (let slot = 0; slot <= 4; slot++) {
    spawnSample(slot);
  }
  for (const sample of samples) {
    sample.x = slotX[sample.slot];
  }
  const CYCLE = 2.8;
  let cycleTime = 0;
  const plungerSpring = { at: 24, rate: 0 };
  let pushAmount = 0;
  let lampTimer = 0;
  let lampOn = false;
  let paused = false;
  let visible = false;
  let rafId = 0;
  let lastFrame = 0;
  let readoutText = "";
  function plungerTarget(_) {
    let height = 4;
    for (const sample of samples) {
      if (!sample.binned && Math.abs(sample.x) < sampleRect.w / 2 + 1.4) {
        height = Math.max(height, 4 + sample.mm / 10);
      }
    }
    return height;
  }
  const slotPosition = (slot) =>
    slot < 0
      ? slotX[0] - 48
      : slot < slotX.length
        ? slotX[slot]
        : slotX[slotX.length - 1] + 48 * (slot - slotX.length + 1);
  function advanceSlots() {
    for (const sample of samples) {
      if (!sample.binned) {
        sample.slot++;
      }
    }
    spawnSample(0);
  }
  function step(dt) {
    cycleTime += dt;
    if (cycleTime >= CYCLE) {
      cycleTime -= CYCLE;
      advanceSlots();
    }
    const progress = Math.min(1, cycleTime / 0.95);
    const eased = easeInOutCubic(progress);
    for (const sample of samples) {
      if (sample.binned) {
        continue;
      }
      const fromX = slotPosition(sample.slot - 1);
      sample.x = fromX + (slotPosition(sample.slot) - fromX) * eased;
      sample.alpha =
        Math.min(1, Math.max(0, (sample.x - (slotX[0] - 48 + 6)) / (48 * 0.55))) *
        Math.min(1, Math.max(0, (slotX[5] - 6 - sample.x) / 18));
      if (sample.slot >= slotX.length - 1 && progress >= 1) {
        sample.gone = true;
      }
    }
    const target = cycleTime > 1.0999999999999999 ? plungerTarget(0) : 24;
    const reduced = reducedMotionQuery.matches;
    for (let substep = 0; substep < 4; substep++) {
      plungerSpring.rate +=
        (((target - plungerSpring.at) * 320 - plungerSpring.rate * (reduced ? 36 : 24)) * dt) / 4;
      plungerSpring.at += (plungerSpring.rate * dt) / 4;
    }
    const atPusher = samples.find((sample) => !sample.binned && sample.slot === 3);
    const isOversize = atPusher && atPusher.mm > 115;
    const pushPhase = cycleTime - 1.2;
    pushAmount +=
      ((isOversize && pushPhase > 0 && pushPhase < 1.1 ? 1 : 0) - pushAmount) *
      (1 - Math.exp(-dt / 0.12));
    if (isOversize && pushAmount > 0.02) {
      atPusher.y = pushAmount * 34;
    }
    if (isOversize && pushAmount > 0.95 && !atPusher.binned) {
      atPusher.binned = true;
      atPusher.binnedAt = performance.now();
      lampTimer = 1;
    }
    lampTimer = Math.max(0, lampTimer - dt / 1.9);
    for (const sample of samples) {
      if (sample.binned) {
        sample.alpha = Math.max(0, sample.alpha - dt / 2.2);
        if (sample.alpha <= 0) {
          sample.gone = true;
        }
      }
    }
    for (let i = samples.length - 1; i >= 0; i--) {
      if (samples[i].gone) {
        samples[i].g.remove();
        samples.splice(i, 1);
      }
    }
  }
  function render() {
    for (const sample of samples) {
      sample.g.setAttribute("transform", isoTranslate(view, [sample.x, sample.y, 0]));
      sample.g.setAttribute("opacity", sample.alpha.toFixed(3));
      sample.key = sample.binned || sample.y > 1 ? 450 : isoDepth([sample.x, sample.y, 4], view);
    }
    plunger.setAttribute("transform", isoTranslate(view, [0, 0, plungerSpring.at]));
    pusher.setAttribute("transform", isoTranslate(view, [0, pushAmount * 34, 0]));
    const reading = (plungerSpring.at - 4) * 10;
    needle.setAttribute("d", needlePath(reading));
    const lampShouldBeOn = lampTimer > 0.05;
    if (lampShouldBeOn !== lampOn) {
      lampOn = lampShouldBeOn;
      lamp.innerHTML = renderLamp(lampShouldBeOn);
    }
    const nodes = [...sortLayer.children];
    for (const node of nodes) {
      node._key =
        node.dataset.key === undefined
          ? (samples.find((sample) => sample.g === node)?.key ?? 0)
          : +node.dataset.key;
    }
    const sorted = [...nodes].sort((a, b) => a._key - b._key);
    if (sorted.some((node, index) => node !== nodes[index])) {
      sorted.forEach((node) => sortLayer.appendChild(node));
    }
    const underPlunger = samples.find((sample) => !sample.binned && Math.abs(sample.x) < 1);
    const measured = underPlunger && Math.abs(plungerSpring.at - (4 + underPlunger.mm / 10)) < 0.15;
    let text;
    text = measured
      ? "offset " +
        underPlunger.off +
        " · " +
        underPlunger.mm +
        " mm · " +
        (underPlunger.mm > 115 ? "over 115, alert" : "under 115, stored")
      : readoutText || "offset 1204 · waiting";
    if (text !== readoutText) {
      readoutText = text;
      readout.textContent = text;
    }
  }
  function frame(now) {
    const dt = lastFrame ? Math.min((now - lastFrame) / 1e3, 1 / 30) : 1 / 60;
    lastFrame = now;
    if (!paused) {
      step(dt);
    }
    render();
    rafId = visible ? requestAnimationFrame(frame) : 0;
  }
  const startLoop = () => {
    if (!rafId && visible) {
      lastFrame = 0;
      rafId = requestAnimationFrame(frame);
    }
  };
  new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) {
        startLoop();
      }
    },
    { rootMargin: "120px 0px" },
  ).observe(stage);
  stage.addEventListener("pointerenter", () => (paused = true));
  stage.addEventListener("pointerleave", () => (paused = false));
  stage.addEventListener("focus", () => (paused = true));
  stage.addEventListener("blur", () => (paused = false));
  if (reducedMotionQuery.matches) {
    cycleTime = 1.85;
    plungerSpring.at = plungerTarget(0);
    step(0);
    render();
    paused = true;
  }
  render();
}
