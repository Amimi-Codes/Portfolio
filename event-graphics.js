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

// === cats, benches and floor base, in floor coords (u along right wall, v along left wall) ===
const iso = (u, v, h = 0) => [50 + 50 * (u - v), 42 + 28.87 * (u + v) - h];

// mix a hex colour toward white (k > 0) or black (k < 0)
const shade = (hex, k) =>
  "#" + hex.slice(1).match(/../g).map((c) => {
    const n = parseInt(c, 16);
    return Math.round(k > 0 ? n + (255 - n) * k : n * (1 + k)).toString(16).padStart(2, "0");
  }).join("");

const face = (pts, fill) =>
  `<polygon points="${pts.map((p) => iso(...p).join(",")).join(" ")}" fill="${fill}"/>`;

// iso box from floor rect (u0..u1, v0..v1), heights h0..h1: lit top, mid left face, dark right face
const box = (u0, v0, u1, v1, h0, h1, c) =>
  face([[u0, v0, h1], [u1, v0, h1], [u1, v1, h1], [u0, v1, h1]], shade(c, 0.25)) +
  face([[u0, v1, h0], [u1, v1, h0], [u1, v1, h1], [u0, v1, h1]], c) +
  face([[u1, v0, h0], [u1, v1, h0], [u1, v1, h1], [u1, v0, h1]], shade(c, -0.3));

// low-poly cats, drawn looking up-left toward the left wall (mirrored for the right wall).
// Each facet is [shade, ...points]; local units, paws at 0,0. A sitting cat is ~11 tall.
const HEAD = [ // around its own centre; ears point up
  [-0.08, [-1.3, 1.8], [1.2, 1.8], [0, 0]],
  [0.12, [-1.9, 0.4], [-1.3, 1.8], [0, 0]],
  [-0.28, [1.2, 1.8], [1.8, 0.2], [0, 0]],
  [0.3, [-1.9, 0.4], [0, 0], [-1.4, -1.3]],
  [-0.16, [1.8, 0.2], [1.3, -1.4], [0, 0]],
  [0.22, [-1.4, -1.3], [0, 0], [0, -1.6]],
  [0, [0, -1.6], [0, 0], [1.3, -1.4]],
  [0.28, [-1.9, -0.9], [-1.6, -3], [-1.05, -1.4]],
  [0.02, [-1.05, -1.4], [-1.6, -3], [-0.5, -1.55]],
  [-0.05, [0.5, -1.6], [1, -3.2], [1.1, -1.5]],
  [-0.3, [1.1, -1.5], [1, -3.2], [1.75, -1]],
];
const SIT = [ // sitting upright, back to us, tail curled on the floor
  [-0.05, [1.5, -0.2], [2.9, -0.4], [3.6, 0.3], [1.4, 0.4]],
  [-0.25, [1.4, 0.4], [3.6, 0.3], [3.2, 0.9], [0, 0.85], [-0.6, 0.6]],
  [0.1, [-2.2, 0], [0.3, -2.6], [-1.9, -3.5]],
  [-0.12, [-2.2, 0], [2.4, 0], [0.3, -2.6]],
  [-0.32, [2.4, 0], [2.6, -2], [0.3, -2.6]],
  [-0.2, [2.6, -2], [1.8, -4.5], [0.3, -2.6]],
  [0.2, [-1.9, -3.5], [0.3, -2.6], [0.1, -4.6]],
  [-0.06, [0.3, -2.6], [1.8, -4.5], [0.1, -4.6]],
  [0.25, [-1.9, -3.5], [0.1, -4.6], [-1.45, -6.4]],
  [-0.18, [0.1, -4.6], [1.8, -4.5], [1.35, -6.4]],
  [0.12, [-1.45, -6.4], [0.1, -4.6], [0, -6.7]],
  [-0.1, [0.1, -4.6], [1.35, -6.4], [0, -6.7]],
];
const LOAF = [ // lying down, paws tucked, tail along the floor
  [-0.25, [3.6, -0.6], [5.6, -0.4], [6.2, 0.3], [3.8, 0.3]],
  [-0.15, [-2.8, 0], [4.2, 0], [1, -2]],
  [-0.32, [4.2, 0], [3, -3.4], [1, -2]],
  [0, [3, -3.4], [0.4, -4], [1, -2]],
  [0.22, [0.4, -4], [-1.7, -3.6], [1, -2]],
  [0.08, [-1.7, -3.6], [-2.8, 0], [1, -2]],
  [0.18, [-3.9, 0], [-2.3, 0], [-2.3, -0.8], [-3.8, -0.8]],
];
const WALK = [ // strolling toward the wall, tail up
  [-0.3, [-1.1, -2.9], [-0.5, -2.8], [-0.6, 0.2], [-1.2, 0.2]],
  [-0.35, [2.2, -2.9], [2.8, -3], [2.9, 0.3], [2.3, 0.3]],
  [-0.12, [2.3, -4.3], [2.8, -4.1], [3.6, -6.8], [3.2, -7]],
  [0.1, [3.2, -7], [3.6, -6.8], [3.1, -7.8]],
  [0.25, [-1.6, -5], [0.5, -5.2], [0.3, -3.8]],
  [0.05, [0.5, -5.2], [2.6, -4.4], [0.3, -3.8]],
  [-0.3, [2.6, -4.4], [2.4, -2.6], [0.3, -3.8]],
  [-0.2, [2.4, -2.6], [0.2, -2.6], [0.3, -3.8]],
  [-0.05, [0.2, -2.6], [-2.2, -3], [0.3, -3.8]],
  [0.15, [-2.2, -3], [-1.6, -5], [0.3, -3.8]],
  [0.15, [-2.2, -3.1], [-1.4, -3], [-1.5, 0], [-2.2, 0]],
  [-0.1, [1.4, -2.8], [2.1, -2.8], [2, 0], [1.4, 0]],
];
const POSES = {
  sit: [SIT, "translate(0 -8)"],
  tilt: [SIT, "translate(-.1 -8) rotate(-18)"], // curious head tilt
  loaf: [LOAF, "translate(-2.5 -4.6) scale(.9)"],
  walk: [WALK, "translate(-2.3 -6) scale(.85)"],
};

