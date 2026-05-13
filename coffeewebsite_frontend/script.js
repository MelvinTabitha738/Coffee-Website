document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================== */
  const BASE_URL = "http://127.0.0.1:8000/api";

  const API_URL = `${BASE_URL}/orders/`;
  const STATUS_URL = `${BASE_URL}/orders/`;

  /* =========================
     PHONE VALIDATION
  ========================== */
  function isValidKenyanPhone(phone) {
    return /^(?:\+254|254|0)?(7|1)\d{8}$/.test(phone);
  }

  /* =========================
     CART STATE
  ========================== */
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: item.quantity ?? 1
  }));

  /* =========================
     ELEMENTS
  ========================== */

  const cartIcon = document.getElementById("cart-icon");
  const cartCount = document.getElementById("cart-count");
  const cartDropdown = document.getElementById("cart-dropdown");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  const checkoutBtn = document.getElementById("checkout-btn");
  const clearCartBtn = document.getElementById("clear-cart-btn");

  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutItems = document.getElementById("checkout-items");
  const checkoutTotal = document.getElementById("checkout-total");

  const closeCheckout = document.getElementById("close-checkout");
  const confirmOrderBtn = document.getElementById("confirm-order");

  const cancelModal = document.getElementById("cancel-modal");
  const confirmCancelBtn = document.getElementById("confirm-cancel");
  const keepOrderBtn = document.getElementById("keep-order");

  const successModal = document.getElementById("success-modal");

  const nameInput = document.getElementById("customer-name");
  const phoneInput = document.getElementById("customer-phone");

  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  const navLinks = document.querySelectorAll(".nav-link");
  const menuOpenButton = document.querySelector("#menu-open-button");
  const menuCloseButton = document.querySelector("#menu-close-button");
  const overlay = document.getElementById("menu-overlay");

  /* =========================
     PAYMENT STATUS BOX
  ========================== */
  const paymentStatusBox = document.getElementById("payment-status");

  /* =========================
     NAV MENU
  ========================== */
  menuOpenButton?.addEventListener("click", () => {
    document.body.classList.add("show-mobile-menu");
  });

  menuCloseButton?.addEventListener("click", () => {
    document.body.classList.remove("show-mobile-menu");
  });

  overlay?.addEventListener("click", () => {
    document.body.classList.remove("show-mobile-menu");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      document.body.classList.remove("show-mobile-menu");
    });
  });

  /* =========================
     ERROR MESSAGES
  ========================== */
  const nameError = document.createElement("small");
  nameError.classList.add("error-text");
  nameInput?.after(nameError);

  const phoneError = document.createElement("small");
  phoneError.classList.add("error-text");
  phoneInput?.after(phoneError);

  /* =========================
     ADD TO CART
  ========================== */
  addToCartButtons.forEach(button => {

    button.addEventListener("click", () => {

      const name = button.dataset.name;
      const price = Number(button.dataset.price);

      const existingItem = cart.find(item => item.name === name);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: Date.now(),
          name,
          price,
          quantity: 1
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      updateCartUI();

      const originalText = button.textContent;

      button.textContent = "Added!";
      button.classList.add("added");

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("added");
      }, 1000);

    });

  });

  /* =========================
     UPDATE CART UI
  ========================== */
  function updateCartUI() {

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartIcon?.classList.toggle("show", totalItems > 0);

    if (cartCount) cartCount.textContent = totalItems;

    cartDropdown?.classList.toggle("hidden", totalItems === 0);

    if (clearCartBtn) {
      clearCartBtn.style.display = totalItems > 0 ? "inline-block" : "none";
    }

    if (checkoutBtn) {
      checkoutBtn.style.display = totalItems > 0 ? "inline-block" : "none";
    }

    renderCart();
  }

  /* =========================
     RENDER CART
  ========================== */
  function renderCart() {

    if (!cartItemsContainer || !cartTotal) return;

    cartItemsContainer.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

      total += item.price * item.quantity;

      const div = document.createElement("div");

      div.classList.add("cart-item");

      div.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          KSh ${item.price}
        </div>

        <div class="qty-controls">
          <button class="decrease-btn">−</button>
          <span>${item.quantity}</span>
          <button class="increase-btn">+</button>
        </div>

        <button class="remove-btn">X</button>
      `;

      div.querySelector(".increase-btn")
        .addEventListener("click", () => changeQty(item.id, 1));

      div.querySelector(".decrease-btn")
        .addEventListener("click", () => changeQty(item.id, -1));

      div.querySelector(".remove-btn")
        .addEventListener("click", () => removeFromCart(item.id));

      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = total;
  }

  /* =========================
     CHANGE QTY
  ========================== */
  function changeQty(id, delta) {

    cart = cart
      .map(item => {
        if (item.id === id) item.quantity += delta;
        return item;
      })
      .filter(item => item.quantity > 0);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartUI();
  }

  /* =========================
     REMOVE ITEM
  ========================== */
  function removeFromCart(id) {

    cart = cart.filter(item => item.id !== id);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartUI();
  }

  /* =========================
     CLEAR CART
  ========================== */
  clearCartBtn?.addEventListener("click", () => {

    if (!confirm("Clear all items in cart?")) return;

    cart = [];

    localStorage.removeItem("cart");

    updateCartUI();
  });

  /* =========================
     CART TOGGLE
  ========================== */
  cartIcon?.addEventListener("click", () => {
    cartDropdown?.classList.toggle("active");
  });

  /* =========================
     CHECKOUT
  ========================== */
  checkoutBtn?.addEventListener("click", () => {

    if (cart.length === 0) return;

    renderCheckout();

    checkoutModal?.classList.add("active");
  });

  function renderCheckout() {

    checkoutItems.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

      total += item.price * item.quantity;

      const div = document.createElement("div");

      div.textContent =
        `${item.name} x ${item.quantity} - KSh ${item.price * item.quantity}`;

      checkoutItems.appendChild(div);
    });

    checkoutTotal.textContent = total;
  }

  /* =========================
     CANCEL ORDER
  ========================== */
  closeCheckout?.addEventListener("click", () => {
    cancelModal?.classList.add("active");
  });

  confirmCancelBtn?.addEventListener("click", () => {

    checkoutModal?.classList.remove("active");
    cancelModal?.classList.remove("active");

    cart = [];

    localStorage.removeItem("cart");

    updateCartUI();

    nameInput.value = "";
    phoneInput.value = "";

    nameError.textContent = "";
    phoneError.textContent = "";

    if (paymentStatusBox) {
      paymentStatusBox.innerHTML = "";
    }

  });

  keepOrderBtn?.addEventListener("click", () => {
    cancelModal?.classList.remove("active");
  });

  /* =========================
     VALIDATION
  ========================== */
  nameInput?.addEventListener("input", () => {

    nameError.textContent =
      nameInput.value.trim() ? "" : "Name is required";

  });

  phoneInput?.addEventListener("input", () => {

    const phone = phoneInput.value.trim();

    if (!phone) {

      phoneError.textContent = "";
      return;
    }

    if (!isValidKenyanPhone(phone)) {

      phoneError.textContent =
        "Enter valid Kenyan number (07XXXXXXXX)";

      phoneInput.classList.add("invalid");

    } else {

      phoneError.textContent = "";

      phoneInput.classList.remove("invalid");
    }
  });

  /* =========================
     CONFIRM ORDER
  ========================== */
  confirmOrderBtn?.addEventListener("click", async () => {

    console.log("========== START PAYMENT ==========");

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    console.log("Customer Name:", name);
    console.log("Customer Phone:", phone);
    console.log("Cart:", cart);

    if (!name) {

      nameError.textContent = "Name is required";

      console.error("Name missing");

      return;
    }

    if (!isValidKenyanPhone(phone)) {

      phoneError.textContent = "Enter valid Kenyan number";

      console.error("Invalid phone");

      return;
    }

    const orderData = {

      customer_name: name,

      customer_phone: phone,

      total_amount: cart.reduce(
        (s, i) => s + i.price * i.quantity,
        0
      ),

      items: cart
    };

    console.log("Sending Order Data:", orderData);

    confirmOrderBtn.disabled = true;

    confirmOrderBtn.textContent = "Sending STK Push...";

    try {

      const res = await fetch(API_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(orderData)
      });

      console.log("POST Response Status:", res.status);

      const data = await res.json();

      console.log("FULL ORDER RESPONSE:", data);

      if (!res.ok) {

        console.error("Backend rejected request");

        throw new Error("Order failed");
      }

      const orderId =
        data.order_id ||
        data.id ||
        data.order?.id;

      console.log("EXTRACTED ORDER ID:", orderId);

      if (!orderId) {

        console.error("ORDER ID NOT FOUND");

        paymentStatusBox.innerHTML = `
          ❌ Order ID Missing
        `;

        return;
      }

      checkoutModal?.classList.remove("active");

      paymentStatusBox.innerHTML = `
        ⏳ Waiting for payment...
      `;

      trackPayment(orderId);

      nameInput.value = "";
      phoneInput.value = "";

    } catch (err) {

      console.error("PAYMENT ERROR:", err);

      paymentStatusBox.innerHTML = `
        ❌ Server Error
      `;

    } finally {

      confirmOrderBtn.disabled = false;

      confirmOrderBtn.textContent =
        "Confirm & Pay via M-Pesa";
    }

  });

  /* =========================
     PAYMENT TRACKING
  ========================== */
  async function trackPayment(orderId) {

    console.log("========== START POLLING ==========");
    console.log("Tracking Order ID:", orderId);

    let attempts = 0;
    let errorCount = 0;

    const interval = setInterval(async () => {

      attempts++;

      const pollingURL = `${STATUS_URL}${orderId}/`;

      console.log("Polling Attempt:", attempts);
      console.log("Polling URL:", pollingURL);

      try {

        const res = await fetch(pollingURL);

        console.log("Polling Response Status:", res.status);

        if (!res.ok) {

          console.error("Polling request failed");

          paymentStatusBox.innerHTML = `
            ⚠ Polling Failed (${res.status})
          `;

          return;
        }

        const data = await res.json();

        console.log("FULL STATUS RESPONSE:", data);

        const paymentStatus =
          data.payment_status ??
          data.status ??
          data.payment ??
          data.paymentState;

        console.log("DETECTED PAYMENT STATUS:", paymentStatus);
        console.log("TYPE:", typeof paymentStatus);

        const paymentSuccess =
          paymentStatus === true ||
          paymentStatus === "SUCCESS" ||
          paymentStatus === "PAID" ||
          paymentStatus === "COMPLETED";

        const paymentFailed =
          paymentStatus === false ||
          paymentStatus === "FAILED" ||
          paymentStatus === "CANCELLED";

        if (paymentSuccess) {

          console.log("PAYMENT SUCCESS DETECTED");

          paymentStatusBox.innerHTML = `
            ✅ Payment Successful
          `;

          successModal?.classList.add("active");

          cart = [];

          localStorage.removeItem("cart");

          updateCartUI();

          clearInterval(interval);

          return;
        }

        if (paymentFailed) {

          console.log("PAYMENT FAILED DETECTED");

          paymentStatusBox.innerHTML = `
            ❌ Payment Failed
          `;

          clearInterval(interval);

          return;
        }

        paymentStatusBox.innerHTML = `
          ⏳ Waiting for payment...
          <br>
          Attempt ${attempts}/30
          <br>
          Status: ${paymentStatus}
        `;

      } catch (err) {

        errorCount++;

        console.error("POLLING ERROR:", err);

        paymentStatusBox.innerHTML = `
          ⚠ Connection Error (${errorCount})
        `;

        if (errorCount >= 5) {

          console.error("Too many polling errors");

          clearInterval(interval);

          paymentStatusBox.innerHTML = `
            ❌ Polling stopped
          `;
        }
      }

      if (attempts >= 30) {

        console.warn("Polling timeout reached");

        clearInterval(interval);

        paymentStatusBox.innerHTML = `
          ⚠ Payment Timeout
        `;
      }

    }, 3000);
  }

  /* =========================
     INIT
  ========================== */
  updateCartUI();

});