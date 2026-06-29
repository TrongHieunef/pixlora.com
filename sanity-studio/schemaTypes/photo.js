// Schema cho ẢNH portfolio (trang chủ: Albums + Featured Works).
export default {
  name: "photo",
  title: "Ảnh (Photo)",
  type: "document",
  fields: [
    { name: "title", title: "Tiêu đề", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "image",
      title: "Ảnh",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "section",
      title: "Hiển thị ở khu vực",
      type: "string",
      options: {
        list: [
          { title: "Album (lưới ảnh)", value: "album" },
          { title: "Featured Works (carousel)", value: "featured" },
        ],
        layout: "radio",
      },
      initialValue: "album",
      validation: (Rule) => Rule.required(),
    },
    { name: "category", title: "Thể loại (vd: lens, portrait...)", type: "string" },
    { name: "date", title: "Ngày chụp", type: "date" },
    { name: "order", title: "Thứ tự sắp xếp (nhỏ hiện trước)", type: "number", initialValue: 0 },
  ],
  preview: { select: { title: "title", subtitle: "section", media: "image" } },
};
