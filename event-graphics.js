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

// flat-vector visitor seen from behind, drawn looking up-left (mirrored for the right wall).
// Local units: feet at 0,0, about 15 tall; the right-hand side of each shape is in shadow.
const figure = ({ shirt, pants, hair, skin = "#e5b08f", shoes = "#2b2b33", hairStyle, skirt, seated }) => {
  const dark = (c) => shade(c, -0.22);
  const legs = seated ? "" : `
    <path d="M-1.35-6.9C-1.4-4.5-1.05-2.5-.95-.9h.7C-.2-3 0-5 0-6.9Z" fill="${dark(pants)}"/>
    <path d="M0-6.9C.05-4.8.35-2.6.4-.6h.7c.1-2.2.3-4.2.25-6.3Z" fill="${pants}"/>
    <path d="M.85-6.9C.9-4.8.95-2.8.85-.6h.25c.1-2.2.3-4.2.25-6.3Z" fill="${dark(pants)}"/>
    <path d="M-1.1-1h.95q.3.6-.1.75h-.85q-.3-.35 0-.75Z" fill="${dark(shoes)}"/>
    <path d="M.3-.6h.9q.3.6-.1.75H.25q-.3-.35.05-.75Z" fill="${shoes}"/>
    ${skirt ? `<path d="M-1.5-7.2h3l.45 3H-1.95Z" fill="${skirt}"/><path d="M.7-7.2h.8l.45 3H.9Z" fill="${dark(skirt)}"/>` : ""}`;
  const hairPath = hairStyle === "long"
    ? "M-1.1-13.7q-.05-1.4 1.15-1.4t1.1 1.4l.15 2.7q-1.3.4-2.6 0Z"
    : "M-1.02-13.6q-.08-1.45 1.07-1.45t1 1.45q-.05.85-.45 1H-.55q-.45-.2-.47-1Z";
  return `${legs}
    <g${seated ? ` transform="translate(0 6.4)"` : ""}>
      <path d="M-1.6-12q-.75.2-.75 1.2l.1 3.1h.7l.1-2.9Z" fill="${dark(shirt)}"/>
      <ellipse cx="-1.9" cy="-7.45" rx=".36" ry=".42" fill="${dark(skin)}"/>
      <path d="M-1.75-11.3q0-.9.9-.95h1.7q.9.05.9.95l-.3 4.6q-1.45.3-2.9 0Z" fill="${shirt}"/>
      <path d="M.75-12.25h.1q.9.05.9.95l-.3 4.6q-.45.1-.85.15.3-2.45.15-5.7Z" fill="${dark(shirt)}"/>
      <path d="M1.6-12q.75.2.75 1.2l-.1 3.1h-.7l-.1-2.9Z" fill="${dark(shirt)}"/>
      <ellipse cx="1.9" cy="-7.45" rx=".36" ry=".42" fill="${dark(skin)}"/>
      <path d="M-.4-12.9h.8v.8h-.8Z" fill="${dark(skin)}"/>
      <ellipse cx="-1" cy="-13.55" rx=".2" ry=".32" fill="${skin}"/>
      <ellipse cx="1.08" cy="-13.55" rx=".2" ry=".32" fill="${dark(skin)}"/>
      <ellipse cx=".05" cy="-13.75" rx="1" ry="1.2" fill="${skin}"/>
      <path d="${hairPath}" fill="${hair}"/>
      ${hairStyle === "bun" ? `<circle cx=".1" cy="-15.05" r=".55" fill="${hair}"/>` : ""}
      <path d="M-.6-14.55q.55-.35 1.1-.15" stroke="${shade(hair, 0.3)}" stroke-width=".18" fill="none" stroke-linecap="round"/>
    </g>`;
};

const person = ({ u, v, faceLeft, size: s = 1, d, ...look }) => {
  const [x, y] = iso(u, v, look.seated ? 3.4 : 0); // seated: origin on the bench top
  return { d: d ?? u + v, svg: `<g transform="translate(${x} ${y}) scale(${faceLeft ? s : -s} ${s})">
    ${look.seated ? "" : `<ellipse rx="2.4" ry=".9" fill="rgba(0 0 0 / .25)"/>`}
    ${figure(look)}
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
  person({ u: 0.15, v: 0.72, faceLeft: true, shirt: "#f4f1ea", pants: "#e5b08f", skirt: "#2d2d36", hair: "#4a2a1a", hairStyle: "bun", shoes: "#c9c9d0" }),
  person({ u: 0.16, v: 0.27, faceLeft: true, shirt: "#5bb6a8", pants: "#2f4a6b", hair: "#1c1410", shoes: "#f4f1ea" }),
  person({ u: 0.22, v: 0.37, faceLeft: true, size: 0.8, shirt: "#f2c35b", pants: "#40516e", hair: "#8a5a32", hairStyle: "long" }),
  person({ u: 0.21, v: 0.15, shirt: "#8f7ad9", pants: "#25252e", hair: "#24170f", hairStyle: "long" }),
  person({ u: 0.55, v: 0.16, shirt: "#e64b4b", pants: "#2b2b33", hair: "#4a2e1c", shoes: "#e64b4b" }),
  person({ u: 0.78, v: 0.15, shirt: "#7fc6e8", pants: "#e5b08f", skirt: "#d65ca3", hair: "#151010", hairStyle: "long", shoes: "#d65ca3" }),
  person({ u: 0.86, v: 0.2, size: 0.7, shirt: "#9bd36a", pants: "#5a4636", hair: "#c48a4f" }),
  bench({ u0: 0.38, v0: 0.5, u1: 0.72, v1: 0.6 }),
  person({ u: 0.56, v: 0.55, d: 1.2, seated: true, shirt: "#f0a35e", pants: "#3f6f8f", hair: "#2a1a12", hairStyle: "bun" }),
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
