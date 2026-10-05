/* =====================================================================
   filters.js — Filtros, ordenamiento y render del catálogo
   Trabaja sobre #grid y se encarga también de leer los parámetros de
   URL (categoria, subcategoria, color, min, max, oferta, q, orden).
   ===================================================================== */

const catalogState = {
  categories: [],
  subcategories: [],
  colors: [],
  min: null,
  max: null,
  offers: false,
  sort: 'relevancia',
  query: ''
};

const PRICE_RANGE = getPriceRange();
const RANGE_FLOOR = Math.floor(PRICE_RANGE.min / 10000) * 10000;
const RANGE_CEIL = Math.ceil(PRICE_RANGE.max / 10000) * 10000;
const RANGE_STEP = 5000;

/* -------------------------------------------------------------------
   Lectura de parámetros de la URL
   ------------------------------------------------------------------- */
function readURLFilters() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('categoria');
  const subcategory = params.get('subcategoria');
  const color = params.get('color');

  if (category) catalogState.categories = category.split(',').filter(Boolean);
  if (subcategory) catalogState.subcategories = subcategory.split(',').filter(Boolean);
  if (color) catalogState.colors = color.split(',').filter(Boolean);
  if (params.get('min')) catalogState.min = Number(params.get('min'));
  if (params.get('max')) catalogState.max = Number(params.get('max'));
  if (params.get('oferta') === '1') catalogState.offers = true;
  if (params.get('q')) catalogState.query = params.get('q');
  if (params.get('orden')) catalogState.sort = params.get('orden');
}

/** Refleja el estado actual en la URL (navegación compartible). */
function syncURLFilters() {
  const params = new URLSearchParams();
  if (catalogState.categories.length) params.set('categoria', catalogState.categories.join(','));
  if (catalogState.subcategories.length) params.set('subcategoria', catalogState.subcategories.join(','));
  if (catalogState.colors.length) params.set('color', catalogState.colors.join(','));
  if (catalogState.min && catalogState.min > RANGE_FLOOR) params.set('min', catalogState.min);
  if (catalogState.max && catalogState.max < RANGE_CEIL) params.set('max', catalogState.max);
  if (catalogState.offers) params.set('oferta', '1');
  if (catalogState.query) params.set('q', catalogState.query);
  if (catalogState.sort !== 'relevancia') params.set('orden', catalogState.sort);

  try {
    const query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
  } catch (error) {
    /* file:// no permite replaceState en algunos navegadores */
  }
}

/* -------------------------------------------------------------------
   Construcción del panel de filtros (se inyecta en escritorio y móvil)
   ------------------------------------------------------------------- */
function countByCategory(category) {
  return PRODUCTS.filter((product) => product.category === category).length;
}

function filterGroupHTML(title, content) {
  return '<div class="filter-group"><h3 class="filter-title">' + title + '</h3>' + content + '</div>';
}

function checkboxOptionHTML(filter, value, label, count, extra) {
  const checked = catalogState[filter].includes(value) ? ' checked' : '';
  return [
    '<label class="filter-option">',
    '  <input type="checkbox" data-filter="' + filter + '" value="' + escapeHTML(value) + '"' + checked + '>',
    '  <span class="filter-option-label">' + (extra || '') + escapeHTML(label) + '</span>',
    '  <span class="filter-count">' + count + '</span>',
    '</label>'
  ].join('');
}

function categoryGroupHTML() {
  const content = getAllCategories()
    .map((category) => checkboxOptionHTML('categories', category, category, countByCategory(category)))
    .join('');
  return filterGroupHTML('Categorías', '<div class="filter-options">' + content + '</div>');
}

