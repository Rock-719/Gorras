# CAPZONE — Tienda de gorras online

E-commerce completo y responsive para la venta de gorras, construido **solo con HTML5, CSS3, JavaScript vanilla, Bootstrap 5 y Bootstrap Icons** (sin frameworks de JS ni compiladores). Catálogo con filtros, buscador, detalle de producto, carrito persistente, favoritos y checkout con confirmación de pedido (demo simulada).

> ⚠️ Proyecto de frontend demo: **no procesa pagos reales** ni envía datos a servidores. Todo ocurre en el navegador.

---

## 📁 Estructura

```
Tienda Gorras/
├── index.html                  # Portada (hero, categorías, destacados, ofertas, newsletter)
├── pages/
│   ├── catalogo.html           # Catálogo con filtros (sidebar desktop / offcanvas móvil)
│   ├── producto.html           # Detalle (?id=N): galería, variantes, relacionados
│   ├── carrito.html            # Carrito con cantidades y resumen
│   ├── checkout.html           # Formulario de compra + métodos de pago + confirmación
│   ├── nosotros.html           # Historia, valores, proceso e información legal (#legales)
│   └── contacto.html           # Formulario de contacto + FAQ
├── css/
│   ├── styles.css              # Variables, tipografía, navbar, footer, botones, hero
│   ├── components.css          # Tarjetas, filtros, detalle, carrito, checkout, modales
│   └── responsive.css          # Breakpoints (móvil/tablet)
├── js/
│   ├── app.js                  # Globals, BASE_PATH, resolveImage, render de tarjetas, favoritos, toasts
│   ├── products.js             # Datos: CATEGORIES y PRODUCTS (catálogo completo)
│   ├── filters.js              # Filtros/orden del catálogo vía URL params (sin recarga)
│   ├── search.js               # Buscador con sugerencias en vivo (modal)
│   ├── product-detail.js       # Lógica de producto.html (?id=N)
│   ├── cart.js                 # Carrito: totales, cantidades, persistencia
│   └── checkout.js             # Validación, resumen y modal de confirmación
└── assets/
    ├── icons/favicon.svg
    └── images/
        ├── products/           # Fotos de productos (reemplazables) + placeholder.svg
        ├── categories/         # Imágenes de categorías + placeholder.svg
        └── banners/            # Banners promocionales + placeholder.svg
```

---

## ▶️ Cómo ejecutar

**Opción A — directo:** abre `index.html` con doble clic en el navegador.

**Opción B — servidor local (recomendado):**

```bash
# Python 3
python -m http.server 8123
# luego visita http://127.0.0.1:8123/index.html
```

No requiere instalación de dependencias ni `npm install`.

---

## ✅ Funcionalidades

- **Navbar** con logo, menú (Inicio, Catálogo, Categorías, Ofertas, Nosotros, Contacto), buscador, favoritos, contador de carrito y hamburguesa en móvil.
- **Home**: hero, 6 tarjetas de categoría, productos destacados, banner de envío gratis, más vendidos y newsletter.
- **Catálogo**: filtros por categoría, subcategoría, color, rango de precio y ofertas; orden (relevancia, precio ↑/↓, recientes); resultados al instante sin recarga; sidebar en desktop y offcanvas en móvil.
- **Búsqueda**: sugerencias en vivo por nombre/categoría/subcategoría/color con mensaje amigable sin resultados.
- **Producto**: galería con miniaturas, variantes de color, cantidad limitada por stock, acordeón de descripción/detalles/envíos, relacionados y "vistos recientemente".
- **Carrito**: cantidades con tope de stock, eliminar líneas, vaciar carrito (con confirmación), subtotal/descuento/envío/total, guardado en `localStorage`.
- **Checkout**: formulario con validación Bootstrap, métodos de pago (tarjeta/PSE/contraentrega), resumen del pedido y modal de confirmación con número de pedido ficticio.
- **Extras**: favoritos con contador, badges (oferta/nuevo), indicadores de stock ("Últimas unidades"), breadcrumbs, toasts, back-to-top, imágenes con `alt`, ARIA/etiquetas, SEO básico.

### Persistencia (`localStorage`)

| Clave | Contenido |
|---|---|
| `capzone_cart` | Líneas del carrito `{key, productId, color, size, quantity, price}` |
| `capzone_favoritos` | IDs de productos favoritos |
| `capzone_vistos` | IDs de productos vistos recientemente |
| `capzone_ultimo_pedido` | Último pedido confirmado (demo) |

