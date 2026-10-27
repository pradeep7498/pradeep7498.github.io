/**
 * The animated particle background (#field canvas).
 * createParticleField(canvas, { reduced }) builds a three.js scene and starts rendering.
 * Returns { uniforms, count } so other code can animate it, or null if WebGL is unavailable.
 * Uses: THREE (js/vendor/three.min.js), shaders.js
 */

function createParticleField(canvas, { reduced = false } = {}) {
  const isMobile = matchMedia("(max-width: 900px)").matches;
  const count = isMobile ? 7e3 : 14e3;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    canvas.remove();
    return null;
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 6);
  const spherePositions = new Float32Array(count * 3);
  const latticePositions = new Float32Array(count * 3);
  const discPositions = new Float32Array(count * 3);
  const streamData = new Float32Array(count * 4);
  const randoms = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const latticeSide = Math.round(Math.cbrt(count));
  for (let i = 0; i < count; i++) {
    const sphereY = 1 - (i / (count - 1)) * 2;
    const ringRadius = Math.sqrt(1 - sphereY * sphereY);
    const theta = goldenAngle * i;
    spherePositions.set(
      [Math.cos(theta) * ringRadius, sphereY, Math.sin(theta) * ringRadius],
      i * 3,
    );
    const gridX = i % latticeSide;
    const gridY = Math.floor(i / latticeSide) % latticeSide;
    const gridZ = Math.floor(i / (latticeSide * latticeSide)) % latticeSide;
    const gridStep = 2 / (latticeSide - 1);
    latticePositions.set([gridX * gridStep - 1, gridY * gridStep - 1, gridZ * gridStep - 1], i * 3);
    const discRadius =
      Math.random() < 0.55 ? 0.55 + Math.random() * 0.12 : Math.sqrt(Math.random());
    const discAngle = Math.random() * Math.PI * 2;
    discPositions.set(
      [
        Math.cos(discAngle) * discRadius,
        Math.sin(discAngle) * discRadius,
        (Math.random() - 0.5) * 0.06,
      ],
      i * 3,
    );
    streamData.set(
      [Math.random(), i % 7, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2],
      i * 4,
    );
    randoms[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(spherePositions.slice(), 3));
  geometry.setAttribute("aSphere", new THREE.BufferAttribute(spherePositions, 3));
  geometry.setAttribute("aLattice", new THREE.BufferAttribute(latticePositions, 3));
  geometry.setAttribute("aDisc", new THREE.BufferAttribute(discPositions, 3));
  geometry.setAttribute("aStream", new THREE.BufferAttribute(streamData, 4));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(randoms, 1));
  const rootStyles = getComputedStyle(document.documentElement);
  const uniforms = {
    uTime: { value: 0 },
    uState: { value: 0 },
    uR: { value: 1.2 },
    uPR: { value: pixelRatio },
    uSize: { value: isMobile ? 2.4 : 2.1 },
    uMotion: { value: +!reduced },
    uView: { value: new THREE.Vector2(6, 3.8) },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseOn: { value: 0 },
    uShift: { value: new THREE.Vector2(0, 0) },
    uPaper: { value: new THREE.Color(rootStyles.getPropertyValue("--paper").trim() || "#e7ebf3") },
    uSignal: {
      value: new THREE.Color(rootStyles.getPropertyValue("--signal").trim() || "#f2b544"),
    },
    uData: { value: new THREE.Color(rootStyles.getPropertyValue("--data").trim() || "#7fb7c9") },
    uAlpha: { value: 0 },
  };
  const points = new THREE.Points(
    geometry,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: 2,
    }),
  );
  points.frustumCulled = false;
  scene.add(points);
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const viewHeight = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const viewWidth = viewHeight * camera.aspect;
    uniforms.uView.value.set(viewWidth, viewHeight);
    const shapePixels = isMobile ? width * 0.74 : Math.min(width * 0.4, 520);
    uniforms.uR.value = ((shapePixels * 0.6) / 2 / height) * viewHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  const raycaster = new THREE.Raycaster();
  const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const pointerNdc = new THREE.Vector2();
  const hitPoint = new THREE.Vector3();
  const mouseTarget = new THREE.Vector3(99, 99, 0);
  let mouseActive = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      pointerNdc.set((event.clientX / innerWidth) * 2 - 1, -(event.clientY / innerHeight) * 2 + 1);
      raycaster.setFromCamera(pointerNdc, camera);
      if (raycaster.ray.intersectPlane(zPlane, hitPoint)) {
        mouseTarget.copy(hitPoint);
      }
      mouseActive = 1;
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => (mouseActive = 0));
  let tiltX = 0;
  let tiltY = 0;
  let inView = true;
  let pageVisible = true;
  let lastTime = performance.now();
  new IntersectionObserver(([entry]) => (inView = entry.isIntersecting)).observe(canvas);
  document.addEventListener("visibilitychange", () => (pageVisible = !document.hidden));
  function tick(now) {
    requestAnimationFrame(tick);
    if (!pageVisible || !inView) {
      lastTime = now;
      return;
    }
    const dt = Math.min((now - lastTime) / 1e3, 0.05);
    lastTime = now;
    uniforms.uTime.value += dt;
    uniforms.uMouse.value.lerp(mouseTarget, 1 - Math.exp(-dt * 8));
    uniforms.uMouseOn.value += (mouseActive - uniforms.uMouseOn.value) * (1 - Math.exp(-dt * 4));
    const influence = uniforms.uMouseOn.value;
    const targetTiltX = reduced ? 0 : uniforms.uMouse.value.y * 0.04 * influence;
    const targetTiltY = reduced ? 0 : uniforms.uMouse.value.x * 0.04 * influence;
    tiltX += (targetTiltX - tiltX) * (1 - Math.exp(-dt * 3));
    tiltY += (targetTiltY - tiltY) * (1 - Math.exp(-dt * 3));
    points.rotation.x = -tiltX;
    points.rotation.y = tiltY;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
  return { uniforms, count };
}