function subcategoryGroupHTML() {
  const source = catalogState.categories.length
    ? PRODUCTS.filter((product) => catalogState.categories.includes(product.category))
    : PRODUCTS;

  const counts = source.reduce((acc, product) => {
    acc[product.subcategory] = (acc[product.subcategory] || 0) + 1;
    return acc;
  }, {});

  const content = Object.keys(counts)
    .sort()
    .map((subcategory) => {
      const checked = catalogState.subcategories.includes(subcategory) ? ' checked' : '';
      return [
        '<label class="filter-option">',
        '  <input type="checkbox" data-filter="subcategories" value="' + escapeHTML(subcategory) + '"' + checked + '>',
        '  <span class="filter-option-label">' + escapeHTML(subcategory) + '</span>',
        '  <span class="filter-count">' + counts[subcategory] + '</span>',
        '</label>'
      ].join('');
    })
    .join('');

  return filterGroupHTML('Subcategorías', '<div class="filter-options">' + content + '</div>');
}

function colorGroupHTML() {
  const content = getAllColors()
    .map((color) =>
      checkboxOptionHTML('colors', color, color, '', '<span class="color-dot" style="--dot:' + getCSSColor(color) + '"></span>')
    )
    .join('');
  return filterGroupHTML('Colores', '<div class="filter-options">' + content + '</div>');
}

function priceGroupHTML() {
  const min = catalogState.min != null ? catalogState.min : RANGE_FLOOR;
  const max = catalogState.max != null ? catalogState.max : RANGE_CEIL;

  return filterGroupHTML(
    'Precio',
    [
      '<div class="price-values"><span class="js-price-min">' + formatCOP(min) + '</span><span class="text-muted">—</span><span class="js-price-max">' + formatCOP(max) + '</span></div>',
      '<input type="range" class="form-range-custom range-price range-min" min="' + RANGE_FLOOR + '" max="' + RANGE_CEIL + '" step="' + RANGE_STEP + '" value="' + min + '" aria-label="Precio mínimo">',
      '<input type="range" class="form-range-custom range-price range-max" min="' + RANGE_FLOOR + '" max="' + RANGE_CEIL + '" step="' + RANGE_STEP + '" value="' + max + '" aria-label="Precio máximo">'
    ].join('')
  );
}

function offersGroupHTML() {
  const checked = catalogState.offers ? ' checked' : '';
  return filterGroupHTML(
    'Ofertas',
    '<div class="filter-options"><label class="filter-option">' +
      '<input type="checkbox" data-filter="offers" value="1"' + checked + '>' +
      '<span class="filter-option-label">Solo productos en oferta</span></label></div>'
  );
}

function buildFiltersHTML() {
  return [
    '<div class="filter-header d-flex justify-content-between align-items-center">',
    '  <h2 class="h6 mb-0"><i class="bi bi-funnel me-2"></i>Filtros</h2>',
    '  <button type="button" class="btn btn-link btn-sm p-0 text-accent" data-clear-filters>Limpiar</button>',
    '</div>',
    categoryGroupHTML(),
    subcategoryGroupHTML(),
    colorGroupHTML(),
    priceGroupHTML(),
    offersGroupHTML()
  ].join('');
}

function paintFilters() {
  document.querySelectorAll('#filtersDesktop, #filtersOffcanvas').forEach((panel) => {
    panel.innerHTML = buildFiltersHTML();
  });
}

function paintSubcategoryGroup() {
  document.querySelectorAll('#filtersDesktop, #filtersOffcanvas').forEach((panel) => {
    const group = panel.querySelectorAll('.filter-group')[1];
    if (group) group.outerHTML = subcategoryGroupHTML();
  });
}

function syncFilterControls() {
  document.querySelectorAll('#filtersDesktop, #filtersOffcanvas').forEach((panel) => {
    panel.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      const key = input.dataset.filter;
      if (key === 'offers') {
        input.checked = catalogState.offers;
      } else if (Array.isArray(catalogState[key])) {
        input.checked = catalogState[key].includes(input.value);
      }
    });
    const minInput = panel.querySelector('.range-min');
    const maxInput = panel.querySelector('.range-max');
    if (minInput) minInput.value = catalogState.min != null ? catalogState.min : RANGE_FLOOR;
    if (maxInput) maxInput.value = catalogState.max != null ? catalogState.max : RANGE_CEIL;
    updatePriceLabels(panel);
  });
}

