/**
 * YUJAMRUTHA - Honey Cart & Direct WhatsApp Order System
 * Pure Farm Multifloral Honey Order Management
 */

const HONEY_PRODUCTS = {
  'honey-250g': {
    id: 'honey-250g',
    nameEn: 'Yujamrutha Multifloral Honey (250g)',
    nameKn: 'ಯುಜಾಮೃತ ಬಹುಪುಷ್ಪ ಜೇನುತುಪ್ಪ (250 ಗ್ರಾಂ)',
    size: '250g Glass Jar',
    price: 190,
    img: 'assets/images/honey-250g.jpg'
  },
  'honey-500g': {
    id: 'honey-500g',
    nameEn: 'Yujamrutha Multifloral Honey (500g)',
    nameKn: 'ಯುಜಾಮೃತ ಬಹುಪುಷ್ಪ ಜೇನುತುಪ್ಪ (500 ಗ್ರಾಂ)',
    size: '500g Glass Jar',
    price: 360,
    img: 'assets/images/honey-500g.jpg'
  },
  'honey-1kg': {
    id: 'honey-1kg',
    nameEn: 'Yujamrutha Multifloral Honey (1 kg)',
    nameKn: 'ಯುಜಾಮೃತ ಬಹುಪುಷ್ಪ ಜೇನುತುಪ್ಪ (1 ಕೆ.ಜಿ)',
    size: '1000g (1kg) Glass Jar',
    price: 680,
    img: 'assets/images/honey-1kg.jpg'
  }
};

// Cart state
let cart = JSON.parse(localStorage.getItem('yujamrutha_cart')) || {};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  initCartUI();
  updateCartBadge();
});

/**
 * Initializes Cart Drawer elements and event listeners
 */
function initCartUI() {
  const cartBtn = document.getElementById('navCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCloseBtn = document.getElementById('cartCloseBtn');

  if (cartBtn && cartOverlay && cartDrawer) {
    cartBtn.addEventListener('click', () => openCart());
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => closeCart());
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => closeCart());
  }
}

function openCart() {
  const overlay = document.getElementById('cartOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    updateCartUI();
    overlay.classList.add('active');
    drawer.classList.add('active');
  }
}

function closeCart() {
  const overlay = document.getElementById('cartOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
  }
}

/**
 * Adjusts quantity display on product cards
 */
function changeQty(productId, delta) {
  const qtyEl = document.getElementById(`qty-${productId}`);
  if (!qtyEl) return;
  let currentVal = parseInt(qtyEl.textContent) || 1;
  currentVal = Math.max(1, currentVal + delta);
  qtyEl.textContent = currentVal;
}

/**
 * Adds product to cart from product card
 */
function addToCart(productId) {
  const qtyEl = document.getElementById(`qty-${productId}`);
  const quantity = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;

  if (!cart[productId]) {
    cart[productId] = 0;
  }
  cart[productId] += quantity;

  saveCart();
  updateCartBadge();
  
  const isKn = typeof currentLang !== 'undefined' && currentLang === 'kn';
  const prod = HONEY_PRODUCTS[productId];
  const name = isKn ? prod.nameKn : prod.nameEn;
  const msg = isKn 
    ? `${name} (${quantity}) ಬುಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!` 
    : `Added ${quantity} x ${name} to order basket!`;
  
  if (typeof showToast === 'function') {
    showToast(msg);
  }

  // Reset product quantity counter back to 1
  if (qtyEl) qtyEl.textContent = '1';
}

/**
 * Modifies quantity directly inside the cart drawer
 */
function updateCartItemQty(productId, newQty) {
  if (newQty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = newQty;
  }
  saveCart();
  updateCartBadge();
  updateCartUI();
}

/**
 * Removes an item from cart
 */
function removeFromCart(productId) {
  delete cart[productId];
  saveCart();
  updateCartBadge();
  updateCartUI();

  const isKn = typeof currentLang !== 'undefined' && currentLang === 'kn';
  if (typeof showToast === 'function') {
    showToast(isKn ? 'ವಸ್ತು ತೆಗೆದುಹಾಕಲಾಗಿದೆ' : 'Item removed from basket');
  }
}

/**
 * Persists cart in localStorage
 */
function saveCart() {
  localStorage.setItem('yujamrutha_cart', JSON.stringify(cart));
}

/**
 * Updates the nav cart badge count
 */
function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (!badge) return;
  const totalCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  badge.textContent = totalCount;
  badge.style.display = totalCount > 0 ? 'flex' : 'none';
}

/**
 * Re-renders the contents of the Cart Drawer
 */
