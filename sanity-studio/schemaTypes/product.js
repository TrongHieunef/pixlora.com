// Schema cho SẢN PHẨM (shop) — có nhiều ảnh (gallery) + video cho trang chi tiết.
export default {
  name: "product",
  title: "Sản phẩm (Product)",
  type: "document",
  fields: [
    { name: "name", title: "Tên sản phẩm", type: "string", validation: (R) => R.required() },
    {
      name: "slug",
      title: "Slug (dùng cho link /chi-tiết)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (R) => R.required(),
    },
    { name: "description", title: "Mô tả", type: "text", rows: 4 },
    { name: "price", title: "Giá (VND)", type: "number", validation: (R) => R.required().min(0) },
    { name: "category", title: "Danh mục (vd: camera, lens...)", type: "string" },
    {
      name: "status",
      title: "Trạng thái",
      type: "string",
      options: { list: [{ title: "Hiện", value: "active" }, { title: "Ẩn", value: "hidden" }], layout: "radio" },
      initialValue: "active",
    },
    {
      name: "badge",
      title: "Nhãn",
      type: "string",
      options: { list: ["popular", "new", "sale", "hot"], layout: "dropdown" },
    },
    { name: "stock", title: "Tồn kho", type: "number", initialValue: 0 },
    { name: "rating", title: "Điểm đánh giá (0-5)", type: "number", validation: (R) => R.min(0).max(5) },
    { name: "review_count", title: "Số lượt đánh giá", type: "number", initialValue: 0 },

    // --- Media cho trang chi tiết ---
    {
      name: "mainImage",
      title: "Ảnh chính",
      type: "image",
      options: { hotspot: true },
      validation: (R) => R.required(),
    },
    {
      name: "gallery",
      title: "Ảnh chi tiết (nhiều ảnh)",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
    },
    {
      name: "youtubeId",
      title: "Video YouTube ID (tùy chọn)",
      type: "string",
      description: 'Phần sau "v=" trong link YouTube. VD: dQw4w9WgXcQ',
    },

    // --- Thông tin thêm ---
    {
      name: "specs",
      title: "Thông số (key / value)",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "key", title: "Tên thông số", type: "string" },
          { name: "value", title: "Giá trị", type: "string" },
        ],
        preview: { select: { title: "key", subtitle: "value" } },
      }],
    },
    {
      name: "features",
      title: "Tính năng nổi bật",
      type: "array",
      of: [{ type: "string" }],
    },
    { name: "publishedAt", title: "Ngày đăng", type: "datetime" },
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "mainImage" },
  },
};