function updatePriceLabels(panel) {
  const minLabel = panel.querySelector('.js-price-min');
  const maxLabel = panel.querySelector('.js-price-max');
  const minInput = panel.querySelector('.range-min');
  const maxInput = panel.querySelector('.range-max');
  if (minLabel && minInput) minLabel.textContent = formatCOP(minInput.value);
  if (maxLabel && maxInput) maxLabel.textContent = formatCOP(maxInput.value);
}

/* -------------------------------------------------------------------
   Aplicación de filtros y ordenamiento
   ------------------------------------------------------------------- */
function sortProducts(list) {
  const sorted = list.slice();
  switch (catalogState.sort) {
    case 'precio-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'precio-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'recientes':
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'relevancia':
    default:
      return sorted.sort((a, b) => {
        const scoreA = (a.featured ? 2 : 0) + (a.bestseller ? 1 : 0);
        const scoreB = (b.featured ? 2 : 0) + (b.bestseller ? 1 : 0);
        return scoreB - scoreA || b.rating - a.rating;
      });
  }
}

function getFilteredProducts() {
  let list = PRODUCTS.slice();

  if (catalogState.query) list = searchProducts(catalogState.query, list);
  if (catalogState.categories.length) list = list.filter((product) => catalogState.categories.includes(product.category));
  if (catalogState.subcategories.length) list = list.filter((product) => catalogState.subcategories.includes(product.subcategory));
  if (catalogState.colors.length) list = list.filter((product) => product.colors.some((color) => catalogState.colors.includes(color)));
  if (catalogState.min != null) list = list.filter((product) => product.price >= catalogState.min);
  if (catalogState.max != null) list = list.filter((product) => product.price <= catalogState.max);
  if (catalogState.offers) list = list.filter((product) => product.oldPrice > product.price);

  return sortProducts(list);
}

function activeFiltersList() {
  const chips = [];
  catalogState.categories.forEach((value) => chips.push({ type: 'categories', value: value }));
  catalogState.subcategories.forEach((value) => chips.push({ type: 'subcategories', value: value }));
  catalogState.colors.forEach((value) => chips.push({ type: 'colors', value: value }));
  if (catalogState.offers) chips.push({ type: 'offers', value: 'En oferta' });
  if (catalogState.min != null || catalogState.max != null) {
    chips.push({
      type: 'price',
      value: formatCOP(catalogState.min != null ? catalogState.min : RANGE_FLOOR) + ' – ' + formatCOP(catalogState.max != null ? catalogState.max : RANGE_CEIL)
    });
  }
  if (catalogState.query) chips.push({ type: 'query', value: '"' + catalogState.query + '"' });
  return chips;
}

function renderActiveFilters() {
  const container = document.getElementById('activeFilters');
  if (!container) return;

  const chips = activeFiltersList();
  container.innerHTML = chips
    .map(
      (chip) =>
        '<button type="button" class="filter-chip" data-chip-type="' + chip.type + '" data-chip-value="' + escapeHTML(chip.value) + '">' +
        escapeHTML(chip.value) + '<i class="bi bi-x"></i></button>'
    )
    .join('');
}

function applyFilters() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const results = getFilteredProducts();
  const countElement = document.getElementById('resultCount');
  if (countElement) {
    countElement.textContent = results.length + (results.length === 1 ? ' producto' : ' productos');
  }

  if (results.length) {
    renderProducts(results, grid);
  } else {
    grid.innerHTML = emptyStateHTML(
      catalogState.query ? 'No encontramos productos que coincidan con tu búsqueda.' : 'No hay productos que coincidan con los filtros seleccionados.'
    );
  }

  renderActiveFilters();
  updateCatalogTitle();
  syncURLFilters();
}

function updateCatalogTitle() {
  const title = document.getElementById('catalogTitle');
  if (!title) return;
  if (catalogState.query) {
    title.textContent = 'Resultados para "' + catalogState.query + '"';
  } else if (catalogState.categories.length === 1) {
    title.textContent = 'Gorras ' + catalogState.categories[0];
  } else {
    title.textContent = 'Catálogo completo';
  }
}

