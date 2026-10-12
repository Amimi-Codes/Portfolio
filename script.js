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
    let shockTimer;
    hero.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      heroJelly.classList.remove("is-shocked");
      void heroJelly.offsetWidth;
      heroJelly.classList.add("is-shocked");
      clearTimeout(shockTimer);
      shockTimer = setTimeout(() => heroJelly.classList.remove("is-shocked"), 1000);
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
    scrollBook.classList.add("is-opened");
  }else if("IntersectionObserver" in window){
    const bookObserver=new IntersectionObserver((entries)=>{
      if(entries.some(entry=>entry.isIntersecting)){
        bookObserver.unobserve(scrollBook);
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>scrollBook.classList.add("is-opened"));
        });
      }
    },{threshold:.12,rootMargin:"0px 0px -12% 0px"});
    bookObserver.observe(scrollBook);
  }else{
    scrollBook.classList.add("is-opened");
  }
}

const storybook = document.querySelector("[data-storybook]");
if (storybook) {
  const book = storybook.querySelector(".pixel-book"),
    carousel = storybook.querySelector(".book-carousel"),
    popup = storybook.querySelector(".book-popup");
  // original book size: up to 37rem (592px) / 55vw tall, never wider than the space between the arrows
  const fit = () => {
    const pad = parseFloat(getComputedStyle(storybook).paddingLeft) * 2;
    const coverH = Math.min(592, innerWidth * 0.55, ((storybook.clientWidth - pad) * 628) / 933);
    book.style.setProperty("--s", coverH / 628);
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
  const turn = (dir) => carousel.scrollBy({ left: dir * carousel.clientWidth });
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

// About page: hobby deck-builder, Ticket to Ride style. The <li> list in about.html is the
// only data: stops and routes are generated from its length, so a new hobby needs no code.
const hobbyGame = document.querySelector(".hobby-game");
if (hobbyGame) {
  const items = [...hobbyGame.querySelectorAll(".hobby-deck li")],
    board = hobbyGame.querySelector(".game-board"),
    map = board.querySelector(".board-map"),
    wide = matchMedia("(min-width: 701px)"),
    motion = !matchMedia("(prefers-reduced-motion: reduce)").matches,
    n = items.length,
    rand = (i) => Math.abs(Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1; // stable jitter

  // stops on an offset grid (about twice as wide as tall) with 3+ spare "?" stops
  const rows = Math.max(2, Math.round(Math.sqrt((n + 3) / 2.2))),
    cols = Math.ceil((n + 3) / rows),
    VW = 1000, px = VW / (cols + 0.5), py = px * 0.82, VH = py * rows + 90;
  const stops = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      stops.push({ r, c,
        x: px * (c + 0.5 + (r % 2) * 0.5) + (rand(i) - 0.5) * px * 0.3,
        y: py * (r + 0.5) + 40 + (rand(i + 99) - 0.5) * py * 0.3 });
    }
  // hobbies claim the stops closest to the centre first
  const order = stops.map((s, i) => i).sort((a, b) =>
    Math.hypot(stops[a].x - VW / 2, (stops[a].y - VH / 2) * 1.5) - Math.hypot(stops[b].x - VW / 2, (stops[b].y - VH / 2) * 1.5));
  const hobbyAt = new Map(order.slice(0, n).map((s, k) => [s, k])); // stop index -> hobby index

  // routes: right neighbour always, the two lower neighbours most of the time (never crossing)
  const at = (r, c) => (r < rows && c >= 0 && c < cols ? r * cols + c : -1), routes = [];
  stops.forEach((s, i) => {
    const down = s.r % 2 ? [s.c, s.c + 1] : [s.c - 1, s.c];
    [[at(s.r, s.c + 1), true], ...down.map((c) => [at(s.r + 1, c), false])].forEach(([j, keep], k) => {
      if (j >= 0 && (keep || rand(i * 3 + k) > 0.3)) routes.push([i, j]);
    });
  });
  const colours = ["var(--mint)", "var(--pink)", "var(--orange)", "#c9b6ff", "#9ed8ff", "#e7dcc4"];
  const svg = `<svg class="board-routes" viewBox="0 0 ${VW} ${VH}">${routes.map(([a, b], k) => {
    const A = stops[a], B = stops[b], len = Math.hypot(B.x - A.x, B.y - A.y), ang = (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI,
      run = len - 64, cars = Math.max(2, Math.round(run / 44)), step = run / cars;
    let rects = "";
    for (let j = 0; j < cars; j++)
      rects += `<rect x="${32 + j * step + 2}" y="-8" width="${step - 4}" height="16" rx="3" style="--d:${j * 70}ms"/>`;
    return `<g class="route" data-a="${a}" data-b="${b}" style="--rc:${colours[k % colours.length]}" transform="translate(${A.x} ${A.y}) rotate(${ang})">${rects}</g>`;
  }).join("")}</svg>`;
  map.style.aspectRatio = `${VW} / ${VH}`;
  map.innerHTML = svg + stops.map((s, i) => {
    const k = hobbyAt.get(i), li = items[k];
    return `<div class="stop${k === undefined ? " is-spare" : ""}" style="left:${(s.x / VW) * 100}%;top:${(s.y / VH) * 100}%"${li ? ` data-cat="${li.dataset.cat || ""}"` : ""}><i class="stop-dot"></i><span class="stop-name">${li ? li.textContent.trim() : "?"}</span></div>`;
  }).join("");
  const stopEls = [...map.querySelectorAll(".stop")], routeEls = [...map.querySelectorAll(".route")];

  // cumulative score: every card played, kept per visitor across visits
  let plays = 0;
  try { plays = +localStorage.getItem("hobbyPlays") || 0; } catch {}
  const chip = document.createElement("i");
  chip.className = "track-chip";
  let cells = [];
  const layTrack = () => {
    board.querySelectorAll(".track-cell").forEach((c) => c.remove());
    const w = board.clientWidth, h = board.clientHeight, f = 17, iw = w - 2 * f, ih = h - 2 * f,
      nx = Math.round((50 * iw) / (iw + ih)), ny = 50 - nx; // 100 spaces: 0..99
    cells = [];
    for (let i = 0; i < nx; i++) cells.push([f + (i * iw) / nx, f]);
    for (let i = 0; i < ny; i++) cells.push([w - f, f + (i * ih) / ny]);
    for (let i = 0; i < nx; i++) cells.push([w - f - (i * iw) / nx, h - f]);
    for (let i = 0; i < ny; i++) cells.push([f, h - f - (i * ih) / ny]);
    board.prepend(...cells.map(([x, y], i) => {
      const c = document.createElement("span");
      c.className = "track-cell";
      c.style.cssText = `left:${x}px;top:${y}px`;
      c.textContent = i;
      return c;
    }));
    moveChip();
  };
  const moveChip = () => {
    const [x, y] = cells[plays % 100] || [0, 0];
    chip.style.left = x + "px";
    chip.style.top = y + "px";
    chip.textContent = plays >= 100 ? Math.floor(plays / 100) * 100 : "";
  };
  board.append(chip);

  const bar = document.createElement("div");
  bar.className = "game-bar";
  bar.innerHTML = `<b>STOPS <span>0</span> / ${n}</b><p>Play a card to claim its stop.</p><button type="button" data-all>Play all</button><button type="button" data-reset>Reset</button><span class="sr-only" aria-live="polite"></span>`;
  board.after(bar);
  const live = bar.querySelector("[aria-live]"), tally = bar.querySelector("b span");

  const tokens = items.map((li, i) => {
    const name = li.textContent.trim(), icon = li.dataset.icon || name[0];
    li.innerHTML = `<button class="hobby-card" type="button" aria-pressed="false"><span class="card-cat">${li.dataset.cat || ""}</span><span class="card-art"><span>${icon}</span></span><span class="card-name">${name}</span><span class="card-no">#${String(i + 1).padStart(2, "0")} · +1 SIDEQUEST</span></button>`;
    li.firstChild.style.setProperty("--tilt", `${((i * 7) % 5) - 2}deg`);
    const t = document.createElement("i");
    t.className = "stop-token";
    t.dataset.cat = li.dataset.cat || "";
    t.textContent = icon;
    return t;
  });
  const stopOf = (k) => stopEls[order[k]], name = (k) => items[k].querySelector(".card-name").textContent;

  const played = new Set();
  const refresh = (msg) => {
    routeEls.forEach((g) => {
      const a = hobbyAt.get(+g.dataset.a), b = hobbyAt.get(+g.dataset.b);
      g.classList.toggle("is-claimed", played.has(a) && played.has(b));
    });
    tally.textContent = played.size;
    moveChip();
    live.textContent = msg;
  };
  const play = (k) => {
    if (played.has(k)) return;
    played.add(k);
    plays++;
    try { localStorage.setItem("hobbyPlays", plays); } catch {}
    const card = items[k].firstChild, stop = stopOf(k), tok = tokens[k];
    card.setAttribute("aria-pressed", "true");
    tok.style.visibility = "hidden";
    stop.classList.add("is-claimed");
    stop.prepend(tok);
    const land = () => {
      tok.style.visibility = "";
      tok.classList.remove("is-landed");
      void tok.offsetWidth;
      tok.classList.add("is-landed");
      refresh(`${name(k)} claimed`);
    };
    if (!motion) return land();
    const from = card.querySelector(".card-art span").getBoundingClientRect(), to = tok.getBoundingClientRect(), fly = tok.cloneNode(true);
    fly.classList.add("token-flyer");
    fly.style.cssText = `left:${to.left}px;top:${to.top}px;width:${to.width}px;height:${to.height}px;visibility:visible`;
    document.body.append(fly);
    const dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
    fly.animate([
      { transform: `translate(${dx}px,${dy}px) scale(1.4)` },
      { transform: `translate(${dx * 0.45}px,${dy * 0.45 - 90}px) scale(1.6) rotate(-12deg)`, offset: 0.55 },
      { transform: "none" },
    ], { duration: 650, easing: "cubic-bezier(.4,0,.3,1)" }).finished.then(() => { fly.remove(); land(); });
  };
  const unplay = (k) => {
    if (!played.delete(k)) return;
    items[k].firstChild.setAttribute("aria-pressed", "false");
    stopOf(k).classList.remove("is-claimed");
    tokens[k].remove();
    refresh(`${name(k)} returned to the deck`);
  };
  items.forEach((li, k) => li.firstChild.addEventListener("click", () => {
    if (wide.matches) played.has(k) ? unplay(k) : play(k);
  }));
  bar.querySelector("[data-all]").addEventListener("click", () =>
    items.forEach((_, k) => setTimeout(() => play(k), motion ? k * 140 : 0)));
  bar.querySelector("[data-reset]").addEventListener("click", () => items.forEach((_, k) => unplay(k)));

  hobbyGame.classList.add("is-ready");
  new ResizeObserver(() => wide.matches && layTrack()).observe(board);
}
