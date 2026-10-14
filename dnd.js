(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Intro: d20 rolls a natural 20, fades to black, reveals the tavern ---- */
  const intro = document.getElementById("intro");
  const finish = () => {
    if (!intro.isConnected || intro.classList.contains("out")) return;
    intro.classList.add("out");
    document.documentElement.classList.remove("intro-lock");
    setTimeout(() => intro.remove(), 1300);
  };
  if (reduced || typeof DICE === "undefined") finish();
  else {
    document.documentElement.classList.add("intro-lock");
    intro.style.animation = "none"; // JS owns the timing; CSS failsafe is for no-JS
    setTimeout(finish, 10000); // never trap the visitor if physics stalls
    try {
      const box = new DICE.dice_box(document.getElementById("intro-dice"));
      box.setDice("1d20");
      box.start_throw(
        () => [20],
        () => {
          intro.classList.add("nat20");
          setTimeout(() => intro.classList.add("dark"), 1400);
          setTimeout(finish, 2300);
        },
      );
    } catch {
      finish();
    }
  }

  /* ---- Rulebook terms fall into their box when it scrolls into view ---- */
  const crate = document.querySelector(".overload");
  if (crate && !reduced && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-fall");
    crate.querySelectorAll("li").forEach((li, i) => li.style.setProperty("--i", i));
    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting) return;
      crate.classList.add("drop");
      io.disconnect();
    }, { threshold: 0.6 }).observe(crate);
  }

  /* ---- Section nav: highlight the current section, mobile book menu ---- */
  const ladder = document.getElementById("ladder");
  const menu = document.getElementById("book-menu");
  menu.insertBefore(ladder.cloneNode(true), menu.querySelector(".x-btn")).removeAttribute("id");
  document.getElementById("book-btn").addEventListener("click", () => menu.showModal());
  menu.querySelector(".x-btn").addEventListener("click", () => menu.close());
  menu.addEventListener("click", (e) => e.target.closest("a") && menu.close());
  if ("IntersectionObserver" in window) {
    const links = document.querySelectorAll(".ladder a");
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.setAttribute("aria-current", a.hash === `#${e.target.id}`));
      }
    }, { rootMargin: "-45% 0px -45% 0px" }); // the section crossing the middle of the screen
    document.querySelectorAll("main > section[id]").forEach((sec) => spy.observe(sec));
  }

  /* ---- Vertical parallax: each layer drifts by its data-depth ---- */
  const scenes = [...document.querySelectorAll(".scene")].map((s) => ({
    sec: s.parentElement,
    layers: [...s.querySelectorAll("[data-depth]")],
  }));
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const { sec, layers } of scenes) {
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const t = (vh - r.top) / (r.height + vh) - 0.5; // -0.5 entering … 0.5 leaving
      for (const l of layers)
        l.style.transform = `translate3d(0,${(-t * l.dataset.depth * vh).toFixed(1)}px,0)`;
    }
  };
  if (!reduced) {
    addEventListener("scroll", () => {
      if (!ticking) (ticking = true), requestAnimationFrame(update);
    }, { passive: true });
    addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---- Quest map: what Origin has shipped, then what the survey asked for ---- */
  const levels = [
    [70, 620, "done", "Foundation", "Basic character creation interface", "Where it all began: the first screens a new adventurer sees."],
    [60, 420, "done", "Foundation", "Species, lineages & classes", "Pick who you are and what you do. Because not every elf is the same elf."],
    [120, 230, "done", "5.5e rebuild", "Upgrade to D&D 5.5e", "Rebuilt on the 2024 rules so new players learn the current game."],
    [260, 110, "done", "5.5e rebuild", "Backgrounds & ability scores", "Choose where your hero comes from and what they're good at."],
    [300, 300, "done", "5.5e rebuild", "Levelling past level 1", "Take your hero beyond their first adventure."],
    [200, 480, "done", "5.5e rebuild", "Spell selection", "Recommended picks, with a note on when each spell is actually useful."],
    [330, 620, "done", "From the survey", "Guided skills & equipment", "Help where new players got stuck most: skills and starting gear."],
    [470, 520, "done", "5.5e rebuild", "Mobile-friendly version", "Build a character on the bus to session."],
    [450, 330, "done", "From the survey", "Ready-made characters", "Start from an example and tweak it instead of facing a blank sheet."],
    [560, 180, "done", "From the survey", "Rules help & a summary that does the maths", "\"?\" tips explain terms in place, and the summary works out hit points, to-hit and saves."],
    [700, 330, "current", "From the survey", "Name generator", "Stuck on a name? Roll one that fits your species and background."],
    [840, 160, "locked", "From the survey", "Backstory generator", "Prompts built from your character concept and the world's lore."],
    [1000, 250, "locked", "From the survey", "Character sheet export", "A printable sheet for in-person games, plus a Google Docs template."],
    [930, 480, "locked", "Later", "Save your progress", "Come back to a character later. Saved for a later stage."],
    [1110, 580, "boss", "Final boss", "Icons, species art & character customization", "Visual choices everywhere, and a hero that looks the part."],
  ];
  // smooth dashed route through the node centres (Catmull-Rom as cubic Béziers)
  const route = (pts) =>
    pts.reduce((d, p, i) => {
      if (!i) return `M${p[0]} ${p[1]}`;
      const a = pts[i - 2] || pts[i - 1], b = pts[i - 1], c = pts[i + 1] || p;
      return d + ` C${b[0] + (p[0] - a[0]) / 6} ${b[1] + (p[1] - a[1]) / 6} ${p[0] - (c[0] - b[0]) / 6} ${p[1] - (c[1] - b[1]) / 6} ${p[0]} ${p[1]}`;
    }, "");
  const here = levels.findIndex((l) => l[2] === "current");
  document.getElementById("route-done").setAttribute("d", route(levels.slice(0, here + 1)));
  document.getElementById("route-todo").setAttribute("d", route(levels.slice(here)));
  const status = { done: "Cleared ★★★", current: "Current quest", locked: "Locked", boss: "Final boss · Locked" };
  const list = document.getElementById("nodes");
  const info = document.getElementById("quest-info");
  const show = (i) => {
    const [, , s, phase, title, text] = levels[i];
    info.innerHTML = `<p class="px-label">Level ${i + 1} · ${phase}</p><h3>${title}</h3><p>${text}</p><p class="px-small status-${s}">${status[s]}</p>`;
    list.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", i === j));
  };
  levels.forEach(([x, y, s, , title], i) => {
    const li = document.createElement("li");
    li.className = `node ${s}`;
    li.style.left = `${(x / 1200) * 100}%`;
    li.style.top = `${(y / 700) * 100}%`;
    li.innerHTML = `${s === "done" ? '<span class="stars" aria-hidden="true">★★★</span>' : ""}<button type="button" aria-label="Level ${i + 1}: ${title}, ${status[s]}">${i + 1}</button>`;
    const btn = li.querySelector("button");
    btn.addEventListener("click", () => show(i));
    btn.addEventListener("mouseenter", () => show(i));
    btn.addEventListener("focus", () => show(i));
    list.append(li);
  });
  show(here);
})();
