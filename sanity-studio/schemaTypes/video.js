// Schema cho VIDEO trang chủ (nhúng YouTube).
export default {
  name: "video",
  title: "Video",
  type: "document",
  fields: [
    { name: "title", title: "Tiêu đề", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "youtubeId",
      title: "YouTube Video ID",
      type: "string",
      description:
        'Phần sau "v=" trong link YouTube. ' +
        "VD link youtube.com/watch?v=dQw4w9WgXcQ  ->  nhập:  dQw4w9WgXcQ",
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: { select: { title: "title", subtitle: "youtubeId" } },
};
