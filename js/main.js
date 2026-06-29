// ---------------------------------------------------------------------------
// Bootstrap — wire everything up once the DOM is ready, then hide the loader.
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  UI.init();
  Cart.render();
  Shop.init();

  // Hide the loading screen once the first paint settles.
  const loader = document.getElementById("loadingScreen");
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("opacity-0");
      setTimeout(() => (loader.style.display = "none"), 500);
    }, 300);
  });
  // Fallback in case the load event already fired.
  setTimeout(() => {
    if (loader.style.display !== "none") {
      loader.classList.add("opacity-0");
      setTimeout(() => (loader.style.display = "none"), 500);
    }
  }, 2000);
});
