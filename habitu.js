const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Artifact gallery: per-slide parallax, reveals, image-to-detail morph ---------- */
const gallery = document.querySelector(".gallery");
if (gallery) {
  // >1 travels faster than the page, <1 slower, like the Codrops gallery
  const speeds = [1.18, 0.86, 1.12, 0.82, 1.2, 0.88, 1.1];
  const slides = [...gallery.querySelectorAll(".gallery-slide")].map((el, i) => ({
    el,
    frame: el.querySelector(".gallery-frame"),
    img: el.querySelector("img"),
    factor: speeds[i % speeds.length] - 1,
    y: 0,
  }));

  // Split captions into characters for the type-on reveal; screen readers get the plain text
  slides.forEach(({ el }) => {
    const cap = el.querySelector("figcaption"), text = cap.textContent;
    cap.textContent = "";
    const plain = document.createElement("span"), chars = document.createElement("span");
    plain.className = "sr-only";
    plain.textContent = text;
    chars.setAttribute("aria-hidden", "true");
    [...text].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "char";
      s.style.setProperty("--i", i);
      s.textContent = c === " " ? " " : c;
      chars.append(s);
    });
    cap.append(plain, chars);
  });

  if (!reducedMotion) {
    gallery.classList.add("is-live");
    const reveal = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach((e, i) => {
            e.target.style.setProperty("--delay", `${i * 0.12}s`);
            e.target.classList.add("is-in");
          });
        // Reset slides that leave so the reveal replays on the next pass
        entries.filter((e) => !e.isIntersecting).forEach((e) => e.target.classList.remove("is-in"));
      },
      { threshold: 0.12 },
    );
    slides.forEach(({ el }) => reveal.observe(el));

    // Parallax only runs while the gallery is on screen
    let running = false;
    const tick = () => {
      if (!running) return;
      const mid = innerHeight / 2;
      for (const s of slides) {
        const r = s.el.getBoundingClientRect(); // the figure itself is never moved vertically
        const d = r.top + r.height / 2 - mid;
        s.y += (s.factor * d - s.y) * 0.09; // eased toward target for the scrubbed, inertial feel
        s.frame.style.transform = `translate3d(0,${s.y.toFixed(2)}px,0)`;
        s.img.style.transform = `translate3d(0,${((-d / innerHeight) * 2.5).toFixed(2)}%,0) scale(1.06)`;
      }
      requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) requestAnimationFrame(tick);
    }).observe(gallery);
  }

  // Detail view: the clicked image morphs (FLIP) into the fullscreen layout
  const view = document.querySelector(".artifact-view"),
    viewImg = view.querySelector(".artifact-view-img"),
    viewBg = view.querySelector(".artifact-view-bg"),
    viewText = view.querySelector(".artifact-view-text");
  const ease = "cubic-bezier(0.7, 0, 0.2, 1)";
  let active = null, busy = false;

  const flipFrom = (frame) => {
    const a = frame.getBoundingClientRect(), b = viewImg.getBoundingClientRect();
    return `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`;
  };

  const open = async (slide) => {
    if (busy || view.open) return;
    busy = true;
    active = slide;
    const { frame, img } = slide;
    viewImg.src = img.currentSrc || img.src;
    viewImg.alt = img.alt;
    view.querySelector(".artifact-index").textContent = `${frame.dataset.index} / 07`;
    view.querySelector("h2").textContent = frame.dataset.title;
    view.querySelector(".artifact-desc").textContent = frame.dataset.desc;
    await viewImg.decode().catch(() => {});
    view.showModal();
    slide.el.classList.add("is-open");
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
      await viewImg.animate([{ transform: "none" }, { transform: flipFrom(active.frame) }], {
        duration: 850,
        easing: ease,
        fill: "forwards",
      }).finished;
    }
    view.close();
    view.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    active.el.classList.remove("is-open");
    active.frame.focus({ preventScroll: true });
    busy = false;
  };

  slides.forEach((s) => s.frame.addEventListener("click", () => open(s)));
  view.querySelector(".artifact-back").addEventListener("click", close);
  view.addEventListener("cancel", (e) => {
    e.preventDefault(); // play the morph back instead of snapping shut on Escape
    close();
  });
}

/* ---------- 04 / UNDERSTAND: animated 3D survey pie ---------- */
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
    let start = Math.PI / 2;
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
      dot.setAttribute("r", 2.5);
      lines.append(path, dot);
      label.addEventListener("pointerenter", () => (hovered = i));
      label.addEventListener("pointerleave", () => (hovered = -1));
      return { mesh, anchor, label, path, dot, mid, lift: 0, grow: 0 };
    });

    // Hover a slice (or its label) to pull it out of the pie
    let hovered = -1;
    const ray = new THREE.Raycaster(), pointer = new THREE.Vector2();
    host.addEventListener("pointermove", (e) => {
      const r = host.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(slices.map((s) => s.mesh))[0];
      hovered = hit ? hit.object.userData.index : -1;
    });
    host.addEventListener("pointerleave", () => (hovered = -1));

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
    new ResizeObserver(resize).observe(host);
    resize();

    const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

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

    let shownAt = -1, last = performance.now(), spin = 0;
    const frame = (now) => {
      requestAnimationFrame(frame);
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const visible = stage.dataset.active === "insight";
      if (!visible) {
        if (shownAt >= 0) {
          // reset so the build-in replays next time
          shownAt = -1;
          slices.forEach((s) => s.label.classList.remove("is-on"));
        }
        return;
      }
      if (shownAt < 0) shownAt = now;
      const t = (now - shownAt) / 1000;
      if (!reducedMotion && hovered < 0) spin += dt * 0.18;
      pie.rotation.y = reducedMotion ? 0.4 : -0.9 * Math.max(0, 1 - t / 1.6) ** 3 + 0.4 + spin;

      slices.forEach((s, i) => {
        const g = reducedMotion ? 1 : Math.min(1, Math.max(0, (t - 0.15 - i * 0.12) / 0.9));
        s.grow = g === 1 ? 1 : easeOutBack(g);
        s.lift += ((hovered === i ? 1 : 0) - s.lift) * 0.15;
        s.mesh.scale.y = Math.max(0.001, s.grow);
        s.mesh.position.set(Math.cos(s.mid) * (0.04 + s.lift * 0.22), s.lift * 0.12, -Math.sin(s.mid) * (0.04 + s.lift * 0.22));
        const hot = hovered === i;
        s.label.classList.toggle("is-hot", hot);
        s.path.classList.toggle("is-hot", hot);
        s.label.classList.toggle("is-on", g > 0.6);
        s.path.style.opacity = s.dot.style.opacity = g > 0.6 ? "" : 0;
      });
      renderer.render(scene, camera);
      placeLabels();
    };
    requestAnimationFrame(frame);
  }
}
