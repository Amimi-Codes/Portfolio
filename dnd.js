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
  intro.querySelector(".intro-skip").addEventListener("click", finish);
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

  /* ---- Quest map (levels from the DndCharacterCreation README) ---- */
  const levels = [
    [90, 560, "done", "Phase 1 · Foundation", "Basic character creation interface", "The first screen a new adventurer sees."],
    [110, 340, "done", "Phase 1 · Foundation", "Core D&D 5e rules", "The rules engine everything else stands on."],
    [260, 400, "done", "Phase 1 · Foundation", "Species & class selection", "Pick who you are and what you do."],
    [300, 590, "done", "Phase 1 · Foundation", "Sub-species", "Because not every elf is the same elf."],
    [600, 360, "current", "Phase 1 · Foundation", "Images & icons", "Visual choices instead of walls of text. Promise there are no mimics (yet)."],
    [720, 110, "locked", "Phase 2 · Enhancement", "Custom character portrait", "Upload your own art to the Character Summary."],
    [900, 190, "locked", "Phase 2 · Enhancement", "Spell selection", "Choosing spells without a spreadsheet."],
    [960, 410, "locked", "Phase 2 · Enhancement", "Feats & proficiencies", "The fine-tuning layer."],
    [880, 590, "locked", "Phase 3 · Integration", "Character leveling", "Take your hero past level 1."],
    [1090, 600, "locked", "Phase 3 · Integration", "Mobile-friendly version", "Build a character on the bus to session."],
    [1150, 400, "locked", "Phase 4 · Exportation", "Character sheet export", "From builder to the table."],
    [1140, 200, "locked", "Phase 4 · Exportation", "Google Docs template", "Export to a templated, shareable doc."],
    [1020, 70, "boss", "Future plans", "Custom content & artwork", "Homebrew species, classes and character art."],
  ];
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
  show(4);
})();
