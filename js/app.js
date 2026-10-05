/* =====================================================================
   app.js — Funciones globales de CAPZONE
   Inicialización, utilidades, tarjetas de producto, favoritos,
   notificaciones (toasts) y elementos comunes de todas las páginas.
   ===================================================================== */

/* Ruta base: "" en index.html y "../" en pages/*.html (data-base en <body>) */
const BASE_PATH = document.body.dataset.base || '';

/* Claves de almacenamiento local */
const LS_FAVORITES = 'capzone_favoritos';
const LS_RECENT = 'capzone_vistos';

/* Formato de moneda colombiana */
const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

/** Formatea un valor numérico como pesos colombianos ($89.900). */
function formatCOP(value) {
  return COP_FORMATTER.format(Math.round(Number(value) || 0));
}

/* -------------------------------------------------------------------
   Almacenamiento local seguro (evita errores en modo privado / file://)
   ------------------------------------------------------------------- */
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn('No se pudo leer localStorage:', key, error);
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('No se pudo escribir localStorage:', key, error);
    return false;
  }
}

/** Escapa texto antes de insertarlo en el DOM (evita inyección de HTML). */
function escapeHTML(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* -------------------------------------------------------------------
   Enlaces internos
   ------------------------------------------------------------------- */
function productUrl(id) {
  return BASE_PATH + 'pages/producto.html?id=' + encodeURIComponent(id);
}

function catalogUrl(query = '') {
  return BASE_PATH + 'pages/catalogo.html' + (query ? '?' + query : '');
}

/* -------------------------------------------------------------------
   Imágenes: respaldo local si la URL externa no responde
   ------------------------------------------------------------------- */
function imgFallback(image) {
  if (image.dataset.fallbackDone) {
    image.style.visibility = 'hidden';
    return;
  }
  image.dataset.fallbackDone = '1';
  image.src = BASE_PATH + 'assets/images/products/placeholder.svg';
}

/**
 * Resuelve la ruta de una imagen.
 * - Las URLs externas (http/https) se devuelven tal cual.
 * - Las rutas locales se escriben relativas a la raíz del proyecto
 *   ("assets/images/...") y se ajustan al nivel de la página actual.
 */
function resolveImage(url) {
  const source = String(url || '');
  if (/^(https?:)?\/\//i.test(source) || source.startsWith('data:')) return source;
  return BASE_PATH + source.replace(/^\.?\//, '');
}

/* -------------------------------------------------------------------
   Toasts (feedback de acciones)
   ------------------------------------------------------------------- */
function getToastContainer() {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '2000';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Muestra una notificación flotante.
 * @param {string} message Mensaje a mostrar (siempre se inserta como texto).
 * @param {'success'|'danger'|'info'|'warning'} type Variant Bootstrap.
 */
function showToast(message, type = 'success') {
  const icons = {
    success: 'check-circle-fill',
    danger: 'exclamation-triangle-fill',
    info: 'info-circle-fill',
    warning: 'exclamation-circle-fill'
  };
  const wrapper = document.createElement('div');
  wrapper.className = 'toast align-items-center border-0 bg-' + type + ' text-white';
  wrapper.setAttribute('role', 'status');

  const body = document.createElement('div');
  body.className = 'd-flex';

  const content = document.createElement('div');
  content.className = 'toast-body d-flex align-items-center gap-2';

  const icon = document.createElement('i');
  icon.className = 'bi bi-' + (icons[type] || icons.info);

  const text = document.createElement('span');
  text.textContent = message; // texto seguro, nunca HTML

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn-close btn-close-white me-2 m-auto';
  closeBtn.setAttribute('data-bs-dismiss', 'toast');
  closeBtn.setAttribute('aria-label', 'Cerrar');

  content.append(icon, text);
  body.append(content, closeBtn);
  wrapper.appendChild(body);
  getToastContainer().appendChild(wrapper);

  const toast = new bootstrap.Toast(wrapper, { delay: 2800 });
  toast.show();
  wrapper.addEventListener('hidden.bs.toast', () => wrapper.remove());
}

/* -------------------------------------------------------------------
   Estados de stock
   ------------------------------------------------------------------- */
function getStockState(product) {
  if (product.stock <= 0) return { label: 'Agotado', className: 'danger' };
  if (product.stock <= 5) return { label: 'Últimas unidades', className: 'warning' };
  return { label: 'En stock', className: 'success' };
}

/** Estrellas de valoración (Bootstrap Icons). */
function renderStars(rating, reviews) {
  const full = Math.round(Number(rating) || 0);
  let html = '<span class="stars" role="img" aria-label="Valoración ' + escapeHTML(rating) + ' de 5">';
  for (let i = 1; i <= 5; i += 1) {
    html += '<i class="bi ' + (i <= full ? 'bi-star-fill' : 'bi-star') + '"></i>';
  }
  html += '</span>';
  if (reviews !== undefined) {
    html += '<span class="rating-text">' + escapeHTML(rating) + ' · ' + escapeHTML(reviews) + ' reseñas</span>';
  }
  return html;
}

/** Puntos de color para las variantes del producto. */
function renderColorDots(colors, limit = 4) {
  return colors
    .slice(0, limit)
    .map(
      (color) =>
        '<span class="color-dot" style="--dot:' + getCSSColor(color) + '" title="' +
        escapeHTML(color) + '"><span class="visually-hidden">' + escapeHTML(color) + '</span></span>'
    )
    .join('');
}

const CSS_COLORS = {
  Negro: '#111111',
  Blanco: '#ffffff',
  Rojo: '#DC3545',
  Azul: '#0d6efd',
  Verde: '#198754',
  Gris: '#8a8a8a',
  Beige: '#e6d5b8',
  Camel: '#c68b4c',
  Burdeos: '#7b1e3a',
  Rosa: '#f7a8c4',
  Morado: '#7c5cd6',
  Naranja: '#D97706',
  Dorado: '#d4af37',
  Plateado: '#c0c0c0'
};

function getCSSColor(color) {
  return CSS_COLORS[color] || '#cccccc';
}

/* -------------------------------------------------------------------
   Favoritos (localStorage)
   ------------------------------------------------------------------- */
function getFavorites() {
  const list = storageGet(LS_FAVORITES, []);
  return Array.isArray(list) ? list.map(Number).filter(Number.isFinite) : [];
}

function isFavorite(productId) {
  return getFavorites().includes(Number(productId));
}

function toggleFavorite(productId) {
  const id = Number(productId);
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  let added;

  if (index >= 0) {
    favorites.splice(index, 1);
    added = false;
  } else {
    favorites.unshift(id);
    added = true;
  }

  storageSet(LS_FAVORITES, favorites);
  updateFavoritesBadge();
  syncFavoriteButtons();
  showToast(
    added ? 'Producto agregado a favoritos' : 'Producto eliminado de favoritos',
    added ? 'success' : 'info'
  );
  return added;
}

function updateFavoritesBadge() {
  const count = getFavorites().length;
  document.querySelectorAll('[data-fav-count]').forEach((element) => {
    element.textContent = count;
    element.classList.toggle('d-none', count === 0);
    const host = element.closest('a, button');
    if (host) {
      host.setAttribute('aria-label', count > 0 ? 'Ver favoritos (' + count + ')' : 'Ver favoritos');
    }
  });
}

/** Mantiene sincronizados los iconos de corazón de todos los productos. */
function syncFavoriteButtons() {
  const favorites = getFavorites();
  document.querySelectorAll('[data-fav]').forEach((button) => {
    const active = favorites.includes(Number(button.dataset.fav));
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    const icon = button.querySelector('i');
    if (icon) icon.classList.toggle('bi-heart-fill', active);
  });
}

/* -------------------------------------------------------------------
   Productos vistos recientemente
   ------------------------------------------------------------------- */
function getRecentlyViewed() {
  const list = storageGet(LS_RECENT, []);
  return Array.isArray(list) ? list.map(Number).filter(Number.isFinite) : [];
}

function addRecentlyViewed(productId) {
  const id = Number(productId);
  if (!Number.isFinite(id)) return;
  const recent = getRecentlyViewed().filter((item) => item !== id);
  recent.unshift(id);
  storageSet(LS_RECENT, recent.slice(0, 8));
}

/* -------------------------------------------------------------------
   Tarjeta de producto (usada en home, catálogo, relacionados, etc.)
   ------------------------------------------------------------------- */
function productCardHTML(product) {
  const discount = calcDiscount(product);
  const stockState = getStockState(product);
  const mainImage = resolveImage(product.images[0]);
  const hoverImage = resolveImage(product.images[1] || product.images[0]);
  const url = productUrl(product.id);
  const alt = product.name + ' — gorra ' + product.category.toLowerCase() + ' ' +
    product.subcategory.toLowerCase() + ' en color ' + product.colors[0].toLowerCase();

  const badges = [
    discount > 0 ? '<span class="badge-product badge-sale">-' + discount + '%</span>' : '',
    product.isNew ? '<span class="badge-product badge-new">Nuevo</span>' : '',
    product.stock <= 0 ? '<span class="badge-product badge-out">Agotado</span>' : ''
  ].join('');

  const oldPrice = product.oldPrice
    ? '<s class="price-old">' + formatCOP(product.oldPrice) + '</s>'
    : '';

  return [
    '<article class="product-card" data-product-id="' + product.id + '">',
    '  <div class="product-media">',
    '    <a href="' + url + '" class="product-image-link" aria-label="Ver ' + escapeHTML(product.name) + '">',
    '      <img src="' + mainImage + '" alt="' + escapeHTML(alt) + '" class="product-img" loading="lazy" onerror="imgFallback(this)">',
    '      <img src="' + hoverImage + '" alt="" aria-hidden="true" class="product-img product-img-hover" loading="lazy" onerror="imgFallback(this)">',
    '    </a>',
    '    <div class="product-badges">' + badges + '</div>',
    '    <button type="button" class="fav-btn" data-fav="' + product.id + '" aria-label="Agregar ' + escapeHTML(product.name) + ' a favoritos" aria-pressed="false">',
    '      <i class="bi bi-heart"></i>',
    '    </button>',
    '    <span class="stock-pill stock-pill-' + stockState.className + '">' + stockState.label + '</span>',
    '  </div>',
    '  <div class="product-body">',
    '    <p class="product-category">' + escapeHTML(product.category) + ' · ' + escapeHTML(product.subcategory) + '</p>',
    '    <h3 class="product-title"><a href="' + url + '">' + escapeHTML(product.name) + '</a></h3>',
    '    <div class="product-rating">' + renderStars(product.rating, product.reviews) + '</div>',
    '    <div class="product-colors"><span class="color-label">Colores:</span>' + renderColorDots(product.colors) + '</div>',
    '    <div class="product-price"><span class="price-current">' + formatCOP(product.price) + '</span>' + oldPrice + '</div>',
    '    <div class="product-actions">',
    '      <a href="' + url + '" class="btn btn-outline-dark btn-sm flex-grow-1">Ver producto</a>',
    '      <button type="button" class="btn btn-accent btn-sm flex-grow-1" data-add-cart="' + product.id + '"' + (product.stock <= 0 ? ' disabled' : '') + '>',
    '        <i class="bi bi-bag-plus me-1"></i>' + (product.stock <= 0 ? 'Agotado' : 'Agregar'),
    '      </button>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('');
}

/** Pinta una lista de productos dentro de un contenedor. */
function renderProducts(list, container) {
  if (!container) return;
  container.innerHTML = list.map(productCardHTML).join('');
  syncFavoriteButtons();
}

/** Mensaje amigable cuando no hay resultados. */
function emptyStateHTML(message) {
  return [
    '<div class="empty-state text-center py-5">',
    '  <i class="bi bi-emoji-frown"></i>',
    '  <h3 class="h5 mt-3">' + escapeHTML(message) + '</h3>',
    '  <p class="text-muted">Prueba con otro término o limpia los filtros para ver todo el catálogo.</p>',
    '  <a href="' + catalogUrl() + '" class="btn btn-accent mt-2">Ver catálogo completo</a>',
    '</div>'
  ].join('');
}

/* -------------------------------------------------------------------
   Acciones globales por delegación de eventos
   ------------------------------------------------------------------- */
document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add-cart]');
  if (addButton && !addButton.disabled) {
    addToCart(Number(addButton.dataset.addCart), { quantity: 1 });
    return;
  }

  const favoriteButton = event.target.closest('[data-fav]');
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.fav);
    return;
  }

  const buyButton = event.target.closest('[data-buy-now]');
  if (buyButton && !buyButton.disabled) {
    const added = addToCart(Number(buyButton.dataset.buyNow), {
      quantity: Number(buyButton.dataset.qty) || 1,
      color: buyButton.dataset.color,
      size: buyButton.dataset.size
    });
    if (added) window.location.href = BASE_PATH + 'pages/checkout.html';
  }
});

