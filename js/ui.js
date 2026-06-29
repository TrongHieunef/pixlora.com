// ---------------------------------------------------------------------------
// UI: dark mode, mobile menu, hero carousel, works carousel, animated counters,
//     static content rendering, back-to-top, print, contact form.
// ---------------------------------------------------------------------------

const UI = (() => {

  // ---- Dark mode ----------------------------------------------------------
  function initDarkMode() {
    const toggle = document.getElementById("darkToggle");
    const stored = localStorage.getItem("theme");
    // Default to light (like the live site); only go dark if the user picked it.
    if (stored === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    syncIcon();
    toggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
      syncIcon();
    });
    function syncIcon() {
      toggle.textContent = document.documentElement.classList.contains("dark") ? "light_mode" : "dark_mode";
    }
  }

  // ---- Mobile menu --------------------------------------------------------
  function initMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    document.getElementById("mobileMenuBtn").addEventListener("click", () => menu.classList.remove("hidden"));
    document.getElementById("closeMobileMenu").addEventListener("click", () => menu.classList.add("hidden"));
    menu.querySelectorAll(".mobile-link").forEach((a) =>
      a.addEventListener("click", () => menu.classList.add("hidden")));
  }

  // ---- Cart sidebar -------------------------------------------------------
  function initCartSidebar() {
    const sidebar = document.getElementById("cartSidebar");
    const overlay = document.getElementById("cartOverlay");
    const open = () => {
      sidebar.classList.remove("translate-x-full");
      overlay.classList.remove("opacity-0", "pointer-events-none");
    };
    const close = () => {
      sidebar.classList.add("translate-x-full");
      overlay.classList.add("opacity-0", "pointer-events-none");
    };
    document.getElementById("cartBtn").addEventListener("click", open);
    document.getElementById("closeCart").addEventListener("click", close);
    overlay.addEventListener("click", close);
    document.getElementById("checkoutBtn").addEventListener("click", () => Cart.checkout());
  }

  // ---- Hero carousel ------------------------------------------------------
  function initHero() {
    const track = document.getElementById("heroTrack");
    const dotsWrap = document.getElementById("heroDots");
    let index = 0;

    track.innerHTML = HERO_SLIDES.map((s) => `
      <div class="relative min-w-full h-full">
        <img src="${s.img}" class="h-full w-full object-cover" alt="${s.title}" />
        <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-6">
          <h2 class="text-3xl sm:text-5xl font-extrabold max-w-3xl">${s.title}</h2>
          <p class="mt-3 text-lg opacity-90">${s.sub}</p>
          <a href="#shop" class="mt-6 rounded-full bg-primary px-7 py-3 font-semibold hover:opacity-90">${s.cta}</a>
        </div>
      </div>`).join("");

    dotsWrap.innerHTML = HERO_SLIDES.map((_, i) =>
      `<button data-i="${i}" class="hero-dot h-2.5 w-2.5 rounded-full bg-white/50"></button>`).join("");

    const dots = [...dotsWrap.querySelectorAll(".hero-dot")];
    const go = (i) => {
      index = (i + HERO_SLIDES.length) % HERO_SLIDES.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("bg-white", di === index));
    };
    dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.i))));
    document.getElementById("heroPrev").addEventListener("click", () => go(index - 1));
    document.getElementById("heroNext").addEventListener("click", () => go(index + 1));
    go(0);
    setInterval(() => go(index + 1), 6000);
  }

  // ---- Featured works carousel -------------------------------------------
  function renderWorks(works) {
    document.getElementById("worksTrack").innerHTML = works.map((w) => `
      <div class="min-w-[260px] sm:min-w-[300px] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <img src="${w.img}" class="aspect-[4/3] w-full object-cover" alt="${w.title}" />
        <div class="p-4">
          <span class="text-xs uppercase text-primary font-semibold">${w.cat}</span>
          <h3 class="font-bold mt-1">${w.title}</h3>
          <p class="text-xs text-slate-400 mt-1">${w.date}</p>
        </div>
      </div>`).join("");
  }

  function initWorks() {
    renderWorks(WORKS);

    const track = document.getElementById("worksTrack");
    let offset = 0;
    const step = 320;
    const maxScroll = () => track.scrollWidth - track.parentElement.clientWidth;
    const move = (dir) => {
      offset = Math.max(0, Math.min(offset + dir * step, maxScroll()));
      track.style.transform = `translateX(-${offset}px)`;
    };
    document.getElementById("worksPrev").addEventListener("click", () => move(-1));
    document.getElementById("worksNext").addEventListener("click", () => move(1));
  }

  // ---- About tags + stats (animated counters) -----------------------------
  function initAbout() {
    document.getElementById("aboutTags").innerHTML = ABOUT_TAGS.map((t) => `
      <span class="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
        <span class="material-symbols-outlined text-base">${t.icon}</span>${t.label}</span>`).join("");

    document.getElementById("aboutStats").innerHTML = ABOUT_STATS.map((s) => `
      <div>
        <span class="material-symbols-outlined text-primary text-2xl">${s.icon}</span>
        <p class="text-2xl font-extrabold mt-1"><span class="counter" data-target="${s.value}">0</span>${s.suffix}</p>
        <p class="text-xs text-slate-500">${s.label}</p>
      </div>`).join("");

    const counters = document.querySelectorAll(".counter");
    const animate = (el) => {
      const target = Number(el.dataset.target);
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(progress * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => obs.observe(c));
  }

  // ---- Albums -------------------------------------------------------------
  function renderAlbums(albums) {
    document.getElementById("albumsGrid").innerHTML = albums.map((a) => `
      <a href="#gallery" class="group relative block rounded-2xl overflow-hidden aspect-[4/3]">
        <img src="${a.img}" class="h-full w-full object-cover transition duration-500 group-hover:scale-110" alt="${a.title}" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
          <h3 class="text-white font-bold">${a.title}</h3>
        </div>
      </a>`).join("");
  }

  function initAlbums() { renderAlbums(ALBUMS); }

  // ---- Videos (rendered only when Sanity provides them) -------------------
  function renderVideos(videos) {
    const grid = document.getElementById("videosGrid");
    grid.innerHTML = videos.map((v) => `
      <div class="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div class="aspect-video">
          <iframe class="h-full w-full" src="https://www.youtube.com/embed/${v.youtubeId}"
            title="${v.title}" loading="lazy" frameborder="0" allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
        </div>
        <div class="p-4"><h3 class="font-bold">${v.title}</h3></div>
      </div>`).join("");
    document.getElementById("videos").classList.remove("hidden");
  }

  // ---- Pull live content from Sanity, fall back to static data silently ---
  async function hydrateFromSanity() {
    if (!window.SANITY || !SANITY.enabled) return; // not configured yet
    try {
      const photos = await sanityFetch(
        `*[_type=="photo"]{ _id, title, category, section,
          "img": image.asset->url, "date": coalesce(date, _createdAt) }
         | order(order asc, _createdAt desc)`
      );
      if (Array.isArray(photos) && photos.length) {
        const fmt = (d) => { try { return new Date(d).toLocaleDateString("vi-VN"); } catch { return ""; } };
        const albums = photos.filter((p) => p.section === "album")
          .map((p) => ({ title: p.title, img: sanityImg(p.img, 500, 375) }));
        const works = photos.filter((p) => p.section === "featured")
          .map((p) => ({ title: p.title, cat: p.category || "", date: fmt(p.date), img: sanityImg(p.img, 500, 375) }));
        if (albums.length) renderAlbums(albums);
        if (works.length) renderWorks(works);
      }

      const videos = await sanityFetch(`*[_type=="video"]{ _id, title, youtubeId } | order(_createdAt desc)`);
      if (Array.isArray(videos) && videos.length) renderVideos(videos);
    } catch (e) {
      console.warn("Sanity hydrate failed, keeping static content:", e.message);
    }
  }

  // ---- Testimonials -------------------------------------------------------
  function initTestimonials() {
    const stars = (n) => Array.from({ length: 5 }, (_, i) =>
      `<span class="material-symbols-outlined text-base ${i < n ? "text-yellow-400" : "text-slate-300"}" style="font-variation-settings:'FILL' ${i < n ? 1 : 0}">star</span>`).join("");
    document.getElementById("testimonialsGrid").innerHTML = TESTIMONIALS.map((t) => `
      <div class="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div class="flex items-center gap-1 mb-3">${stars(t.rating)}</div>
        <p class="text-slate-500 italic">"${t.text}"</p>
        <div class="flex items-center gap-3 mt-5">
          <img src="${t.img}" class="h-11 w-11 rounded-full object-cover" alt="${t.name}" />
          <div><p class="font-semibold">${t.name}</p><p class="text-xs text-slate-400">${t.role}</p></div>
        </div>
      </div>`).join("");
  }

  // ---- Packages -----------------------------------------------------------
  function initPackages() {
    document.getElementById("packagesGrid").innerHTML = PACKAGES.map((p) => `
      <div class="relative rounded-2xl border-2 ${p.popular ? "border-primary" : "border-transparent"} bg-white dark:bg-slate-900 p-7 shadow-sm flex flex-col">
        ${p.popular ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs text-white font-semibold">Most Popular</span>` : ""}
        <h3 class="text-xl font-extrabold">${p.name}</h3>
        <p class="text-sm text-slate-500 mt-1">${p.desc}</p>
        <p class="text-3xl font-extrabold text-primary mt-4">${formatVND(p.price)}</p>
        <ul class="mt-5 space-y-2 text-sm flex-1">
          ${p.features.map((f) => `<li class="flex items-center gap-2"><span class="material-symbols-outlined text-accent text-base">check_circle</span>${f}</li>`).join("")}
        </ul>
        <a href="#contact" class="mt-6 rounded-full ${p.popular ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800"} py-3 text-center font-semibold hover:opacity-90">Choose Plan</a>
      </div>`).join("");
  }

  // ---- Back to top, print, contact form ----------------------------------
  function initMisc() {
    const btt = document.getElementById("backToTop");
    window.addEventListener("scroll", () => {
      btt.classList.toggle("opacity-0", window.scrollY < 400);
      btt.classList.toggle("pointer-events-none", window.scrollY < 400);
    });
    btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const printBtn = document.getElementById("printBtn");
    if (printBtn) printBtn.addEventListener("click", () => window.print());

    const form = document.getElementById("contactForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error || res.status);
        toast("Message sent! I'll get back to you soon.", "mark_email_read");
        form.reset();
      } catch (err) {
        // No backend available — still acknowledge in demo mode.
        console.warn("contact API unavailable:", err.message);
        toast("Message sent (demo mode — no backend)", "mark_email_read");
        form.reset();
      }
    });
  }

  function init() {
    initDarkMode();
    initMobileMenu();
    initCartSidebar();
    initHero();
    initWorks();
    initAbout();
    initAlbums();
    initTestimonials();
    initPackages();
    initMisc();
    hydrateFromSanity(); // upgrade gallery/videos from the CMS if configured
  }

  return { init };
})();
