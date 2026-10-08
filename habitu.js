const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- The making: once reached, the first draft splits open into the three style tiles by itself ---------- */
const morph = document.querySelector(".morph");
if (morph) {
  const pin = morph.querySelector(".morph-pin"),
    draft = morph.querySelector(".morph-draft"),
    draftCap = draft.querySelector("figcaption"),
    shards = [...draft.querySelectorAll(".morph-shard")],
    tiles = [...morph.querySelectorAll(".morph-tile")];
  const clamp = (v) => Math.min(1, Math.max(0, v)),
    smooth = (t) => t * t * (3 - 2 * t),
    lerp = (a, b, t) => a + (b - a) * t;
  // layout boxes relative to the pin (offsets ignore the transforms we set)
  const box = (el) => {
    let x = 0, y = 0;
    for (let n = el; n && n !== pin; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
  };
  let p = 0, startedAt = -1;
  const render = () => {
    // 1) the draft splits along its columns and the three parts swing open
    const open = smooth(clamp(p / 0.3));
    const spread = draft.offsetWidth * 0.12;
    draftCap.style.opacity = 1 - open;
    shards.forEach((shard, i) => {
      const tile = tiles[i], side = i - 1;
      // 2) each part travels to its slot in the row and becomes that style tile
      const e = smooth(clamp((p - 0.3 - i * 0.05) / 0.5));
      const S = box(shard), T = box(tile);
      const sx = S.x + side * spread * open, sy = S.y;
      const tilt = side * 6 * open * (1 - e);
      shard.style.transform = `translate(${side * spread * open + (T.x - sx) * e}px,${(T.y - sy) * e}px) rotate(${tilt}deg) scale(${lerp(1, T.w / S.w, e)},${lerp(1, T.h / S.h, e)})`;
      shard.style.opacity = 1 - clamp(e * 2 - 0.6);
      tile.style.transform = `translate(${(sx - T.x) * (1 - e)}px,${(sy - T.y) * (1 - e)}px) rotate(${tilt}deg) scale(${lerp(S.w / T.w, 1, e)},${lerp(S.h / T.h, 1, e)})`;
      tile.style.opacity = clamp(e * 2 - 0.2);
      tile.querySelector("figcaption").style.opacity = clamp((e - 0.85) / 0.15);
      tile.style.pointerEvents = e > 0.95 ? "" : "none";
    });
    draft.style.pointerEvents = open < 0.05 ? "" : "none";
  };
  const DURATION = 2800;
  const play = () => {
    p = clamp((performance.now() - startedAt) / DURATION);
    render();
    if (p < 1 && startedAt >= 0) requestAnimationFrame(play);
  };
  const check = () => {
    const r = morph.getBoundingClientRect();
    if (startedAt < 0 && r.top <= parseFloat(getComputedStyle(pin).top) + 1) {
      // the pin has caught: play the whole split without needing more scrolling
      startedAt = performance.now();
      if (reducedMotion) startedAt -= DURATION;
      requestAnimationFrame(play);
    } else if (startedAt >= 0 && r.top > innerHeight) {
      // scrolled back above the section: reset so it plays again next time
      startedAt = -1;
      p = 0;
      render();
    }
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", render);
  render();
  check();
}

/* ---------- Detail view: a clicked artifact morphs (FLIP) into a fullscreen layout ---------- */
const view = document.querySelector(".artifact-view");
if (view) {
  const viewImg = view.querySelector(".artifact-view-img"),
    viewBg = view.querySelector(".artifact-view-bg"),
    viewText = view.querySelector(".artifact-view-text");
  const ease = "cubic-bezier(0.7, 0, 0.2, 1)";
  let active = null, busy = false;

  const flipFrom = (frame) => {
    const a = frame.getBoundingClientRect(), b = viewImg.getBoundingClientRect();
    return `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`;
  };

  const open = async (frame) => {
    if (busy || view.open) return;
    busy = true;
    active = frame;
    const img = frame.querySelector("img");
    viewImg.src = img.currentSrc || img.src;
    viewImg.alt = img.alt;
    view.querySelector(".artifact-index").textContent = `${frame.dataset.index} / 04`;
    view.querySelector("h2").textContent = frame.dataset.title;
    view.querySelector(".artifact-desc").textContent = frame.dataset.desc;
    await viewImg.decode().catch(() => {});
    view.showModal();
    frame.parentElement.classList.add("is-open");
    if (!reducedMotion) {
      viewImg.animate([{ transform: flipFrom(frame) }, { transform: "none" }], { duration: 900, easing: ease });
      viewBg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: "ease-out" });
      await viewText.animate(
        [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
        { duration: 600, delay: 450, easing: "ease-out", fill: "backwards" },
      ).finished;
    }
    busy = false;
  };

  const close = async () => {
    if (busy || !view.open) return;
    busy = true;
    if (!reducedMotion) {
      viewText.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" });
      viewBg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 200, fill: "forwards" });
      await viewImg.animate([{ transform: "none" }, { transform: flipFrom(active) }], {
        duration: 850,
        easing: ease,
        fill: "forwards",
      }).finished;
    }
    view.close();
    view.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    active.parentElement.classList.remove("is-open");
    active.focus({ preventScroll: true });
    busy = false;
  };

  document.querySelectorAll(".artifacts .gallery-frame").forEach((f) => f.addEventListener("click", () => open(f)));
  view.querySelector(".artifact-back").addEventListener("click", close);
  view.addEventListener("cancel", (e) => {
    e.preventDefault(); // play the morph back instead of snapping shut on Escape
    close();
  });
}

