const lens = document.querySelector(".magnifying-glass");
const dialog = document.querySelector(".poster-dialog");
const dialogImg = dialog.querySelector("img");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const ZOOM = 1.5; // zoomed poster width = lens width * ZOOM, so the lens shows ~1/4 of a poster

document.querySelectorAll(".frame").forEach((frame) => {
  const img = frame.querySelector("img");

  frame.addEventListener("click", () => {
    lens.classList.remove("is-on");
    dialogImg.src = img.src;
    dialogImg.alt = img.alt;
    dialog.showModal();
  });

  img.addEventListener("pointerenter", () => {
    if (!finePointer.matches) return;
    lens.style.backgroundImage = `url("${img.src}")`;
    lens.classList.add("is-on");
  });
  img.addEventListener("pointerleave", () => lens.classList.remove("is-on"));
  img.addEventListener("pointermove", (e) => {
    if (!finePointer.matches) return;
    // offsetX/Y are in the img's own (un-skewed) coordinates
    const d = lens.offsetWidth;
    const w = d * ZOOM;
    const h = (w * img.naturalHeight) / img.naturalWidth;
    const x = e.offsetX / img.offsetWidth;
    const y = e.offsetY / img.offsetHeight;
    lens.style.left = e.clientX + "px";
    lens.style.top = e.clientY + "px";
    lens.style.backgroundSize = `${w}px ${h}px`;
    lens.style.backgroundPosition = `${d / 2 - x * w}px ${d / 2 - y * h}px`;
  });
});

// click on the backdrop closes the popup
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

// === people, benches and floor light, in floor coords (u along right wall, v along left wall) ===
const iso = (u, v, h = 0) => [50 + 50 * (u - v), 42 + 28.87 * (u + v) - h];

const person = ({ u, v, shirt, pants, hair, longHair, flip, size = 1 }) => {
  const [x, y] = iso(u, v);
  const s = size;
  return { d: u + v, svg: `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse rx="2.8" ry="1.1" fill="rgba(0 0 0 / .28)"/>
    <rect x="-1.6" y="-6.4" width="1.4" height="6.2" rx=".6" fill="${pants}"/>
    <rect x=".2" y="-6.4" width="1.4" height="6.2" rx=".6" fill="${pants}"/>
    <rect x="-3.1" y="-11.3" width="1.1" height="4.9" rx=".55" fill="${shirt}"/>
    <rect x="2" y="-11.3" width="1.1" height="4.9" rx=".55" fill="${shirt}"/>
    <rect x="-2.3" y="-12" width="4.6" height="6.2" rx="1.1" fill="${shirt}"/>
    <rect x="-.55" y="-12.9" width="1.1" height="1.2" fill="#e2ad8c"/>
    <circle cy="-14.3" r="1.75" fill="#e2ad8c"/>
    <circle cy="-14.5" r="1.8" fill="${hair}"/>
    ${longHair ? `<rect x="-1.8" y="-14.6" width="3.6" height="4" rx="1.2" fill="${hair}"/>` : ""}
  </g>` };
};

const face = (pts, fill) =>
  `<polygon points="${pts.map((p) => iso(...p).join(",")).join(" ")}" fill="${fill}"/>`;

// solid gallery bench with a glowing neon base, like the reference render
const bench = ({ u0, v0, u1, v1, h = 3.2 }) => {
  const [a, b] = [iso(u0, v1), iso(u1, v1)];
  const c = iso(u1, v0);
  return { d: (u0 + u1 + v0 + v1) / 2, svg: `<g>
    ${face([[u0, v0, h], [u1, v0, h], [u1, v1, h], [u0, v1, h]], "#f3f0f7")}
    ${face([[u0, v1, 0], [u1, v1, 0], [u1, v1, h], [u0, v1, h]], "#c9c3d6")}
    ${face([[u1, v0, 0], [u1, v1, 0], [u1, v1, h], [u1, v0, h]], "#aaa2bb")}
    <polyline class="neon" points="${a} ${b} ${c}" fill="none" stroke="#8ff6ff" stroke-width=".5" filter="url(#glow)"/>
  </g>` };
};

// light pool on the floor under a poster; rotated to run along its wall
const pool = (u, v, angle) => {
  const [x, y] = iso(u, v);
  return `<ellipse class="pool" cx="${x}" cy="${y}" rx="8" ry="2.6" transform="rotate(${angle} ${x} ${y})" fill="url(#pool)"/>`;
};

const pools = [
  pool(0.06, 0.7, -30), pool(0.06, 0.3, -30),
  pool(0.2, 0.06, 30), pool(0.5, 0.06, 30), pool(0.8, 0.06, 30),
];
const items = [
  person({ u: 0.15, v: 0.72, shirt: "#e8607a", pants: "#2d3a5a", hair: "#3a2418", longHair: true, flip: true }),
  person({ u: 0.16, v: 0.27, shirt: "#5bb6a8", pants: "#3b3b46", hair: "#1c1410", flip: true }),
  person({ u: 0.22, v: 0.37, shirt: "#f2c35b", pants: "#40516e", hair: "#8a5a32", longHair: true, flip: true, size: 0.8 }),
  person({ u: 0.21, v: 0.15, shirt: "#8f7ad9", pants: "#25252e", hair: "#24170f", longHair: true }),
  person({ u: 0.55, v: 0.16, shirt: "#f4f1ea", pants: "#3f6f8f", hair: "#4a2e1c" }),
  person({ u: 0.78, v: 0.15, shirt: "#d65ca3", pants: "#2f2f3a", hair: "#151010", longHair: true }),
  person({ u: 0.86, v: 0.2, shirt: "#7fc6e8", pants: "#5a4636", hair: "#c48a4f", size: 0.7 }),
  bench({ u0: 0.38, v0: 0.5, u1: 0.72, v1: 0.6 }),
  bench({ u0: 0.48, v0: 0.72, u1: 0.58, v1: 0.92 }),
];
// painter's order: things further back (smaller u + v) draw first
items.sort((a, b) => a.d - b.d);

document.querySelector(".scene").innerHTML = `
  <defs>
    <radialGradient id="pool"><stop offset="0" stop-color="#fff2cf" stop-opacity="1"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation=".5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  ${pools.join("")}
  ${items.map((i) => i.svg).join("")}`;
