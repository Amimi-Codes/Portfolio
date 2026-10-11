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

// === cats, benches and floor light, in floor coords (u along right wall, v along left wall) ===
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

// low-poly cat sitting with its back to us, looking up-left (mirrored for the right wall).
// Each facet is [shade, ...points]; local units, paws at 0,0, about 11 tall.
const CAT = [
  // tail curled on the floor
  [-0.05, [1.5, -0.2], [2.9, -0.4], [3.6, 0.3], [1.4, 0.4]],
  [-0.25, [1.4, 0.4], [3.6, 0.3], [3.2, 0.9], [0, 0.85], [-0.6, 0.6]],
  // body
  [0.1, [-2.2, 0], [0.3, -2.6], [-1.9, -3.5]],
  [-0.12, [-2.2, 0], [2.4, 0], [0.3, -2.6]],
  [-0.32, [2.4, 0], [2.6, -2], [0.3, -2.6]],
  [-0.2, [2.6, -2], [1.8, -4.5], [0.3, -2.6]],
  [0.2, [-1.9, -3.5], [0.3, -2.6], [0.1, -4.6]],
  [-0.06, [0.3, -2.6], [1.8, -4.5], [0.1, -4.6]],
  [0.25, [-1.9, -3.5], [0.1, -4.6], [-1.2, -5.8]],
  [-0.18, [0.1, -4.6], [1.8, -4.5], [1.1, -6]],
  [0.12, [-1.2, -5.8], [0.1, -4.6], [0, -6.4]],
  [-0.1, [0.1, -4.6], [1.1, -6], [0, -6.4]],
  // head
  [-0.08, [-1.3, -6.5], [1.2, -6.5], [0, -8]],
  [0.12, [-1.9, -7.6], [-1.3, -6.5], [0, -8]],
  [-0.28, [1.2, -6.5], [1.8, -7.8], [0, -8]],
  [0.3, [-1.9, -7.6], [0, -8], [-1.4, -9.3]],
  [-0.16, [1.8, -7.8], [1.3, -9.4], [0, -8]],
  [0.22, [-1.4, -9.3], [0, -8], [0, -9.6]],
  [0, [0, -9.6], [0, -8], [1.3, -9.4]],
  // ears
  [0.28, [-1.9, -8.9], [-1.6, -11], [-1.05, -9.4]],
  [0.02, [-1.05, -9.4], [-1.6, -11], [-0.5, -9.55]],
  [-0.05, [0.5, -9.6], [1, -11.2], [1.1, -9.5]],
  [-0.3, [1.1, -9.5], [1, -11.2], [1.75, -9]],
];

const cat = ({ u, v, faceLeft, fur = "#efedea", size: s = 1, seated, d }) => {
  const [x, y] = iso(u, v, seated ? 3.4 : 0); // seated: origin on the bench top
  return { d: d ?? u + v, svg: `<g transform="translate(${x} ${y}) scale(${faceLeft ? s : -s} ${s})">
    <ellipse cx=".7" cy=".3" rx="3.2" ry="1.1" fill="rgba(0 0 0 / .22)"/>
    ${CAT.map(([k, ...pts]) => `<polygon points="${pts.join(" ")}" fill="${shade(fur, k)}" stroke="${shade(fur, k)}" stroke-width=".05" stroke-linejoin="round"/>`).join("")}
  </g>` };
};

// upholstered gallery bench: tufted cushion on an inset wooden base
const bench = ({ u0, v0, u1, v1 }) => {
  const H = 3.4, base = 1.9, inset = 0.012;
  const alongU = u1 - u0 > v1 - v0;
  const n = Math.round((alongU ? u1 - u0 : v1 - v0) / 0.1); // cushion sections
  const tufts = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const [u, v] = alongU ? [u0 + t * (u1 - u0), (v0 + v1) / 2] : [(u0 + u1) / 2, v0 + t * (v1 - v0)];
    const [x, y] = iso(u, v, H);
    return `<circle cx="${x}" cy="${y}" r=".2" fill="#c96a82"/>`;
  });
  const seams = Array.from({ length: n - 1 }, (_, i) => {
    const t = (i + 1) / n;
    const ends = alongU
      ? [[u0 + t * (u1 - u0), v0, H], [u0 + t * (u1 - u0), v1, H], [u0 + t * (u1 - u0), v1, base]]
      : [[u0, v0 + t * (v1 - v0), H], [u1, v0 + t * (v1 - v0), H], [u1, v0 + t * (v1 - v0), base]];
    return `<polyline points="${ends.map((p) => iso(...p)).join(" ")}" fill="none" stroke="#d97690" stroke-width=".1"/>`;
  });
  return { d: (u0 + u1 + v0 + v1) / 2, svg: `<g>
    ${face([[u0 - 0.01, v0 - 0.01, 0], [u1 + 0.02, v0 - 0.01, 0], [u1 + 0.02, v1 + 0.02, 0], [u0 - 0.01, v1 + 0.02, 0]], "rgba(0 0 0 / .18)")}
    ${box(u0 + inset, v0 + inset, u1 - inset, v1 - inset, 0, base, "#d9a877")}
    ${box(u0, v0, u1, v1, base, H, "#ec8fa5")}
    ${seams.join("")}${tufts.join("")}
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
  cat({ u: 0.13, v: 0.7, faceLeft: true }),
  cat({ u: 0.14, v: 0.29, faceLeft: true, fur: "#9a9ea6" }),
  cat({ u: 0.2, v: 0.38, faceLeft: true, fur: "#e39a55", size: 0.65 }),
  cat({ u: 0.2, v: 0.13, fur: "#3a3a40" }),
  cat({ u: 0.52, v: 0.14, fur: "#e8d3b0" }),
  cat({ u: 0.79, v: 0.13 }),
  cat({ u: 0.86, v: 0.2, fur: "#e39a55", size: 0.6 }),
  bench({ u0: 0.38, v0: 0.5, u1: 0.72, v1: 0.6 }),
  cat({ u: 0.56, v: 0.55, d: 1.2, seated: true, fur: "#9a9ea6", size: 0.8 }),
  bench({ u0: 0.48, v0: 0.72, u1: 0.58, v1: 0.92 }),
];
// painter's order: things further back (smaller u + v) draw first
items.sort((a, b) => a.d - b.d);

document.querySelector(".scene").innerHTML = `
  <defs>
    <radialGradient id="pool"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  ${pools.join("")}
  ${items.map((i) => i.svg).join("")}`;