/* ---------- 06 / TEST: cycle the final screens while the section is on stage ---------- */
const screens = document.querySelector(".test-screens");
if (screens) {
  const imgs = [...screens.children];
  // homepage → goal 1 → goal 2 → homepage → history → shop, then round again
  const order = [0, 1, 2, 0, 3, 4];
  const stage = screens.closest(".story-stage");
  let step = 0, timer = 0;
  const show = () => imgs.forEach((img, i) => (img.hidden = i !== order[step]));
  const sync = () => {
    clearInterval(timer);
    step = 0;
    show();
    if (stage.dataset.active === "test")
      timer = setInterval(() => {
        step = (step + 1) % order.length;
        show();
      }, 2200);
  };
  new MutationObserver(sync).observe(stage, { attributes: true, attributeFilter: ["data-active"] });
  sync();
}

/* ---------- 04 / UNDERSTAND: 3D survey pie, slices drop in when the section is reached ---------- */
const chart = document.querySelector(".survey-chart");
if (chart) {
  // Screening survey: which goals students track
  const data = [
    { name: "Health / Fitness", value: 28.6, color: "#7fe3c4" },
    { name: "Academic Improvement", value: 19.0, color: "#3fb3b8" },
    { name: "Personal Development", value: 14.3, color: "#e6a98f" },
    { name: "Reducing Anxiety / Stress", value: 14.3, color: "#f1d48a" },
    { name: "Time Management", value: 9.5, color: "#94b6ff" },
    { name: "I Don’t Track Habits", value: 14.3, color: "#6f8d95" },
  ];
  const stage = chart.closest(".story-stage");
  // Load three.js only once the story is close to the viewport
  const near = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    near.disconnect();
    Promise.all([import("three"), import("three/addons/environments/RoomEnvironment.js")])
      .then(([THREE, { RoomEnvironment }]) => buildPie(THREE, RoomEnvironment))
      .catch(() => chart.classList.add("is-unavailable"));
  }, { rootMargin: "100% 0px" });
  near.observe(stage);

  function buildPie(THREE, RoomEnvironment) {
    const host = chart.querySelector(".chart-scene"),
      lines = chart.querySelector(".chart-lines"),
      labelsHost = chart.querySelector(".chart-labels");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.append(renderer.domElement);

    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const sun = new THREE.DirectionalLight("#ffffff", 2.2);
    sun.position.set(3, 8, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.radius = 6;
    Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
    scene.add(sun, new THREE.HemisphereLight("#d8fff0", "#06303a", 0.9));

    const ground = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.ShadowMaterial({ opacity: 0.28 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pie = new THREE.Group();
    scene.add(pie);
    const R = 2, total = data.reduce((t, d) => t + d.value, 0);
    // fixed layout: Health / Fitness starts at the right edge, the rest follow anticlockwise
    let start = 0.08;
    const slices = data.map((d, i) => {
      const sweep = (d.value / total) * Math.PI * 2, mid = start + sweep / 2;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.absarc(0, 0, R, start, start + sweep, false);
      shape.lineTo(0, 0);
      // Taller slices for bigger shares, as in the ECharts 3D pie
      const height = 0.25 + (d.value / 28.6) * 0.75;
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        curveSegments: 72,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.035,
        bevelSegments: 4,
      });
      geo.rotateX(-Math.PI / 2); // lie flat, extrude upward
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshPhysicalMaterial({ color: d.color, roughness: 0.32, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
      );
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.userData.index = i;
      pie.add(mesh);
      start += sweep;
      // the label anchors to the top outer edge of the slice
      const anchor = new THREE.Object3D();
      anchor.position.set(Math.cos(mid) * R * 0.98, height, -Math.sin(mid) * R * 0.98);
      mesh.add(anchor);

      const label = document.createElement("div");
      label.className = "chart-label";
      label.style.setProperty("--c", d.color);
      label.innerHTML = `<i></i><b>${d.value.toFixed(1)}%</b><span>${d.name}</span>`;
      labelsHost.append(label);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path"),
        dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      path.setAttribute("fill", "none"); // never filled, even if the stylesheet is stale
      dot.setAttribute("r", 2.5);
      lines.append(path, dot);
      mesh.position.set(Math.cos(mid) * 0.04, 0, -Math.sin(mid) * 0.04); // hairline gap between slices
      return { mesh, anchor, label, path, dot };
    });

    let w = 0, h = 0, compact = false;
    const v = new THREE.Vector3();
    const toScreen = (obj) => {
      obj.getWorldPosition(v).project(camera);
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
    };
    const centre = new THREE.Object3D(), rim = new THREE.Object3D();
    rim.position.set(R + 0.1, 0, 0);
    scene.add(centre, rim);
    const pieRadiusPx = () => toScreen(rim).x - toScreen(centre).x;
    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      compact = w < 520;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // size the pie to leave a label column on each side
      const target = Math.min(w / 2 - (compact ? 128 : 190), h * 0.36);
      let dist = 12;
      for (let i = 0; i < 3; i++) {
        camera.position.set(0, dist * 0.62, dist * 0.78);
        camera.lookAt(0, 0.1, 0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        dist *= pieRadiusPx() / Math.max(target, 40);
      }
      lines.setAttribute("viewBox", `0 0 ${w} ${h}`);
    };
    new ResizeObserver(() => {
      resize();
      draw(performance.now());
    }).observe(host);
    resize();


    const placeLabels = () => {
      const c = toScreen(centre), rx = pieRadiusPx(), gap = compact ? 10 : 22;
      const items = slices.map((s) => {
        const p = toScreen(s.anchor), lh = s.label.offsetHeight;
        return { s, p, lh, left: p.x < c.x, y: p.y - lh / 2 };
      });
      // keep labels on each side from stacking on top of each other
      for (const side of [true, false]) {
        const group = items.filter((it) => it.left === side).sort((a, b) => a.y - b.y);
        for (let i = 1; i < group.length; i++) group[i].y = Math.max(group[i].y, group[i - 1].y + group[i - 1].lh + 6);
      }
      for (const { s, p, lh, left, y } of items) {
        const lw = s.label.offsetWidth, ly = y + lh / 2;
        const elbowX = left ? Math.min(p.x, c.x - rx - gap * 0.4) : Math.max(p.x, c.x + rx + gap * 0.4);
        const x = left ? Math.max(6, c.x - rx - gap - lw) : Math.min(w - lw - 6, c.x + rx + gap);
        s.label.classList.toggle("is-left", left);
        s.label.style.transform = `translate(${x}px,${y}px)`;
        s.path.setAttribute("d", `M${p.x},${p.y} L${elbowX},${ly} L${left ? x + lw : x},${ly}`);
        s.dot.setAttribute("cx", p.x);
        s.dot.setAttribute("cy", p.y);
      }
    };

    const DROP = 4, FALL = 0.75, STAGGER = 0.12;
    const bounce = (t) => (t < 0.73 ? Math.min(1, 1.9 * t * t) : 1 - 0.12 * Math.sin(((t - 0.73) / 0.27) * Math.PI) * (1 - t) * 3.7);
    let startedAt = -1, raf = 0;
    const draw = (now) => {
      const t = startedAt < 0 ? 0 : reducedMotion ? 99 : (now - startedAt) / 1000;
      slices.forEach((s, i) => {
        const k = startedAt < 0 ? 0 : Math.min(1, Math.max(0, (t - i * STAGGER) / FALL));
        s.mesh.position.y = DROP * (1 - bounce(k));
        s.mesh.visible = k > 0;
        const on = k === 1;
        s.label.classList.toggle("is-on", on);
        s.path.style.opacity = s.dot.style.opacity = on ? "" : 0;
      });
      renderer.render(scene, camera);
      placeLabels();
      return t < (slices.length - 1) * STAGGER + FALL;
    };
    const loop = () => (raf = draw(performance.now()) ? requestAnimationFrame(loop) : 0);
    const sync = () => {
      const visible = stage.dataset.active === "insight";
      if (visible && startedAt < 0) {
        startedAt = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      } else if (!visible && startedAt >= 0) {
        // reset so the drop replays on the next visit
        startedAt = -1;
        cancelAnimationFrame(raf);
        draw(0);
      }
    };
    new MutationObserver(sync).observe(stage, { attributes: true, attributeFilter: ["data-active"] });
    draw(0);
    sync();
  }
}
