// ---------------------------------------------------------------------------
// Shop: load products (Sanity / API / static), filter, search, sort, paginate.
// Clicking a product goes to a real detail page: product.html?id=<id>
// ---------------------------------------------------------------------------

// --- Shared product loader (also used by product.html) ---------------------
// Sources in order: Sanity CMS -> live API -> static JSON -> embedded fallback.
async function loadSanityProducts() {
  if (!window.SANITY || !SANITY.enabled) return null;
  try {
    const rows = await sanityFetch(`*[_type=="product"]{
      "id": coalesce(slug.current, _id),
      name, description, price, category,
      "status": coalesce(status, "active"),
      badge, stock, rating, review_count,
      "main_image": mainImage.asset->url,
      "gallery_images": gallery[].asset->url,
      "video": youtubeId,
      specs, features,
      "created_at": coalesce(publishedAt, _createdAt)
    } | order(_createdAt desc)`);
    if (!Array.isArray(rows) || !rows.length) return null;
    rows.forEach((r) => {
      r.main_image = sanityImg(r.main_image, 600, 450);
      r.gallery_images = (r.gallery_images || []).map((u) => sanityImg(u, 1000, 750));
      if (Array.isArray(r.specs)) {
        r.specs = r.specs.reduce((o, s) => { if (s && s.key) o[s.key] = s.value; return o; }, {});
      }
      r.features = r.features || [];
    });
    return rows;
  } catch (e) {
    console.warn("Sanity products failed:", e.message);
    return null;
  }
}

async function loadProducts() {
  const fromSanity = await loadSanityProducts();
  if (fromSanity) return fromSanity.filter((p) => p.status === "active");

  for (const url of ["/api/products", "data/products.json"]) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data.filter((p) => p.status === "active");
    } catch (e) {
      console.warn(`fetch(${url}) failed:`, e.message);
    }
  }
  console.warn("Falling back to embedded product list.");
  return PRODUCTS_FALLBACK.filter((p) => p.status === "active");
}