**Reglas de totales:** subtotal = suma de precios de lista; descuento = ahorro por ofertas; envío = $10.000 (**gratis desde $150.000**); total = subtotal − descuento + envío.

Los precios se formatean siempre con:

```js
new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
```

---

## 🛠️ Personalización

### Agregar o editar productos → `js/products.js`

Cada producto del array `PRODUCTS` tiene este formato:

```js
{
  id: 19,                       // único en todo el catálogo
  name: 'Nuevo Modelo Cap',
  category: 'Urbanas',          // debe existir en CATEGORIES
  subcategory: 'Snapback',
  price: 89900,                 // COP
  oldPrice: 0,                  // 0 = sin oferta
  discount: 0,                  // % para badge "Oferta"
  colors: ['Negro', 'Blanco'],
  sizes: ['Única'],
  stock: 15,                    // limita cantidades en carrito
  rating: 4.6,
  reviews: 90,
  featured: true,               // aparece en "Destacados"
  bestseller: false,            // aparece en "Más vendidos"
  isNew: true,                  // badge "Nuevo"
  date: '2026-09-01',           // orden "Más recientes"
  material: 'Algodón',
  description: '…',
  features: ['…', '…'],
  images: [px(1234567), px(7654321)]   // ver "Imágenes" abajo
}
```

Agrega el objeto al final del array: el catálogo, la búsqueda, los filtros y la página de detalle lo detectan automáticamente.

### Cambiar categorías → `js/products.js`

Edita el array `CATEGORIES` (`name`, `label`, `description`, `image`, `alt`). El `name` debe coincidir con el campo `category` de los productos y con los enlaces del menú/categorías (`pages/catalogo.html?categoria=Nombre`).

### Cambiar imágenes

Hoy las fotos vienen de URLs públicas (Pexels) mediante el helper `px(id, width)`:

```js
px(11945298)  // → https://images.pexels.com/photos/11945298/…
```

Para usar **tus propias fotos locales**:

1. Guarda el archivo en `assets/images/products/` (ej. `gorra-negra.jpg`).
2. Reemplaza la URL por una ruta relativa: `images: ['assets/images/products/gorra-negra.jpg']` (en `index.html`) o `['../assets/images/products/gorra-negra.jpg']` (dentro de `pages/`).
3. Usa `resolveImage(ruta)` si la ruta debe resolverse según la página — ya lo hacen los renderizados internos, así que basta con mantener rutas relativas a `assets/`.

Más detalle en `assets/images/products/README.md`.

### Cambiar colores → `css/styles.css`

Toda la paleta vive en las variables `:root`:

```css
--cz-black: #111111;      /* fondo principal */
--cz-white: #ffffff;
--cz-gray: #f5f5f5;       /* secciones claras */
--cz-dark: #333333;       /* texto principal */
--cz-accent: #d97706;     /* acento ámbar */
--cz-accent-dark: #b45309;/* acento para texto/botones (contraste AA) */
--cz-success: #198754;
--cz-danger: #dc3545;
```

Modifica una variable y el cambio se propaga a botones, badges, enlaces y estados.

### Cambiar textos del sitio

- Menú, footer y banners: HTML estático en cada página (`index.html` y `pages/*.html`).
- Categorías de productos: texto de las tarjetas en `index.html` (sección "Categorías").
- Envío gratis desde $150.000: cambiar `FREE_SHIPPING_FROM` en `js/cart.js` y el texto visible en home/checkout.

---

## 📱 Responsive

- Desktop ≥ 992px: sidebar de filtros visible, grid de 4–3 columnas.
- Tablet 768–991px: filtros en offcanvas, carrito en tarjetas apiladas.
- Móvil ≤ 767px: menú hamburguesa, grid de 2 columnas, hero apilado.

## 🔍 Accesibilidad y SEO

- HTML semántico (`header`, `nav`, `main`, `section`, `footer`), un solo `h1` por página y jerarquía de encabezados correcta.
- `alt` descriptivo en todas las imágenes, etiquetas/ARIA en formularios e iconos, foco visible.
- `meta description`, `title` únicos por página, Open Graph básico y favicon.
- Auditoría Lighthouse: **100 / 100 / 100** (Accesibilidad, Buenas prácticas, SEO) en las 7 páginas.

## 📝 Notas

- Los pedidos son simulados: el "número de pedido" se genera en el cliente y no hay cobro real.
- Sin `eval`, sin dependencias externas de JS (solo Bootstrap 5 y Bootstrap Icons por CDN).
- Compatible con abrir el sitio desde `file://` o desde cualquier servidor estático.
