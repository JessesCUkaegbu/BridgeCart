/**
 * BridgeCart — main script
 * Handles: page switching, hero scene init, category filter,
 *          request form, buy modal, WhatsApp link builder.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ── State ──────────────────────────────────────────────────
  const state = { selectedProduct: null };

  // ── AOS (scroll animations) ─────────────────────────────────
  if (window.AOS) {
    AOS.init({ duration: 800, easing: "ease-out-cubic", once: true, offset: 60 });
  }

  // ── Hero scene: star field ───────────────────────────────────
  const starsContainer = document.getElementById("hw-stars");
  if (starsContainer) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 80; i++) {
      const size = (Math.random() * 2 + 0.5).toFixed(2);
      const el   = document.createElement("div");
      el.className = "hw-star";
      el.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `top:${(Math.random() * 55).toFixed(1)}%`,
        `left:${(Math.random() * 100).toFixed(1)}%`,
        `--o:${(Math.random() * 0.6 + 0.2).toFixed(2)}`,
        `--d:${(Math.random() * 3 + 2).toFixed(1)}s`,
        `animation-delay:${(Math.random() * 4).toFixed(1)}s`,
      ].join(";");
      fragment.appendChild(el);
    }
    starsContainer.appendChild(fragment);
  }

  // ── Hero scene: skyline buildings ───────────────────────────
  const skylineContainer = document.getElementById("hw-skyline");
  if (skylineContainer) {
    const heights  = [20, 45, 30, 60, 35, 50, 25, 70, 40, 55, 30, 65, 45, 35, 50, 28, 42, 38, 55, 32];
    const fragment = document.createDocumentFragment();
    heights.forEach((h) => {
      const el = document.createElement("div");
      el.className = "hw-building";
      el.style.cssText = `width:${Math.floor(Math.random() * 12 + 8)}px;height:${h}px;`;
      fragment.appendChild(el);
    });
    skylineContainer.appendChild(fragment);
  }

  // ── DOM refs ────────────────────────────────────────────────
  const pages         = document.querySelectorAll(".page");
  const navLinks      = document.querySelectorAll(".site-nav-link");
  const filterBtns    = document.querySelectorAll("[data-filter-category]");
  const modal         = document.getElementById("buy-modal");
  const requestForm   = document.getElementById("request-form-card");
  const buyForm       = document.getElementById("buy-form");
  const successMsg    = document.getElementById("success-msg");

  // ── Helpers ─────────────────────────────────────────────────
  /**
   * Show / clear a form message element.
   * @param {string} id      - element id
   * @param {string} text    - message text (empty = hide)
   * @param {string} [type]  - "success" | "error"
   */
  function setMessage(id, text, type = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent  = text;
    el.className    = text ? `form-message${type ? " " + type : ""}` : "form-message";
  }

  /**
   * Show / clear the status banner above the shop grid.
   */
  function setStatusBanner(text, type = "") {
    const el = document.getElementById("buy-success-message");
    if (!el) return;
    el.textContent    = text;
    el.className      = text ? `status-message${type ? " " + type : ""}` : "status-message";
    el.style.display  = text ? "block" : "none";
  }

  /**
   * Build a wa.me link with a pre-filled message.
   */
  function buildWALink(message) {
    return `https://wa.me/231779005985?text=${encodeURIComponent(message)}`;
  }

  // ── Page switching ───────────────────────────────────────────
  function setActivePage(name) {
    pages.forEach((p) => p.classList.toggle("active", p.id === `page-${name}`));
    navLinks.forEach((b) => b.classList.toggle("active", b.dataset.pageTarget === name));
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (name === "shop") filterCategory("All");
    if (window.AOS)      AOS.refreshHard();
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Category filter ──────────────────────────────────────────
  function filterCategory(category) {
    filterBtns.forEach((b) =>
      b.classList.toggle("active", b.dataset.filterCategory === category)
    );

    document.querySelectorAll(".product-card").forEach((card) => {
      const show = category === "All" || card.dataset.category === category;
      card.style.display = show ? "flex" : "none";
    });

    setStatusBanner("");
    if (window.AOS) AOS.refresh();
  }

  // ── Buy modal ────────────────────────────────────────────────
  function openModal(product) {
    state.selectedProduct = product;
    const label = document.getElementById("buy-product-label");
    if (label) label.textContent = `${product.name} — $${product.price}`;
    buyForm.reset();
    setMessage("buy-form-message", "");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    // Focus first input for accessibility
    const firstInput = modal.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    state.selectedProduct = null;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    setMessage("buy-form-message", "");
  }

  // ── Form: request a product ──────────────────────────────────
  function handleRequestSubmit(e) {
    e.preventDefault();
    if (!requestForm.checkValidity()) { requestForm.reportValidity(); return; }

    const d = new FormData(requestForm);
    const message = [
      "Hi BridgeCart! I would like to place a request.",
      "",
      `Name:     ${d.get("full_name")}`,
      `Phone:    ${d.get("whatsapp_number")}`,
      `Email:    ${d.get("email")            || "N/A"}`,
      `Category: ${d.get("category")         || "N/A"}`,
      `Product:  ${d.get("product_description")}`,
      `Budget:   ${d.get("budget")           || "N/A"}`,
      `Location: ${d.get("delivery_location") || "N/A"}`,
    ].join("\n");

    window.open(buildWALink(message), "_blank", "noopener,noreferrer");

    requestForm.hidden = true;
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.removeAttribute("hidden");
    }
  }

  // ── Form: buy order ──────────────────────────────────────────
  function handleOrderSubmit(e) {
    e.preventDefault();
    if (!buyForm.checkValidity()) { buyForm.reportValidity(); return; }
    if (!state.selectedProduct) {
      setMessage("buy-form-message", "Please select a product first.", "error");
      return;
    }

    const p = state.selectedProduct;
    const d = new FormData(buyForm);
    const message = [
      "Hi BridgeCart! I want to buy this item.",
      "",
      `Name:     ${d.get("buyer_name")}`,
      `Phone:    ${d.get("buyer_phone")}`,
      `Product:  ${p.name}`,
      `Category: ${p.category}`,
      `Price:    $${p.price}`,
      `Notes:    ${d.get("buyer_note") || "N/A"}`,
      "",
      "Please contact me with the next steps.",
    ].join("\n");

    window.open(buildWALink(message), "_blank", "noopener,noreferrer");
    closeModal();
    setStatusBanner(
      `Your order request for "${p.name}" has been submitted. We will contact you on WhatsApp shortly.`,
      "success"
    );
  }

  // ── Global click delegation ──────────────────────────────────
  document.addEventListener("click", (e) => {
    // Page navigation
    const pageBtn = e.target.closest("[data-page-target]");
    if (pageBtn) {
      e.preventDefault();
      setActivePage(pageBtn.dataset.pageTarget);

      // Optionally pre-filter shop category
      if (pageBtn.dataset.categoryTarget) {
        filterCategory(pageBtn.dataset.categoryTarget);
      }
      // Optionally scroll to a section after switching
      if (pageBtn.dataset.scrollTarget) {
        // Small delay so the page renders first
        setTimeout(() => scrollToSection(pageBtn.dataset.scrollTarget), 80);
      }
      return;
    }

    // Scroll only (same page)
    const scrollBtn = e.target.closest("[data-scroll-target]");
    if (scrollBtn && !scrollBtn.dataset.pageTarget) {
      e.preventDefault();
      scrollToSection(scrollBtn.dataset.scrollTarget);
      return;
    }

    // Category filter
    const filterBtn = e.target.closest("[data-filter-category]");
    if (filterBtn) {
      e.preventDefault();
      filterCategory(filterBtn.dataset.filterCategory);
      return;
    }

    // Open buy modal
    const productBtn = e.target.closest("[data-open-product]");
    if (productBtn) {
      e.preventDefault();
      openModal({
        name:     productBtn.dataset.productName,
        category: productBtn.dataset.productCategory,
        price:    productBtn.dataset.productPrice,
      });
      return;
    }

    // Close modal via close button or backdrop click
    if (e.target.closest("[data-close-buy-modal]") || e.target === modal) {
      e.preventDefault();
      closeModal();
    }
  });

  // Keyboard: Escape closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("active")) closeModal();
  });

  // ── Form listeners ───────────────────────────────────────────
  if (requestForm) requestForm.addEventListener("submit", handleRequestSubmit);
  if (buyForm)     buyForm.addEventListener("submit",     handleOrderSubmit);

  // ── Boot ─────────────────────────────────────────────────────
  setActivePage("home");
  filterCategory("All");

  // ── Shop hero canvas animation ───────────────────────────────
  (function initShopHeroCanvas() {
    const canvas = document.getElementById("shop-hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ── palette ──────────────────────────────────────────────
    const NAVY   = "#1B3A6B";
    const GOLD   = "#C9A84C";
    const GOLDF  = "rgba(201,168,76,";
    const WHITEF = "rgba(255,255,255,";

    // ── resize ───────────────────────────────────────────────
    function resize() {
      const hero = canvas.parentElement;
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener("resize", () => { resize(); buildScene(); });

    // ── Product emoji items floating in the scene ─────────────
    const ITEMS = ["📦","📱","💻","👟","👗","🛋️","📺","🔋","👔","👠"];

    // ── Scene objects ─────────────────────────────────────────
    let particles  = [];   // small gold/white sparkle dots
    let floaters   = [];   // emoji product cards
    let shipX      = -180; // animated cargo ship x position
    let routeDash  = 0;    // animated dashed route line offset
    let frameId    = null;

    function buildScene() {
      const W = canvas.width;
      const H = canvas.height;

      // Sparkle particles
      particles = Array.from({ length: 55 }, () => ({
        x:   Math.random() * W,
        y:   Math.random() * H,
        r:   Math.random() * 1.4 + 0.3,
        o:   Math.random() * 0.55 + 0.15,
        spd: Math.random() * 0.4 + 0.1,
        dir: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
      }));

      // Floating product emoji cards
      floaters = Array.from({ length: 7 }, (_, i) => {
        const emoji = ITEMS[i % ITEMS.length];
        return {
          emoji,
          x:      80 + (i / 6) * (W - 160),
          baseY:  H * 0.18 + (i % 2) * (H * 0.22),
          phase:  (i / 7) * Math.PI * 2,
          speed:  0.6 + Math.random() * 0.5,
          size:   28 + Math.floor(Math.random() * 12),
          alpha:  0.72 + Math.random() * 0.22,
          pulseR: 28 + Math.floor(Math.random() * 8),
          pulsePhase: Math.random() * Math.PI * 2,
        };
      });
    }

    // ── Draw helpers ──────────────────────────────────────────

    // Rounded rectangle
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    // Draw one floating product card
    function drawFloater(f, t) {
      const bobY   = f.baseY + Math.sin(t * f.speed * 0.001 + f.phase) * 10;
      const rotate = Math.sin(t * f.speed * 0.0006 + f.phase) * 0.08;
      const cardW  = f.size * 3.2;
      const cardH  = f.size * 3.8;
      const cx     = f.x - cardW / 2;
      const cy     = bobY - cardH / 2;

      ctx.save();
      ctx.translate(f.x, bobY);
      ctx.rotate(rotate);
      ctx.translate(-f.x, -bobY);

      // Card shadow
      ctx.shadowColor = "rgba(0,0,0,.35)";
      ctx.shadowBlur  = 14;
      ctx.shadowOffsetY = 6;

      // Card body
      roundRect(cx, cy, cardW, cardH, 10);
      ctx.fillStyle = `rgba(255,255,255,${f.alpha * 0.12})`;
      ctx.fill();
      ctx.strokeStyle = GOLDF + (f.alpha * 0.35) + ")";
      ctx.lineWidth   = 1;
      ctx.stroke();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur  = 0;
      ctx.shadowOffsetY = 0;

      // Emoji
      ctx.font      = `${f.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha  = f.alpha;
      ctx.fillText(f.emoji, f.x, bobY - 4);
      ctx.globalAlpha  = 1;

      // Gold price tag line at bottom of card
      const tagY = cy + cardH - 18;
      ctx.fillStyle   = GOLDF + "0.65)";
      roundRect(cx + 8, tagY, cardW - 16, 14, 4);
      ctx.fill();

      ctx.restore();
    }

    // Draw the animated shipping route (dashed arc China → Liberia)
    function drawRoute(W, H) {
      const startX = W * 0.08;
      const endX   = W * 0.92;
      const midY   = H * 0.78;
      const ctrlY  = H * 0.15;

      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -routeDash;
      ctx.strokeStyle    = WHITEF + "0.22)";
      ctx.lineWidth      = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, midY);
      ctx.quadraticCurveTo(W / 2, ctrlY, endX, midY);
      ctx.stroke();

      // Gold endpoint dots
      [startX, endX].forEach((ex) => {
        // Outer pulse ring
        const ring = (Math.sin(routeDash * 0.05) * 0.5 + 0.5);
        ctx.beginPath();
        ctx.arc(ex, midY, 8 + ring * 8, 0, Math.PI * 2);
        ctx.strokeStyle = GOLDF + (0.25 - ring * 0.22) + ")";
        ctx.lineWidth   = 1;
        ctx.setLineDash([]);
        ctx.stroke();

        // Inner solid dot
        ctx.beginPath();
        ctx.arc(ex, midY, 4, 0, Math.PI * 2);
        ctx.fillStyle = GOLD;
        ctx.fill();
      });

      // Pin labels
      ctx.setLineDash([]);
      ctx.font        = "bold 11px 'Segoe UI', sans-serif";
      ctx.textAlign   = "center";
      ctx.fillStyle   = WHITEF + "0.7)";
      ctx.textBaseline = "middle";
      ctx.fillText("🇨🇳 China",   startX, midY - 20);
      ctx.fillText("🇱🇷 Liberia", endX,   midY - 20);

      ctx.restore();
    }

    // Draw animated cargo ship sailing along the route
    function drawShip(W, H, t) {
      // Ship travels from left edge to right edge over ~28s
      const speed   = W / (28 * 60); // pixels per frame at 60fps
      shipX        += speed;
      if (shipX > W + 180) shipX = -180;

      // Y follows the bezier arc
      const progress = (shipX + 180) / (W + 360);
      const p        = Math.max(0, Math.min(1, progress));
      const startX   = W * 0.08;
      const endX     = W * 0.92;
      const ctrlY    = H * 0.15;
      const midY     = H * 0.78;
      // Quadratic bezier Y
      const shipY = (1 - p) * (1 - p) * midY + 2 * (1 - p) * p * ctrlY + p * p * midY - 22;

      ctx.save();
      ctx.translate(shipX, shipY);

      // Hull
      ctx.beginPath();
      ctx.moveTo(-55, 0);
      ctx.lineTo(-60, 14);
      ctx.quadraticCurveTo(0, 20, 60, 14);
      ctx.lineTo(55, 0);
      ctx.closePath();
      ctx.fillStyle   = NAVY;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth   = 1;
      ctx.fill();
      ctx.stroke();

      // Deck stripe
      ctx.fillStyle = "#1B3A6B";
      ctx.fillRect(-50, -4, 105, 5);

      // Containers row 1
      const cols = [[GOLD, 0.85], ["#1B3A6B", 1], [GOLD, 0.70], ["#1B3A6B", 1]];
      cols.forEach(([color, alpha], i) => {
        ctx.globalAlpha  = alpha;
        ctx.fillStyle    = color;
        ctx.strokeStyle  = GOLD;
        ctx.lineWidth    = 0.5;
        roundRect(-48 + i * 26, -22, 22, 14, 2);
        ctx.fill(); ctx.stroke();
      });

      // Containers row 2
      [GOLD, "#1B3A6B", GOLD].forEach((color, i) => {
        ctx.globalAlpha  = 0.75;
        ctx.fillStyle    = color;
        roundRect(-40 + i * 28, -34, 24, 12, 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Bridge
      ctx.fillStyle   = "#1B3A6B";
      ctx.strokeStyle = GOLD;
      ctx.lineWidth   = 0.8;
      roundRect(28, -30, 26, 20, 3);
      ctx.fill(); ctx.stroke();

      // Bridge windows
      [[32,-26],[39,-26],[46,-26]].forEach(([wx, wy]) => {
        ctx.fillStyle   = GOLD;
        ctx.globalAlpha = 0.85;
        roundRect(wx, wy, 5, 5, 1);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Funnel
      ctx.fillStyle   = "#0f2447";
      ctx.strokeStyle = GOLD;
      ctx.lineWidth   = 0.8;
      roundRect(42, -42, 6, 14, 2);
      ctx.fill(); ctx.stroke();

      // Mast + flag
      ctx.strokeStyle = GOLD;
      ctx.lineWidth   = 1;
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, -4); ctx.stroke();
      ctx.fillStyle   = GOLD;
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(0,-34); ctx.lineTo(14,-30); ctx.lineTo(0,-24); ctx.fill();
      ctx.globalAlpha = 1;

      // Bow wave
      ctx.strokeStyle = GOLDF + "0.35)";
      ctx.lineWidth   = 1.2;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(-58, 8); ctx.quadraticCurveTo(-70,14,-80,18); ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Grid overlay — subtle perspective grid lines
    function drawGrid(W, H) {
      ctx.save();
      ctx.strokeStyle = WHITEF + "0.04)";
      ctx.lineWidth   = 0.5;
      for (let x = 0; x < W; x += 72) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();
    }

    // ── Main render loop ───────────────────────────────────────
    let last = 0;
    function render(ts) {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Grid
      drawGrid(W, H);

      // Sparkle particles
      particles.forEach((p) => {
        p.twinklePhase += p.twinkleSpeed;
        const alpha = p.o * (0.5 + 0.5 * Math.sin(p.twinklePhase));
        p.x += Math.cos(p.dir) * p.spd * 0.3;
        p.y += Math.sin(p.dir) * p.spd * 0.3;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.85 ? GOLDF + alpha + ")" : WHITEF + alpha + ")";
        ctx.fill();
      });

      // Dashed route
      routeDash += 0.6;
      drawRoute(W, H);

      // Floating product cards
      floaters.forEach((f) => drawFloater(f, ts));

      // Cargo ship
      drawShip(W, H, ts);

      frameId = requestAnimationFrame(render);
    }

    // ── Pause when page-shop is not active (perf) ─────────────
    const observer = new MutationObserver(() => {
      const shopPage = document.getElementById("page-shop");
      if (!shopPage) return;
      const isVisible = shopPage.classList.contains("active");
      if (isVisible && !frameId) {
        buildScene();
        frameId = requestAnimationFrame(render);
      } else if (!isVisible && frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    });

    const shopPage = document.getElementById("page-shop");
    if (shopPage) {
      observer.observe(shopPage, { attributes: true, attributeFilter: ["class"] });
    }

  })(); // end initShopHeroCanvas

});
