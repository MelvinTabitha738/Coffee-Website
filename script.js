document.addEventListener("DOMContentLoaded", () => {

  
    //  NAV MENU
 
  const navLinks = document.querySelectorAll(".nav-link");
  const menuOpenButton = document.querySelector("#menu-open-button");
  const menuCloseButton = document.querySelector("#menu-close-button");
  const overlay = document.getElementById("menu-overlay");

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


  
    //  CART ELEMENTS
  
  const cartIcon = document.getElementById("cart-icon");
  const cartCount = document.getElementById("cart-count");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  const cartDropdown = document.getElementById("cart-dropdown");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");


  
    //  CART STATE 
  
  let cart = JSON.parse(localStorage.getItem("cart")) || [];


cart = cart.map(item => ({
  name: item.name,
  price: Number(item.price),
  quantity: item.quantity ?? 1,
  id: item.id
}));

updateCartUI();


  
    //  ADD TO CART
  
  addToCartButtons.forEach(button => {
    button.addEventListener("click", () => {

      const name = button.dataset.name;
      const price = Number(button.dataset.price);

      cart.push({
        name,
        price,
        quantity: 1,
        id: Date.now()
      });

      localStorage.setItem("cart", JSON.stringify(cart));

      updateCartUI();

      // button feedback
      const originalText = button.textContent;

      button.textContent = "Added!";
      button.classList.add("added");

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("added");
      }, 1000);
    });
  });


  
    //CART UI
  
  function updateCartUI() {
    if (cart.length > 0) {
      cartIcon?.classList.add("show");
      cartCount.textContent = cart.length;
    } else {
      cartIcon?.classList.remove("show");
      cartCount.textContent = 0;
    }

    renderCart();
  }


 
    //  RENDER CART 
  
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

      
        //  EVENT LISTENERS 
      
      div.querySelector(".increase-btn").addEventListener("click", () => {
        increaseQty(item.id);
      });

      div.querySelector(".decrease-btn").addEventListener("click", () => {
        decreaseQty(item.id);
      });

      div.querySelector(".remove-btn").addEventListener("click", () => {
        removeFromCart(item.id);
      });

      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = total;
  }


  
    //  INCREASE QTY
  
  window.increaseQty = function (id) {
    cart = cart.map(item => {
      if (item.id === id) {
        item.quantity += 1;
      }
      return item;
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
  };


  
    //  DECREASE QTY
  
  window.decreaseQty = function (id) {
    cart = cart.map(item => {
      if (item.id === id && item.quantity > 1) {
        item.quantity -= 1;
      }
      return item;
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
  };


  
    //  REMOVE FROM CART
  
  window.removeFromCart = function (id) {
    cart = cart.filter(item => item.id !== id);

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
  };


  
    //  CART TOGGLE
  
  cartIcon?.addEventListener("click", () => {
    cartDropdown?.classList.toggle("active");
  });


  
    //  SWIPER
   
  const swiper = new Swiper('.slider-wrapper', {
    direction: 'horizontal',
    loop: true,
    grabCursor: true,
    spaceBetween: 25,

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });

});