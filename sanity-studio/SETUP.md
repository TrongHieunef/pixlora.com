# Set up Sanity (CMS cho ảnh + video) — làm 1 lần

> Cần cài [Node.js](https://nodejs.org) trước (bản LTS). Kiểm tra: `node -v`.

Kiến trúc: **Studio** (chủ web login để up ảnh) tách rời **web public** (chỉ đọc).
Trong code FE chỉ có `projectId` — KHÔNG phải bí mật, KHÔNG có token.

---

## Bước 1 — Tạo tài khoản + project Sanity (free)

1. Vào https://www.sanity.io → **Sign up** (login Google/GitHub cho nhanh).
2. Ở terminal, tạo Studio:

   ```bash
   npm create sanity@latest -- --template clean --create-project "John Thomas Photo" --dataset production
   ```

   - Đăng nhập khi nó hỏi.
   - Chọn **TypeScript? → No** (cho khớp file `.js` ở đây; chọn Yes cũng được).
   - Nó tạo 1 thư mục studio và in ra **Project ID** (vd `abc12xyz`). **Ghi lại.**

## Bước 2 — Gắn schema (cấu trúc dữ liệu)

Copy 4 file trong [`schemaTypes/`](schemaTypes/) ở đây đè vào thư mục
`schemaTypes/` của studio vừa tạo:

- `photo.js`   — ảnh trang chủ (Album / Featured Works)
- `video.js`   — video trang chủ
- `product.js` — sản phẩm (ảnh chính + gallery nhiều ảnh + video YouTube)
- `index.js`   — đăng ký 3 schema trên

## Bước 3 — Chạy Studio và up thử

```bash
cd <thư-mục-studio>
npm run dev
```

Mở http://localhost:3333 → **Create** → thêm **Ảnh** (chọn Album/Featured),
**Video**, và **Sản phẩm** (up Ảnh chính + Gallery nhiều ảnh + YouTube ID). Đây
chính là trang admin chủ web sẽ dùng.

> Deploy Studio online miễn phí để chủ web tự vào: `npx sanity deploy`
> → được link dạng `ten-ban.sanity.studio`.

## Bước 4 — Cho web public ĐỌC được (CORS)

1. Vào https://www.sanity.io/manage → chọn project → **API**.
2. Mục **CORS origins** → **Add origin**, thêm các origin của web (KHÔNG tick
   "Allow credentials"):
   - `http://localhost:3000` (hoặc cổng bạn chạy web)
   - domain thật khi deploy, vd `https://johndoephoto.vercel.app`
3. Mục **Dataset** đảm bảo `production` để **Public** (đọc không cần token).

## Bước 5 — Nối web với Sanity

Mở [`../js/sanity.js`](../js/sanity.js), điền **Project ID** vào:

```js
const SANITY = {
  projectId: "abc12xyz",   // <-- dán Project ID của bạn
  dataset: "production",
  ...
};
```

Xong! Mở lại web — phần **Photo Albums**, **Featured Works** và **Videos** sẽ
tự lấy nội dung từ Sanity. Nếu để trống `projectId`, web vẫn chạy bằng dữ liệu
tĩnh mặc định (không lỗi).

---

## Hỏi nhanh

**Up ảnh ở đâu?** → Trong Studio (Bước 3), không phải trên web public.
**Ai up được?** → Chỉ người bạn mời vào project Sanity (manage.sanity.io →
Members → Invite). Khách vào web KHÔNG up được.
**Lộ gì khi đẩy `sanity.js` lên web không?** → Không. `projectId` chỉ cho đọc
dữ liệu vốn đã công khai trên web.
**Video có tốn băng thông Sanity không?** → Không — video nằm trên YouTube,
Sanity chỉ lưu cái ID. Băng thông YouTube lo.
