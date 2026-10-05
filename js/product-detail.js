/* =====================================================================
   product-detail.js — Página de producto (producto.html?id=N)
   Galía, variantes, cantidad, botones de compra, acordeones,
   productos relacionados y vistos recientemente.
   ===================================================================== */

const detailState = { product: null, color: '', size: '', quantity: 1 };

/** Lee el id del producto desde la URL. */
function getProductIdFromURL() {
  return Number(new URLSearchParams(window.location.search).get('id'));
}

/* -------------------------------------------------------------------
   Galería
   ------------------------------------------------------------------- */
function galleryHTML(product) {
  const thumbs = product.images
    .map(
      (image, index) =>
        '<button type="button" class="gallery-thumb' + (index === 0 ? ' is-active' : '') + '" data-image-index="' + index + '" aria-label="Ver imagen ' + (index + 1) + ' de ' + escapeHTML(product.name) + '">' +
        '<img src="' + resolveImage(image) + '" alt="Miniatura ' + (index + 1) + ' de ' + escapeHTML(product.name) + '" loading="lazy" onerror="imgFallback(this)">' +
        '</button>'
    )
    .join('');

  return [
    '<div class="gallery-main">',
    '  <img id="galleryMain" src="' + resolveImage(product.images[0]) + '" alt="' + escapeHTML(product.name + ' — gorra ' + product.category.toLowerCase()) + '" onerror="imgFallback(this)">',
    '</div>',
    '<div class="gallery-thumbs" role="group" aria-label="Miniaturas del producto">' + thumbs + '</div>'
  ].join('');
}

function bindGallery(product) {
  const gallery = document.getElementById('productGallery');
  if (!gallery) return;

  gallery.addEventListener('click', (event) => {
    const thumb = event.target.closest('.gallery-thumb');
    if (!thumb) return;
    const index = Number(thumb.dataset.imageIndex);
    const main = document.getElementById('galleryMain');
    main.src = resolveImage(product.images[index]);
    main.alt = product.name + ' — imagen ' + (index + 1) + ' de ' + product.images.length;
    gallery.querySelectorAll('.gallery-thumb').forEach((item) => item.classList.remove('is-active'));
    thumb.classList.add('is-active');
  });
}

/* -------------------------------------------------------------------
   Información, variantes y cantidad
   ------------------------------------------------------------------- */
function variantButtonsHTML(type, values, selected) {
  return values
    .map((value) => {
      const active = value === selected ? ' is-active' : '';
      const dot = type === 'color' ? '<span class="variant-dot" style="--dot:' + getCSSColor(value) + '"></span>' : '';
      return '<button type="button" class="variant-btn' + active + '" data-variant="' + type + '" data-value="' + escapeHTML(value) + '" aria-pressed="' + (value === selected) + '">' +
        dot + escapeHTML(value) + '</button>';
    })
    .join('');
}

