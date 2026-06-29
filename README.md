# John Thomas Photography — Static Clone

A fully **static** portfolio + camera-gear shop. No build step, no framework, no
real backend — the product API call (`fetch("data/products.json")`) is mocked
with a local JSON file, with an embedded fallback so the page also works when
opened straight from disk.

## Tech

| Layer        | Used                                                                 |
|--------------|---------------------------------------------------------------------|
| Markup       | Plain semantic HTML5                                                 |
| Styling      | Tailwind CSS via CDN (`forms`, `container-queries`) + custom CSS     |
| Theme        | `darkMode: "class"`, colors `primary #13b6ec`, `secondary #ff6b6b`, `accent #10b981` |
| Fonts/icons  | Plus Jakarta Sans + Material Symbols Outlined                        |
| Logic        | Vanilla JS, split into small modules                                 |
| "Backend"    | `data/products.json` (mocked) + `PRODUCTS_FALLBACK` in `js/data.js`  |

## Structure

```
cac/
├── index.html            # Page markup (all sections)
├── css/
│   └── styles.css        # Animations, spinner, shimmer, card hover
├── js/
│   ├── config.js         # Tailwind theme config
│   ├── data.js           # Static content + products fallback + formatVND()
│   ├── cart.js           # Cart + wishlist + toast (localStorage)
│   ├── shop.js           # Product load (mock), filters, search, sort, paginate
│   ├── ui.js             # Carousels, dark mode, menu, counters, sections
│   └── main.js           # Bootstrap / init
├── data/
│   └── products.json     # Mocked backend data
└── README.md
```

## Run (three ways)

The shop loads products from, in order: the **live API** (`/api/products`) →
the **static JSON** (`data/products.json`) → an **embedded fallback** in
`js/data.js`. So it works in every setup below.

### 1. With the backend (full features — orders + contact saved to a DB)

Requires [Node.js](https://nodejs.org) 18+.

```bash
cd server
npm install
npm start
```

Open <http://localhost:3000>. The server serves the static site **and** the API.

### 2. As a plain static site (no backend)

```bash
python -m http.server 8000   # or:  npx serve .
```

Open <http://localhost:8000>. Products come from `data/products.json`;
checkout and contact run in "demo mode" (no data is saved).

### 3. Straight from disk

Double-click `index.html`. `fetch` is blocked on `file://`, so the shop falls
back to the embedded product list — everything still renders.

## Backend (Express + SQLite)

Lives in [`server/`](server/). Data is stored in a local `shop.db` SQLite file,
seeded once from `data/products.json` on first run.

| Method | Endpoint              | Purpose                                        |
|--------|-----------------------|------------------------------------------------|
| GET    | `/api/products`       | All active products (array). Supports `?category=`, `?q=`, `?sort=` |
| GET    | `/api/products/:id`   | A single product                               |
| POST   | `/api/orders`         | Place an order `{ items: [{id, qty}], customer? }`. Totals computed server-side |
| POST   | `/api/contact`        | Save a contact message `{ name, email, content }` |
| GET    | `/api/health`         | Health check                                   |

Files:

```
server/
├── package.json    # deps: express, better-sqlite3
├── db.js           # schema + idempotent seed + row→JSON mapping
├── server.js       # Express app: API routes + static hosting
└── shop.db         # created on first run (git-ignored)
```

> Security notes for later: order totals are recomputed from DB prices (the
> client's numbers are never trusted). Add input validation, rate limiting, and
> auth before exposing any write endpoints publicly.

## Features

- Auto-rotating hero carousel with dots + arrows
- Animated stat counters (IntersectionObserver)
- Photo albums + draggable "Featured Works" carousel
- Shop: category filters, live search, sort, pagination
- Add-to-cart slide-out drawer, wishlist, quantity controls (persisted)
- Dark mode (persisted, respects system preference)
- Toast notifications, back-to-top, mobile menu, print, contact form

> Clone for demo / educational purposes only.
