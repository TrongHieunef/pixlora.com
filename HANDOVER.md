# Tài liệu bàn giao — John Doe Photography

Website giới thiệu nhiếp ảnh + quản lý nội dung bằng **Sanity CMS**. Chủ web tự
đăng nhập, tự up ảnh/video, web tự cập nhật. **Không cần thuê backend, không tốn
phí hosting** (đều dùng gói free).

> Tài liệu này hướng dẫn **người tiếp nhận** setup lại từ đầu trên tài khoản của
> mình. Làm theo đúng thứ tự là chạy được.

---

## Mục lục
1. [Kiến trúc tổng quan](#1-kiến-trúc-tổng-quan)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Yêu cầu môi trường](#3-yêu-cầu-môi-trường)
4. [Chạy web ở máy (local)](#4-chạy-web-ở-máy-local)
5. [Set up Sanity CMS (từ đầu)](#5-set-up-sanity-cms-từ-đầu)
6. [Nối web với Sanity (wiring)](#6-nối-web-với-sanity-wiring)
7. [Chạy & deploy Studio + bàn giao quyền](#7-chạy--deploy-studio--bàn-giao-quyền)
8. [Deploy web lên mạng](#8-deploy-web-lên-mạng)
9. [Thêm / sửa nội dung](#9-thêm--sửa-nội-dung)
10. [Backend Express (tùy chọn — có thể bỏ)](#10-backend-express-tùy-chọn--có-thể-bỏ)
11. [Xử lý lỗi thường gặp](#11-xử-lý-lỗi-thường-gặp)
12. [Checklist bàn giao](#12-checklist-bàn-giao)

---

## 1. Kiến trúc tổng quan

Có **2 phần tách rời**:

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│   SANITY STUDIO          │  ghi    │   SANITY CLOUD               │
│   (trang admin riêng)    │ ──────► │   - Database nội dung        │
│   chủ web LOGIN để up    │         │   - CDN ảnh (tự nén/resize)  │
└─────────────────────────┘         └──────────────┬───────────────┘
                                                    │ đọc (public, không token)
                                                    ▼
                                     ┌──────────────────────────────┐
                                     │   WEB PUBLIC (FE tĩnh)        │
                                     │   HTML + Tailwind + JS thuần  │
                                     │   chỉ HIỂN THỊ, không upload  │
                                     └──────────────────────────────┘
```

- **Web public**: chỉ HTML/CSS/JS tĩnh. Không có login, không có ô upload, không
  có token. Vì vậy **không ai phá được** (không có endpoint để spam).
- **Sanity Studio**: app admin riêng, chủ web đăng nhập bằng tài khoản Sanity để
  up ảnh/video. Đây là nơi (và là nơi DUY NHẤT) thêm/sửa nội dung.
- **Video**: KHÔNG lưu trên Sanity (tốn băng thông). Chỉ lưu YouTube ID, video
  thật nằm trên YouTube → nhúng iframe.

**Vì sao FE-only mà không lộ gì:** code FE chỉ chứa `projectId` + `dataset` —
đây là định danh công khai (như username), chỉ cho phép **đọc** nội dung vốn đã
hiển thị công khai. **Không có token ghi** trong FE.

---

## 2. Cấu trúc thư mục

```
cac/                          ← WEB PUBLIC (phần chính, deploy cái này)
├── index.html                # Trang chủ (mọi section)
├── product.html              # Trang chi tiết sản phẩm (mở qua ?id=...)
├── css/
│   └── styles.css            # Animation, spinner, hiệu ứng card
├── js/
│   ├── sanity.js             # ⭐ Kết nối Sanity (điền projectId ở đây)
│   ├── config.js             # Cấu hình màu/theme Tailwind
│   ├── data.js               # Nội dung TĨNH mặc định (about, testimonials, ...)
│   ├── cart.js               # Giỏ hàng + wishlist + toast (localStorage)
│   ├── shop.js               # Tải sản phẩm (loadProducts), lọc, tìm, sắp xếp, phân trang
│   ├── product-page.js       # Render trang chi tiết (gallery + video + mua)
│   ├── ui.js                 # ⭐ Carousel, dark mode, và LẤY ảnh/video từ Sanity
│   └── main.js               # Khởi động / bootstrap (trang chủ)
├── data/
│   └── products.json         # Dữ liệu sản phẩm shop (tĩnh)
│
├── sanity-studio/            ← FILE THAM KHẢO để copy vào Studio (xem mục 5)
│   ├── schemaTypes/
│   │   ├── photo.js          # Schema: ảnh trang chủ (album / featured)
│   │   ├── video.js          # Schema: video trang chủ
│   │   ├── product.js        # Schema: sản phẩm (gallery nhiều ảnh + video)
│   │   └── index.js          # Đăng ký schema
│   └── SETUP.md
│
├── server/                   ← BACKEND EXPRESS (tùy chọn, xem mục 10)
│   ├── package.json
│   ├── db.js
│   └── server.js
│
├── README.md
└── HANDOVER.md               ← file này
```

> ⚠️ **Sanity Studio là 1 project RIÊNG**, KHÔNG nằm trong thư mục này. Thư mục
> `sanity-studio/` ở đây chỉ chứa **bản copy của schema** để bạn dán vào Studio
> mới tạo (mục 5). Bạn sẽ tạo Studio bằng lệnh ở mục 5.

---

## 3. Yêu cầu môi trường

| Cần | Phiên bản | Ghi chú |
|-----|-----------|---------|
| [Node.js](https://nodejs.org) | LTS (18+; khuyên 20/22) | Cho Sanity Studio (web tĩnh thì không cần) |
| Tài khoản [Sanity](https://sanity.io) | Free | Đăng nhập bằng Google/GitHub |
| (Tùy chọn) Tài khoản [Vercel](https://vercel.com) | Free | Để deploy web |

> Sau khi cài Node trên Windows, **mở lại terminal** thì `node -v` mới nhận.

---

## 4. Chạy web ở máy (local)

Web **bắt buộc chạy qua server** (không double-click `index.html`). Vì khi mở
trực tiếp `file://`, trình duyệt chặn gọi Sanity (origin = `null`). Mở file trực
tiếp web vẫn chạy nhưng dùng ảnh demo tĩnh.

Chọn 1 trong các cách:

```bash
# Cách 1 — VS Code: cài extension "Live Server" → chuột phải index.html →
#          "Open with Live Server"  (cổng 5500)

# Cách 2 — Python:
python -m http.server 8000          # mở http://localhost:8000

# Cách 3 — Node:
npx serve .                         # mở cổng nó in ra (thường 3000)
```

> Cổng bạn dùng phải được khai báo trong CORS của Sanity (mục 5, bước 4).

---

## 5. Set up Sanity CMS (từ đầu)

### Bước 1 — Tạo project + Studio
Mở terminal, `cd` tới nơi muốn đặt Studio (**đặt NGOÀI thư mục `cac`**):

```bash
cd <thư-mục-cha>
npm create sanity@latest
```

Trả lời các câu hỏi:
- **Login** → chọn Google/GitHub (mở trình duyệt đăng nhập).
- **Create new project** → đặt tên (vd `John Doe Photo`).
- **Use the default dataset configuration? → Yes** (tạo dataset `production`).
- **Project template → Clean project with no predefined schemas**.
- **TypeScript? → No**.
- **Package manager → npm**.

Khi xong, **Project ID** nằm trong file `sanity.config.js` của Studio vừa tạo:

```js
// <studio>/sanity.config.js
export default defineConfig({
  projectId: 'xxxxxxxx',   // 👈 GHI LẠI cái này
  dataset: 'production',
  ...
})
```

### Bước 2 — Gắn schema
Copy 4 file từ [`sanity-studio/schemaTypes/`](sanity-studio/schemaTypes/) (trong
project này) **đè vào** thư mục `schemaTypes/` của Studio vừa tạo:
`photo.js`, `video.js`, `product.js`, `index.js`.

> Sanity quản lý: **ảnh + video TRANG CHỦ** (`photo`, `video`) và **sản phẩm**
> cho Shop + trang chi tiết (`product`). Các phần còn lại của trang chủ (text
> About, testimonials, packages) là nội dung tĩnh trong code (xem mục 9).

### Bước 3 — Chạy thử Studio
```bash
cd <studio>
npm run dev      # mở http://localhost:3333
```
Bấm **Create** → thêm vài **Ảnh** (chọn Album/Featured), **Video**, và **Sản
phẩm** (up Ảnh chính, Gallery nhiều ảnh, YouTube ID) để test.

### Bước 4 — Mở quyền cho web ĐỌC (CORS)
Mỗi origin (domain + cổng) của web phải được cho phép. Chạy trong thư mục Studio:

```bash
npx sanity cors add http://localhost:5500 --no-credentials
npx sanity cors add http://localhost:8000 --no-credentials
npx sanity cors add http://localhost:3000 --no-credentials
# sau khi deploy, thêm domain thật:
npx sanity cors add https://ten-cua-ban.vercel.app --no-credentials
```

> `--no-credentials` vì web chỉ đọc dữ liệu công khai, không cần đăng nhập.

### Bước 5 — Đảm bảo dataset Public
Vào https://www.sanity.io/manage → chọn project → **API** → mục **Dataset**:
`production` phải để **Public** (đọc không cần token). Mặc định đã public.

---

## 6. Nối web với Sanity (wiring)

Mở [`js/sanity.js`](js/sanity.js), điền **Project ID** của bạn:

```js
const SANITY = {
  projectId: "xxxxxxxx",     // 👈 dán Project ID từ mục 5
  dataset: "production",
  apiVersion: "2024-01-01",
  get enabled() { return Boolean(this.projectId); },
};
```

**Phạm vi của Sanity:** ảnh + video **trang chủ** (Albums, Featured Works,
Videos) và **sản phẩm** (Shop + trang chi tiết). Nếu để trống `projectId` hoặc
CMS chưa có nội dung → web tự dùng dữ liệu tĩnh mặc định, KHÔNG bị trắng.

**Cơ chế hoạt động** (không cần sửa, chỉ để hiểu):

1. `js/sanity.js` cung cấp hàm `sanityFetch(groq)` — gọi thẳng API Sanity qua
   HTTP bằng câu truy vấn GROQ, **không token**.
2. [`js/ui.js`](js/ui.js) `hydrateFromSanity()` chạy lúc tải trang chủ: lấy
   `photo` (đổ vào Albums/Featured Works) và `video` (section Videos). Không có
   thì giữ ảnh tĩnh.
3. [`js/shop.js`](js/shop.js) `loadProducts()` lấy sản phẩm theo thứ tự ưu tiên:
   **Sanity → `/api/products` (nếu chạy backend) → `data/products.json` → bản
   nhúng trong `js/data.js`**. Cả Shop lẫn trang chi tiết đều dùng hàm này.
4. Ảnh trả về là URL CDN Sanity; web tự thêm `?w=...&h=...&fit=crop` để resize
   (hàm `sanityImg`). `specs` dạng mảng `{key,value}` được tự gộp thành object.

Ánh xạ dữ liệu:
| Trong Sanity | Hiển thị ở web |
|---|---|
| `photo` (section = album) | Lưới **Photo Albums** |
| `photo` (section = featured) | Carousel **Featured Works** |
| `video` | Section **Videos** trang chủ |
| `product` | **Shop** + trang **chi tiết sản phẩm** |

### Trang chi tiết sản phẩm (Product detail)
- Là **một TRANG RIÊNG** (`product.html`), không phải popup. Trong Shop, bấm
  **ảnh / tên / nút "Xem chi tiết"** → chuyển sang trang đó.
- **URL thật, chia sẻ được**: `product.html?id=<id>` (id lấy từ `slug` của sản
  phẩm trong Sanity, vd `product.html?id=sony-a7-iii`). Nút Back của trình duyệt
  hoạt động bình thường.
- Hiển thị: **gallery nhiều ảnh** (ảnh chính + `gallery`) + **video YouTube** (nếu
  có) — bấm thumbnail để xem; kèm mô tả, thông số, tính năng, chọn số lượng, nút
  **Mua ngay** / **Thêm vào giỏ**.
- Ảnh/video do schema **`product`** trong Sanity quản lý (`mainImage`,
  `gallery[]`, `youtubeId`). Chủ web tự thêm trong Studio.
- File liên quan: [`product.html`](product.html) (khung trang),
  [`js/product-page.js`](js/product-page.js) (đọc `?id=`, render chi tiết),
  [`js/shop.js`](js/shop.js) (hàm dùng chung `loadProducts()` / `ratingStars()`).

GROQ sản phẩm (trong `shop.js`) — `id` lấy từ `slug`, ảnh từ asset, `specs` dạng
mảng `{key,value}` được tự gộp thành object:
```groq
*[_type=="product"]{
  "id": coalesce(slug.current, _id), name, description, price, category,
  "status": coalesce(status,"active"), badge, stock, rating, review_count,
  "main_image": mainImage.asset->url, "gallery_images": gallery[].asset->url,
  "video": youtubeId, specs, features, "created_at": coalesce(publishedAt,_createdAt)
}
```

---

## 7. Chạy & deploy Studio + bàn giao quyền

### Deploy Studio online (để up ảnh từ bất kỳ đâu, không cần máy dev)
```bash
cd <studio>
npx sanity deploy
```
Nhập một tên (vd `johndoephoto`) → được link `https://johndoephoto.sanity.studio`.
Chủ web vào link này, đăng nhập, là up ảnh/video được.

### Mời chủ web vào quản lý
https://www.sanity.io/manage → project → **Members** → **Invite member** → nhập
email chủ web. (Hoặc chuyển hẳn quyền sở hữu project nếu muốn.)

---

## 8. Deploy web lên mạng

Web là tĩnh nên deploy cực dễ, miễn phí. Khuyên dùng **Vercel**:

1. Đẩy thư mục `cac/` lên một repo GitHub.
2. Vào https://vercel.com → **New Project** → chọn repo đó.
3. **Framework Preset: Other**, **Root Directory: `cac`** (nếu repo có nhiều thư
   mục), **Build Command: để trống**, **Output Directory: để trống** (deploy tĩnh).
4. Deploy → được link `https://....vercel.app`.
5. **Quan trọng:** thêm link đó vào CORS Sanity (mục 5 bước 4), nếu không web
   thật sẽ không tải được ảnh từ Sanity.

> Netlify / Cloudflare Pages / GitHub Pages cũng được, làm tương tự (deploy tĩnh,
> không build).

---

## 9. Thêm / sửa nội dung

### Nội dung ĐỘNG (chủ web tự sửa qua Studio) — ảnh & video
Vào Studio → **Create** → `Ảnh` hoặc `Video`. Web tự cập nhật, không cần sửa code.

### Nội dung TĨNH (sửa trong code) — phần còn lại
Các phần dưới đây hiện là dữ liệu mẫu, sửa trực tiếp trong file:

| Mục | File | Biến / chỗ sửa |
|-----|------|----------------|
| Slide hero (banner đầu trang) | `js/data.js` | `HERO_SLIDES` |
| Giới thiệu (About), tag, số liệu | `js/data.js` | `ABOUT_TAGS`, `ABOUT_STATS` + text trong `index.html` |
| Cảm nhận khách hàng | `js/data.js` | `TESTIMONIALS` |
| Gói dịch vụ | `js/data.js` | `PACKAGES` |
| Sản phẩm shop (nếu KHÔNG dùng Sanity) | `data/products.json` | sửa file JSON |
| Thông tin liên hệ (email, hotline, địa chỉ) | `index.html` | section `#contact` |
| Màu thương hiệu / theme | `js/config.js` | `primary`, `secondary`, `accent` |
| Tên/brand, logo, footer | `index.html` | header & footer |

> **Sản phẩm shop**: đã có schema `product` trong Sanity (gallery nhiều ảnh +
> video). Chỉ cần vào Studio thêm sản phẩm là Shop + trang chi tiết tự dùng dữ
> liệu Sanity (ưu tiên hơn `data/products.json`). Nếu CMS chưa có sản phẩm nào,
> web dùng `data/products.json` làm mặc định.
>
> Muốn đưa thêm phần khác lên Sanity: tạo schema tương tự rồi thêm truy vấn GROQ,
> pattern y hệt mục 6.

---

## 10. Backend Express (tùy chọn — có thể bỏ)

Trong `server/` có sẵn một backend nhỏ (Express + SQLite) phục vụ **đơn hàng** và
**form liên hệ** lưu vào database. **Nếu site chỉ là trang giới thiệu thì KHÔNG
cần phần này** — cứ bỏ qua/xóa thư mục `server/`.

Web đã được viết để **chạy được mà không cần backend**: nút Checkout và form liên
hệ sẽ chạy ở "demo mode" (báo thành công, không lưu) khi không có server.

Nếu cần dùng:
```bash
cd server
npm install
npm start          # http://localhost:3000 (phục vụ cả web lẫn API)
```
Endpoint: `GET /api/products`, `GET /api/products/:id`, `POST /api/orders`,
`POST /api/contact`, `GET /api/health`. Chi tiết trong [README.md](README.md).

> ⚠️ Nếu deploy backend công khai: thêm xác thực, giới hạn tần suất (rate limit),
> kiểm tra dữ liệu đầu vào trước. Với trang giới thiệu thì nên bỏ hẳn cho gọn.

---

## 11. Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|-------------|-------------|----------|
| Ảnh demo hiện, ảnh thật không lên | `projectId` chưa điền, hoặc mở web bằng `file://` | Điền `projectId` (mục 6); chạy web qua server (mục 4) |
| Console báo lỗi **CORS** | Origin web chưa được phép | `npx sanity cors add <origin> --no-credentials` (mục 5 bước 4) |
| Console báo **401/403** khi gọi Sanity | Dataset đang Private | Đặt dataset `production` → Public (mục 5 bước 5) |
| Ảnh mới up không thấy | CDN cache | Chờ ~1 phút hoặc reload cứng (Ctrl+F5) |
| Video không hiện | Sai YouTube ID | Chỉ nhập phần ID sau `v=`, vd `dQw4w9WgXcQ` |
| Studio không mở | Chưa `npm install` trong Studio | `cd <studio> && npm install && npm run dev` |

Cách debug nhanh: mở **F12 → Console** xem log; web sẽ in cảnh báo nếu fallback về
dữ liệu tĩnh.

---

## 12. Checklist bàn giao

Người tiếp nhận làm xong các mục này là hoàn tất:

- [ ] Cài Node.js, mở terminal mới kiểm tra `node -v`
- [ ] Tạo project Sanity, lấy **Project ID** (mục 5)
- [ ] Copy schema `photo.js` / `video.js` / `index.js` vào Studio (mục 5 bước 2)
- [ ] `npm run dev` Studio, up thử vài ảnh/video (mục 5 bước 3)
- [ ] Thêm **CORS origin** cho local + domain thật (mục 5 bước 4)
- [ ] Dataset `production` để **Public** (mục 5 bước 5)
- [ ] Điền `projectId` vào `js/sanity.js` (mục 6)
- [ ] Chạy web qua server, xác nhận ảnh/video từ Sanity lên đúng (mục 4)
- [ ] `npx sanity deploy` để có link Studio online (mục 7)
- [ ] Mời chủ web vào Sanity Members (mục 7)
- [ ] Deploy web lên Vercel + thêm domain vào CORS (mục 8)
- [ ] Thay nội dung tĩnh thật: about, liên hệ, theme, brand (mục 9)
- [ ] Quyết định giữ hay bỏ `server/` (mục 10)

---

*Mọi thắc mắc về wiring xem mục 6; về schema xem `sanity-studio/schemaTypes/`.*
