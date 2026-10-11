const FOLDER = "assets/Graphic Design Work";
const LISTING = `https://api.github.com/repos/Amimi-Codes/Portfolio/contents/${encodeURI(FOLDER)}`;

const carousel = document.querySelector(".carousel");
const ring = carousel.querySelector(".carousel-item-wrapper");
const ground = ring.querySelector(".carousel-ground");
const dialog = document.querySelector(".poster-dialog");
const dialogImg = dialog.querySelector("img");

// posters written in the HTML: the fallback, and the source of their alt text
const known = [...ring.querySelectorAll(".carousel-item button")].map((b) => ({
  src: b.dataset.src,
  alt: b.getAttribute("aria-label"),
}));

// "hear-me-out_cake.webp" -> "Event graphic: hear me out cake"
const altFromName = (src) =>
  "Event graphic: " + decodeURIComponent(src.split("/").pop()).replace(/\.\w+$/, "").replace(/[-_]+/g, " ");

const render = (posters) => {
  ring.querySelectorAll(".carousel-item").forEach((li) => li.remove());
  posters.forEach(({ src, alt }, i) => {
    const li = document.createElement("li");
    li.className = "carousel-item";
    li.style.cssText = `--_index: ${i + 1}; --_image-url: url("${src}")`;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.src = src;
    button.setAttribute("aria-label", alt);
    li.append(button);
    ring.insertBefore(li, ground);
  });
  carousel.style.setProperty("--_n", posters.length);
};

// Show every image in the folder on GitHub: posters already in the HTML keep their
// order and alt text, new files are added after them. If GitHub can't be reached
// (offline, rate limit), the posters in the HTML stay as they are.
fetch(LISTING)
  .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
  .then((files) => {
    const srcs = files
      .filter((f) => f.type === "file" && /\.(webp|avif|png|jpe?g|gif|svg)$/i.test(f.name))
      .map((f) => encodeURI(`${FOLDER}/${f.name}`));
    const posters = [
      ...known.filter((k) => srcs.includes(k.src)),
      ...srcs.filter((src) => !known.some((k) => k.src === src)).map((src) => ({ src, alt: altFromName(src) })),
    ];
    if (posters.length) render(posters);
  })
  .catch(() => {});

ring.addEventListener("click", (e) => {
  const poster = e.target.closest(".carousel-item button");
  if (!poster) return;
  dialogImg.src = poster.dataset.src;
  dialogImg.alt = poster.getAttribute("aria-label");
  dialog.showModal();
});

// click on the backdrop closes the popup
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
