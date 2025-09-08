// modules/menu.js
export function setupMenu() {
  const toggleBtn = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}