// Render 5 stars for a rating (shared with the detail page).
function ratingStars(rating) {
  const full = Math.round(rating || 0);
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<span class="material-symbols-outlined text-base ${i <= full ? "text-yellow-400" : "text-slate-300"}" style="font-variation-settings:'FILL' ${i <= full ? 1 : 0}">star</span>`;
  }
  return out;
}

window.loadProducts = loadProducts;
window.ratingStars = ratingStars;

// --- Shop section (homepage) ----------------------------------------------
const Shop = (() => {
  let all = [];
  let filtered = [];
  let category = "all";
  let query = "";
  let sort = "newest";
  let page = 1;
  const PER_PAGE = 6;

  const BADGE_STYLES = {
    popular: "bg-primary text-white",
    new: "bg-accent text-white",
    sale: "bg-secondary text-white",
    hot: "bg-orange-500 text-white",
  };

  async function load() {
    all = await loadProducts();
    buildCategoryFilters();
    apply();
  }

  function buildCategoryFilters() {
    const cats = ["all", ...new Set(all.map((p) => p.category))];
    const wrap = document.getElementById("categoryFilters");
    wrap.innerHTML = cats.map((c) => `
      <button data-cat="${c}" class="cat-btn rounded-full px-4 py-2 text-sm capitalize transition
        ${c === category ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 hover:bg-primary/10"}">
        ${c}
      </button>`).join("");
    wrap.querySelectorAll(".cat-btn").forEach((b) =>
      b.addEventListener("click", () => { category = b.dataset.cat; page = 1; apply(); }));
  }

  function apply() {
    filtered = all.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchQuery = !query || p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    switch (sort) {
      case "price-asc": filtered.sort((a, b) => a.price - b.price); break;
      case "price-desc": filtered.sort((a, b) => b.price - a.price); break;
      case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
      case "popular": filtered.sort((a, b) => b.review_count - a.review_count); break;
      default: filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // newest
    }

    document.querySelectorAll(".cat-btn").forEach((b) => {
      const active = b.dataset.cat === category;
      b.className = `cat-btn rounded-full px-4 py-2 text-sm capitalize transition ${active ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 hover:bg-primary/10"}`;
    });

    renderGrid();
    renderPagination();
  }

  function card(p) {
    const badge = p.badge ? `<span class="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold capitalize ${BADGE_STYLES[p.badge] || "bg-slate-700 text-white"}">${p.badge}</span>` : "";
    const wished = Cart.inWishlist(p.id);
    const href = `product.html?id=${encodeURIComponent(p.id)}`;
    const hasMedia = (p.gallery_images && p.gallery_images.length) || p.video;
    const mediaHint = hasMedia
      ? `<span class="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
           <span class="material-symbols-outlined text-sm">${p.video ? "play_circle" : "collections"}</span>
           ${p.video ? "Video" : (p.gallery_images.length + 1) + " ảnh"}</span>`
      : "";
    return `
      <div class="product-card rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
        <div class="relative">
          <a href="${href}" class="block">
            <img src="${p.main_image}" alt="${p.name}" loading="lazy"
                 class="aspect-[4/3] w-full object-cover" onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
          </a>
          ${badge}
          ${mediaHint}
          <button class="wish-btn absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 dark:bg-slate-800/90" data-id="${p.id}">
            <span class="material-symbols-outlined text-base ${wished ? "text-secondary" : "text-slate-400"}" style="font-variation-settings:'FILL' ${wished ? 1 : 0}">favorite</span>
          </button>
        </div>
        <div class="p-5 flex flex-col flex-1">
          <span class="text-xs uppercase tracking-wide text-primary font-semibold">${p.category}</span>
          <a href="${href}"><h3 class="font-bold mt-1 leading-tight hover:text-primary transition-colors">${p.name}</h3></a>
          <p class="text-sm text-slate-500 mt-1 line-clamp-2">${p.description}</p>
          <div class="flex items-center gap-1 mt-2">${ratingStars(p.rating)}
            <span class="text-xs text-slate-400 ml-1">(${p.review_count})</span></div>
          <p class="text-xs mt-2 ${p.stock > 0 ? "text-accent" : "text-secondary"}">
            ${p.stock > 0 ? `Còn hàng (${p.stock})` : "Hết hàng"}</p>
          <div class="mt-auto pt-4">
            <span class="text-lg font-extrabold text-primary">${formatVND(p.price)}</span>
            <div class="flex items-center gap-2 mt-3">
              <a href="${href}" class="flex-1 text-center rounded-full border border-primary text-primary py-2 text-sm font-semibold hover:bg-primary/10 transition-colors">
                Xem chi tiết
              </a>
              <button class="add-btn grid h-10 w-10 place-items-center rounded-full bg-primary text-white hover:opacity-90" data-id="${p.id}" title="Thêm vào giỏ">
                <span class="material-symbols-outlined text-base">add_shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderGrid() {
    const grid = document.getElementById("productsGrid");
    if (!filtered.length) {
      grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10">Không có sản phẩm phù hợp.</p>`;
      return;
    }
    const start = (page - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);
    grid.innerHTML = pageItems.map(card).join("");

    grid.querySelectorAll(".add-btn").forEach((b) =>
      b.addEventListener("click", () => Cart.add(all.find((p) => p.id === b.dataset.id))));
    grid.querySelectorAll(".wish-btn").forEach((b) =>
      b.addEventListener("click", () => Cart.toggleWishlist(b.dataset.id)));
  }

  function renderPagination() {
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const wrap = document.getElementById("pagination");
    if (totalPages <= 1) { wrap.innerHTML = ""; return; }

    const btn = (label, target, disabled, active) => `
      <button data-page="${target}" ${disabled ? "disabled" : ""}
        class="page-btn grid h-10 min-w-10 px-3 place-items-center rounded-lg text-sm
        ${active ? "bg-primary text-white" : "bg-white dark:bg-slate-800"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-primary/10"}">${label}</button>`;

    let html = btn("‹", page - 1, page === 1, false);
    for (let i = 1; i <= totalPages; i++) html += btn(i, i, false, i === page);
    html += btn("›", page + 1, page === totalPages, false);
    wrap.innerHTML = html;

    wrap.querySelectorAll(".page-btn").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.disabled) return;
        page = Number(b.dataset.page);
        renderGrid();
        renderPagination();
        document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
      }));
  }

  function init() {
    document.getElementById("searchInput").addEventListener("input", (e) => {
      query = e.target.value.trim().toLowerCase(); page = 1; apply();
    });
    document.getElementById("sortSelect").addEventListener("change", (e) => {
      sort = e.target.value; page = 1; apply();
    });
    document.addEventListener("wishlist:change", renderGrid);
    load();
  }

  return { init };
})();
