const dialog = document.querySelector(".poster-dialog");
const dialogImg = dialog.querySelector("img");

document.querySelectorAll(".carousel-item button").forEach((poster) =>
  poster.addEventListener("click", () => {
    dialogImg.src = poster.dataset.src;
    dialogImg.alt = poster.getAttribute("aria-label");
    dialog.showModal();
  }),
);

// click on the backdrop closes the popup
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
