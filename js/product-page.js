// ---------------------------------------------------------------------------
// Product detail page (product.html). Reads ?id=<id|slug>, loads the product
// from the same sources as the shop, and renders a fotoliox-style detail:
// image carousel (arrows + dots + thumbnails) + info panel + related products.
// ---------------------------------------------------------------------------

(function () {
  // ---- Dark mode (default light, same as the homepage) --------------------
  const toggle = document.getElementById("darkToggle");
  if (localStorage.getItem("theme") === "dark") document.documentElement.classList.add("dark");
  const syncIcon = () =>
    (toggle.textContent = document.documentElement.classList.contains("dark") ? "light_mode" : "dark_mode");
  syncIcon();
  toggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    syncIcon();
  });

  // ---- Cart sidebar -------------------------------------------------------
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  const openCart = () => {
    sidebar.classList.remove("translate-x-full");
    overlay.classList.remove("opacity-0", "pointer-events-none");
  };
  const closeCart = () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.add("opacity-0", "pointer-events-none");
  };
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.getElementById("checkoutBtn").addEventListener("click", () => Cart.checkout());
  Cart.render();

  // ---- Helpers ------------------------------------------------------------
  function mediaItems(p) {
    const imgs = [p.main_image, ...(p.gallery_images || [])].filter(Boolean);
    const items = imgs.map((url) => ({ type: "image", url }));
    if (p.video) items.push({ type: "video", youtubeId: p.video });
    return items;
  }

  function mediaMarkup(it, name) {
    return it.type === "video"
      ? `<iframe class="h-full w-full" src="https://www.youtube.com/embed/${it.youtubeId}"
           title="${name}" frameborder="0" allowfullscreen
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
      : `<img src="${it.url}" alt="${name}" class="h-full w-full object-contain">`;
  }

  function fmtDateTime(d) {
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
  }

  // ---- Render -------------------------------------------------------------
  function render(p, related) {
    document.title = `${p.name} | John Thomas Photography`;
    document.getElementById("crumbName").textContent = p.name;

    const items = mediaItems(p);
    const inStock = p.stock > 0;

    const thumbs = items.map((it, i) => `
      <button class="detail-thumb h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden ring-2 ${i === 0 ? "ring-primary" : "ring-transparent"}" data-i="${i}">
        ${it.type === "video"
          ? `<span class="grid h-full w-full place-items-center bg-slate-900 text-white material-symbols-outlined">play_circle</span>`
          : `<img src="${it.url}" class="h-full w-full object-cover" alt="">`}
      </button>`).join("");

    const dots = items.length > 1
      ? items.map((_, i) => `<button class="detail-dot h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"}" data-i="${i}"></button>`).join("")
      : "";

    const arrows = items.length > 1 ? `
      <button id="detailPrev" class="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-md bg-slate-700/70 text-white hover:bg-slate-700">
        <span class="material-symbols-outlined">chevron_left</span></button>
      <button id="detailNext" class="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-md bg-slate-700/70 text-white hover:bg-slate-700">
        <span class="material-symbols-outlined">chevron_right</span></button>` : "";

    const relatedHtml = related.length ? `
      <section class="mt-14">
        <h2 class="text-2xl font-extrabold mb-6">Related Products</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${related.map((r) => `
            <a href="product.html?id=${encodeURIComponent(r.id)}" class="product-card block rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <img src="${r.main_image}" alt="${r.name}" loading="lazy" class="aspect-[4/3] w-full object-cover">
              <div class="p-4">
                <span class="text-xs uppercase tracking-wide text-primary font-semibold">${r.category}</span>
                <h3 class="font-bold mt-1 leading-tight">${r.name}</h3>
                <p class="text-lg font-extrabold text-primary mt-2">${formatVND(r.price)}</p>
              </div>
            </a>`).join("")}
        </div>
      </section>` : "";

    document.getElementById("productDetail").innerHTML = `
      <div class="rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-5 sm:p-8 grid lg:grid-cols-2 gap-8">
        <!-- Gallery -->
        <div>
          <div class="relative">
            <div id="detailMain" class="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              ${mediaMarkup(items[0], p.name)}
            </div>
            ${arrows}
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">${dots}</div>
          </div>
          <div id="detailThumbs" class="flex gap-2 mt-3 overflow-x-auto pb-1">${thumbs}</div>
        </div>

        <!-- Info -->
        <div>
          <span class="inline-flex items-center gap-1 rounded-full ${inStock ? "bg-accent/15 text-accent" : "bg-secondary/15 text-secondary"} px-3 py-1 text-xs font-semibold">
            <span class="material-symbols-outlined text-sm">${inStock ? "check_circle" : "cancel"}</span>
            ${inStock ? "Available" : "Out of stock"}
          </span>

          <h1 class="text-3xl font-extrabold mt-3">${p.name}</h1>
          <p class="text-3xl font-extrabold text-primary mt-3">${formatVND(p.price)}</p>

          <div class="flex items-center gap-2 text-sm text-slate-500 mt-3">
            <span class="material-symbols-outlined text-yellow-400 text-lg" style="font-variation-settings:'FILL' 1">star</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200">${p.rating ?? 0}</span>
            <span>•</span><span>${p.review_count ?? 0} reviews</span>
            <span>•</span><span>${p.stock ?? 0} in stock</span>
          </div>

          <p class="text-slate-500 mt-4 leading-relaxed">${p.description || ""}</p>

          <hr class="my-6 border-slate-200 dark:border-slate-700" />

          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-slate-400">calendar_today</span>
              <span class="text-slate-500">Added:</span>
              <span class="font-medium">${fmtDateTime(p.created_at) || "—"}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-slate-400">sell</span>
              <span class="text-slate-500">Product ID:</span>
              <span class="font-medium break-all">${p.id}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-slate-400">category</span>
              <span class="text-slate-500">Category:</span>
              <span class="font-medium capitalize">${p.category || "—"}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-8">
            <a href="index.html#shop" class="rounded-full bg-slate-100 dark:bg-slate-800 py-3.5 text-center font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Continue Shopping
            </a>
            <button id="addBtn" class="rounded-full bg-primary py-3.5 text-white font-semibold hover:opacity-90 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">add_shopping_cart</span> Add to Cart
            </button>
          </div>
        </div>
      </div>
      ${relatedHtml}`;

    // ---- Carousel interactions ----
    const mainEl = document.getElementById("detailMain");
    const thumbBtns = [...document.querySelectorAll(".detail-thumb")];
    const dotBtns = [...document.querySelectorAll(".detail-dot")];
    let idx = 0;
    const show = (i) => {
      idx = (i + items.length) % items.length;
      mainEl.innerHTML = mediaMarkup(items[idx], p.name);
      thumbBtns.forEach((b, bi) => {
        b.classList.toggle("ring-primary", bi === idx);
        b.classList.toggle("ring-transparent", bi !== idx);
      });
      dotBtns.forEach((d, di) => {
        d.classList.toggle("bg-primary", di === idx);
        d.classList.toggle("bg-slate-300", di !== idx);
      });
    };
    thumbBtns.forEach((b) => b.addEventListener("click", () => show(Number(b.dataset.i))));
    dotBtns.forEach((d) => d.addEventListener("click", () => show(Number(d.dataset.i))));
    const prev = document.getElementById("detailPrev");
    const next = document.getElementById("detailNext");
    if (prev) prev.addEventListener("click", () => show(idx - 1));
    if (next) next.addEventListener("click", () => show(idx + 1));

    // ---- Add to cart ----
    document.getElementById("addBtn").addEventListener("click", () => { Cart.add(p); openCart(); });
  }

  function renderNotFound(id) {
    document.getElementById("productDetail").innerHTML = `
      <div class="text-center py-24">
        <span class="material-symbols-outlined text-6xl text-slate-300">search_off</span>
        <h1 class="text-2xl font-bold mt-4">Product not found</h1>
        <p class="text-slate-500 mt-2">The product "<b>${id || ""}</b>" does not exist.</p>
        <a href="index.html#shop" class="inline-block mt-6 rounded-full bg-primary px-6 py-3 text-white font-semibold hover:opacity-90">Back to Shop</a>
      </div>`;
  }

  // ---- Boot ---------------------------------------------------------------
  async function boot() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return renderNotFound(id);
    try {
      const products = await loadProducts();
      const p = products.find((x) => x.id === id);
      if (!p) return renderNotFound(id);
      const related = products.filter((x) => x.id !== p.id).slice(0, 3);
      render(p, related);
    } catch (e) {
      console.error(e);
      renderNotFound(id);
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
