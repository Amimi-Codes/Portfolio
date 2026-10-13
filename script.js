const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
document
  .querySelectorAll("#year")
  .forEach((el) => (el.textContent = new Date().getFullYear()));
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (items) =>
      items.forEach((item) => {
        if (item.isIntersecting) {
          item.target.classList.add("visible");
          observer.unobserve(item.target);
        }
      }),
    { threshold: 0.12 },
  );
  reveals.forEach((el) => observer.observe(el));
} else reveals.forEach((el) => el.classList.add("visible"));
const canvas = document.getElementById("particles");
if (canvas && !reducedMotion) {
  const ctx = canvas.getContext("2d");
  let w = 0,
    h = 0,
    dpr = 1,
    particles = [],
    ripples = [];
  const pointer = { x: -999, y: -999, active: false };
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from(
      { length: Math.min(165, Math.max(70, (w * h) / 6500)) },
      () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.4,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.3,
        shade: Math.random() * 70 + 170,
      }),
    );
  }
  resize();
  addEventListener("resize", resize, { passive: true });
  const field = canvas.parentElement;
  field.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active = true;
  });
  field.addEventListener("pointerleave", () => (pointer.active = false));
  field.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 4, a: 1 });
    for (let i = 0; i < 12; i++)
      particles.push({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        shade: 190,
      });
  });
  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.997;
      p.vy *= 0.997;
      if (p.x < -12) p.x = w + 12;
      if (p.x > w + 12) p.x = -12;
      if (p.y < -12) p.y = h + 12;
      if (p.y > h + 12) p.y = -12;
      const dx = p.x - pointer.x,
        dy = p.y - pointer.y,
        d = Math.hypot(dx, dy);
      if (pointer.active && d < 180 && d > 0) {
        const f = (180 - d) / 180;
        p.vx += (dx / d) * f * 0.08;
        p.vy += (dy / d) * f * 0.08;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.shade},72%,86%,${0.28 + 0.28 * Math.sin(t / 1300 + p.x)})`;
      ctx.fill();
    }
    ripples = ripples.filter((r) => r.a > 0.01);
    ripples.forEach((r) => {
      r.r += 2.2;
      r.a *= 0.965;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(183,255,236,${r.a})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
const journeyButtons = [...document.querySelectorAll(".journey-stop")],
  journeyDetail = document.querySelector(".journey-detail");
const journeyText = {
  early:
    "Early years: dance, skating, choir, piano, violin, swimming, and interactive theatre. Creativity started as a way to keep moving outside of academics.",
  nature:
    "2016: A love of nature and wildlife photography opened the door to creative spaces, visual storytelling, and design.",
  queens:
    "2020: Amy moved to Ontario for Queen’s University. Starting fresh sharpened her flexibility, resilience, and ability to make a home in a new place.",
  design:
    "2025: Amy graduated from Queen’s with high honours, completed a full-stack development internship at Point Lepreau, and began studying user experience at the University of Toronto.",
  events:
    "2026: Event logistics grew into a broad creative practice: floor plans, marketing, outreach, staffing, and the energy of bringing people together.",
};
journeyButtons.forEach((button) =>
  button.addEventListener("click", () => {
    journeyButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    journeyDetail.textContent = journeyText[button.dataset.stop];
  }),
);
const story = document.querySelector(".story");
if (story) {
  const steps = [...document.querySelectorAll("[data-scene]")],
    scene = document.querySelector(".story-stage"),
    progress = document.querySelector(".reading-progress span");
  const update = () => {
    let active = steps[0];
    for (const step of steps)
      if (step.getBoundingClientRect().top < innerHeight * 0.5) active = step;
    scene.dataset.active = active.dataset.scene;
    progress.style.width = `${(scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100}%`;
  };
  addEventListener("scroll", update, { passive: true });
  update();
}

const heroJelly = document.querySelector(".hero-jelly");
if (heroJelly) {
  const hero = heroJelly.parentElement;
  let x = hero.clientWidth * 0.7, y = hero.clientHeight * 0.3, angle = 0, last = 0;
  const SPEED = 70; // px per second, same whether drifting or following the cursor
  const pointer = { x: 0, y: 0, inside: false };
  const place = () => (heroJelly.style.transform = `translate(${x}px,${y}px) rotate(${angle}deg)`);
  place();
  if (!reducedMotion) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.inside = true;
    });
    hero.addEventListener("pointerleave", () => (pointer.inside = false));
    let shockTimer, caught = false;
    const shock = () => {
      heroJelly.classList.remove("is-shocked");
      void heroJelly.offsetWidth;
      heroJelly.classList.add("is-shocked");
      clearTimeout(shockTimer);
      shockTimer = setTimeout(() => heroJelly.classList.remove("is-shocked"), 1000);
    };
    hero.addEventListener("click", (e) => {
      if (!e.target.closest("a")) shock();
    });
    (function swim(t) {
      const w = hero.clientWidth, h = hero.clientHeight, size = heroJelly.offsetWidth;
      // follow the cursor (bell centred just behind it), otherwise wander a slow loop around the banner
      const tx = pointer.inside ? pointer.x - size / 2 : w * (0.5 + 0.38 * Math.sin(t / 7000)) - size / 2;
      const ty = pointer.inside ? pointer.y - size * 0.3 : h * (0.45 + 0.3 * Math.sin(t / 4300 + 1)) - size;
      const dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy);
      const step = Math.min(dist, (SPEED * Math.min(t - last, 50)) / 1000);
      last = t;
      if (dist > 0) {
        x += (dx / dist) * step;
        y += (dy / dist) * step;
      }
      // shock once on reaching the cursor; re-arm after the cursor moves away
      if (pointer.inside && dist < 3 && !caught) { caught = true; shock(); }
      else if (!pointer.inside || dist > size * 0.35) caught = false;
      // lean into the direction of travel
      angle += ((dist > 2 ? (dx / dist) * 15 : 0) - angle) * 0.05;
      place();
      requestAnimationFrame(swim);
    })(0);
  }
}
const wordCycle = document.querySelector(".word-cycle");
if (wordCycle) {
  const words = [...wordCycle.querySelectorAll("em")],
    article = document.querySelector(".word-article");
  let i = 0;
  // the box hugs the current word so "with" sits right after it
  const show = () => {
    wordCycle.style.setProperty("--i", i);
    article.textContent = words[i].dataset.article || "A"; // "An artist"
    wordCycle.style.width = words[i].offsetWidth + "px";
  };
  document.fonts.ready.then(show);
  addEventListener("resize", show, { passive: true });
  if (!reducedMotion) setInterval(() => ((i = (i + 1) % words.length), show()), 2600);
}
const scrollBook=document.querySelector("[data-storybook]");
if(scrollBook){
  if(reducedMotion){
    scrollBook.classList.add("is-opened","is-ready");
  }else if("IntersectionObserver" in window){
    const bookObserver=new IntersectionObserver((entries)=>{
      if(entries.some(entry=>entry.isIntersecting)){
        bookObserver.unobserve(scrollBook);
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{scrollBook.classList.add("is-opened");scrollBook.dispatchEvent(new Event("bookopen"));});
        });
      }
    },{threshold:.12,rootMargin:"0px 0px -12% 0px"});
    bookObserver.observe(scrollBook);
  }else{
    scrollBook.classList.add("is-opened","is-ready");
  }
}

const storybook = document.querySelector("[data-storybook]");
if (storybook) {
  const book = storybook.querySelector(".pixel-book"),
    carousel = storybook.querySelector(".book-carousel"),
    popup = storybook.querySelector(".book-popup");
  // book size: up to 560px / 50vw tall, never wider than the space between the arrows
  const fit = () => {
    const pad = parseFloat(getComputedStyle(storybook).paddingLeft) * 2;
    const coverH = Math.min(560, innerWidth * 0.5, ((storybook.clientWidth - pad) * 654) / 1236);
    book.style.setProperty("--s", coverH / 654);
  };
  fit();
  addEventListener("resize", fit, { passive: true });
  let current = 0;
  carousel.addEventListener(
    "scroll",
    () => {
      // the HabitU phones belong to page 2
      popup.classList.toggle("is-hidden", Math.abs(carousel.scrollLeft - carousel.clientWidth) > 8);
      const next = Math.round(carousel.scrollLeft / carousel.clientWidth);
      if (next === current) return;
      current = next;
      // the phones pop out of the HabitU page again each time it comes back
      if (current === 1 && !reducedMotion) {
        popup.classList.remove("is-revealing");
        void popup.offsetWidth;
        popup.classList.add("is-revealing");
      }
    },
    { passive: true },
  );
  // Page turn: Amy's frames of the right page lifting over (book-turn-1..4), then the same frames
  // mirrored as it lands on the left. Previous plays the mirror image. The deck loops both ways.
  const art = book.querySelector(".book-art"), rest = "assets/book-home.svg",
    frames = [rest, 1, 2, 3, 4].map((f) => (f === rest ? f : `assets/book-turn-${f}.svg`)),
    spreads = carousel.children.length, FRAME_MS = 65;
  frames.forEach((f) => (new Image().src = f));
  const show = (f, mirror) => { art.src = frames[f]; art.classList.toggle("is-mirrored", mirror); };
  const pause = () => new Promise((r) => setTimeout(r, FRAME_MS));
  // Opening: Amy's frames (assets/book-open/0..10.svg, aligned to the open book) from the closed
  // cover to the open spread, then the first case study fades in (.is-ready)
  const OPEN_FRAMES = 11, OPEN_MS = 95;
  for (let f = 1; f < OPEN_FRAMES; f++) new Image().src = `assets/book-open/${f}.svg`;
  let turning = false;
  const opened = () => { art.src = rest; storybook.classList.add("is-ready"); };
  if (reducedMotion || storybook.classList.contains("is-ready")) opened();
  storybook.addEventListener("bookopen", async () => {
    turning = true;
    await new Promise((r) => setTimeout(r, 250)); // a beat on the closed cover
    for (let f = 1; f < OPEN_FRAMES; f++) {
      art.src = `assets/book-open/${f}.svg`;
      await new Promise((r) => setTimeout(r, OPEN_MS));
    }
    opened();
    turning = false;
  });
  const turn = async (dir) => {
    if (turning) return;
    turning = true;
    const target = (Math.round(carousel.scrollLeft / carousel.clientWidth) + dir + spreads) % spreads;
    const jump = () => carousel.scrollTo({ left: target * carousel.clientWidth, behavior: "instant" });
    if (reducedMotion) { jump(); turning = false; return; }
    const m = dir < 0; // previous turns the other way
    const seq = [[1, m], [2, m], [3, m], [4, m], [3, !m], [2, !m], [1, !m], [0, false]];
    storybook.classList.add("is-turning");
    popup.classList.add("is-hidden");
    for (const [i, [f, mir]] of seq.entries()) {
      show(f, mir);
      if (i === 4) jump(); // swap spreads while the page is upright
      if (i === 7) storybook.classList.remove("is-turning"); // new spread fades in once the page has landed
      await pause();
    }
    turning = false;
  };
  storybook.querySelector(".book-arrow-next").addEventListener("click", () => turn(1));
  storybook.querySelector(".book-arrow-prev").addEventListener("click", () => turn(-1));
}

const scrapbook=document.querySelector(".scrapbook");if(scrapbook&&!reducedMotion){const memories=[...scrapbook.querySelectorAll(".scrap-memory")];const tilt=()=>{const y=scrollY;memories.forEach((memory,index)=>memory.style.setProperty("--scrap-y",((y*.012+index*3)%8-4)+"px"));requestAnimationFrame(tilt)};tilt()}

const resumeAirplane=document.querySelector(".resume-airplane");
const resumeDialog=document.querySelector(".resume-dialog");
if(resumeAirplane&&resumeDialog){
  resumeAirplane.addEventListener("click",e=>{
    e.preventDefault();
    resumeDialog.showModal();
  });
  // click on the dimmed backdrop closes it
  resumeDialog.addEventListener("click",e=>{if(e.target===resumeDialog)resumeDialog.close()});
}

// About journey map: a dashed path through each chapter's year, drawn as you scroll;
// each leg carries its doodle icon, which then rests beside the chapter it leads to.
const journey = document.querySelector(".scrapbook");
const journeySvg = journey && journey.querySelector(".journey-path");
if (journeySvg) {
  const line = journeySvg.querySelector(".journey-line"),
    draw = journeySvg.querySelector(".journey-draw"),
    chapters = [...journey.querySelectorAll(".scrap-memory")],
    bubbles = [...journey.querySelectorAll(".speech-bubble")].map((el) => ({ el, top: 0 })),
    icons = [...journey.querySelectorAll(".journey-icon")];
  let ends = [], samples = [], total = 0, shown = 0;
  const build = () => {
    const box = journey.getBoundingClientRect();
    // the path runs down the margin left of the chapters (inside it when there's no room),
    // level with each chapter's heading, so it never crosses text or photos
    const gx = box.left > 64 ? -40 : 6;
    // one stop at the top of each chapter
    const pts = chapters.map((c) => [gx, c.getBoundingClientRect().top - box.top + 11]);
    bubbles.forEach((b) => (b.top = b.el.getBoundingClientRect().top - box.top));
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    ends = [0];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], dy = y1 - y0;
      const wave = (gx < 0 ? 26 : 0) * (i % 2 ? 1 : -1); // gentle sway on wide screens
      const seg = ` C${x0 + wave} ${y0 + dy * 0.45} ${x1 + wave} ${y1 - dy * 0.45} ${x1} ${y1}`;
      d += seg;
      const tmp = document.createElementNS("http://www.w3.org/2000/svg", "path");
      tmp.setAttribute("d", `M${x0} ${y0}` + seg);
      journeySvg.appendChild(tmp);
      ends.push(ends[i - 1] + tmp.getTotalLength());
      tmp.remove();
    }
    line.setAttribute("d", d);
    draw.setAttribute("d", d);
    total = line.getTotalLength();
    draw.style.strokeDasharray = total;
    samples = [];
    for (let l = 0; l < total; l += 6) samples.push([l, line.getPointAtLength(l)]);
    samples.push([total, line.getPointAtLength(total)]);
    shown = Math.min(shown, total);
  };
  const place = (len) => {
    draw.style.strokeDashoffset = total - len;
    icons.forEach((icon, i) => {
      const start = ends[i], end = ends[i + 1];
      if (end === undefined) return;
      const p = line.getPointAtLength(Math.min(Math.max(len, start), end));
      icon.style.transform = `translate(${p.x}px,${p.y}px)`;
      icon.classList.toggle("is-on", len > start + 2);
    });
    // a chapter's photos appear once the path has reached it (and stay)
    chapters.forEach((c, i) => len > ends[i] - 10 && len > 1 && c.classList.add("photos-in"));
    // speech bubbles pop in, in order, once the icon passes the top of each one
    const y = line.getPointAtLength(len).y;
    bubbles.forEach((b, i) => y >= b.top && (i === 0 || bubbles[i - 1].el.classList.contains("is-in")) && b.el.classList.add("is-in"));
  };
  const target = () => {
    if (reducedMotion) return total;
    // how far down the path the middle of the screen has reached
    const mid = innerHeight * 0.55 - journey.getBoundingClientRect().top;
    let l = 0;
    for (const [len, p] of samples) { if (p.y > mid) break; l = len; }
    return l;
  };
  build();
  new ResizeObserver(build).observe(journey);
  (function tick() {
    shown += (target() - shown) * 0.12;
    place(shown);
    requestAnimationFrame(tick);
  })();
}

// About page: hobby tarot. The <li> list in about.html is the only data, so the deck works for
// any number of cards. The cards drift continuously along a path across the book and only stop
// while the pointer is on a card. Picking one lifts it to the centre and plays glow -> radiate ->
// flash -> flip; revealed cards stay face up when they go back into the deck.
const tarot = document.querySelector(".tarot-stage");
if (tarot) {
  const items = [...tarot.querySelectorAll(".tarot-deck li")],
    dotsEl = tarot.querySelector(".tarot-dots"),
    phone = matchMedia("(max-width: 700px)"),
    still = matchMedia("(prefers-reduced-motion: reduce)").matches,
    n = items.length,
    SLOT_MS = 3000; // time for a card to move one slot
  // path points (x/y in % of the stage, rotation, scale): off-left, the visible slots, off-right
  const PATHS = {
    wide: { pts: [[3, 51, -12, 0.9], [20.75, 49.7, -6.8, 1], [40.2, 47, 0, 1], [60.5, 46.8, 0, 1], [79.25, 49.5, 6.8, 1], [97, 51, 12, 0.9]], pick: [50, 52, 0, 1.45] },
    phone: { pts: [[-60, 53, -12, 0.8], [-6, 53, -8, 0.82], [50, 54, 0, 1], [106, 53, 8, 0.82], [160, 53, 12, 0.8]], pick: [50, 54, 0, 1.08] },
  };
  const cards = items.map((li, i) => {
    const name = li.textContent.trim();
    li.innerHTML = `<button class="tarot-card" type="button" aria-label="Draw a card (${i + 1} of ${n})"><span class="tc-inner"><span class="tc-back"></span><span class="tc-front"><img src="${li.dataset.front}" alt="${name}" loading="lazy" /></span></span></button>`;
    const b = li.firstChild;
    b.dataset.name = name;
    return b;
  });
  const live = Object.assign(document.createElement("p"), { className: "sr-only" });
  live.setAttribute("aria-live", "polite");
  tarot.append(live);
  dotsEl.innerHTML = cards.map(() => "<i></i>").join("");
  const dots = [...dotsEl.children];

  let offset = 0, pending = 0, picked = null, hover = null, busy = false, returning = 0;
  const set = (b, [x, y, r, sc], o) => {
    b.style.setProperty("--x", x.toFixed(2)); b.style.setProperty("--y", y.toFixed(2));
    b.style.setProperty("--r", r.toFixed(2) + "deg"); b.style.setProperty("--sc", sc.toFixed(3)); b.style.setProperty("--o", o.toFixed(3));
  };
  // position p along the path: -1 = off left, 0..k-1 = visible slots, k = off right
  const at = (pts, p) => {
    const u = Math.min(Math.max(p + 1, 0), pts.length - 1), i = Math.min(Math.floor(u), pts.length - 2), t = u - i;
    return pts[i].map((v, j) => v + (pts[i + 1][j] - v) * t);
  };
  const layout = () => {
    const P = phone.matches ? PATHS.phone : PATHS.wide, k = P.pts.length - 2;
    cards.forEach((b, i) => {
      b.classList.toggle("is-dim", !!picked && b !== picked);
      if (b === picked) return set(b, P.pick, 1);
      let p = (((i - offset) % n) + n) % n;
      if (p > n - 1) p -= n; // the card just leaving is in [-1, 0)
      const o = Math.max(0, Math.min(1, p + 1, k - p));
      set(b, at(P.pts, p), o);
      const hidden = o < 0.5;
      b.toggleAttribute("data-hidden", hidden);
      b.tabIndex = hidden ? -1 : 0;
    });
    const on = ((Math.round(offset) % n) + n) % n;
    dots.forEach((d, i) => d.classList.toggle("on", i === on));
  };
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(now - last, 100); last = now;
    // the deck holds still while a card is hovered, open, or gliding back to its place
    if (!hover && !picked && !returning && !document.hidden) offset += still ? 0 : dt / SLOT_MS;
    if (pending) { const m = pending * Math.min(1, dt / 180); offset += m; pending -= m; if (Math.abs(pending) < 0.001) pending = 0; }
    layout();
    requestAnimationFrame(frame);
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, still ? 0 : ms));
  // the lift to/from the centre is the only eased move; the drift is set every frame
  const glide = (b) => { b.classList.add("is-moving"); setTimeout(() => b.classList.remove("is-moving"), 800); };
  const reveal = async (b) => {
    busy = true; picked = b; glide(b); b.classList.add("is-picked");
    await wait(650);
    if (!b.classList.contains("is-flipped")) {
      b.classList.add("is-glow"); await wait(330);     // light blooms on the jellyfish
      b.classList.add("is-radiate"); await wait(420);  // ...and spreads across the card
      b.classList.add("is-flash"); await wait(160);    // white out
      b.classList.add("is-flipped"); await wait(300);  // flip; the white fades as the front turns in
      b.classList.remove("is-flash", "is-radiate", "is-glow");
      if (!still) for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2, d = 90 + (k % 3) * 30, s = document.createElement("i"), w = b.offsetWidth / 100;
        s.className = "tc-spark";
        s.style.cssText = `--dx:${Math.cos(a) * d * w}px;--dy:${Math.sin(a) * d * w * 0.8}px;--d:${(k % 4) * 60}ms`;
        b.append(s); setTimeout(() => s.remove(), 1400);
      }
    }
    live.textContent = `You drew ${b.dataset.name}`;
    b.setAttribute("aria-label", `${b.dataset.name}. Tap to put the card back`);
    busy = false;
  };
  const putBack = () => {
    const b = picked; if (!b || busy) return;
    glide(b); b.classList.remove("is-picked"); picked = null;
    clearTimeout(returning); returning = setTimeout(() => (returning = 0), still ? 0 : 750);
    b.setAttribute("aria-label", b.dataset.name); // stays face up
  };
  cards.forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation(); if (busy) return;
      if (picked === b) putBack(); else if (picked) putBack(); else reveal(b);
    });
    b.addEventListener("pointerenter", () => (hover = b));
    b.addEventListener("pointerleave", () => hover === b && (hover = null));
    b.addEventListener("focus", () => (hover = b));
    b.addEventListener("blur", () => hover === b && (hover = null));
  });
  document.addEventListener("click", () => picked && putBack());
  document.addEventListener("keydown", (e) => e.key === "Escape" && putBack());
  // swipe on phones: nudge the deck one card
  let x0 = null;
  tarot.addEventListener("pointerdown", (e) => (x0 = e.clientX));
  tarot.addEventListener("pointerup", (e) => {
    if (x0 === null || picked) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) pending += dx < 0 ? 1 : -1;
  });
  layout();
  requestAnimationFrame(frame);
}