function productInfoHTML(product) {
  const discount = calcDiscount(product);
  const stockState = getStockState(product);
  const favoriteActive = isFavorite(product.id);

  return [
    '<p class="product-kicker">' + escapeHTML(product.category) + ' · ' + escapeHTML(product.subcategory) + '</p>',
    '<h1 class="product-detail-title">' + escapeHTML(product.name) + '</h1>',
    '<div class="product-detail-rating">' + renderStars(product.rating, product.reviews) + '</div>',

    '<div class="product-detail-price">',
    '  <span class="price-current">' + formatCOP(product.price) + '</span>',
    product.oldPrice ? '<s class="price-old">' + formatCOP(product.oldPrice) + '</s>' : '',
    discount > 0 ? '<span class="badge-discount">-' + discount + '%</span>' : '',
    '</div>',

    '<p class="stock-indicator stock-' + stockState.className + '">',
    '  <i class="bi bi-circle-fill"></i> ' + stockState.label +
    (product.stock > 0 ? ' · ' + product.stock + ' unidades disponibles' : ''),
    '</p>',

    '<p class="product-detail-description">' + escapeHTML(product.description) + '</p>',

    '<div class="variant-block">',
    '  <p class="variant-label">Color: <strong id="selectedColor">' + escapeHTML(detailState.color) + '</strong></p>',
    '  <div class="variant-list" id="colorList">' + variantButtonsHTML('color', product.colors, detailState.color) + '</div>',
    '</div>',

    '<div class="variant-block">',
    '  <p class="variant-label">Talla: <strong id="selectedSize">' + escapeHTML(detailState.size) + '</strong></p>',
    '  <div class="variant-list" id="sizeList">' + variantButtonsHTML('size', product.sizes, detailState.size) + '</div>',
    '</div>',

    '<div class="purchase-row">',
    '  <div class="qty-control qty-control-lg" role="group" aria-label="Cantidad">',
    '    <button type="button" class="qty-btn" data-detail-qty="-1" aria-label="Disminuir cantidad"><i class="bi bi-dash"></i></button>',
    '    <input type="number" id="detailQty" class="qty-input" value="1" min="1" max="' + product.stock + '" aria-label="Cantidad a comprar"' + (product.stock <= 0 ? ' disabled' : '') + '>',
    '    <button type="button" class="qty-btn" data-detail-qty="1" aria-label="Aumentar cantidad"><i class="bi bi-plus"></i></button>',
    '  </div>',
    '  <span class="qty-hint" id="qtyHint">Máximo ' + product.stock + ' unidades</span>',
    '</div>',

    '<div class="detail-actions">',
    '  <button type="button" class="btn btn-accent btn-lg flex-grow-1" id="btnAddDetail"' + (product.stock <= 0 ? ' disabled' : '') + '>',
    '    <i class="bi bi-bag-plus me-2"></i>' + (product.stock <= 0 ? 'Producto agotado' : 'Agregar al carrito'),
    '  </button>',
    '  <button type="button" class="btn btn-dark btn-lg flex-grow-1" id="btnBuyNow"' + (product.stock <= 0 ? ' disabled' : '') + '>Comprar ahora</button>',
    '  <button type="button" class="btn btn-outline-dark btn-lg detail-fav' + (favoriteActive ? ' is-active' : '') + '" id="btnFavDetail" data-fav="' + product.id + '" aria-pressed="' + favoriteActive + '" aria-label="Añadir a favoritos">',
    '    <i class="bi ' + (favoriteActive ? 'bi-heart-fill' : 'bi-heart') + '"></i>',
    '  </button>',
    '</div>',

    '<ul class="detail-perks">',
    '  <li><i class="bi bi-truck"></i> Envío gratis en pedidos desde ' + formatCOP(FREE_SHIPPING_FROM) + '</li>',
    '  <li><i class="bi bi-arrow-repeat"></i> Cambios y devoluciones en 30 días</li>',
    '  <li><i class="bi bi-shield-check"></i> Pago 100% seguro (demo)</li>',
    '</ul>'
  ].join('');
}

function renderBreadcrumb(product) {
  const breadcrumb = document.getElementById('productBreadcrumb');
  if (!breadcrumb) return;
  breadcrumb.innerHTML = [
    '<ol class="breadcrumb breadcrumb-custom">',
    '  <li class="breadcrumb-item"><a href="' + BASE_PATH + 'index.html">Inicio</a></li>',
    '  <li class="breadcrumb-item"><a href="' + catalogUrl() + '">Catálogo</a></li>',
    '  <li class="breadcrumb-item"><a href="' + catalogUrl('categoria=' + encodeURIComponent(product.category)) + '">' + escapeHTML(product.category) + '</a></li>',
    '  <li class="breadcrumb-item active" aria-current="page">' + escapeHTML(product.name) + '</li>',
    '</ol>'
  ].join('');
}

function renderAccordions(product) {
  const container = document.getElementById('productAccordion');
  if (!container) return;

  const features = (product.features || [])
    .map((feature) => '<li><i class="bi bi-check2-circle me-2"></i>' + escapeHTML(feature) + '</li>')
    .join('');

  const item = (id, title, body, open) => [
    '<div class="accordion-item custom-accordion-item">',
    '  <h2 class="accordion-header">',
    '    <button class="accordion-button' + (open ? '' : ' collapsed') + '" type="button" data-bs-toggle="collapse" data-bs-target="#acc-' + id + '" aria-expanded="' + (open ? 'true' : 'false') + '">' + title + '</button>',
    '  </h2>',
    '  <div id="acc-' + id + '" class="accordion-collapse collapse' + (open ? ' show' : '') + '" data-bs-parent="#productAccordion">',
    '    <div class="accordion-body">' + body + '</div>',
    '  </div>',
    '</div>'
  ].join('');

  container.innerHTML = [
    item('desc', 'Descripción', '<p class="mb-0">' + escapeHTML(product.description) + '</p>', true),
    item('features', 'Características', '<ul class="feature-list mb-0">' + features + '</ul>', false),
    item('material', 'Material', '<p class="mb-0"><strong>' + escapeHTML(product.material) + '</strong>. Lavar a mano con agua fría y secar al aire para conservar la forma y los colores.', false),
    item('shipping', 'Envíos', '<p class="mb-0">Despachamos a toda Colombia en 2–5 días hábiles. Los pedidos superiores a ' + formatCOP(FREE_SHIPPING_FROM) + ' tienen envío gratis. Recibes la guía de seguimiento por correo.</p>', false),
    item('returns', 'Cambios y devoluciones', '<p class="mb-0">Tienes 30 días para cambiar o devolver tu producto siempre que conserve etiquetas y no presente uso. El proceso se gestiona desde el correo de tu pedido.</p>', false)
  ].join('');
}

