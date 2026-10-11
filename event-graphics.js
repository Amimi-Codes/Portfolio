const lens = document.querySelector(".magnifying-glass");
const dialog = document.querySelector(".poster-dialog");
const dialogImg = dialog.querySelector("img");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const ZOOM = 2.5; // zoomed poster width = lens width * ZOOM

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