const facets = (list, fur) =>
  list.map(([k, ...pts]) => `<polygon points="${pts.join(" ")}" fill="${shade(fur, k)}" stroke="${shade(fur, k)}" stroke-width=".05" stroke-linejoin="round"/>`).join("");

// size 1 = a ~35cm sitting cat at room scale
const cat = ({ u, v, pose = "sit", faceLeft, fur = "#efedea", size = 1, onBench, d }) => {
  const s = 0.45 * size;
  const [body, head] = POSES[pose];
  const [x, y] = iso(u, v, onBench ? BENCH_H : 0); // on a bench: origin on the cushion
  return { d: d ?? u + v, svg: `<g transform="translate(${x} ${y}) scale(${faceLeft ? s : -s} ${s})">
    <ellipse cx="${pose === "loaf" ? 1.2 : 0.7}" cy=".3" rx="${pose === "sit" || pose === "tilt" ? 3.2 : 4.4}" ry="1.1" fill="rgba(0 0 0 / .22)"/>
    ${facets(body, fur)}<g transform="${head}">${facets(HEAD, fur)}</g>
  </g>` };
};

// upholstered gallery bench: tufted cushion on four wooden legs, seat ~45cm high
const BENCH_H = 6.4;
const bench = ({ u0, v0, u1, v1 }) => {
  const H = BENCH_H, base = 4.4, leg = 0.014, inset = 0.015;
  const alongU = u1 - u0 > v1 - v0;
  const n = Math.round((alongU ? u1 - u0 : v1 - v0) / 0.1); // cushion sections
  const tufts = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const [u, v] = alongU ? [u0 + t * (u1 - u0), (v0 + v1) / 2] : [(u0 + u1) / 2, v0 + t * (v1 - v0)];
    const [x, y] = iso(u, v, H);
    return `<circle cx="${x}" cy="${y}" r=".2" fill="#bdb5a8"/>`;
  });
  const seams = Array.from({ length: n - 1 }, (_, i) => {
    const t = (i + 1) / n;
    const ends = alongU
      ? [[u0 + t * (u1 - u0), v0, H], [u0 + t * (u1 - u0), v1, H], [u0 + t * (u1 - u0), v1, base]]
      : [[u0, v0 + t * (v1 - v0), H], [u1, v0 + t * (v1 - v0), H], [u1, v0 + t * (v1 - v0), base]];
    return `<polyline points="${ends.map((p) => iso(...p)).join(" ")}" fill="none" stroke="#d8d2c8" stroke-width=".1"/>`;
  });
  return { d: (u0 + u1 + v0 + v1) / 2, svg: `<g>
    ${face([[u0 - 0.01, v0 - 0.01, 0], [u1 + 0.02, v0 - 0.01, 0], [u1 + 0.02, v1 + 0.02, 0], [u0 - 0.01, v1 + 0.02, 0]], "rgba(0 0 0 / .18)")}
    ${[[u0, v0], [u1, v0], [u0, v1], [u1, v1]].map(([u, v]) => {
      const lu = u === u0 ? u0 + inset : u1 - inset - leg;
      const lv = v === v0 ? v0 + inset : v1 - inset - leg;
      return box(lu, lv, lu + leg, lv + leg, 0, base, "#c99a6b");
    }).join("")}
    ${box(u0, v0, u1, v1, base, H, "#f4f1ec")}
    ${seams.join("")}${tufts.join("")}
  </g>` };
};

// Placement: cats sit at viewing distance in front of each frame; one backless bench
// (~1.5m x 45cm) sits mid-room, centred on the right wall's group with ~2m to the art
// and a clear walkway around it.
const items = [
  cat({ u: 0.12, v: 0.66, faceLeft: true }),
  cat({ u: 0.17, v: 0.58, faceLeft: true, pose: "loaf", fur: "#e39a55", size: 0.7 }),
  cat({ u: 0.26, v: 0.38, faceLeft: true, pose: "walk", fur: "#9a9ea6" }),
  cat({ u: 0.2, v: 0.12, pose: "tilt", fur: "#3a3a40" }),
  cat({ u: 0.5, v: 0.13, fur: "#e8d3b0" }),
  cat({ u: 0.8, v: 0.14, pose: "loaf" }),
  cat({ u: 0.87, v: 0.21, pose: "tilt", fur: "#e39a55", size: 0.65 }),
  bench({ u0: 0.32, v0: 0.5, u1: 0.68, v1: 0.61 }),
  cat({ u: 0.5, v: 0.56, d: 1.2, onBench: true, pose: "loaf", fur: "#9a9ea6" }),
];
// painter's order: things further back (smaller u + v) draw first
items.sort((a, b) => a.d - b.d);

document.querySelector(".scene").innerHTML = `
  <polygon points="0,70.87 50,99.74 50,100.94 0,72.07" fill="#8f6644"/>
  <polygon points="50,99.74 100,70.87 100,72.07 50,100.94" fill="#6f4c31"/>
  <polygon points="0,72.07 50,100.94 50,103.74 0,74.87" fill="#efe6da"/>
  <polygon points="50,100.94 100,72.07 100,74.87 50,103.74" fill="#d3c6b4"/>
  ${items.map((i) => i.svg).join("")}`;
