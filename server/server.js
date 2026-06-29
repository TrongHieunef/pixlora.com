// ---------------------------------------------------------------------------
// Express server: serves the static site + a small JSON API backed by SQLite.
// Run from the server/ folder:  npm install  &&  npm start
// Then open http://localhost:3000
// ---------------------------------------------------------------------------
const path = require("path");
const express = require("express");
const { db, rowToProduct } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, ".."); // the static site lives one level up

app.use(express.json());

// ---- API ------------------------------------------------------------------

// GET /api/products  — returns active products as an array (same shape as
// data/products.json). Optional query params let you filter server-side:
//   ?category=lens&q=sony&sort=price-asc
app.get("/api/products", (req, res) => {
  const { category, q, sort } = req.query;

  let sql = "SELECT * FROM products WHERE status = 'active'";
  const params = {};

  if (category && category !== "all") {
    sql += " AND category = @category";
    params.category = category;
  }
  if (q) {
    sql += " AND (LOWER(name) LIKE @q OR LOWER(description) LIKE @q)";
    params.q = `%${String(q).toLowerCase()}%`;
  }

  switch (sort) {
    case "price-asc":  sql += " ORDER BY price ASC"; break;
    case "price-desc": sql += " ORDER BY price DESC"; break;
    case "rating":     sql += " ORDER BY rating DESC"; break;
    case "popular":    sql += " ORDER BY review_count DESC"; break;
    default:           sql += " ORDER BY datetime(created_at) DESC"; // newest
  }

  const rows = db.prepare(sql).all(params).map(rowToProduct);
  res.json(rows);
});

// GET /api/products/:id  — single product
app.get("/api/products/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json(rowToProduct(row));
});

// POST /api/orders  — body: { items: [{id, qty}], customer? }
// Prices are looked up server-side (never trust the client's totals).
app.post("/api/orders", (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: "Cart is empty" });

  const getProduct = db.prepare("SELECT id, name, price, stock FROM products WHERE id = ?");
  const lines = [];
  let total = 0;

  for (const it of items) {
    const p = getProduct.get(it.id);
    if (!p) return res.status(400).json({ error: `Unknown product: ${it.id}` });
    const qty = Math.max(1, parseInt(it.qty, 10) || 1);
    total += p.price * qty;
    lines.push({ product_id: p.id, name: p.name, price: p.price, qty });
  }

  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    const order = db
      .prepare("INSERT INTO orders (total, customer, created_at) VALUES (?, ?, ?)")
      .run(total, JSON.stringify(req.body.customer ?? {}), now);
    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)"
    );
    for (const l of lines) insertItem.run(order.lastInsertRowid, l.product_id, l.name, l.price, l.qty);
    return order.lastInsertRowid;
  });

  const orderId = tx();
  res.status(201).json({ id: orderId, total, items: lines });
});

// POST /api/contact  — body: { name, email, content }
app.post("/api/contact", (req, res) => {
  const { name, email, content } = req.body || {};
  if (!name || !email || !content) {
    return res.status(400).json({ error: "name, email and content are required" });
  }
  db.prepare("INSERT INTO messages (name, email, content, created_at) VALUES (?, ?, ?, ?)")
    .run(name, email, content, new Date().toISOString());
  res.status(201).json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- Static site ----------------------------------------------------------
app.use(express.static(ROOT));

app.listen(PORT, () => {
  console.log(`\n  John Thomas Photography running at http://localhost:${PORT}`);
  console.log(`  API base: http://localhost:${PORT}/api\n`);
});
