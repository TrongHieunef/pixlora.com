// ---------------------------------------------------------------------------
// Cart + wishlist + toast. State persists in localStorage.
// ---------------------------------------------------------------------------

const Cart = (() => {
  let items = JSON.parse(localStorage.getItem("cart") || "[]");
  let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

  const save = () => {
    localStorage.setItem("cart", JSON.stringify(items));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  };

  const total = () => items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = () => items.reduce((sum, i) => sum + i.qty, 0);

  function add(product, qty = 1) {
    qty = Math.max(1, qty);
    const existing = items.find((i) => i.id === product.id);
    if (existing) existing.qty += qty;
    else items.push({ id: product.id, name: product.name, price: product.price, image: product.main_image, qty });
    save();
    render();
    toast(`${product.name} added to cart`, "shopping_cart");
  }

  function remove(id) {
    items = items.filter((i) => i.id !== id);
    save();
    render();
  }

  function setQty(id, qty) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, qty);
    save();
    render();
  }

  function toggleWishlist(id) {
    const idx = wishlist.indexOf(id);
    if (idx >= 0) { wishlist.splice(idx, 1); toast("Removed from wishlist", "favorite_border"); }
    else { wishlist.push(id); toast("Added to wishlist", "favorite"); }
    save();
    document.dispatchEvent(new CustomEvent("wishlist:change"));
  }

  const inWishlist = (id) => wishlist.includes(id);

  function render() {
    const countEl = document.getElementById("cartCount");
    const itemsEl = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    if (countEl) countEl.textContent = count();
    if (totalEl) totalEl.textContent = formatVND(total());
    if (!itemsEl) return;

    if (!items.length) {
      itemsEl.innerHTML = `<p class="text-center text-slate-400 mt-10">Your cart is empty.</p>`;
      return;
    }

    itemsEl.innerHTML = items.map((i) => `
      <div class="flex gap-3 items-center">
        <img src="${i.image}" class="h-16 w-16 rounded-lg object-cover" alt="${i.name}" />
        <div class="flex-1">
          <p class="font-semibold text-sm leading-tight">${i.name}</p>
          <p class="text-primary text-sm">${formatVND(i.price)}</p>
          <div class="flex items-center gap-2 mt-1">
            <button class="qty-btn material-symbols-outlined text-base" data-id="${i.id}" data-delta="-1">remove</button>
            <span class="text-sm w-6 text-center">${i.qty}</span>
            <button class="qty-btn material-symbols-outlined text-base" data-id="${i.id}" data-delta="1">add</button>
          </div>
        </div>
        <button class="remove-btn material-symbols-outlined text-slate-400 hover:text-secondary" data-id="${i.id}">delete</button>
      </div>`).join("");

    itemsEl.querySelectorAll(".qty-btn").forEach((b) =>
      b.addEventListener("click", () => {
        const item = items.find((i) => i.id === b.dataset.id);
        setQty(b.dataset.id, item.qty + Number(b.dataset.delta));
      }));
    itemsEl.querySelectorAll(".remove-btn").forEach((b) =>
      b.addEventListener("click", () => remove(b.dataset.id)));
  }

  async function checkout() {
    if (!items.length) { toast("Your cart is empty", "remove_shopping_cart"); return; }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty })) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || res.status);
      const order = await res.json();
      items = [];
      save();
      render();
      toast(`Order #${order.id} placed — ${formatVND(order.total)}`, "task_alt");
    } catch (e) {
      // No backend running (static hosting / file://) — simulate success.
      console.warn("checkout API unavailable:", e.message);
      items = [];
      save();
      render();
      toast("Order placed (demo mode — no backend)", "task_alt");
    }
  }

  return { add, remove, setQty, toggleWishlist, inWishlist, render, count, checkout };
})();

// Toast helper (global).
let toastTimer;
function toast(message, icon = "check_circle") {
  const el = document.getElementById("toast");
  if (!el) return;
  document.getElementById("toastMsg").textContent = message;
  document.getElementById("toastIcon").textContent = icon;
  el.classList.remove("translate-x-[150%]");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("translate-x-[150%]"), 2500);
}