/* -------------------------------------------------------------------
   Modal de usuario (demo) — se inyecta para no repetir HTML
   ------------------------------------------------------------------- */
function injectUserModal() {
  if (document.getElementById('userModal')) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = [
    '<div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">',
    '  <div class="modal-dialog modal-dialog-centered">',
    '    <div class="modal-content">',
    '      <div class="modal-header">',
    '        <h2 class="modal-title h5" id="userModalLabel"><i class="bi bi-person-circle me-2"></i>Mi cuenta</h2>',
    '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>',
    '      </div>',
    '      <div class="modal-body">',
    '        <p class="text-muted small">Ingresa para guardar tus favoritos y seguir tus pedidos.</p>',
    '        <form id="loginForm" novalidate>',
    '          <div class="mb-3">',
    '            <label for="loginEmail" class="form-label">Correo electrónico</label>',
    '            <input type="email" class="form-control" id="loginEmail" placeholder="tu@correo.com" required>',
    '            <div class="invalid-feedback">Ingresa un correo válido.</div>',
    '          </div>',
    '          <div class="mb-3">',
    '            <label for="loginPassword" class="form-label">Contraseña</label>',
    '            <input type="password" class="form-control" id="loginPassword" minlength="6" placeholder="••••••••" required>',
    '            <div class="invalid-feedback">Mínimo 6 caracteres.</div>',
    '          </div>',
    '          <button type="submit" class="btn btn-accent w-100">Ingresar</button>',
    '        </form>',
    '      </div>',
    '      <div class="modal-footer justify-content-center">',
    '        <span class="small text-muted">Demo de frontend: no se envía ni se guarda ninguna contraseña.</span>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');
  document.body.appendChild(wrapper.firstElementChild);

  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal')).hide();
    form.reset();
    form.classList.remove('was-validated');
    showToast('Sesión iniciada (demo)', 'success');
  });
}