function updateCartUI() {
  const container = document.getElementById('cartItemsList');
  const totalEl = document.getElementById('cartTotalPrice');
  const emptyEl = document.getElementById('cartEmptyNotice');
  const footerEl = document.getElementById('cartFooter');
  if (!container) return;

  const isKn = typeof currentLang !== 'undefined' && currentLang === 'kn';
  const itemKeys = Object.keys(cart);

  if (itemKeys.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'block';

  let totalAmount = 0;
  let html = '';

  itemKeys.forEach(id => {
    const qty = cart[id];
    const prod = HONEY_PRODUCTS[id];
    if (!prod) return;

    const itemTotal = prod.price * qty;
    totalAmount += itemTotal;
    const name = isKn ? prod.nameKn : prod.nameEn;
    const removeLabel = isKn ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove';

    html += `
      <div class="cart-item">
        <img src="${prod.img}" alt="${name}" class="cart-item-img">
        <div>
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">₹${prod.price} x ${qty} = ₹${itemTotal}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${id}')">${removeLabel}</button>
        </div>
        <div class="qty-control" style="transform: scale(0.85); transform-origin: right center;">
          <button class="qty-btn" onclick="updateCartItemQty('${id}', ${qty - 1})">-</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn" onclick="updateCartItemQty('${id}', ${qty + 1})">+</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalEl) {
    totalEl.textContent = `₹${totalAmount}`;
  }
}

/**
 * Compiles itemized WhatsApp message and triggers WhatsApp link
 */
function checkoutWhatsApp() {
  const itemKeys = Object.keys(cart);
  if (itemKeys.length === 0) return;

  const isKn = typeof currentLang !== 'undefined' && currentLang === 'kn';
  let totalAmount = 0;
  let itemsSummary = '';

  itemKeys.forEach((id, index) => {
    const qty = cart[id];
    const prod = HONEY_PRODUCTS[id];
    if (!prod) return;
    const itemTotal = prod.price * qty;
    totalAmount += itemTotal;
    const name = isKn ? prod.nameKn : prod.nameEn;
    itemsSummary += `${index + 1}. ${name} - ${qty} jar(s) = ₹${itemTotal}%0A`;
  });

  const greeting = isKn ? 'ನಮಸ್ಕಾರ ಶ್ರೀ ಅಭಿನಂದನ್,' : 'Namaste Master Abhinandhan,';
  const orderTitle = isKn ? '*ಯುಜಾಮೃತ ಜೇನುತುಪ್ಪದ ನೂತನ ಆರ್ಡರ್*' : '*New Yujamrutha Farm Honey Order*';
  const totalText = isKn ? '*ಒಟ್ಟು ಮೊತ್ತ:*' : '*Total Estimated Amount:*';
  const deliveryPrompt = isKn 
    ? 'ದಯವಿಟ್ಟು ವಿತರಣೆ ಮತ್ತು ಪಾವತಿ ವಿವರ ತಿಳಿಸಿ. (ಡೆಲಿವರಿ ವಿಳಾಸ: ಕೋಟಿಕೊಪ್ಪ/ತೀರ್ಥಹಳ್ಳಿ ಅಥವಾ ಕೊರಿಯರ್)'
    : 'Please confirm availability, payment method and delivery to my address.';

  const waText = `${greeting}%0A%0A` +
    `${orderTitle}%0A` +
    `--------------------------------%0A` +
    `${itemsSummary}` +
    `--------------------------------%0A` +
    `${totalText} ₹${totalAmount}%0A%0A` +
    `${encodeURIComponent(deliveryPrompt)}%0A%0A` +
    `(Sent from Yujamrutha Web Portal)`;

  const waUrl = `https://wa.me/919880781965?text=${waText}`;

  if (typeof showToast === 'function') {
    showToast(isKn ? 'ವಾಟ್ಸಾಪ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...' : 'Connecting to WhatsApp...');
  }

  window.open(waUrl, '_blank');
}

/**
 * Direct Instant Buy for a single honey jar via WhatsApp
 */
function directOrderWhatsApp(productId) {
  const prod = HONEY_PRODUCTS[productId];
  if (!prod) return;

  const qtyEl = document.getElementById(`qty-${productId}`);
  const quantity = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;
  const isKn = typeof currentLang !== 'undefined' && currentLang === 'kn';
  const name = isKn ? prod.nameKn : prod.nameEn;
  const total = prod.price * quantity;

  const greeting = isKn ? 'ನಮಸ್ಕಾರ ಶ್ರೀ ಅಭಿನಂದನ್,' : 'Namaste Master Abhinandhan,';
  const orderText = isKn
    ? `${greeting} ನಾನು ಯುಜಾಮೃತ ನೈಸರ್ಗಿಕ ಜೇನುತುಪ್ಪವನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ಇಚ್ಛಿಸುತ್ತೇನೆ:%0A%0A*ಉತ್ಪನ್ನ:* ${encodeURIComponent(name)}%0A*ಪ್ರಮಾಣ:* ${quantity} ಸೀಸೆ (Jar)%0A*ಒಟ್ಟು ಅಂದಾಜು ಬೆಲೆ:* ₹${total}%0A%0Aಡೆಲಿವರಿ ಹಾಗೂ ಪಾವತಿಯ ವಿವರ ತಿಳಿಸಿ.`
    : `${greeting} I would like to order Yujamrutha pure farm honey:%0A%0A*Product:* ${encodeURIComponent(name)}%0A*Quantity:* ${quantity} Jar(s)%0A*Total Price:* ₹${total}%0A%0APlease share delivery & payment details.`;

  const waUrl = `https://wa.me/919880781965?text=${orderText}`;
  window.open(waUrl, '_blank');
}
