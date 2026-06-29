// ---------------------------------------------------------------------------
// Product detail page (product.html). Reads ?id=<id|slug>, loads the product
// from the same sources as the shop, and renders gallery + video + buy button.
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

  // ---- Media gallery helpers ---------------------------------------------
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
      : `<img src="${it.url}" alt="${name}" class="h-full w-full object-cover">`;
  }

  function render(p) {
    document.title = `${p.name} | John Doe Photography`;
    document.getElementById("crumbName").textContent = p.name;

    const items = mediaItems(p);
    const specs = p.specs && Object.keys(p.specs).length
      ? `<div class="mt-6"><h4 class="font-semibold">Thông số</h4>
           <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2 max-w-md">
             ${Object.entries(p.specs).map(([k, v]) =>
               `<dt class="text-slate-400 capitalize">${k}</dt><dd>${v}</dd>`).join("")}
           </dl></div>` : "";
    const feats = (p.features && p.features.length)
      ? `<div class="mt-6"><h4 class="font-semibold">Tính năng nổi bật</h4>
           <ul class="mt-2 space-y-1.5 text-sm">
             ${p.features.map((f) => `<li class="flex items-center gap-2">
               <span class="material-symbols-outlined text-accent text-base">check_circle</span>${f}</li>`).join("")}
           </ul></div>` : "";
    const thumbs = items.length > 1
      ? `<div class="flex gap-2 mt-3 flex-wrap">
           ${items.map((it, i) => `
             <button class="detail-thumb h-20 w-20 rounded-lg overflow-hidden ring-2 ${i === 0 ? "ring-primary" : "ring-transparent"}" data-i="${i}">
               ${it.type === "video"
                 ? `<span class="grid h-full w-full place-items-center bg-slate-900 text-white material-symbols-outlined">play_circle</span>`
                 : `<img src="${it.url}" class="h-full w-full object-cover" alt="">`}
             </button>`).join("")}
         </div>` : "";

    document.getElementById("productDetail").innerHTML = `
      <div class="grid lg:grid-cols-2 gap-8">
        <div>
          <div id="detailMain" class="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm">
            ${mediaMarkup(items[0], p.name)}
          </div>
          ${thumbs}
        </div>
        <div>
          <span class="text-xs uppercase tracking-wide text-primary font-semibold">${p.category}</span>
          <h1 class="text-3xl font-extrabold mt-1">${p.name}</h1>
          <div class="flex items-center gap-1 mt-2">${ratingStars(p.rating)}
            <span class="text-sm text-slate-400 ml-1">(${p.review_count} đánh giá)</span></div>
          <p class="text-3xl font-extrabold text-primary mt-4">${formatVND(p.price)}</p>
          <p class="text-slate-500 mt-4 leading-relaxed">${p.description}</p>
          <p class="text-sm mt-4 ${p.stock > 0 ? "text-accent" : "text-secondary"}">
            ${p.stock > 0 ? `Còn hàng (${p.stock})` : "Hết hàng"}</p>
          ${specs}${feats}
          <div class="flex items-center gap-3 mt-8">
            <div class="flex items-center rounded-full border border-slate-200 dark:border-slate-700">
              <button id="qtyMinus" class="material-symbols-outlined px-3 py-2">remove</button>
              <span id="qtyVal" class="w-10 text-center">1</span>
              <button id="qtyPlus" class="material-symbols-outlined px-3 py-2">add</button>
            </div>
            <button id="buyBtn" class="flex-1 rounded-full bg-primary py-3.5 text-white font-semibold hover:opacity-90 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">shopping_cart_checkout</span> Mua ngay
            </button>
          </div>
          <button id="addBtn" class="w-full mt-3 rounded-full border border-primary text-primary py-3 font-semibold hover:bg-primary/10 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">add_shopping_cart</span> Thêm vào giỏ
          </button>
        </div>
      </div>`;

    // gallery thumbnail switching
    const mainEl = document.getElementById("detailMain");
    const thumbBtns = document.querySelectorAll(".detail-thumb");
    thumbBtns.forEach((b) =>
      b.addEventListener("click", () => {
        mainEl.innerHTML = mediaMarkup(items[Number(b.dataset.i)], p.name);
        thumbBtns.forEach((x) => {
          x.classList.toggle("ring-primary", x === b);
          x.classList.toggle("ring-transparent", x !== b);
        });
      }));

    // quantity + buy
    let qty = 1;
    const qtyVal = document.getElementById("qtyVal");
    document.getElementById("qtyMinus").addEventListener("click", () => { qty = Math.max(1, qty - 1); qtyVal.textContent = qty; });
    document.getElementById("qtyPlus").addEventListener("click", () => { qty += 1; qtyVal.textContent = qty; });
    document.getElementById("addBtn").addEventListener("click", () => { Cart.add(p, qty); openCart(); });
    document.getElementById("buyBtn").addEventListener("click", () => { Cart.add(p, qty); openCart(); });
  }

  function renderNotFound(id) {
    document.getElementById("productDetail").innerHTML = `
      <div class="text-center py-24">
        <span class="material-symbols-outlined text-6xl text-slate-300">search_off</span>
        <h1 class="text-2xl font-bold mt-4">Không tìm thấy sản phẩm</h1>
        <p class="text-slate-500 mt-2">Mã sản phẩm "<b>${id || ""}</b>" không tồn tại.</p>
        <a href="index.html#shop" class="inline-block mt-6 rounded-full bg-primary px-6 py-3 text-white font-semibold hover:opacity-90">Về Shop</a>
      </div>`;
  }

  // ---- Boot ---------------------------------------------------------------
  async function boot() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return renderNotFound(id);
    try {
      const products = await loadProducts();
      const p = products.find((x) => x.id === id);
      if (p) render(p);
      else renderNotFound(id);
    } catch (e) {
      console.error(e);
      renderNotFound(id);
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
