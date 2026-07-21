/**
 * BridgeCart — main script
 * Handles: page switching, hero scene init, request form,
 *          WhatsApp link builder.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {

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
  const pages       = document.querySelectorAll(".page");
  const navLinks    = document.querySelectorAll(".site-nav-link");
  const requestForm = document.getElementById("request-form-card");
  const successMsg  = document.getElementById("success-msg");

  // ── Helpers ─────────────────────────────────────────────────
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

    if (window.AOS) AOS.refreshHard();
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // ── Global click delegation ──────────────────────────────────
  document.addEventListener("click", (e) => {
    // Page navigation
    const pageBtn = e.target.closest("[data-page-target]");
    if (pageBtn) {
      e.preventDefault();
      setActivePage(pageBtn.dataset.pageTarget);

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

    // Footer WhatsApp button
    const waBtn = e.target.closest("[data-whatsapp-link]");
    if (waBtn) {
      e.preventDefault();
      window.open(waBtn.dataset.whatsappLink, "_blank", "noopener,noreferrer");
    }
  });

  // ── Form listeners ───────────────────────────────────────────
  if (requestForm) requestForm.addEventListener("submit", handleRequestSubmit);

  // ── Boot ─────────────────────────────────────────────────────
  setActivePage("home");

});

// ── Mobile nav toggle ────────────────────────────────────────
const navToggle = document.querySelector(".nav-toggle");
const navLinksPanel = document.getElementById("site-nav-links");

if (navToggle && navLinksPanel) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinksPanel.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the menu when any link inside it is tapped
  navLinksPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinksPanel.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}