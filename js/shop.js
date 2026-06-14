import { ProductsAPI, CategoriesAPI } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const closeBtn = document.getElementById('closeBtn');

    // --- Toast Notification Logic ---
    function showToast(message, icon = 'fa-check-circle') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.classList.add('toast');
      toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
      
      container.appendChild(toast);
      
      setTimeout(() => {
        if(container.contains(toast)) {
          toast.remove();
        }
      }, 3000);
    }

    // --- Smooth Scrolling for all internal links ---
    // This uses event delegation, so it will work for dynamically added links too.
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a');

      if (target && target.getAttribute('href')?.startsWith('#')) {
        const href = target.getAttribute('href');
        
        if (href === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });

          // If it's a link inside the mobile nav, close the nav
          if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
          }
        }
      }
    });

    // --- Mobile Nav Logic ---
    if (hamburger && navLinks && closeBtn) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
      });

      closeBtn.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });

      // Close mobile nav when clicking outside of it
      document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
          navLinks.classList.remove('active');
        }
      });
    }

    const shopToggle = document.querySelector('.shop-toggle');
    const shopDropdown = document.querySelector('.shop-dropdown');

    if (shopToggle && shopDropdown && navLinks) {
      shopToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.innerWidth <= 900) {
          shopDropdown.classList.toggle('active');
        }
      });

      // Event delegation to handle clicks on dynamic category links
      navLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-link')) {
          if (window.innerWidth <= 900) {
            navLinks.classList.remove('active');
            shopDropdown.classList.remove('active');
          }
        }
      });

      document.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          shopDropdown.classList.remove('active');
        }
      });
    }

    // --- Slideshow ---
    let slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
      let currentIndex = 0;
      setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
      }, 4000);
    }

    // --- Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartCount() {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.textContent = totalItems;
        if (totalItems > 0) {
          badge.classList.add('pulse-anim');
          setTimeout(() => badge.classList.remove('pulse-anim'), 300);
        }
      });

      document.querySelectorAll('.cart-text-count').forEach(span => {
        span.textContent = `(${totalItems})`;
        if (totalItems > 0) {
          span.style.color = '#ff3b3b'; // bright red accent
        } else {
          span.style.color = 'inherit';
        }
      });
    }

    function displayCartItems() {
      const cartItemsContainer = document.getElementById('cartItems');
      const cartTotalElement = document.getElementById('cartTotal');
      if (!cartItemsContainer || !cartTotalElement) return;

      cartItemsContainer.innerHTML = '';
      let total = 0;

      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const productElement = document.createElement('div');
        productElement.classList.add('cart-item');
        productElement.innerHTML = `
          <div class="cart-item-info">
            <p><strong>${item.name}</strong></p>
            <p>₦${item.price.toLocaleString()} × ${item.quantity} = ₦${itemTotal.toLocaleString()}</p>
          </div>
          <div class="quantity-controls">
            <button class="quantity-change" data-index="${index}" data-change="-1">−</button>
            <span>${item.quantity}</span>
            <button class="quantity-change" data-index="${index}" data-change="1">+</button>
            <button class="remove-item" data-index="${index}">Remove</button>
          </div>
        `;
        cartItemsContainer.appendChild(productElement);
      });

      cartTotalElement.innerHTML = `<span>Total:</span> <span>₦${total.toLocaleString()}</span>`;
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

    const cartItemsContainer = document.getElementById('cartItems');
    if (cartItemsContainer) {
      cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('quantity-change')) {
          const index = parseInt(target.dataset.index, 10);
          const change = parseInt(target.dataset.change, 10);
          changeQuantity(index, change);
        }
        if (target.classList.contains('remove-item')) {
          const index = parseInt(target.dataset.index, 10);
          removeFromCart(index);
        }
      });
    }

    const cartButtons = document.querySelectorAll('.cart-text-btn, .cart-icon-btn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartButton = document.getElementById('closeCart');

    if (cartButtons.length > 0 && cartDrawer && cartOverlay && closeCartButton) {
      function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
        displayCartItems();
      }

      function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
      }

      cartButtons.forEach(btn => btn.addEventListener('click', openCart));
      closeCartButton.addEventListener('click', closeCart);
      cartOverlay.addEventListener('click', closeCart);
    }

    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
          showToast("Your cart is empty!", 'fa-exclamation-circle');
          return;
        }

        let message = `Hello! I'd like to place an order:\n\n`;
        cart.forEach((item, index) => {
          const itemTotal = item.price * item.quantity;
          message += `${index + 1}. ${item.name} - ₦${item.price.toLocaleString()} × ${item.quantity} = ₦${itemTotal.toLocaleString()}\n`;
        });

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        message += `\n*Total:* ₦${total.toLocaleString()}\n`;

        const phone = "2347088975744";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        displayCartItems();
        showToast("Your order has been sent to WhatsApp! We'll contact you shortly.");
      });
    }

    // --- Image Modal Logic ---
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const closeImgModal = imageModal ? imageModal.querySelector('.close') : null;

    if (imageModal && modalImg && closeImgModal) {
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('product-image')) {
          let src = e.target.src;
          // If it's a cloudinary URL, remove all transformation segments to show full quality original
          if (src.includes('cloudinary.com')) {
            src = src.replace(/\/upload\/.*\/v/, '/upload/v');
          }
          modalImg.src = src;
          imageModal.style.display = "flex";
        }
      });

      closeImgModal.onclick = function() {
        imageModal.style.display = "none";
      };

      // Also close modal if clicking outside the image
      imageModal.onclick = function(e) {
        if (e.target === imageModal) {
          imageModal.style.display = "none";
        }
      };
    }

    // --- Dynamic Content Loading ---
    const productListContainer = document.getElementById('product-list');

    async function loadProducts() {
      if (!productListContainer) return;
      productListContainer.innerHTML = '<p class="loading-text">Loading our amazing scents...</p>';

      try {
        const products = await ProductsAPI.getAll();
        if (!products || products.length === 0) {
          productListContainer.innerHTML = '<p>No products found at the moment. Please check back later!</p>';
          return;
        }

        const productsByCategory = products.reduce((acc, product) => {
          const categoryName = (product.categories && product.categories.name) ? product.categories.name : 'Uncategorized';
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(product);
          return acc;
        }, {});

        let html = '';
        for (const category in productsByCategory) {
          const categoryId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          html += `
            <div class="category-section" id="${categoryId}">
              <h2 class="category-title clickable">${category} <i class="fas fa-chevron-down"></i></h2>
              <div class="product-container">
                ${productsByCategory[category].map(product => `
                  <div class="product-card ${!product.in_stock ? 'sold-out' : ''}" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                    <img src="${product.image_url}" alt="${product.name}" class="product-image" loading="lazy">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description || ''}</p>
                    <p class="price">₦${product.price.toLocaleString()}</p>
                    <button class="add-to-cart" ${!product.in_stock ? 'disabled' : ''}>
                      ${!product.in_stock ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
        productListContainer.innerHTML = html;

        // Setup Category Modal Logic
        const categoryModal = document.getElementById('categoryModal');
        const categoryList = document.getElementById('categoryList');
        const closeCategoryModal = document.querySelector('.close-category');

        if (categoryModal && categoryList) {
          let modalListHtml = '';
          for (const cat in productsByCategory) {
            const catId = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            modalListHtml += `<div class="category-list-item" data-target="${catId}">${cat}</div>`;
          }
          categoryList.innerHTML = modalListHtml;

          categoryList.querySelectorAll('.category-list-item').forEach(item => {
            item.addEventListener('click', () => {
              const targetId = item.getAttribute('data-target');
              const targetSection = document.getElementById(targetId);
              if (targetSection) {
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetSection.getBoundingClientRect().top;
                const offsetPosition = (elementRect - bodyRect) - offset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
              }
              categoryModal.classList.remove('show');
            });
          });

          document.querySelectorAll('.category-title.clickable').forEach(title => {
            title.addEventListener('click', () => {
              categoryModal.classList.add('show');
            });
          });

          if (closeCategoryModal) {
            closeCategoryModal.addEventListener('click', () => categoryModal.classList.remove('show'));
          }
          categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) categoryModal.classList.remove('show');
          });
        }

      } catch (error) {
        console.error('Error loading products:', error);
        productListContainer.innerHTML = `<p class="error-text">Oops! Something went wrong while fetching our products. Please try refreshing the page. Details: ${error.message}</p>`;
      }
    }

    async function loadDynamicCategories() {
      const navLinksContainer = document.getElementById('nav-category-links');
      const footerLinksContainer = document.getElementById('footer-category-links');

      if (!navLinksContainer || !footerLinksContainer) return;

      try {
        const categories = await CategoriesAPI.getAll();
        let navHtml = '';
        let footerHtml = '';

        categories.forEach(category => {
          const categoryId = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          navHtml += `<a href="#${categoryId}" class="category-link">${category.name}</a>`;
          footerHtml += `<li><a href="#${categoryId}">${category.name}</a></li>`;
        });

        navLinksContainer.innerHTML = navHtml;
        footerLinksContainer.innerHTML = footerHtml;
      } catch (error) {
        console.error('Error loading categories:', error);
        navLinksContainer.innerHTML = '<a href="#" class="category-link">Error loading</a>';
        footerLinksContainer.innerHTML = '<li><a href="#">Error loading</a></li>';
      }
    }

    if (productListContainer) {
      productListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart')) {
          const productCard = event.target.closest('.product-card');
          if (productCard.classList.contains('sold-out')) return;

          const productName = productCard.dataset.name;
          const productPrice = parseFloat(productCard.dataset.price);

          const existingProduct = cart.find(item => item.name === productName);

          if (existingProduct) {
            existingProduct.quantity += 1;
          } else {
            cart.push({ name: productName, price: productPrice, quantity: 1 });
          }

          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
          
          showToast(`${productName} added to cart!`);
          
          const button = event.target;
          button.textContent = 'Added!';
          setTimeout(() => {
              button.textContent = 'Add to Cart';
          }, 1000);
        }
      });
    }

    // Initial setup calls
    updateCartCount();
    loadProducts();
    loadDynamicCategories();

  } catch (error) {
    console.error("A critical error occurred during initialization:", error);
    const body = document.querySelector('body');
    if (body) {
      body.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; background-color: #fff3f3; border: 1px solid #ffcccc; color: #cc0000; margin: 20px;">
          <h1>Oops! The page could not be loaded.</h1>
          <p>A critical error occurred while setting up the application. Please check the console for details or try refreshing the page.</p>
          <pre style="white-space: pre-wrap; background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px; color: #333;">${error.stack}</pre>
        </div>
      `;
    }
  }
});
