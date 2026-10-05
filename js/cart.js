/* =====================================================================
   cart.js — Carrito de compras CAPZONE
   Responsable de: agregar / eliminar / modificar cantidades, cálculo de
   totales, persistencia en localStorage y render de carrito.html.
   ===================================================================== */

const CART_KEY = 'capzone_cart';
const FREE_SHIPPING_FROM = 150000; // envío gratis desde $150.000
const SHIPPING_COST = 10000;

/* Identificador único de una línea del carrito (producto + variantes) */
function cartLineKey(productId, color, size) {
  return [productId, color || '', size || ''].join('|');
}

/** Lee el carrito desde localStorage. */
function getCart() {
  const cart = storageGet(CART_KEY, []);
  if (!Array.isArray(cart)) return [];
  return cart.filter((line) => line && Number.isFinite(Number(line.productId)) && Number(line.quantity) > 0);
}

/** Guarda el carrito y notifica el cambio. */
function saveCart(cart) {
  storageSet(CART_KEY, cart);
  updateCartBadge();
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}

/** Cantidad total de unidades en el carrito. */
function getCartCount() {
  return getCart().reduce((total, line) => total + Number(line.quantity), 0);
}

/**
 * Agrega un producto al carrito (o incrementa su cantidad).
 * @returns {boolean} true si se agregó correctamente.
 */
function addToCart(productId, options = {}) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Producto no encontrado', 'danger');
    return false;
  }
  if (product.stock <= 0) {
    showToast('Este producto está agotado', 'warning');
    return false;
  }

  const color = options.color && product.colors.includes(options.color) ? options.color : product.colors[0];
  const size = options.size && product.sizes.includes(options.size) ? options.size : product.sizes[0];
  const requested = Math.max(1, Number(options.quantity) || 1);

  const cart = getCart();
  const key = cartLineKey(product.id, color, size);
  const existing = cart.find((line) => line.key === key);
  const alreadyInCart = existing ? Number(existing.quantity) : 0;
  const allowed = Math.min(alreadyInCart + requested, product.stock);

  if (allowed === alreadyInCart) {
    showToast('Ya tienes el stock disponible de este producto (' + product.stock + ' u.)', 'warning');
    return false;
  }

  if (existing) {
    existing.quantity = allowed;
  } else {
    cart.push({
      key: key,
      productId: product.id,
      color: color,
      size: size,
      quantity: allowed,
      price: product.price
    });
  }

  saveCart(cart);
  showToast('Producto agregado al carrito', 'success');
  return true;
}

/** Elimina una línea del carrito. */
function removeFromCart(key) {
  saveCart(getCart().filter((line) => line.key !== key));
  showToast('Producto eliminado del carrito', 'info');
}

/**
 * Actualiza la cantidad de una línea respetando el stock.
 * @returns {number} cantidad final aplicada.
 */
function setCartQuantity(key, quantity) {
  const cart = getCart();
  const line = cart.find((item) => item.key === key);
  if (!line) return 0;

  const product = getProductById(line.productId);
  const max = product ? product.stock : 99;
  const next = Math.min(Math.max(1, Number(quantity) || 1), max);

  line.quantity = next;
  saveCart(cart);
  return next;
}

/** Vacía por completo el carrito. */
function clearCart() {
  saveCart([]);
  showToast('Carrito vaciado', 'info');
}

/** Actualiza el contador visible del navbar. */
function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = count;
    element.classList.toggle('d-none', count === 0);
    const host = element.closest('a, button');
    if (host) {
      host.setAttribute(
        'aria-label',
        count > 0
          ? 'Ver carrito de compras (' + count + (count === 1 ? ' producto)' : ' productos)')
          : 'Ver carrito de compras'
      );
    }
  });
}

/**
 * Calcula los totales del carrito.
 * subtotal  = suma de precios de lista (oldPrice cuando existe)
 * discount  = ahorro total del cliente
 * shipping  = $10.000 o gratis desde $150.000
 * total     = subtotal - discount + shipping
 */