/* -------------------------------------------------------------------
   Newsletter
   ------------------------------------------------------------------- */
function initNewsletter() {
  document.querySelectorAll('[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input.value || !input.checkValidity()) {
        input.classList.add('is-invalid');
        input.focus();
        return;
      }
      input.classList.remove('is-invalid');
      input.value = '';
      showToast('¡Gracias! Tu correo fue registrado en el newsletter.', 'success');
    });
    const input = form.querySelector('input[type="email"]');
    if (input) input.addEventListener('input', () => input.classList.remove('is-invalid'));
  });
}

/* -------------------------------------------------------------------
   Botón volver arriba
   ------------------------------------------------------------------- */
function initBackToTop() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.id = 'backToTop';
  button.setAttribute('aria-label', 'Volver al inicio');
  button.innerHTML = '<i class="bi bi-arrow-up"></i>';
  document.body.appendChild(button);

  const toggle = () => button.classList.toggle('is-visible', window.scrollY > 500);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* -------------------------------------------------------------------
   Secciones dinámicas del home
   ------------------------------------------------------------------- */
function initHomeSections() {
  const featured = document.getElementById('featuredGrid');
  if (featured) {
    renderProducts(PRODUCTS.filter((product) => product.featured).slice(0, 8), featured);
  }

  const bestsellers = document.getElementById('bestsellersGrid');
  if (bestsellers) {
    renderProducts(
      PRODUCTS.filter((product) => product.bestseller).sort((a, b) => b.reviews - a.reviews).slice(0, 4),
      bestsellers
    );
  }

  const recentSection = document.getElementById('recentSection');
  if (recentSection) {
    const recent = getRecentlyViewed()
      .map((id) => getProductById(id))
      .filter(Boolean)
      .slice(0, 4);
    const grid = document.getElementById('recentGrid');
    if (recent.length && grid) {
      renderProducts(recent, grid);
    } else {
      recentSection.classList.add('d-none');
    }
  }
}

/* -------------------------------------------------------------------
   Inicialización común
   ------------------------------------------------------------------- */
function initApp() {
  injectUserModal();
  initNewsletter();
  initBackToTop();
  updateFavoritesBadge();
  updateCartBadge();
  syncFavoriteButtons();
  initHomeSections();
}

document.addEventListener('DOMContentLoaded', initApp);
