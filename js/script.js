/* ==========================================================================
   SWEET HEAVEN — script.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------------
     0. SPLIT HERO TITLE INTO CHARACTERS (for reveal animation)
  --------------------------------------------------------------------- */
  document.querySelectorAll("[data-line]").forEach((line) => {
    const text = line.textContent;
    const isItalic = line.querySelector(".italic") !== null;
    line.innerHTML = "";
    text.split("").forEach((ch) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      if (isItalic) span.classList.add("italic");
      line.appendChild(span);
    });
  });

  /* ---------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL
  --------------------------------------------------------------------- */
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        lenis.scrollTo(id, { offset: -60 });
        closeMobileMenu();
      }
    });
  });

  /* ---------------------------------------------------------------------
     2. LOADING SCREEN
  --------------------------------------------------------------------- */
  const loader = document.getElementById("loader");
  const loaderLetters = document.querySelectorAll(".loader__mark span");
  const loaderRing = document.querySelector(".loader__ring circle");
  const loaderLabel = document.querySelector(".loader__label");

  const loadTl = gsap.timeline({
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => {
          loader.style.display = "none";
          playHeroIntro();
        },
      });
    },
  });

  loadTl
    .to(loaderRing, {
      strokeDashoffset: 0,
      duration: 1.3,
      ease: "power2.inOut",
    })
    .to(
      loaderLetters,
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.035, ease: "power2.out" },
      "-=1.1",
    )
    .to(loaderLabel, { opacity: 1, duration: 0.5 }, "-=.2")
    .to({}, { duration: 0.3 });

  /* ---------------------------------------------------------------------
     3. HERO INTRO ANIMATION
  --------------------------------------------------------------------- */
  function playHeroIntro() {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.8 },
    });
    tl.to(".hero__title .char", { y: "0%", stagger: 0.018, duration: 0.7 })
      .to(".hero .reveal-fade", { opacity: 1, y: 0, stagger: 0.12 }, "-=.5")
      .fromTo(
        ".hero__visual",
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 1 },
        "-=.9",
      )
      .fromTo(
        ".hero__badge",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0 },
        "-=.4",
      )
      .to(
        ".hero__image",
        { scale: 1, duration: 1.4, ease: "power2.out" },
        "-=1.1",
      )
      .add(
        () => animateCount(document.querySelector(".hero__badge-num")),
        "-=.6",
      );
  }

  /* ---------------------------------------------------------------------
     4. SCROLL REVEALS (generic)
  --------------------------------------------------------------------- */
  gsap.utils.toArray(".reveal-fade:not(.hero .reveal-fade)").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.utils.toArray(".reveal-up").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      delay: (i % 4) * 0.08,
    });
  });

  gsap.utils.toArray(".reveal-image").forEach((el) => {
    const img = el.querySelector("img");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
    tl.to(el, { opacity: 1, duration: 0.9, ease: "power2.out" }).to(
      img,
      { scale: 1, duration: 1.4, ease: "power3.out" },
      "-=.9",
    );
  });

  /* Craft timeline draw */
  const craftPath = document.querySelector(".craft__line-path");
  if (craftPath) {
    gsap.to(craftPath, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: "none",
      scrollTrigger: {
        trigger: ".craft__timeline",
        start: "top 75%",
        end: "bottom 60%",
        scrub: 1,
      },
    });
  }

  /* Parallax hero image */
  gsap.to("[data-parallax] img", {
    yPercent: 8,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  /* ---------------------------------------------------------------------
     5. COUNT-UP NUMBERS
  --------------------------------------------------------------------- */
  function animateCount(el) {
    if (!el || el.dataset.counted) return;
    el.dataset.counted = "true";
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.floor(obj.val) + suffix;
      },
    });
  }
  document.querySelectorAll(".stat__num").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => animateCount(el),
    });
  });

  /* ---------------------------------------------------------------------
     6. NAVBAR SCROLL STATE + PROGRESS BAR
  --------------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const progressBar = document.getElementById("progressBar");
  const backToTop = document.getElementById("backToTop");

  lenis.on("scroll", ({ scroll, limit }) => {
    navbar.classList.toggle("is-scrolled", scroll > 40);
    backToTop.classList.toggle("is-visible", scroll > 600);
    const pct = limit > 0 ? (scroll / limit) * 100 : 0;
    progressBar.style.width = pct + "%";
  });

  backToTop.addEventListener("click", () => lenis.scrollTo(0));

  /* ---------------------------------------------------------------------
     7. MOBILE MENU
  --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
  }

  navToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open");
  });

  /* ---------------------------------------------------------------------
     8. CUSTOM CURSOR (with contextual labels)
  --------------------------------------------------------------------- */
  const cursor = document.getElementById("cursor");
  const cursorLabel = document.getElementById("cursorLabel");
  const isFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  if (isFinePointer) {
    window.addEventListener("mousemove", (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out",
      });
    });

    document
      .querySelectorAll("a, button, .product-card, .gallery__item")
      .forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursor.classList.add("is-hover");
          cursorLabel.textContent =
            el.dataset.cursor ||
            el.closest("[data-cursor]")?.dataset.cursor ||
            "";
        });
        el.addEventListener("mouseleave", () => {
          cursor.classList.remove("is-hover");
          cursorLabel.textContent = "";
        });
      });
  }

  /* ---------------------------------------------------------------------
     9. MAGNETIC BUTTONS
  --------------------------------------------------------------------- */
  if (isFinePointer) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.5,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)",
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     10. SWIPER — TESTIMONIALS
  --------------------------------------------------------------------- */
  new Swiper(".testimonial-swiper", {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 32,
    autoplay: { delay: 5500, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
  });

  /* ---------------------------------------------------------------------
     11. ACCORDION (FAQ)
  --------------------------------------------------------------------- */
  document.querySelectorAll(".accordion__item").forEach((item) => {
    const head = item.querySelector(".accordion__head");
    const body = item.querySelector(".accordion__body");

    head.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      document
        .querySelectorAll(".accordion__item.is-open")
        .forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove("is-open");
            openItem.querySelector(".accordion__body").style.maxHeight = null;
          }
        });

      if (isOpen) {
        item.classList.remove("is-open");
        body.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ---------------------------------------------------------------------
     12. NEWSLETTER FORM
  --------------------------------------------------------------------- */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterNote = document.getElementById("newsletterNote");

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    newsletterNote.textContent = "Terima kasih! Anda telah berlangganan.";
    newsletterForm.reset();
  });

  /* ---------------------------------------------------------------------
     13. PRODUCT CATEGORY FILTER
  --------------------------------------------------------------------- */
  const tabs = document.querySelectorAll(".tab");
  const productCards = document.querySelectorAll(".product-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const filter = tab.dataset.filter;

      productCards.forEach((card) => {
        const match = filter === "all" || card.dataset.cat === filter;
        if (match) {
          card.classList.remove("is-hidden");
          gsap.fromTo(
            card,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          );
        } else {
          gsap.to(card, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => card.classList.add("is-hidden"),
          });
        }
      });

      setTimeout(() => ScrollTrigger.refresh(), 400);
    });
  });

  /* ---------------------------------------------------------------------
     14. QUICK VIEW MODAL
  --------------------------------------------------------------------- */
  const qvModal = document.getElementById("quickViewModal");
  const qvImage = document.getElementById("qvImage");
  const qvName = document.getElementById("qvName");
  const qvDesc = document.getElementById("qvDesc");
  const qvPrice = document.getElementById("qvPrice");
  const qvRating = document.getElementById("qvRating");
  const qvOrder = document.getElementById("qvOrder");

  function openModal(modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    lenis.stop();
  }
  function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    lenis.start();
  }

  document.querySelectorAll(".product-card__view").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      qvImage.src = card.dataset.img;
      qvImage.alt = card.dataset.name;
      qvName.textContent = card.dataset.name;
      qvDesc.textContent = card.dataset.desc;
      qvPrice.textContent = card.dataset.price;
      qvRating.textContent = card.dataset.rating;
      qvOrder.href = `https://wa.me/6281234567890?text=${encodeURIComponent("Halo, saya ingin memesan " + card.dataset.name)}`;
      openModal(qvModal);
    });
  });

  qvModal
    .querySelectorAll("[data-close]")
    .forEach((el) => el.addEventListener("click", () => closeModal(qvModal)));

  /* ---------------------------------------------------------------------
     15. GALLERY LIGHTBOX
  --------------------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const galleryImages = Array.from(
    document.querySelectorAll(".gallery__item img"),
  );
  let currentIndex = 0;

  function showImage(i) {
    currentIndex = (i + galleryImages.length) % galleryImages.length;
    lightboxImage.src = galleryImages[currentIndex].src.replace(
      "w=1200",
      "w=1600",
    );
    lightboxImage.alt = galleryImages[currentIndex].alt;
  }

  galleryImages.forEach((img, i) => {
    img.closest(".gallery__item").addEventListener("click", () => {
      showImage(i);
      openModal(lightbox);
    });
  });

  document
    .getElementById("lbPrev")
    .addEventListener("click", () => showImage(currentIndex - 1));
  document
    .getElementById("lbNext")
    .addEventListener("click", () => showImage(currentIndex + 1));
  lightbox
    .querySelectorAll("[data-close]")
    .forEach((el) => el.addEventListener("click", () => closeModal(lightbox)));

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "Escape") closeModal(lightbox);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && qvModal.classList.contains("is-open"))
      closeModal(qvModal);
  });

  /* ---------------------------------------------------------------------
     16. REFRESH SCROLLTRIGGER ON RESIZE
  --------------------------------------------------------------------- */
  window.addEventListener("resize", () => ScrollTrigger.refresh());
});