function getCartTotals() {
  const cart = getCart();
  let listSubtotal = 0;
  let currentSubtotal = 0;
  let discount = 0;

  cart.forEach((line) => {
    const product = getProductById(line.productId);
    if (!product) return;
    const listPrice = product.oldPrice || product.price;
    listSubtotal += listPrice * line.quantity;
    currentSubtotal += product.price * line.quantity;
    if (product.oldPrice) discount += (product.oldPrice - product.price) * line.quantity;
  });

  const shipping = cart.length === 0 || currentSubtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;

  return {
    listSubtotal: listSubtotal,
    currentSubtotal: currentSubtotal,
    discount: discount,
    shipping: shipping,
    total: listSubtotal - discount + shipping,
    freeShippingFrom: FREE_SHIPPING_FROM,
    remainingForFreeShipping: Math.max(0, FREE_SHIPPING_FROM - currentSubtotal)
  };
}

/* =====================================================================
   Render de la página carrito.html
   ===================================================================== */
function cartLineHTML(line) {
  const product = getProductById(line.productId);
  if (!product) return '';
  const lineTotal = product.price * line.quantity;

  return [
    '<article class="cart-line" data-key="' + escapeHTML(line.key) + '">',
    '  <div class="cart-line-product">',
    '    <a href="' + productUrl(product.id) + '" class="cart-line-image">',
    '      <img src="' + resolveImage(product.images[0]) + '" alt="' + escapeHTML(product.name + ' en color ' + line.color) + '" loading="lazy" onerror="imgFallback(this)">',
    '    </a>',
    '    <div class="cart-line-info">',
    '      <p class="cart-line-category">' + escapeHTML(product.category) + ' · ' + escapeHTML(product.subcategory) + '</p>',
    '      <h3 class="cart-line-title"><a href="' + productUrl(product.id) + '">' + escapeHTML(product.name) + '</a></h3>',
    '      <p class="cart-line-variant">',
    '        <span class="color-dot" style="--dot:' + getCSSColor(line.color) + '"></span>',
    '        Color: ' + escapeHTML(line.color) + ' · Talla: ' + escapeHTML(line.size),
    '      </p>',
    '      <p class="cart-line-unit">' + formatCOP(product.price) + ' c/u</p>',
    '    </div>',
    '  </div>',
    '  <div class="cart-line-price"><span class="cart-label">Precio</span>' + formatCOP(product.price) + '</div>',
    '  <div class="cart-line-qty">',
    '    <span class="cart-label">Cantidad</span>',
    '    <div class="qty-control" role="group" aria-label="Cantidad de ' + escapeHTML(product.name) + '">',
    '      <button type="button" class="qty-btn" data-action="decrease" aria-label="Disminuir cantidad"><i class="bi bi-dash"></i></button>',
    '      <input type="number" class="qty-input" value="' + line.quantity + '" min="1" max="' + product.stock + '" inputmode="numeric" aria-label="Cantidad">',
    '      <button type="button" class="qty-btn" data-action="increase" aria-label="Aumentar cantidad"><i class="bi bi-plus"></i></button>',
    '    </div>',
    '    <small class="qty-stock">Máx. ' + product.stock + '</small>',
    '  </div>',
    '  <div class="cart-line-subtotal"><span class="cart-label">Subtotal</span>' + formatCOP(lineTotal) + '</div>',
    '  <button type="button" class="cart-line-remove" data-action="remove" aria-label="Eliminar ' + escapeHTML(product.name) + ' del carrito">',
    '    <i class="bi bi-trash"></i>',
    '  </button>',
    '</article>'
  ].join('');
}

