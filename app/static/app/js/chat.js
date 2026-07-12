/**
 * BridgeCart — chat page script
 *
 * PHASE 1: MOCK MODE
 * ------------------
 * MOCK_MODE = true simulates the AI conversation locally so the full
 * experience can be tested with zero backend. When the Django endpoint
 * is ready, set MOCK_MODE = false and implement sendToBackend() —
 * nothing else needs to change.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const MOCK_MODE = true;

  // ── DOM refs ─────────────────────────────────────────────────
  const messagesEl = document.getElementById("chat-messages");
  const formEl     = document.getElementById("chat-form");
  const inputEl    = document.getElementById("chat-input");
  const sendEl     = document.getElementById("chat-send");
  const chipsEl    = document.getElementById("chat-chips");

  if (!messagesEl || !formEl) return; // not on the chat page

  // Conversation history — sent to the backend on every turn later
  const history = [];

  // ── Message rendering ────────────────────────────────────────

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /** Append a plain text message bubble. role: "ai" | "user" */
  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `msg msg--${role}`;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.innerHTML = role === "ai"
      ? '<i class="bi bi-truck"></i>'
      : '<i class="bi bi-person-fill"></i>';

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    row.append(avatar, bubble);
    messagesEl.appendChild(row);
    history.push({ role, content: text });
    scrollToBottom();
  }

  /** Append AI message followed by a grid of product cards. */
  function addProductResults(introText, products) {
    addMessage("ai", introText);

    const grid = document.createElement("div");
    grid.className = "chat-products";

    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "chat-product";
      card.innerHTML = `
        <div class="chat-product-img" aria-hidden="true">${p.emoji}</div>
        <div class="chat-product-body">
          <p class="chat-product-cat">${p.category}</p>
          <p class="chat-product-name">${p.name}</p>
          <p class="chat-product-note">${p.note}</p>
          <div class="chat-product-footer">
            <div class="chat-product-price">
              $${p.price}
              <small>+ shipping</small>
            </div>
            <button type="button" class="chat-product-pick"
                    data-name="${p.name}" data-price="${p.price}">
              Get quote
            </button>
          </div>
        </div>`;
      grid.appendChild(card);
    });

    messagesEl.appendChild(grid);
    scrollToBottom();
  }

  /** Typing indicator control */
  let typingRow = null;
  function showTyping() {
    typingRow = document.createElement("div");
    typingRow.className = "msg msg--ai";
    typingRow.innerHTML = `
      <div class="chat-avatar" aria-hidden="true"><i class="bi bi-truck"></i></div>
      <div class="bubble typing" aria-label="Assistant is typing">
        <span></span><span></span><span></span>
      </div>`;
    messagesEl.appendChild(typingRow);
    scrollToBottom();
  }
  function hideTyping() {
    if (typingRow) { typingRow.remove(); typingRow = null; }
  }

  // ── MOCK AI (Phase 1) ────────────────────────────────────────
  // A tiny state machine that demonstrates the full experience:
  // greeting → clarify → "search" → product cards → handoff.

  const MOCK_PRODUCTS = {
    phone: [
      { emoji:"📱", category:"Electronics", name:"Samsung Galaxy A15",  price:145, note:"6.5\" AMOLED, 128GB, dual SIM — best seller in Monrovia." },
      { emoji:"📱", category:"Electronics", name:"Tecno Spark 20",     price:112, note:"6.6\" display, 256GB, 50MP camera, big battery." },
      { emoji:"📱", category:"Electronics", name:"Redmi 13C",          price:105, note:"6.74\" 90Hz screen, 128GB — great value pick." },
    ],
    earbuds: [
      { emoji:"🎧", category:"Electronics", name:"QCY T13 ANC",        price:19,  note:"Active noise cancelling, 30h battery, punchy bass." },
      { emoji:"🎧", category:"Electronics", name:"Redmi Buds 5",       price:27,  note:"46dB ANC, 40h battery, USB-C fast charge." },
    ],
    sneakers: [
      { emoji:"👟", category:"Footwear",    name:"Classic Canvas Low", price:14,  note:"Vulcanised sole, 10 colours, sizes 38–46." },
      { emoji:"👟", category:"Footwear",    name:"AirFlow Runner",     price:32,  note:"Mesh upper, cushioned sole — daily wear favourite." },
    ],
    chair: [
      { emoji:"🪑", category:"Furniture",   name:"ErgoMesh Office Chair", price:95, note:"High-back mesh, lumbar support, holds 150kg." },
      { emoji:"🪑", category:"Furniture",   name:"Compact Task Chair",    price:58, note:"Space-saving, adjustable height, breathable back." },
    ],
  };

  function detectTopic(text) {
    const t = text.toLowerCase();
    if (/(phone|smartphone|samsung|iphone|tecno|redmi)/.test(t)) return "phone";
    if (/(earbud|headphone|airpod|audio)/.test(t))               return "earbuds";
    if (/(sneaker|shoe|footwear|trainer)/.test(t))               return "sneakers";
    if (/(chair|office|desk|furniture)/.test(t))                 return "chair";
    return null;
  }

  let mockStage = "start"; // start → clarified → done
  let mockTopic = null;

  function mockRespond(userText) {
    const topic = detectTopic(userText) || mockTopic;

    // First message with a recognisable topic → ask one clarifying question
    if (mockStage === "start" && topic) {
      mockTopic = topic;
      mockStage = "clarified";
      const questions = {
        phone:    "Nice — what's your budget, and do you prefer Samsung, Tecno, or are you open to anything?",
        earbuds:  "Got it. What's your budget? And do you want noise cancelling or is long battery life more important?",
        sneakers: "On it. What size do you wear, and do you prefer canvas or a sporty running style?",
        chair:    "Sure. Is this for long work days (ergonomic, high-back) or something compact for a small space?",
      };
      return { type:"text", text:questions[topic] };
    }

    // First message with no clear topic → ask what they need
    if (mockStage === "start") {
      return { type:"text", text:"Welcome to BridgeCart! Tell me what product you're looking for — a phone, earbuds, sneakers, furniture, anything — and your rough budget, and I'll find you options from our verified suppliers in China." };
    }

    // Second message → "search" and show product cards
    if (mockStage === "clarified") {
      mockStage = "done";
      const results = MOCK_PRODUCTS[mockTopic] || MOCK_PRODUCTS.phone;
      return {
        type:"products",
        text:"Here's what I found from our verified suppliers. Prices include our sourcing fee — shipping to Liberia is quoted separately based on weight:",
        products: results,
      };
    }

    // After results → handoff message
    return { type:"text", text:"Great choice! Tap \"Get quote\" on the product you want and our team will confirm the final price with shipping on WhatsApp within 24 hours. You only pay after you approve the quote." };
  }

  // ── BACKEND CALL (Phase 2 — swap point) ──────────────────────
  /**
   * When the Django endpoint is ready:
   *   1. Set MOCK_MODE = false
   *   2. This function POSTs the conversation to /api/chat/
   *      and returns the same shape as mockRespond():
   *      { type: "text"|"products", text: string, products?: [...] }
   */
  async function sendToBackend(userText) {
    const response = await fetch("/api/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ message: userText, history }),
    });
    if (!response.ok) throw new Error(`Chat API error: ${response.status}`);
    return response.json();
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
  }

  // ── Send flow ────────────────────────────────────────────────
  async function handleSend(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Hide quick chips after first user message
    if (chipsEl && !chipsEl.hidden) chipsEl.hidden = true;

    addMessage("user", trimmed);
    inputEl.value = "";
    autosize();
    sendEl.disabled = true;
    showTyping();

    try {
      let reply;
      if (MOCK_MODE) {
        // Simulated thinking delay for realism
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
        reply = mockRespond(trimmed);
      } else {
        reply = await sendToBackend(trimmed);
      }

      hideTyping();
      if (reply.type === "products") {
        addProductResults(reply.text, reply.products);
      } else {
        addMessage("ai", reply.text);
      }
    } catch (err) {
      hideTyping();
      addMessage("ai", "Something went wrong on my end. Please try again — or reach us directly on WhatsApp: +231 77 900 5985.");
      console.error(err);
    } finally {
      sendEl.disabled = false;
      inputEl.focus();
    }
  }

  // ── Events ───────────────────────────────────────────────────

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend(inputEl.value);
  });

  // Enter sends, Shift+Enter makes a new line
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });

  // Auto-grow the textarea up to its CSS max-height
  function autosize() {
    inputEl.style.height = "auto";
    inputEl.style.height = `${inputEl.scrollHeight}px`;
  }
  inputEl.addEventListener("input", autosize);

  // Quick prompt chips
  if (chipsEl) {
    chipsEl.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-chip]");
      if (chip) handleSend(chip.dataset.chip);
    });
  }

  // "Get quote" buttons on product cards → WhatsApp handoff
  messagesEl.addEventListener("click", (e) => {
    const pick = e.target.closest(".chat-product-pick");
    if (!pick) return;
    const msg = encodeURIComponent(
      "Hi BridgeCart! I was chatting with your assistant and I want a quote for:\n\n" +
      `Product: ${pick.dataset.name}\n` +
      `Listed estimate: $${pick.dataset.price} + shipping\n\n` +
      "Please confirm the final price with shipping to Liberia. Thank you!"
    );
    window.open(`https://wa.me/231779005985?text=${msg}`, "_blank", "noopener,noreferrer");
    addMessage("ai", `Perfect — I've prepared your quote request for the ${pick.dataset.name}. Our team will confirm the final price on WhatsApp shortly. Anything else you'd like to find?`);
  });

  // ── Boot: welcome message ────────────────────────────────────
  addMessage("ai", "Hi! 👋 I'm the BridgeCart assistant. Tell me what you're looking for and your budget — I'll search our verified suppliers in China and bring you real options with prices.");
  inputEl.focus();

});