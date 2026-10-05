/* =====================================================================
   search.js — Buscador de productos CAPZONE
   Búsqueda por nombre, categoría, subcategoría, color, material y
   descripción (ignorando acentos y mayúsculas) + modal de búsqueda.
   ===================================================================== */

/* Variantes de color para que "negra" encuentre productos "Negro" */
const COLOR_VARIANTS = {
  Negro: 'negro negra negros negras black',
  Blanco: 'blanco blanca blancos blancas white',
  Rojo: 'rojo roja rojos rojas red',
  Azul: 'azul azules blue',
  Verde: 'verde verdes green',
  Gris: 'gris grises gray grey',
  Beige: 'beige beiges',
  Camel: 'camel camelé',
  Burdeos: 'burdeos burdeos vino bordeaux',
  Rosa: 'rosa rosas pink',
  Morado: 'morado morada morados moradas purple violeta',
  Naranja: 'naranja naranjas orange',
  Dorado: 'dorado dorada gold',
  Plateado: 'plateado plateada silver'
};

const SEARCH_INDEX = new Map();

/** Normaliza texto: sin acentos, sin mayúsculas, espacios simples. */
function normalizeText(value) {
  return String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Texto indexable de un producto (se calcula una sola vez). */
function getSearchText(product) {
  if (!SEARCH_INDEX.has(product.id)) {
    const colorText = product.colors
      .map((color) => color + ' ' + (COLOR_VARIANTS[color] || ''))
      .join(' ');
    SEARCH_INDEX.set(
      product.id,
      normalizeText(
        [product.name, product.category, product.subcategory, product.material, product.description, (product.features || []).join(' '), colorText].join(' ')
      )
    );
  }
  return SEARCH_INDEX.get(product.id);
}

/**
 * Busca productos por uno o varios términos.
 * Todos los términos deben coincidir con algún campo del producto.
 * @param {string} query Texto del usuario.
 * @param {Array} list Lista sobre la que buscar (por defecto todo el catálogo).
 * @returns {Array} Productos coincidentes.
 */
function searchProducts(query, list = PRODUCTS) {
  const normalized = normalizeText(query);
  if (!normalized) return list.slice();

  const terms = normalized.split(' ').filter(Boolean);
  return list.filter((product) => {
    const haystack = getSearchText(product);
    return terms.every((term) => haystack.includes(term));
  });
}

/* -------------------------------------------------------------------
   Modal de búsqueda (se inyecta para no repetir HTML en cada página)
   ------------------------------------------------------------------- */
function injectSearchModal() {
  if (document.getElementById('searchModal')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = [
    '<div class="modal fade" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">',
    '  <div class="modal-dialog modal-dialog-centered modal-lg">',
    '    <div class="modal-content search-modal">',
    '      <div class="modal-header border-0 pb-0">',
    '        <h2 class="modal-title h5" id="searchModalLabel"><i class="bi bi-search me-2"></i>Buscar en CAPZONE</h2>',
    '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>',
    '      </div>',
    '      <div class="modal-body">',
    '        <form id="searchForm" role="search">',
    '          <div class="input-group input-group-lg">',
    '            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>',
    '            <input type="search" class="form-control" id="searchInput" autocomplete="off"',
    '                   placeholder="Ej: gorra negra, trucker, deportiva..." aria-label="Buscar productos">',
    '            <button class="btn btn-accent px-4" type="submit">Buscar</button>',
    '          </div>',
    '        </form>',
    '        <div id="searchSuggestions" class="search-suggestions" aria-live="polite"></div>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');
  document.body.appendChild(wrapper.firstElementChild);
}

function suggestionRowHTML(product) {
  return [
    '<a class="search-suggestion" href="' + productUrl(product.id) + '">',
    '  <img src="' + resolveImage(product.images[0]) + '" alt="' + escapeHTML(product.name) + '" loading="lazy" onerror="imgFallback(this)">',
    '  <span class="search-suggestion-info">',
    '    <strong>' + escapeHTML(product.name) + '</strong>',
    '    <small>' + escapeHTML(product.category + ' · ' + product.subcategory) + '</small>',
    '  </span>',
    '  <span class="search-suggestion-price">' + formatCOP(product.price) + '</span>',
    '</a>'
  ].join('');
}

function renderSearchSuggestions(query) {
  const box = document.getElementById('searchSuggestions');
  if (!box) return;

  const term = normalizeText(query);
  if (term.length < 2) {
    box.innerHTML = '<p class="small text-muted mb-0">Escribe al menos 2 letras. Puedes buscar por nombre, categoría o color.</p>';
    return;
  }

  const results = searchProducts(term).slice(0, 6);

  if (!results.length) {
    box.innerHTML = '<div class="search-empty"><i class="bi bi-emoji-frown"></i><p class="mb-0">No encontramos productos que coincidan con tu búsqueda.</p></div>';
    return;
  }

  box.innerHTML = [
    '<p class="small text-muted mb-2">' + results.length + ' resultado(s) para "' + escapeHTML(query) + '"</p>',
    results.map(suggestionRowHTML).join(''),
    '<a class="btn btn-outline-dark btn-sm w-100 mt-3" href="' + catalogUrl('q=' + encodeURIComponent(term)) + '">Ver todos los resultados</a>'
  ].join('');
}

function initSearch() {
  injectSearchModal();

  const input = document.getElementById('searchInput');
  const form = document.getElementById('searchForm');
  if (!input || !form) return;

  input.addEventListener('input', () => renderSearchSuggestions(input.value));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const term = normalizeText(input.value);
    if (!term) {
      input.focus();
      return;
    }
    window.location.href = catalogUrl('q=' + encodeURIComponent(term));
  });

  document.getElementById('searchModal').addEventListener('shown.bs.modal', () => {
    renderSearchSuggestions(input.value);
    input.focus();
  });
}

document.addEventListener('DOMContentLoaded', initSearch);
