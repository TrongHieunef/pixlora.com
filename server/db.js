// ---------------------------------------------------------------------------
// SQLite setup + schema + one-time seed from ../data/products.json
// ---------------------------------------------------------------------------
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "shop.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL"); // better concurrency for reads

// ---- Schema ---------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT,
    price         INTEGER NOT NULL,
    category      TEXT,
    status        TEXT DEFAULT 'active',
    badge         TEXT,
    stock         INTEGER DEFAULT 0,
    rating        REAL DEFAULT 0,
    review_count  INTEGER DEFAULT 0,
    main_image    TEXT,
    specs         TEXT,            -- JSON string
    features      TEXT,            -- JSON string
    created_at    TEXT,
    updated_at    TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    total       INTEGER NOT NULL,
    customer    TEXT,              -- JSON: {name,email,phone,address}
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  TEXT NOT NULL,
    name        TEXT,
    price       INTEGER NOT NULL,
    qty         INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT,
    email       TEXT,
    content     TEXT,
    created_at  TEXT NOT NULL
  );
`);

// ---- Seed (idempotent) ----------------------------------------------------
function seed() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  if (count > 0) return;

  const jsonPath = path.join(__dirname, "..", "data", "products.json");
  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const insert = db.prepare(`
    INSERT INTO products
      (id, name, description, price, category, status, badge, stock,
       rating, review_count, main_image, specs, features, created_at, updated_at)
    VALUES
      (@id, @name, @description, @price, @category, @status, @badge, @stock,
       @rating, @review_count, @main_image, @specs, @features, @created_at, @updated_at)
  `);

  const insertMany = db.transaction((rows) => {
    for (const p of rows) {
      insert.run({
        ...p,
        badge: p.badge ?? null,
        specs: JSON.stringify(p.specs ?? {}),
        features: JSON.stringify(p.features ?? []),
      });
    }
  });

  insertMany(products);
  console.log(`Seeded ${products.length} products into ${DB_PATH}`);
}

// Convert a DB row back into the JSON shape the frontend expects.
function rowToProduct(row) {
  if (!row) return null;
  return {
    ...row,
    specs: JSON.parse(row.specs || "{}"),
    features: JSON.parse(row.features || "[]"),
  };
}

seed();

// Allow `npm run seed` / `node db.js --seed` to (re)seed explicitly.
if (require.main === module && process.argv.includes("--seed")) {
  console.log("Seed check complete.");
}

module.exports = { db, rowToProduct };
