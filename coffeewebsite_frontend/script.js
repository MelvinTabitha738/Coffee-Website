document.addEventListener("DOMContentLoaded", () => {


  //  CONFIG

  const BASE_URL = "https://urban-coffee.onrender.com/api";
  const ORDERS_URL = `${BASE_URL}/orders/`;
  const CONTACT_URL = `${BASE_URL}/contact/`;


  //  SWIPER INITIALIZATION  

  const swiper = new Swiper(".slider-container", {
    loop: true,
    grabCursor: true,
    spaceBetween: 20,
    slidesPerView: 1,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      640: { slidesPerView: 1 },
      900: { slidesPerView: 2, spaceBetween: 30 },
      1200: { slidesPerView: 3, spaceBetween: 30 },
    }
  });

  /* ═══════════════════════════════════════════
     PHONE VALIDATION
  ═══════════════════════════════════════════ */
  function isValidKenyanPhone(phone) {
    return /^(?:\+254|254|0)?(7|1)\d{8}$/.test(phone.trim());
  }

  /* ═══════════════════════════════════════════
     CART STATE
  ═══════════════════════════════════════════ */
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: item.quantity ?? 1
  }));

  /* ═══════════════════════════════════════════
     ELEMENT REFERENCES
  ═══════════════════════════════════════════ */
  const cartIcon = document.getElementById("cart-icon");
  const cartCount = document.getElementById("cart-count");
  const cartDropdown = document.getElementById("cart-dropdown");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");

  const checkoutBtn = document.getElementById("checkout-btn");
  const clearCartBtn = document.getElementById("clear-cart-btn");

  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutItemsEl = document.getElementById("checkout-items");
  const checkoutTotalEl = document.getElementById("checkout-total");
  const closeCheckout = document.getElementById("close-checkout");
  const confirmOrderBtn = document.getElementById("confirm-order");

  const cancelModal = document.getElementById("cancel-modal");
  const confirmCancelBtn = document.getElementById("confirm-cancel");
  const keepOrderBtn = document.getElementById("keep-order");

  const successModal = document.getElementById("success-modal");
  const closeSuccessBtn = document.getElementById("close-success");
  const successDetails = document.getElementById("success-order-details");

  const failedModal = document.getElementById("failed-modal");
  const closeFailedBtn = document.getElementById("close-failed");
  const failedReason = document.getElementById("failed-reason");

  const nameInput = document.getElementById("customer-name");
  const phoneInput = document.getElementById("customer-phone");
  const paymentStatusBox = document.getElementById("payment-status");

  const paymentToast = document.getElementById("payment-toast");

  const addToCartBtns = document.querySelectorAll(".add-to-cart");
  const navLinks = document.querySelectorAll(".nav-link");
  const menuOpenBtn = document.getElementById("menu-open-button");
  const menuCloseBtn = document.getElementById("menu-close-button");
  const overlay = document.getElementById("menu-overlay");

  const contactForm = document.getElementById("contact-form");
  const contactFeedback = document.getElementById("contact-feedback");
  const contactSubmit = document.getElementById("contact-submit");

  /* ═══════════════════════════════════════════
     DYNAMIC ERROR ELEMENTS
  ═══════════════════════════════════════════ */
  const nameError = document.createElement("small");
  nameError.classList.add("error-text");
  nameInput?.after(nameError);

  const phoneError = document.createElement("small");
  phoneError.classList.add("error-text");
  phoneInput?.after(phoneError);

  /* ═══════════════════════════════════════════
     NAV MOBILE MENU
  ═══════════════════════════════════════════ */
  menuOpenBtn?.addEventListener("click", () => document.body.classList.add("show-mobile-menu"));
  menuCloseBtn?.addEventListener("click", () => document.body.classList.remove("show-mobile-menu"));
  overlay?.addEventListener("click", () => document.body.classList.remove("show-mobile-menu"));

  /* ─────────────────────────────────────────────
     NAV LINK SCROLLING (FIXED)
     - Works whether the link is an in-page anchor
       (#home, #about, etc.) or a normal page link.
     - Closes the mobile sidebar first, then scrolls
       manually so it isn't dropped mid-transition,
       and offsets for the fixed 80px header so the
       section isn't hidden underneath it.
  ───────────────────────────────────────────── */
  const HEADER_OFFSET = 80;

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";

      // Only intercept real in-page anchors like "#about".
      // Leave plain "#" or external links alone.
      if (href.startsWith("#") && href.length > 1) {
        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          // Close the mobile sidebar first
          document.body.classList.remove("show-mobile-menu");

          // Let the sidebar-close transition start, then scroll.
          // (Also works instantly fine on desktop where there's no sidebar.)
          requestAnimationFrame(() => {
            const targetY = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            window.scrollTo({ top: targetY, behavior: "smooth" });
          });
        } else {
          // No matching section found — just close the menu.
          document.body.classList.remove("show-mobile-menu");
        }
      } else {
        document.body.classList.remove("show-mobile-menu");
      }
    });
  });

  /* ═══════════════════════════════════════════
     TOAST NOTIFICATIONS
  ═══════════════════════════════════════════ */
  let toastTimer = null;

  function showToast(message, type = "info", durationMs = 4000) {
    if (!paymentToast) return;
    clearTimeout(toastTimer);
    paymentToast.textContent = message;
    paymentToast.className = `payment-toast show toast-${type}`;
    toastTimer = setTimeout(() => {
      paymentToast.classList.remove("show");
    }, durationMs);
  }

  /* ═══════════════════════════════════════════
     ADD TO CART
  ═══════════════════════════════════════════ */
  addToCartBtns.forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      const price = Number(button.dataset.price);

      const existing = cart.find(i => i.name === name);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id: Date.now(), name, price, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartUI();

      const orig = button.textContent;
      button.textContent = "✓ Added!";
      button.classList.add("added");
      setTimeout(() => {
        button.textContent = orig;
        button.classList.remove("added");
      }, 1200);
    });
  });

  /* ═══════════════════════════════════════════
     UPDATE CART UI
  ═══════════════════════════════════════════ */
  function updateCartUI() {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

    cartIcon?.classList.toggle("show", totalItems > 0);
    if (cartCount) cartCount.textContent = totalItems;

    if (clearCartBtn) clearCartBtn.style.display = totalItems > 0 ? "block" : "none";
    if (checkoutBtn) checkoutBtn.style.display = totalItems > 0 ? "block" : "none";

    renderCartItems();
  }

  /* ═══════════════════════════════════════════
     RENDER CART DROPDOWN ITEMS
  ═══════════════════════════════════════════ */
  function renderCartItems() {
    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          <span style="color:#888;font-size:0.82rem">KSh ${item.price}</span>
        </div>
        <div class="qty-controls">
          <button class="decrease-btn" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button class="increase-btn" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-btn" aria-label="Remove item">✕</button>
      `;
      div.querySelector(".increase-btn").addEventListener("click", () => changeQty(item.id, 1));
      div.querySelector(".decrease-btn").addEventListener("click", () => changeQty(item.id, -1));
      div.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(item.id));
      cartItemsEl.appendChild(div);
    });

    cartTotalEl.textContent = total;
  }

  /* ═══════════════════════════════════════════
     QUANTITY & REMOVE
  ═══════════════════════════════════════════ */
  function changeQty(id, delta) {
    cart = cart.map(i => { if (i.id === id) i.quantity += delta; return i; })
      .filter(i => i.quantity > 0);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
  }

  /* ═══════════════════════════════════════════
     CLEAR CART
  ═══════════════════════════════════════════ */
  clearCartBtn?.addEventListener("click", () => {
    if (!confirm("Clear all items from cart?")) return;
    clearCart();
  });

  function clearCart() {
    cart = [];
    localStorage.removeItem("cart");
    updateCartUI();
  }

  /* ═══════════════════════════════════════════
     CART TOGGLE
  ═══════════════════════════════════════════ */
  cartIcon?.addEventListener("click", (e) => {
    e.stopPropagation();
    cartDropdown?.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!cartDropdown?.contains(e.target) && !cartIcon?.contains(e.target)) {
      cartDropdown?.classList.remove("active");
    }
  });

  /* ═══════════════════════════════════════════
     CHECKOUT OPEN
  ═══════════════════════════════════════════ */
  checkoutBtn?.addEventListener("click", () => {
    if (cart.length === 0) return;
    renderCheckoutItems();
    checkoutModal?.classList.add("active");
    cartDropdown?.classList.remove("active");
  });

  function renderCheckoutItems() {
    if (!checkoutItemsEl || !checkoutTotalEl) return;
    checkoutItemsEl.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.innerHTML = `
        <span>${item.name} × ${item.quantity}</span>
        <span>KSh ${(item.price * item.quantity).toLocaleString()}</span>
      `;
      checkoutItemsEl.appendChild(div);
    });
    checkoutTotalEl.textContent = total.toLocaleString();
  }

  /* ═══════════════════════════════════════════
     CANCEL ORDER FLOW
  ═══════════════════════════════════════════ */
  closeCheckout?.addEventListener("click", () => {
    cancelModal?.classList.add("active");
  });

  keepOrderBtn?.addEventListener("click", () => {
    cancelModal?.classList.remove("active");
  });

  confirmCancelBtn?.addEventListener("click", () => {
    checkoutModal?.classList.remove("active");
    cancelModal?.classList.remove("active");
    // NOTE: We do NOT clear the cart here — user cancelled checkout, not the order.
    // The cart stays so they can try again.
    nameInput.value = "";
    phoneInput.value = "";
    nameError.textContent = "";
    phoneError.textContent = "";
    if (paymentStatusBox) paymentStatusBox.innerHTML = "";
  });

  /* ═══════════════════════════════════════════
     INPUT VALIDATION
  ═══════════════════════════════════════════ */
  nameInput?.addEventListener("input", () => {
    nameError.textContent = nameInput.value.trim() ? "" : "Name is required";
  });

  phoneInput?.addEventListener("input", () => {
    const ph = phoneInput.value.trim();
    if (!ph) { phoneError.textContent = ""; return; }
    if (!isValidKenyanPhone(ph)) {
      phoneError.textContent = "Enter a valid Kenyan number (e.g. 0712345678)";
      phoneInput.classList.add("invalid");
    } else {
      phoneError.textContent = "";
      phoneInput.classList.remove("invalid");
    }
  });

  /* ═══════════════════════════════════════════
     CONFIRM & PAY — M-PESA
  ═══════════════════════════════════════════ */
  confirmOrderBtn?.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    // ── Validate ────────────────────────────────────────────────────────────
    if (!name) {
      nameError.textContent = "Name is required";
      nameInput.focus();
      return;
    }

    if (!isValidKenyanPhone(phone)) {
      phoneError.textContent = "Enter a valid Kenyan number (e.g. 0712345678)";
      phoneInput.focus();
      return;
    }

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const orderData = {
      customer_name: name,
      customer_phone: phone,
      total_amount: total,
      items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))
    };

    // ── Lock UI ─────────────────────────────────────────────────────────────
    confirmOrderBtn.disabled = true;
    confirmOrderBtn.textContent = "⏳ Sending STK Push…";
    if (paymentStatusBox) {
      paymentStatusBox.innerHTML = "📲 Check your phone for the M-Pesa prompt…";
    }

    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || "Failed to place order";
        if (paymentStatusBox) paymentStatusBox.innerHTML = `❌ ${errMsg}`;
        showToast(`❌ ${errMsg}`, "error");
        return;
      }

      const orderId = data.order_id || data.id;

      if (!orderId) {
        if (paymentStatusBox) paymentStatusBox.innerHTML = "❌ Could not get order ID";
        return;
      }

      // ── STK sent — close checkout modal, start polling ───────────────────
      checkoutModal?.classList.remove("active");
      nameInput.value = "";
      phoneInput.value = "";
      if (paymentStatusBox) paymentStatusBox.innerHTML = "";

      showToast("📲 Check your phone for the M-Pesa prompt!", "info", 8000);
      startPaymentPolling(orderId, { name, phone, total });

    } catch (err) {
      console.error("[PAYMENT ERROR]", err);
      if (paymentStatusBox) paymentStatusBox.innerHTML = "❌ Server error. Check your connection.";
      showToast("❌ Server error. Please try again.", "error");

    } finally {
      confirmOrderBtn.disabled = false;
      confirmOrderBtn.textContent = "Confirm & Pay via M-Pesa";
    }
  });

  /* ═══════════════════════════════════════════
     PAYMENT STATUS POLLING
     Polls every 3s for up to 90s (30 attempts)
  ═══════════════════════════════════════════ */
  function startPaymentPolling(orderId, meta) {
    let attempts = 0;
    let errorCount = 0;
    const MAX = 30;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`${ORDERS_URL}${orderId}/`);
        const data = await res.json();

        if (!res.ok) {
          if (++errorCount >= 5) { stopPolling("⚠ Connection lost. Please refresh."); }
          return;
        }

        const payStatus = data.payment_status; // "PENDING" | "PAID" | "FAILED"

        if (payStatus === "PAID") {
          // ✅ SUCCESS
          clearInterval(interval);
          onPaymentSuccess(data);
          return;
        }

        if (payStatus === "FAILED") {
          // ❌ FAILED / CANCELLED
          clearInterval(interval);
          onPaymentFailed(data);
          return;
        }

        // Still PENDING — update toast
        showToast(`⏳ Waiting for payment… (${attempts}/${MAX})`, "warning", 4000);

      } catch (err) {
        errorCount++;
        if (errorCount >= 5) { stopPolling("⚠ Connection lost."); }
      }

      if (attempts >= MAX) {
        clearInterval(interval);
        showToast("⚠ Payment timed out. Please check M-Pesa and try again.", "error", 8000);
      }
    }, 3000);

    function stopPolling(msg) {
      clearInterval(interval);
      showToast(msg, "error", 8000);
    }
  }

  /* ═══════════════════════════════════════════
     ON PAYMENT SUCCESS
  ═══════════════════════════════════════════ */
  function onPaymentSuccess(data) {
    // Clear cart ONLY on confirmed success
    clearCart();

    // Build order details HTML
    const receipt = data.mpesa_receipt || data.transaction_id || "N/A";
    const items = (data.items || [])
      .map(i => `<div class="detail-row"><span>${i.name} × ${i.quantity}</span><span>KSh ${(parseFloat(i.price) * i.quantity).toLocaleString()}</span></div>`)
      .join("");

    if (successDetails) {
      successDetails.innerHTML = `
        ${items}
        <div class="detail-row" style="margin-top:8px;font-weight:700">
          <span>Total Paid</span>
          <span style="color:var(--brand-amber)">KSh ${parseFloat(data.total_amount || 0).toLocaleString()}</span>
        </div>
        <div class="detail-row receipt-row">
          <span class="receipt-label">M-Pesa Receipt</span>
          <span style="font-weight:700;color:#166534">${receipt}</span>
        </div>
        <div class="detail-row" style="margin-top:4px">
          <span>Order Status</span>
          <span style="color:var(--info);font-weight:600">☕ Preparing</span>
        </div>
      `;
    }

    successModal?.classList.add("active");
    showToast("✅ Payment successful! Your order is being prepared.", "success", 6000);
  }

  /* ═══════════════════════════════════════════
     ON PAYMENT FAILED / CANCELLED
  ═══════════════════════════════════════════ */
  function onPaymentFailed(data) {
    // DO NOT clear cart — let the user try again
    if (failedReason) {
      failedReason.textContent =
        "Your M-Pesa payment was cancelled or failed. Your cart is still saved — you can try again.";
    }
    failedModal?.classList.add("active");
    showToast("❌ Payment cancelled. Your cart is still saved.", "error", 6000);
  }

  /* ═══════════════════════════════════════════
     MODAL CLOSE BUTTONS
  ═══════════════════════════════════════════ */
  closeSuccessBtn?.addEventListener("click", () => {
    successModal?.classList.remove("active");
  });

  closeFailedBtn?.addEventListener("click", () => {
    failedModal?.classList.remove("active");
  });

  /* ═══════════════════════════════════════════
     CONTACT FORM — POST TO DJANGO BACKEND
  ═══════════════════════════════════════════ */
  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name")?.value.trim();
    const email = document.getElementById("contact-email")?.value.trim();
    const phone = document.getElementById("contact-phone")?.value.trim();
    const message = document.getElementById("contact-message")?.value.trim();

    if (!name || !email || !message) {
      showContactFeedback("Please fill in all required fields.", "error");
      return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = "Sending…";

    try {
      const res = await fetch(CONTACT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showContactFeedback("✅ " + data.message, "success");
        contactForm.reset();
        showToast("✅ Message sent successfully!", "success");
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : "Something went wrong. Please try again.";
        showContactFeedback("❌ " + errMsg, "error");
      }

    } catch (err) {
      showContactFeedback("❌ Network error. Please check your connection.", "error");
    } finally {
      contactSubmit.disabled = false;
      contactSubmit.textContent = "Send Message";
    }
  });

  function showContactFeedback(msg, type) {
    if (!contactFeedback) return;
    contactFeedback.textContent = msg;
    contactFeedback.className = `contact-feedback ${type}`;
    setTimeout(() => {
      contactFeedback.className = "contact-feedback";
    }, 7000);
  }

  /* ═══════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════ */
  updateCartUI();

}); // end DOMContentLoaded