function clearFilters() {
  catalogState.categories = [];
  catalogState.subcategories = [];
  catalogState.colors = [];
  catalogState.min = null;
  catalogState.max = null;
  catalogState.offers = false;
  catalogState.query = '';
  catalogState.sort = 'relevancia';

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'relevancia';
  const searchField = document.getElementById('catalogSearch');
  if (searchField) searchField.value = '';

  paintFilters();
  applyFilters();
  showToast('Filtros limpiados', 'info');
}

/* -------------------------------------------------------------------
   Eventos
   ------------------------------------------------------------------- */
function handleFilterChange(event) {
  const input = event.target;

  if (input.matches('[data-filter]')) {
    const key = input.dataset.filter;
    if (key === 'offers') {
      catalogState.offers = input.checked;
    } else if (Array.isArray(catalogState[key])) {
      const list = catalogState[key];
      const index = list.indexOf(input.value);
      if (input.checked && index < 0) list.push(input.value);
      if (!input.checked && index >= 0) list.splice(index, 1);
    }
    if (key === 'categories') {
      catalogState.subcategories = [];
      paintSubcategoryGroup();
    }
    applyFilters();
    syncFilterControls();
    return;
  }

  if (input.matches('.range-price')) {
    const panel = input.closest('#filtersDesktop, #filtersOffcanvas');
    const minValue = Number(panel.querySelector('.range-min').value);
    const maxValue = Number(panel.querySelector('.range-max').value);

    if (minValue > maxValue) {
      if (input.classList.contains('range-min')) input.value = maxValue;
      else input.value = minValue;
    }
    const minInput = panel.querySelector('.range-min');
    const maxInput = panel.querySelector('.range-max');
    catalogState.min = Number(minInput.value) > RANGE_FLOOR ? Number(minInput.value) : null;
    catalogState.max = Number(maxInput.value) < RANGE_CEIL ? Number(maxInput.value) : null;

    updatePriceLabels(panel);
    applyFilters();
  }
}

function removeFilterChip(chip) {
  const type = chip.dataset.chipType;
  const value = chip.dataset.chipValue;

  if (type === 'categories' || type === 'subcategories' || type === 'colors') {
    catalogState[type] = catalogState[type].filter((item) => item !== value);
    if (type === 'categories') catalogState.subcategories = [];
  } else if (type === 'offers') {
    catalogState.offers = false;
  } else if (type === 'price') {
    catalogState.min = null;
    catalogState.max = null;
  } else if (type === 'query') {
    catalogState.query = '';
    const searchField = document.getElementById('catalogSearch');
    if (searchField) searchField.value = '';
  }

  paintFilters();
  applyFilters();
}

function initCatalog() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  readURLFilters();
  paintFilters();

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.value = catalogState.sort;
    sortSelect.addEventListener('change', () => {
      catalogState.sort = sortSelect.value;
      applyFilters();
    });
  }

  const catalogSearch = document.getElementById('catalogSearch');
  if (catalogSearch) {
    catalogSearch.value = catalogState.query;
    catalogSearch.addEventListener('input', () => {
      catalogState.query = normalizeText(catalogSearch.value);
      applyFilters();
    });
  }

  document.querySelectorAll('#filtersDesktop, #filtersOffcanvas').forEach((panel) => {
    panel.addEventListener('change', handleFilterChange);
    panel.addEventListener('input', handleFilterChange);
    panel.addEventListener('click', (event) => {
      if (event.target.closest('[data-clear-filters]')) clearFilters();
    });
  });

  const activeFilters = document.getElementById('activeFilters');
  if (activeFilters) {
    activeFilters.addEventListener('click', (event) => {
      const chip = event.target.closest('.filter-chip');
      if (chip) removeFilterChip(chip);
    });
  }

  applyFilters();
}

document.addEventListener('DOMContentLoaded', initCatalog);