function renderRelated(product) {
  const related = getRelatedProducts(product, 4);
  renderProducts(related, document.getElementById('relatedGrid'));

  const interest = PRODUCTS.filter(
    (item) => item.id !== product.id && item.featured && !related.some((rel) => rel.id === item.id)
  ).slice(0, 4);
  renderProducts(interest.length ? interest : PRODUCTS.filter((i) => i.id !== product.id).slice(0, 4), document.getElementById('interestGrid'));

  const recentGrid = document.getElementById('recentGrid');
  if (recentGrid) {
    const recent = getRecentlyViewed()
      .filter((id) => id !== product.id)
      .map((id) => getProductById(id))
      .filter(Boolean)
      .slice(0, 4);
    const section = document.getElementById('detailRecentSection');
    if (recent.length) renderProducts(recent, recentGrid);
    else if (section) section.classList.add('d-none');
  }
}

/* -------------------------------------------------------------------
   Interacción de variantes y cantidad
   ------------------------------------------------------------------- */
function setDetailQuantity(value) {
  const product = detailState.product;
  if (!product) return;
  const input = document.getElementById('detailQty');
  const next = Math.min(Math.max(1, Number(value) || 1), Math.max(1, product.stock));
  detailState.quantity = next;
  if (input) input.value = next;
}

function bindDetailActions(product) {
  const info = document.getElementById('productInfo');
  if (!info) return;

  info.addEventListener('click', (event) => {
    const variant = event.target.closest('[data-variant]');
    if (variant) {
      const type = variant.dataset.variant;
      const value = variant.dataset.value;
      if (type === 'color') detailState.color = value;
      else detailState.size = value;

      const listId = type === 'color' ? '#colorList' : '#sizeList';
      info.querySelectorAll(listId + ' .variant-btn').forEach((button) => {
        const active = button.dataset.value === value;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const label = document.getElementById(type === 'color' ? 'selectedColor' : 'selectedSize');
      if (label) label.textContent = value;
      return;
    }

    const qtyButton = event.target.closest('[data-detail-qty]');
    if (qtyButton) {
      setDetailQuantity(detailState.quantity + Number(qtyButton.dataset.detailQty));
    }
  });

  const qtyInput = document.getElementById('detailQty');
  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      const requested = Number(qtyInput.value);
      if (requested > product.stock) {
        showToast('Solo quedan ' + product.stock + ' unidades disponibles', 'warning');
        setDetailQuantity(product.stock);
      } else {
        setDetailQuantity(requested);
      }
    });
  }

  const addButton = document.getElementById('btnAddDetail');
  if (addButton) {
    addButton.addEventListener('click', () => {
      addToCart(product.id, { color: detailState.color, size: detailState.size, quantity: detailState.quantity });
    });
  }

  const buyButton = document.getElementById('btnBuyNow');
  if (buyButton) {
    buyButton.addEventListener('click', () => {
      const added = addToCart(product.id, { color: detailState.color, size: detailState.size, quantity: detailState.quantity });
      if (added) window.location.href = BASE_PATH + 'pages/checkout.html';
    });
  }

  const favoriteButton = document.getElementById('btnFavDetail');
  if (favoriteButton) {
    /* La acción la resuelve la delegación global de app.js ([data-fav]) */
    favoriteButton.addEventListener('click', () => {
      syncFavoriteButtons();
    });
  }
}

/* -------------------------------------------------------------------
   Inicialización
   ------------------------------------------------------------------- */
function initProductDetail() {
  const root = document.getElementById('productDetail');
  if (!root) return;

  const product = getProductById(getProductIdFromURL());

  if (!product) {
    root.innerHTML = [
      '<div class="empty-state text-center py-5">',
      '  <i class="bi bi-exclamation-circle"></i>',
      '  <h1 class="h4 mt-3">No encontramos esa gorra</h1>',
      '  <p class="text-muted">El producto solicitado no existe o fue removido del catálogo.</p>',
      '  <a href="' + catalogUrl() + '" class="btn btn-accent mt-2">Volver al catálogo</a>',
      '</div>'
    ].join('');
    document.title = 'Producto no encontrado | CAPZONE';
    return;
  }

  detailState.product = product;
  detailState.color = product.colors[0];
  detailState.size = product.sizes[0];
  detailState.quantity = 1;

  document.title = product.name + ' | CAPZONE — Gorras online';

  addRecentlyViewed(product.id);
  renderBreadcrumb(product);
  document.getElementById('productGallery').innerHTML = galleryHTML(product);
  document.getElementById('productInfo').innerHTML = productInfoHTML(product);
  renderAccordions(product);
  bindGallery(product);
  bindDetailActions(product);
  renderRelated(product);
}

document.addEventListener('DOMContentLoaded', initProductDetail);
