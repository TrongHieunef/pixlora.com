// ---------------------------------------------------------------------------
// Static content for the non-product sections (mirrors the original site).
// ---------------------------------------------------------------------------

const ABOUT_TAGS = [
  { icon: "landscape", label: "Landscape" }, { icon: "portrait", label: "Portrait" },
  { icon: "flight", label: "Travel" }, { icon: "location_city", label: "Urban" },
];

const ABOUT_STATS = [
  { icon: "work", value: 500, suffix: "+", label: "Projects" },
  { icon: "photo_camera", value: 50000, suffix: "+", label: "Photos Taken" },
  { icon: "emoji_events", value: 15, suffix: "+", label: "Awards" },
];

const HERO_SLIDES = [
  { img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200", title: "Capturing Moments, Telling Stories", sub: "Where every shot tells a unique story", cta: "View Gallery" },
  { img: "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?w=1200", title: "Professional Photography Services", sub: "Portrait • Landscape • Event • Commercial", cta: "Learn More" },
  { img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200", title: "Premium Camera Gear Shop", sub: "Professional Equipment • Authentic Products", cta: "Shop Now" },
];

const ALBUMS = [
  { title: "European Travels", img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500" },
  { title: "Urban Landscapes", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500" },
  { title: "Portraits", img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=500" },
  { title: "Nature's Beauty", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500" },
];

const WORKS = [
  { title: "Sony 85mm f/1.8 Lens", cat: "lens", date: "20/01/2020", img: "https://images.unsplash.com/photo-1660477946008-8cd03548bdba?w=600" },
  { title: "Sony A7 III Camera", cat: "camera", date: "05/03/2020", img: "https://images.unsplash.com/photo-1606986628470-26a67fa4730c?w=600" },
  { title: "Aluminum Rig", cat: "accessory", date: "17/12/2019", img: "https://images.unsplash.com/photo-1452696193712-6cabf5103b63?w=500" },
  { title: "Family Photo", cat: "camera", date: "17/11/2019", img: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=500" },
  { title: "Golden Hour", cat: "lens", date: "18/02/2021", img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500" },
];

const TESTIMONIALS = [
  { name: "Sarah Johnson", role: "Marketing Director", img: "https://i.pravatar.cc/100?img=47", rating: 5, text: "John captured our corporate event perfectly. His attention to detail made all the difference!" },
  { name: "Michael Chen", role: "Travel Blogger", img: "https://i.pravatar.cc/100?img=12", rating: 5, text: "Working with John was effortless. The travel shots he delivered exceeded every expectation." },
  { name: "Emily Rodriguez", role: "Bride", img: "https://i.pravatar.cc/100?img=32", rating: 5, text: "Our wedding photos are absolutely stunning. John has a real gift for catching genuine emotion." },
];

const PACKAGES = [
  {
    name: "Basic", price: 2999000, popular: false,
    desc: "Perfect for individuals and small shoots.",
    features: ["2-hour session", "30 edited photos", "Online gallery", "1 location"],
  },
  {
    name: "Professional", price: 5999000, popular: true,
    desc: "Our most popular package for events.",
    features: ["4-hour session", "80 edited photos", "Online gallery", "2 locations", "Print release"],
  },
  {
    name: "Premium", price: 9999000, popular: false,
    desc: "Full-day coverage with everything included.",
    features: ["Full-day session", "200 edited photos", "Online gallery", "Unlimited locations", "Print release", "Premium album"],
  },
];

// Embedded copy of data/products.json — used as a fallback when the page is
// opened directly from disk (file://) and fetch() is blocked by the browser.
const PRODUCTS_FALLBACK = [
  { id: "p1", name: "Sony A7 III Camera", description: "Full-frame mirrorless camera with outstanding low-light performance.", price: 38999999, category: "camera", status: "active", badge: "popular", stock: 8, rating: 4.7, review_count: 124, main_image: "https://images.unsplash.com/photo-1606980625105-5e8f0a8c9f9b?w=600", gallery_images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000", "https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=1000"], video: "aqz-KE-bpKQ", specs: { sensor: "Full-frame", mp: "24.2" }, features: ["4K video", "5-axis stabilization"], created_at: "2020-03-05", updated_at: "2020-03-05" },
  { id: "p2", name: "Sony 85mm f/1.8 Lens", description: "Portrait prime lens with beautiful bokeh.", price: 8999999, category: "lens", status: "active", badge: "popular", stock: 8, rating: 4.5, review_count: 28, main_image: "https://images.unsplash.com/photo-1617005082133-5c66db5b8a3a?w=600", gallery_images: ["https://images.unsplash.com/photo-1617005082133-5c66db5b8a3a?w=1000", "https://images.unsplash.com/photo-1606986628470-26a67fa4730c?w=1000"], specs: { focal: "85mm", aperture: "f/1.8" }, features: ["Fast autofocus"], created_at: "2020-01-20", updated_at: "2020-01-20" },
  { id: "p3", name: "Nikon 50mm f/1.8 Lens", description: "Versatile prime lens for portraits and everyday photography.", price: 4599999, category: "lens", status: "active", badge: "new", stock: 20, rating: 4.6, review_count: 39, main_image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600", gallery_images: [], specs: { focal: "50mm" }, features: [], created_at: "2024-12-01", updated_at: "2024-12-01" },
  { id: "p4", name: "Camera Bag Pro", description: "Professional camera bag with laptop compartment.", price: 2599999, category: "bag", status: "active", badge: null, stock: 30, rating: 4.4, review_count: 56, main_image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600", gallery_images: [], specs: {}, features: ["Water resistant"], created_at: "2023-06-10", updated_at: "2023-06-10" },
  { id: "p5", name: "Studio Softbox Light Kit", description: "Continuous lighting kit for studio portraits and product shots.", price: 3200000, category: "lighting", status: "active", badge: "sale", stock: 18, rating: 4.3, review_count: 17, main_image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600", gallery_images: [], specs: {}, features: [], created_at: "2023-02-15", updated_at: "2023-02-15" },
  { id: "p6", name: "SanDisk 128GB SD Card", description: "High-speed UHS-II memory card for 4K recording.", price: 1290000, category: "memory", status: "active", badge: "hot", stock: 10000, rating: 4.8, review_count: 210, main_image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=600", gallery_images: [], specs: { size: "128GB" }, features: [], created_at: "2024-01-11", updated_at: "2024-01-11" },
  { id: "p7", name: "Carbon Fiber Tripod", description: "Lightweight, sturdy tripod for travel and landscape work.", price: 4200000, category: "accessory", status: "active", badge: null, stock: 25, rating: 4.6, review_count: 73, main_image: "https://images.unsplash.com/photo-1452696193712-6cabf5103b63?w=600", gallery_images: [], specs: {}, features: [], created_at: "2023-12-17", updated_at: "2023-12-17" },
  { id: "p8", name: "Canon EOS R6 Camera", description: "Hybrid mirrorless body ideal for stills and video.", price: 45999999, category: "camera", status: "active", badge: "popular", stock: 5, rating: 4.9, review_count: 98, main_image: "https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=600", gallery_images: ["https://images.unsplash.com/photo-1606980625105-5e8f0a8c9f9b?w=1000", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000"], video: "aqz-KE-bpKQ", specs: {}, features: [], created_at: "2024-11-17", updated_at: "2024-11-17" },
];

// Shared formatting helper.
const formatVND = (n) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";

