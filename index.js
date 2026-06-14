const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  const closeBtn = document.getElementById('closeBtn');

  closeBtn.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });




document.addEventListener('DOMContentLoaded', () => {
  const shopToggle = document.querySelector('.shop-toggle');
  const shopDropdown = document.querySelector('.shop-dropdown');
  const navLinks = document.getElementById('navLinks');
  const categoryLinks = document.querySelectorAll('.category-link');

  // Toggle dropdown on mobile
  shopToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // 🛑 prevent click from passing through
    if (window.innerWidth < 768) {
      shopDropdown.classList.toggle('active');
    }
  });

  // Close nav and dropdown after clicking a category link
  categoryLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        navLinks.classList.remove('active');       // close hamburger
        shopDropdown.classList.remove('active');   // close dropdown
      }
    });
  });

  // Optional: clicking outside closes the dropdown
  document.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      shopDropdown.classList.remove('active');
    }
  });
});







  let slides = document.querySelectorAll('.slide');
  let currentIndex = 0;

  setInterval(() => {
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('active');
  }, 4000); // change every 4 seconds




  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateCartCount() {
      const cartCountElement = document.getElementById('cartButton');
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountElement.textContent = `View Cart (${totalItems})`;
  }
  
  function displayCartItems() {
      const cartItemsContainer = document.getElementById('cartItems');
      const cartTotalElement = document.getElementById('cartTotal');
      cartItemsContainer.innerHTML = '';
  
      let total = 0;
  
      cart.forEach((item, index) => {
          const itemTotal = item.price * item.quantity;
          total += itemTotal;
  
          const productElement = document.createElement('div');
          productElement.classList.add('cart-item');
          productElement.innerHTML = `
              <p><strong>${item.name}</strong><br>
              ₦${item.price.toLocaleString()} × ${item.quantity} = ₦${itemTotal.toLocaleString()}</p>
              <div class="quantity-controls">
                  <button onclick="changeQuantity(${index}, -1)">−</button>
                  <button onclick="changeQuantity(${index}, 1)">+</button>
                  <button onclick="removeFromCart(${index})">Remove</button>
              </div>
          `;
          cartItemsContainer.appendChild(productElement);
      });
  
      cartTotalElement.textContent = `Total: ₦${total.toLocaleString()}`;
  }
  
  function changeQuantity(index, change) {
      cart[index].quantity += change;
      if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      displayCartItems();
  }
  
  function removeFromCart(index) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      displayCartItems();
  }
  
  document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', event => {
          const productElement = event.target.closest('.product-card');
          const productName = productElement.querySelector('h3').textContent;
             const productPrice = parseFloat(productElement.querySelector('.price').textContent.replace(/[^0-9.]/g, ''));
  
          const existingProduct = cart.find(item => item.name === productName);
  
          if (existingProduct) {
              existingProduct.quantity += 1;
          } else {
              cart.push({ name: productName, price: productPrice, quantity: 1 });
          }
  
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
          alert(`${productName} added to cart!`);
      });
  });
  
  document.getElementById('cartButton').addEventListener('click', () => {
      document.getElementById('cartModal').style.display = 'flex';
      displayCartItems();
  });
  
  document.getElementById('closeCart').addEventListener('click', () => {
      document.getElementById('cartModal').style.display = 'none';
  });
  
  updateCartCount();
  
  document.getElementById('checkoutButton').addEventListener('click', () => {
      if (cart.length === 0) {
          alert("Your cart is empty!");
          return;
      }
  
      let message = `Hello! I'd like to place an order:\n\n`;
      cart.forEach((item, index) => {
          const itemTotal = item.price * item.quantity;
          message += `${index + 1}. ${item.name} - ₦${item.price.toLocaleString()} × ${item.quantity} = ₦${itemTotal.toLocaleString()}\n`;
      });
  
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      message += `\n*Total:* ₦${total.toLocaleString()}\n`;
    //   message += `\nPlease send your *name* and *delivery address* 😊`;
  
      const phone = "2347088975744";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  
      cart = [];
      localStorage.removeItem('cart');
      updateCartCount();
      displayCartItems();
      alert("Your order has been sent to WhatsApp! We'll contact you shortly.");
  });
