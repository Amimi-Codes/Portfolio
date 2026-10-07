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

// Pixel-art jellyfish: bell drawn from a map, tentacles + oral arms generated, one path per colour.
const heroJelly = document.querySelector(".hero-jelly");
if (heroJelly) {
  const bell = [
    ".......oooooooooo.......",
    ".....oowwccccccccoo.....",
    "....owwccPPPPPPPccco....",
    "...owccPPPPPPPPPPPcco...",
    "..owccPPPpppppppPPPcco..",
    "..ocPPPppppppppppPPPco..",
    ".owcPPpppPPPPPPpppPPcco.",
    ".ocPPppPPwwPPPPPPppPPco.",
    ".ocPPpPPwwPPppPPPppPPco.",
    "occPPppPPPPppppPPpppPcco",
    "ocPPpppppppppppppppPPPco",
    "ocPPppppppppppppppppPPco",
    "occPPPppppppppppppPPPcco",
    "ooccPPPPPPPPPPPPPPPPccoo",
    ".ooccccccccccccccccccoo.",
    "..o.oo.oo.oo.oo.oo.o.o..",
  ];
  const colors = { o: "#8ff8ff", w: "#f4ffff", c: "#3fc6ee", P: "#ffc4ef", p: "#ff86d8", t: "#7ff3ff", a: "#ff9fe4", A: "#ffd9f5" };
  const px = {};
  const put = (x, y, k) => (px[k] = px[k] || []).push(`M${x} ${y}h1v1h-1z`);
  bell.forEach((row, y) => [...row].forEach((k, x) => k !== "." && put(x, y, k)));
  const tentacles = [];
  for (let y = 16; y < 54; y++) {
    // thin outer tentacles drift sideways like the reference
    [2, 6, 17, 21].forEach((base, i) => {
      if (y < 46 + i * 2) tentacles.push([base + Math.round(Math.sin(y * 0.3 + i) * 1.3 + (y - 16) * 0.1), y, "t"]);
    });
    // frilly oral arms down the middle, tapering
    const w = Math.max(1, Math.round(4 - (y - 16) / 9)), cx = 11 + Math.round(Math.sin(y * 0.22) * 1.6 + (y - 16) * 0.08);
    if (y < 48) for (let x = cx - w; x <= cx + w; x++) tentacles.push([x, y, x === cx - w || x === cx + w ? "t" : (x + y) % 3 ? "a" : "A"]);
  }
  const paths = (list) => Object.entries(list).map(([k, d]) => `<path fill="${colors[k]}" d="${d.join("")}"/>`).join("");
  const tpx = {};
  tentacles.forEach(([x, y, k]) => (tpx[k] = tpx[k] || []).push(`M${x} ${y}h1v1h-1z`));
  heroJelly.querySelector(".jelly-body").innerHTML =
    `<svg viewBox="-2 -2 28 58" shape-rendering="crispEdges"><g class="jelly-tentacles">${paths(tpx)}</g><g>${paths(px)}</g>` +
    `<g class="jelly-bolts" fill="none" stroke="#fff59a" stroke-width=".8" shape-rendering="auto"><path d="M-1 4l3 2-2 2 3 2"/><path d="M25 3l-3 3 2 1-3 3"/><path d="M4 20l-3 3 2 1-2 3"/><path d="M20 21l3 3-2 1 3 3"/></g></svg>`;

  const hero = heroJelly.parentElement;
  let x = hero.clientWidth * 0.7, y = hero.clientHeight * 0.3, vx = 0, angle = 0;
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
      shockTimer = setTimeout(() => heroJelly.classList.remove("is-shocked"), 2000);
    });
    (function swim(t) {
      const w = hero.clientWidth, h = hero.clientHeight, size = heroJelly.offsetWidth;
      // follow the cursor (bell centred just behind it), otherwise wander a slow loop around the banner
      const tx = pointer.inside ? pointer.x - size / 2 : w * (0.5 + 0.38 * Math.sin(t / 7000)) - size / 2;
      const ty = pointer.inside ? pointer.y - size * 0.3 : h * (0.45 + 0.3 * Math.sin(t / 4300 + 1)) - size;
      const ease = pointer.inside ? 0.05 : 0.02;
      const nx = x + (tx - x) * ease;
      vx = nx - x;
      x = nx;
      y += (ty - y) * ease;
      angle += (Math.max(-25, Math.min(25, vx * 3)) - angle) * 0.08;
      place();
      requestAnimationFrame(swim);
    })(0);
  }
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

const storybook=document.querySelector("[data-storybook]");if(storybook){const scenes=[...storybook.querySelectorAll(".book-scene")],status=storybook.querySelector(".book-pagination");let current=0;const show=next=>{scenes[current].classList.remove("is-active","is-revealing");current=(next+scenes.length)%scenes.length;scenes[current].classList.add("is-active");status.textContent=String(current+1).padStart(2,"0")+" / "+String(scenes.length).padStart(2,"0");if(!reducedMotion){void scenes[current].offsetWidth;scenes[current].classList.add("is-revealing");setTimeout(()=>scenes[current].classList.remove("is-revealing"),1450)}};storybook.querySelector(".book-arrow-next").addEventListener("click",()=>show(current+1));storybook.querySelector(".book-arrow-prev").addEventListener("click",()=>show(current-1))}

const scrapbook=document.querySelector(".scrapbook");if(scrapbook&&!reducedMotion){const memories=[...scrapbook.querySelectorAll(".scrap-memory")];const tilt=()=>{const y=scrollY;memories.forEach((memory,index)=>memory.style.setProperty("--scrap-y",((y*.012+index*3)%8-4)+"px"));requestAnimationFrame(tilt)};tilt()}

const resumeAirplane=document.querySelector(".resume-airplane");
if(resumeAirplane){
  resumeAirplane.addEventListener("click",()=>resumeAirplane.classList.add("is-launched"));
}
