document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
  const menuOpenButton = document.querySelector("#menu-open-button");
    const menuCloseButton = document.querySelector("#menu-close-button");
  // toogle mobile menu visibility
    menuOpenButton.addEventListener("mouseover", () => {
      document.body.classList.add("show-mobile-menu");
    });
  // close menu when the close button is clicked
    menuCloseButton.addEventListener("mouseover", () => {
      document.body.classList.remove("show-mobile-menu");
    });
// close the menu when the navlink is clicked
    const overlay = document.getElementById("menu-overlay");
   overlay.addEventListener("click", () => {
  document.body.classList.remove("show-mobile-menu");
});
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    document.body.classList.remove("show-mobile-menu"); // Close the menu
  });
});

  
  const swiper = new Swiper('.slider-wrapper', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
  grabCursor:true,
  spaceBetween: 25,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    dynamicBullets: true,

  },
  

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // And if we need scrollbar
  // scrollbar: {
  //   el: '.swiper-scrollbar',
  // },
  // responsive breakpoints
breakpoints: {
  0:{
    slidesPerView:1
  },
  768 :{
    slidesPerView:2
  },
  1024:{
    slidesPerView:3
  },
}
  });
  // document.querySelectorAll('.user-image').forEach((img, index) => {
  //   img.addEventListener('click', () => {
  //     swiper.slideToLoop(index);
  //   });
  // });

  // const form = document.getElementById('contact-form');
  // const message = document.getElementById('thank-you-message');

  // form.addEventListener('submit', async function (e) {
  //   e.preventDefault();

    // Convert form data to JSON
  //   const data = {
  //     name: form.elements["name"].value,
  //     email: form.elements["email"].value,
  //     message: form.elements["message"].value
  //   };

  //   try {
  //     const response = await fetch(form.action, {
  //       method: 'POST',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(data)
  //     });

  //     if (response.ok) {
  //       form.reset();
  //       message.style.display = 'block';
  //     } else {
  //       alert('Something went wrong. Please try again.');
  //     }
  //   } catch (error) {
  //     alert('Failed to submit the form.');
  //   }
  // });

});
  