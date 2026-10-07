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
    popup = storybook.querySelector(".book-popup"),
    status = storybook.querySelector(".book-pagination"),
    total = carousel.children.length;
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
      popup.classList.toggle("is-hidden", carousel.scrollLeft > 8);
      const next = Math.round(carousel.scrollLeft / carousel.clientWidth);
      if (next === current) return;
      current = next;
      status.textContent = String(current + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
      // the phones pop out of the HabitU page again each time it comes back
      if (current === 0 && !reducedMotion) {
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
if(resumeAirplane){
  resumeAirplane.addEventListener("click",()=>resumeAirplane.classList.add("is-launched"));
}
