/* ---------- Political Advertising compliance scan ----------
   Plain DOM rather than a canvas: a scan line sweeps across a stack of rows,
   each resolving to OK or FLAGGED as it is reached. */
export function start(container) {
  const rows = Array.from({ length: 9 }, () => ({ w: 45 + Math.random() * 45, flag: Math.random() < 0.34 }));

  const list = document.createElement("div");
  list.style.cssText = "position:absolute;inset:0;padding:22px 26px;display:flex;flex-direction:column;justify-content:center;gap:10px";

  const built = rows.map((r) => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:12px";
    const bar = document.createElement("div");
    bar.style.cssText = `height:10px;width:${r.w}%;border-radius:3px;background:#dcdce0;transition:background 0.4s ease`;
    const tag = document.createElement("span");
    tag.textContent = r.flag ? "FLAGGED" : "OK";
    tag.style.cssText = `font-size:11px;font-weight:700;color:${r.flag ? "#7b2cbf" : "#2bc764"};opacity:0;transition:opacity 0.3s ease`;
    row.append(bar, tag);
    list.appendChild(row);
    return { r, bar, tag, revealed: false };
  });

  const scanline = document.createElement("div");
  scanline.style.cssText = "position:absolute;top:0;bottom:0;left:8%;width:2px;background:linear-gradient(#32e875,#9d4edd);box-shadow:0 0 14px rgba(50,232,117,0.7)";

  container.append(list, scanline);

  let raf = 0, t = 0;
  const loop = () => {
    t += 0.006;
    const scanX = 8 + (Math.sin(t) * 0.5 + 0.5) * 84;
    scanline.style.left = `${scanX}%`;
    for (const b of built) {
      const revealed = scanX >= 12 + b.r.w * 0.2;
      if (revealed === b.revealed) continue;
      b.revealed = revealed;
      b.bar.style.background = revealed ? (b.r.flag ? "#c77dff" : "#32e875") : "#dcdce0";
      b.tag.style.opacity = revealed ? "1" : "0";
    }
    raf = requestAnimationFrame(loop);
  };
  loop();

  return () => { cancelAnimationFrame(raf); list.remove(); scanline.remove(); };
}
