// ---------------------------------------------------------------------------
// Sanity connection (READ-ONLY, public dataset).
//
// IMPORTANT: projectId and dataset are NOT secrets — they only allow reading
// content that's already public on the website. There is NO token here, so
// nothing sensitive is exposed by shipping this file to the browser.
// Uploading/editing happens in Sanity Studio (separate app, behind login).
//
// 👉 After you create your Sanity project, paste the Project ID below.
//    Until then `SANITY.enabled` is false and the site uses its static data.
// ---------------------------------------------------------------------------
const SANITY = {
  projectId: "6exe5b7g",    // Pixlora (public read — not a secret)
  dataset: "production",
  apiVersion: "2024-01-01",
  get enabled() { return Boolean(this.projectId); },
};
// Query the public dataset over plain HTTP using a GROQ query (no token).
async function sanityFetch(groq) {
  if (!SANITY.enabled) throw new Error("Sanity not configured");
  const url =
    `https://${SANITY.projectId}.apicdn.sanity.io/v${SANITY.apiVersion}` +
    `/data/query/${SANITY.dataset}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Sanity HTTP " + res.status);
  const json = await res.json();
  return json.result;
}
// Append Sanity image-pipeline params (resize / crop / auto-format) to a
// CDN image URL returned by `image.asset->url`.
//
// crop = true  -> ép cứng theo w x h, cắt ảnh để lấp đầy khung (dùng cho
//                 thumbnail, card sản phẩm ở trang shop / related products).
// crop = false -> chỉ giới hạn chiều rộng tối đa (w), giữ nguyên tỉ lệ gốc,
//                 KHÔNG cắt ảnh (dùng cho ảnh chính / gallery ở trang chi tiết).
function sanityImg(url, w = 600, h = 450, crop = true) {
  if (!url) return "";
  if (!crop) {
    return `${url}?w=${w}&fit=max&auto=format`;
  }
  return `${url}?w=${w}&h=${h}&fit=crop&auto=format`;
}
// expose as globals (the site uses plain script tags, no bundler)
window.SANITY = SANITY;
window.sanityFetch = sanityFetch;
window.sanityImg = sanityImg;
