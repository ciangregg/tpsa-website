/* ---------- Halvorsen strange attractor ----------
   Drag to rotate, no auto-motion, the original pink→purple→blue→cyan→green
   colour ramp, and the parameter (a) slider. */
export function initAttractor() {
  const canvas = document.getElementById("attractor");
  const slider = document.getElementById("attractor-a");
  const readout = document.getElementById("attractor-a-readout");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const rotation = { x: (-146.10 * Math.PI) / 180, y: (-46.41 * Math.PI) / 180, z: 0 };
  const dt = 0.005;
  let a = parseFloat(slider.value);
  let minZ = Infinity, maxZ = -Infinity;
  let dragging = false, prev = { x: 0, y: 0 };

  const points = (() => {
    const viewAngleY = (-46.41 * Math.PI) / 180;
    const out = [];
    const gridSize = 20, spacing = 0.1;
    for (let i = -gridSize; i <= gridSize; i++)
      for (let j = -gridSize; j <= gridSize; j++) {
        const x = i * spacing, y = j * spacing, z = (Math.random() - 0.5) * 0.01;
        out.push({
          x: x * Math.cos(viewAngleY) - z * Math.sin(viewAngleY),
          y,
          z: x * Math.sin(viewAngleY) + z * Math.cos(viewAngleY),
        });
      }
    return out;
  })();

  const rotatePoint = (p) => {
    let x = p.x, y = p.y, z = p.z;
    let tx = x * Math.cos(rotation.z) - y * Math.sin(rotation.z);
    let ty = x * Math.sin(rotation.z) + y * Math.cos(rotation.z); x = tx; y = ty;
    tx = x * Math.cos(rotation.y) + z * Math.sin(rotation.y);
    let tz = -x * Math.sin(rotation.y) + z * Math.cos(rotation.y); x = tx; z = tz;
    ty = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
    tz = y * Math.sin(rotation.x) + z * Math.cos(rotation.x); y = ty; z = tz;
    return { x, y, z };
  };

  const COLORS = [
    { h: 315, s: 100, l: 65 }, { h: 280, s: 100, l: 50 }, { h: 240, s: 100, l: 50 },
    { h: 180, s: 100, l: 50 }, { h: 120, s: 100, l: 50 },
  ];
  const getColor = (z) => {
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    const nz = (z - minZ) / (maxZ - minZ || 1);
    const seg = Math.min(Math.floor(nz * (COLORS.length - 1)), COLORS.length - 2);
    const prog = (nz * (COLORS.length - 1)) % 1;
    const c1 = COLORS[seg], c2 = COLORS[seg + 1];
    return `hsla(${c1.h + (c2.h - c1.h) * prog}, ${c1.s + (c2.s - c1.s) * prog}%, ${c1.l + (c2.l - c1.l) * prog}%, 0.65)`;
  };

  const updatePoint = (p) => {
    const dx = (-a * p.x - 4 * p.y - 4 * p.z - p.y * p.y) * dt;
    const dy = (-a * p.y - 4 * p.z - 4 * p.x - p.z * p.z) * dt;
    const dz = (-a * p.z - 4 * p.x - 4 * p.y - p.x * p.x) * dt;
    p.x += dx; p.y += dy; p.z += dz;
  };

  const animate = () => {
    const scale = 10, ox = canvas.width / 2, oy = canvas.height / 2;
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const p of points) {
      updatePoint(p);
      const r = rotatePoint(p);
      ctx.fillStyle = getColor(r.z);
      ctx.beginPath();
      ctx.arc(r.x * (scale * 1.7) + ox, r.y * (scale * 1.7) + oy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(animate);
  };

  canvas.addEventListener("mousedown", (e) => { dragging = true; prev = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    rotation.y += (e.clientX - prev.x) * 0.01;
    rotation.x += (e.clientY - prev.y) * 0.01;
    prev = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("mouseup", () => { dragging = false; });
  canvas.addEventListener("mouseleave", () => { dragging = false; });

  slider.addEventListener("input", () => {
    a = parseFloat(slider.value);
    if (readout) readout.textContent = `a = ${a.toFixed(2)}`;
  });

  animate();
}