function renderCartSummary() {
  const totals = getCartTotals();
  const target = document.getElementById('cartSummary');
  if (!target) return;

  const freeNote = totals.remainingForFreeShipping > 0
    ? '<div class="alert alert-info py-2 small mb-3"><i class="bi bi-truck me-1"></i>Te faltan <strong>' +
      formatCOP(totals.remainingForFreeShipping) + '</strong> para el envío gratis.</div>'
    : '<div class="alert alert-success py-2 small mb-3"><i class="bi bi-truck"></i> ¡Tienes envío gratis!</div>';

  target.innerHTML = [
    '<div class="summary-box">',
    '  <h2 class="h5 summary-title">Resumen del pedido</h2>',
    freeNote,
    '  <dl class="summary-list">',
    '    <div><dt>Subtotal</dt><dd>' + formatCOP(totals.listSubtotal) + '</dd></div>',
    '    <div class="summary-discount"><dt>Descuento</dt><dd>-' + formatCOP(totals.discount) + '</dd></div>',
    '    <div><dt>Envío</dt><dd>' + (totals.shipping === 0 ? 'Gratis' : formatCOP(totals.shipping)) + '</dd></div>',
    '    <div class="summary-total"><dt>TOTAL</dt><dd>' + formatCOP(totals.total) + '</dd></div>',
    '  </dl>',
    '  <a href="' + BASE_PATH + 'pages/checkout.html" class="btn btn-accent w-100 mb-2">Finalizar compra</a>',
    '  <a href="' + catalogUrl() + '" class="btn btn-outline-dark w-100">Continuar comprando</a>',
    '  <p class="small text-muted mt-3 mb-0 text-center"><i class="bi bi-shield-check me-1"></i>Compra segura · Devoluciones en 30 días</p>',
    '</div>'
  ].join('');
}

function renderCartPage() {
  const container = document.getElementById('cartContent');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = [
      '<div class="empty-state text-center py-5">',
      '  <i class="bi bi-cart-x"></i>',
      '  <h2 class="h4 mt-3">Tu carrito está vacío</h2>',
      '  <p class="text-muted">Aún no has agregado productos. Explora el catálogo y encuentra tu próxima gorra.</p>',
      '  <a href="' + catalogUrl() + '" class="btn btn-accent mt-2">Explorar catálogo</a>',
      '</div>'
    ].join('');
    const summary = document.getElementById('cartSummary');
    if (summary) summary.innerHTML = '';
    return;
  }

  container.innerHTML = [
    '<div class="cart-head">',
    '  <span>Producto</span><span>Precio</span><span>Cantidad</span><span>Subtotal</span><span class="visually-hidden">Acciones</span>',
    '</div>',
    cart.map(cartLineHTML).join(''),
    '<div class="cart-actions d-flex flex-wrap gap-2 mt-4">',
    '  <a href="' + catalogUrl() + '" class="btn btn-outline-dark"><i class="bi bi-arrow-left me-1"></i>Continuar comprando</a>',
    '  <button type="button" class="btn btn-outline-danger" id="clearCartBtn"><i class="bi bi-trash me-1"></i>Limpiar carrito</button>',
    '</div>'
  ].join('');

  renderCartSummary();
}

/* Delegación de eventos dentro del carrito */
function initCartPage() {
  const container = document.getElementById('cartContent');
  if (!container) return;

  container.addEventListener('click', (event) => {
    if (event.target.closest('#clearCartBtn')) {
      if (confirm('¿Seguro que deseas vaciar todo el carrito?')) clearCart();
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    const lineElement = event.target.closest('.cart-line');
    if (!actionButton || !lineElement) return;

    const key = lineElement.dataset.key;
    const input = lineElement.querySelector('.qty-input');
    const current = Number(input.value);

    switch (actionButton.dataset.action) {
      case 'increase':
        input.value = setCartQuantity(key, current + 1);
        break;
      case 'decrease':
        input.value = setCartQuantity(key, current - 1);
        break;
      case 'remove':
        if (confirm('¿Eliminar este producto del carrito?')) removeFromCart(key);
        break;
      default:
        break;
    }
  });

  container.addEventListener('change', (event) => {
    if (!event.target.classList.contains('qty-input')) return;
    const lineElement = event.target.closest('.cart-line');
    event.target.value = setCartQuantity(lineElement.dataset.key, event.target.value);
  });

  document.addEventListener('cart:updated', renderCartPage);
  renderCartPage();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initCartPage();
});
