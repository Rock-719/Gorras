/* =====================================================================
   products.js — Base de datos de productos CAPZONE
   ---------------------------------------------------------------------
   - Contenido estático del catálogo (no depende del DOM).
   - Las imágenes se construyen con px(id) => URL pública de Pexels.
     Para usar imágenes locales basta con reemplazar la llamada por
     "assets/images/products/mi-imagen.jpg" (ver README.md).
   ===================================================================== */

/**
 * Construye la URL pública de una imagen de producto (CDN de Pexels).
 * @param {number} id  Identificador de la foto.
 * @param {number} width Ancho deseado en píxeles.
 * @returns {string}
 */
function px(id, width = 900) {
  return 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=' + width;
}

/* ---------------------------------------------------------------
   Categorías principales (se usan en el catálogo y en el home)
   --------------------------------------------------------------- */
const CATEGORIES = [
  {
    name: 'Deportivas',
    label: 'Gorras deportivas',
    description: 'Ligeras, transpirables y con tecnología de secado rápido.',
    image: px(36152381, 800),
    alt: 'Gorra deportiva con camiseta roja en ambiente urbano'
  },
  {
    name: 'Urbanas',
    label: 'Gorras urbanas',
    description: 'Diseños de calle con actitud y bordados con carácter.',
    image: px(16628549, 800),
    alt: 'Adolescente urbano con gorra y audífonos en la ciudad'
  },
  {
    name: 'Trucker',
    label: 'Gorras trucker',
    description: 'La clásica malla trasera que nunca pasa de moda.',
    image: px(26956137, 800),
    alt: 'Gorra trucker verde y camel con parche frontal'
  },
  {
    name: 'Snapback',
    label: 'Gorras snapback',
    description: 'Visera plana, frontal alto y ajuste perfecto.',
    image: px(5343088, 800),
    alt: 'Gorra snapback negra con visera camuflaje sobre pared de ladrillo'
  },
  {
    name: 'Dad Hat',
    label: 'Gorras dad hat',
    description: 'Suaves, lavadas y sin estructura para un look relajado.',
    image: px(7562957, 800),
    alt: 'Gorra dad hat beige colgada en un banco de madera'
  },
  {
    name: 'Premium',
    label: 'Gorras premium',
    description: 'Materiales nobles y acabados de edición limitada.',
    image: px(9280916, 800),
    alt: 'Retrato con iluminación suave de hombre usando gorra negra premium'
  }
];

/* ---------------------------------------------------------------
   Catálogo
   --------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: 1,
    name: 'Sprint Pro Running Cap',
    category: 'Deportivas',
    subcategory: 'Running',
    price: 79900,
    oldPrice: 99900,
    discount: 20,
    colors: ['Negro', 'Verde', 'Azul'],
    sizes: ['Única'],
    stock: 20,
    rating: 4.8,
    reviews: 214,
    featured: true,
    bestseller: true,
    isNew: false,
    date: '2026-03-12',
    material: 'Poliéster técnico con malla ventilada',
    description:
      'Gorra deportiva ultraligera diseñada para correr y entrenar. Su tejido de secado rápido mantiene la cabeza fresca y el cierre trasero ajustable garantiza que no se mueva durante el esfuerzo.',
    features: ['Tejido de secado rápido', 'Cinta transpirable interior', 'Ajuste trasero con hebilla', 'Reflejantes laterales', 'Peso: 58 g'],
    images: [px(11945298), px(23058042), px(36152381)]
  },
  {
    id: 2,
    name: 'Classic Nine Béisbol Cap',
    category: 'Deportivas',
    subcategory: 'Béisbol',
    price: 84900,
    oldPrice: 0,
    discount: 0,
    colors: ['Azul', 'Blanco', 'Rojo'],
    sizes: ['Única'],
    stock: 14,
    rating: 4.7,
    reviews: 168,
    featured: false,
    bestseller: true,
    isNew: false,
    date: '2026-02-20',
    material: 'Algodón piqué 100%',
    description:
      'La gorra de béisbol clásica de seis paneles con visera curva. Un básico atemporal que combina con todo, elaborada en algodón piqué con bordado frontal de alta densidad.',
    features: ['Seis paneles con ojales', 'Visera curva preformada', 'Cierre metálico deslizante', 'Bordado frontal duradero'],
    images: [px(844867), px(9558605), px(6345390)]
  },
  {
    id: 3,
    name: 'Team Spirit Pro Cap',
    category: 'Deportivas',
    subcategory: 'Equipo',
    price: 94900,
    oldPrice: 114900,
    discount: 17,
    colors: ['Rojo', 'Negro', 'Blanco'],
    sizes: ['Única'],
    stock: 7,
    rating: 4.6,
    reviews: 92,
    featured: false,
    bestseller: false,
    isNew: true,
    date: '2026-09-14',
    material: 'Algodón reforzado con bordado 3D',
    description:
      'Diseñada para el aficionado que vive cada partido. Frontal estructurado con bordado en relieve, colores intensos que no se destiñen y un ajuste cómodo para todo el día.',
    features: ['Bordado 3D en frontal', 'Estructura media', 'Ajuste universal', 'Tinte de alta fijación'],
    images: [px(39401524), px(38309344), px(13697753)]
  },
  {
    id: 4,
    name: 'Urban Black Cap',
    category: 'Urbanas',
    subcategory: 'Snapback',
    price: 89900,
    oldPrice: 109900,
    discount: 18,
    colors: ['Negro', 'Blanco'],
    sizes: ['Única'],
    stock: 15,
    rating: 4.9,
    reviews: 341,
    featured: true,
    bestseller: true,
    isNew: false,
    date: '2026-01-15',
    material: 'Algodón premium',
    description:
      'Gorra urbana de diseño moderno con silueta snapback, visera plana y frontal alto. Su acabado mate y el bordado minimalista la convierten en la pieza central de cualquier outfit de calle.',
    features: ['Visera plana', 'Frontal alto y estructurado', 'Cierre snap ajustable', 'Bordado minimalista', 'Forro interior suave'],
    images: [px(18670550), px(13876038), px(30731085)]
  },
  {
    id: 5,
    name: 'Downtown Oversize Cap',
    category: 'Urbanas',
    subcategory: 'Oversize',
    price: 99900,
    oldPrice: 0,
    discount: 0,
    colors: ['Negro', 'Gris', 'Beige'],
    sizes: ['Única'],
    stock: 11,
    rating: 4.7,
    reviews: 127,
    featured: true,
    bestseller: false,
    isNew: false,
    date: '2026-08-02',
    material: 'Gabardina de algodón',
    description:
      'Silueta amplia de tendencia con caída relajada. El tejido de gabardina aporta cuerpo sin rigidez y el cierre metálico permite un ajuste limpio sin colgar.',
    features: ['Corte oversize', 'Gabardina resistente al agua', 'Cierre metálico', 'Etiqueta tejida lateral'],
    images: [px(14677893), px(12891244), px(16166738)]
  },
  {
    id: 6,
    name: 'Street Embroidered Cap',
    category: 'Urbanas',
    subcategory: 'Bordada',
    price: 109900,
    oldPrice: 129900,
    discount: 15,
    colors: ['Negro', 'Verde'],
    sizes: ['Única'],
    stock: 4,
    rating: 4.8,
    reviews: 86,
    featured: false,
    bestseller: true,
    isNew: false,
    date: '2026-06-28',
    material: 'Algodón peinado',
    description:
      'Bordado artesanal de motivos botánicos sobre algodón peinado. Cada gorra pasa por un proceso de control de hilo que garantiza un acabado limpio por dentro y por fuera.',
    features: ['Bordado de precisión', 'Algodón peinado 240 g', 'Visera flexible', 'Etiqueta de piel interna'],
    images: [px(16117426), px(9637417), px(18224833)]
  },
  {
    id: 7,
    name: 'Retro Trucker Mesh Cap',
    category: 'Trucker',
    subcategory: 'Retro',
    price: 74900,
    oldPrice: 89900,
    discount: 17,
    colors: ['Verde', 'Camel', 'Negro'],
    sizes: ['Única'],
    stock: 18,
    rating: 4.6,
    reviews: 203,
    featured: false,
    bestseller: true,
    isNew: false,
    date: '2026-04-15',
    material: 'Poliéster y malla trasera',
    description:
      'Inspirada en los 90, esta trucker combina frontal con parche tejido y malla trasera de alta respirabilidad. Un clásico retro que vuelve con fuerza.',
    features: ['Malla trasera transpirable', 'Parche bordado retro', 'Cierre snaps de plástico', 'Banda interior absorbente'],
    images: [px(26956137), px(8445639), px(35171714)]
  },
  {
    id: 8,
    name: 'Classic Foam Trucker',
    category: 'Trucker',
    subcategory: 'Clásica',
    price: 69900,
    oldPrice: 0,
    discount: 0,
    colors: ['Blanco', 'Azul', 'Rojo'],
    sizes: ['Única'],
    stock: 25,
    rating: 4.5,
    reviews: 141,
    featured: false,
    bestseller: false,
    isNew: false,
    date: '2025-12-18',
    material: 'Espuma frontal y malla',
    description:
      'La trucker de toda la vida: frontal en espuma blanda, malla trasera y ajuste con snaps. Liviana y económica sin renunciar al estilo.',
    features: ['Frontal en espuma suave', 'Malla de doble capa', 'Ajuste con snaps', 'Peso: 70 g'],
    images: [px(9558758), px(12100396), px(6087151)]
  },
  {
    id: 9,
    name: 'Patch Trucker Edition',
    category: 'Trucker',
    subcategory: 'Patch',
    price: 84900,
    oldPrice: 99900,
    discount: 15,
    colors: ['Verde', 'Beige'],
    sizes: ['Única'],
    stock: 2,
    rating: 4.9,
    reviews: 58,
    featured: false,
    bestseller: false,
    isNew: true,
    date: '2026-09-20',
    material: 'Mezcla de algodón y poliéster',
    description:
      'Edición limitada con parches bordados de inspiración outdoor. Colores terrosos, tejido resistente y un acabado lavado que mejora con el uso.',
    features: ['Parches bordados premium', 'Tejido lavado', 'Edición limitada', 'Cierre snaps metálicos'],
    images: [px(36488247), px(14280459), px(27844047)]
  },
  {
    id: 10,
    name: 'LA Snapback Cap',
    category: 'Snapback',
    subcategory: 'Clásica',
    price: 99900,
    oldPrice: 0,
    discount: 0,
    colors: ['Gris', 'Negro'],
    sizes: ['Única'],
    stock: 9,
    rating: 4.7,
    reviews: 176,
    featured: true,
    bestseller: false,
    isNew: false,
    date: '2026-03-22',
    material: 'Algodón rígido con visera plana',
    description:
      'Silueta snapback clásica con bordado de ciudad en relieve. Frontal firme, visera perfectamente plana y ajuste snaps con cinco posiciones.',
    features: ['Bordado 3D de ciudad', 'Visera plana', 'Cierre snap de 5 posiciones', 'Frontal alto'],
    images: [px(5343088), px(18545451), px(844867)]
  },
  {
    id: 11,
    name: 'Bold Logo Snapback',
    category: 'Snapback',
    subcategory: 'Logotipo',
    price: 109900,
    oldPrice: 129900,
    discount: 15,
    colors: ['Negro', 'Rojo'],
    sizes: ['Única'],
    stock: 6,
    rating: 4.8,
    reviews: 119,
    featured: false,
    bestseller: true,
    isNew: true,
    date: '2026-09-25',
    material: 'Algodón de alta densidad',
    description:
      'Logotipo grabado a gran escala sobre algodón de alta densidad. Pensada para quien quiere que su gorra hable por él: máximo contraste y cero pretensión.',
    features: ['Logotipo de gran formato', 'Algodón 320 g', 'Visera plana reforzada', 'Cierre snap'],
    images: [px(31162881), px(12284599), px(21820217)]
  },
  {
    id: 12,
    name: 'Ivory Minimal Snapback',
    category: 'Snapback',
    subcategory: 'Limitada',
    price: 119900,
    oldPrice: 139900,
    discount: 14,
    colors: ['Blanco', 'Beige'],
    sizes: ['Única'],
    stock: 10,
    rating: 4.6,
    reviews: 74,
    featured: true,
    bestseller: false,
    isNew: false,
    date: '2026-08-08',
    material: 'Algodón orgánico',
    description:
      'Tonos neutros, bordado tono sobre tono y silueta limpia. La snapback minimalista que combina con looks formales y casuales por igual.',
    features: ['Algodón orgánico certificado', 'Bordado tono sobre tono', 'Acabado sin costuras frontales', 'Edición de temporada'],
    images: [px(29925645), px(19453747), px(27401299)]
  },
  {
    id: 13,
    name: 'Washed Dad Hat',
    category: 'Dad Hat',
    subcategory: 'Lavada',
    price: 79900,
    oldPrice: 0,
    discount: 0,
    colors: ['Beige', 'Negro', 'Gris'],
    sizes: ['Única'],
    stock: 16,
    rating: 4.8,
    reviews: 255,
    featured: false,
    bestseller: true,
    isNew: false,
    date: '2026-02-09',
    material: 'Algodón lavado suave',
    description:
      'Sin estructura, lavada a mano y con una visera que ya viene curvada. Se siente usada desde el primer día y acompaña cualquier plan de fin de semana.',
    features: ['Sin estructura', 'Lavado suave', 'Visera precurvada', 'Ajuste con correa de metal'],
    images: [px(7562957), px(18277115), px(21906701)]
  },
  {
    id: 14,
    name: 'Soft Color Dad Hat',
    category: 'Dad Hat',
    subcategory: 'Minimalista',
    price: 69900,
    oldPrice: 84900,
    discount: 18,
    colors: ['Morado', 'Azul'],
    sizes: ['Única'],
    stock: 13,
    rating: 4.5,
    reviews: 63,
    featured: false,
    bestseller: false,
    isNew: true,
    date: '2026-09-18',
    material: 'Algodón suave sin estructura',
    description:
      'Colores pastel y un corte relajado que se adapta a cualquier cabeza. La compañera perfecta para días de sol, viajes y fotos espontáneas.',
    features: ['Colores pastel', 'Tejido elástico suave', 'Correa ajustable', 'Bordado discreto lateral'],
    images: [px(9321573), px(23070927), px(20566252)]
  },
  {
    id: 15,
    name: 'Olive Embroidered Dad Hat',
    category: 'Dad Hat',
    subcategory: 'Bordada',
    price: 89900,
    oldPrice: 0,
    discount: 0,
    colors: ['Verde', 'Camel'],
    sizes: ['Única'],
    stock: 0,
    rating: 4.7,
    reviews: 49,
    featured: false,
    bestseller: false,
    isNew: false,
    date: '2026-06-30',
    material: 'Algodón peinado con bordado',
    description:
      'Bordado de ramas de olivo sobre algodón peinado en tonos tierra. Una gorra silenciosa, elegante y hecha para durar temporada tras temporada.',
    features: ['Bordado de ramas de olivo', 'Tonos tierra', 'Correa de cuero vegetal', 'Algodón peinado'],
    images: [px(10760585), px(17459731), px(19046783)]
  },
  {
    id: 16,
    name: 'Premium Leather Cap',
    category: 'Premium',
    subcategory: 'Cuero',
    price: 189900,
    oldPrice: 239900,
    discount: 21,
    colors: ['Negro', 'Burdeos'],
    sizes: ['Única', 'G'],
    stock: 5,
    rating: 4.9,
    reviews: 97,
    featured: true,
    bestseller: true,
    isNew: false,
    date: '2026-07-01',
    material: 'Cuero genuino y forro de satén',
    description:
      'Confeccionada en cuero genuino de curtido vegetal con forro de satén y herrajes metálicos. Una pieza de lujo discreto que envejece con carácter.',
    features: ['Cuero genuino curtido vegetal', 'Forro de satén', 'Herrajes metálicos', 'Bordado en relieve', 'Estuche incluido'],
    images: [px(9280916), px(34432105), px(16796460)]
  },
  {
    id: 17,
    name: 'Silk Touch Premium Cap',
    category: 'Premium',
    subcategory: 'Seda',
    price: 159900,
    oldPrice: 199900,
    discount: 20,
    colors: ['Blanco', 'Rosa'],
    sizes: ['Única'],
    stock: 8,
    rating: 4.7,
    reviews: 68,
    featured: false,
    bestseller: false,
    isNew: false,
    date: '2026-08-10',
    material: 'Mezcla de seda y algodón',
    description:
      'Brillo sutil, tacto sedoso y un corte impecable. Pensada para eventos, celebraciones y quienes prefieren el minimalismo lujoso.',
    features: ['Mezcla de seda 30%', 'Bordado con hilo metálico', 'Visera estructurada', 'Estuche de regalo'],
    images: [px(16144421), px(12032301), px(29036404)]
  },
  {
    id: 18,
    name: 'Artisan Signature Cap',
    category: 'Premium',
    subcategory: 'Artesanal',
    price: 209900,
    oldPrice: 0,
    discount: 0,
    colors: ['Burdeos', 'Negro'],
    sizes: ['Única', 'G'],
    stock: 3,
    rating: 5,
    reviews: 31,
    featured: true,
    bestseller: false,
    isNew: true,
    date: '2026-09-28',
    material: 'Lana merino artesanal',
    description:
      'Producción artesanal en lotes de 50 unidades. Lana merino, costuras a mano y una firma bordada que certifica el número de pieza de cada gorra.',
    features: ['Lana merino 100%', 'Costuras a mano', 'Número de pieza único', 'Empaque de colección'],
    images: [px(20645804), px(1144721), px(1484802)]
  }
];

/* ---------------------------------------------------------------
   Consultas y utilidades del catálogo
   --------------------------------------------------------------- */

/** Devuelve un producto por su id (Number). */
function getProductById(id) {
  const numericId = Number(id);
  return PRODUCTS.find((product) => product.id === numericId) || null;
}

/** Productos relacionados: misma categoría, excluyendo el producto actual. */
function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  const sameCategory = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id);
  const others = PRODUCTS.filter((item) => item.category !== product.category && item.id !== product.id);
  return sameCategory.concat(others).slice(0, limit);
}

/** Lista única de categorías presentes en el catálogo. */
function getAllCategories() {
  return [...new Set(PRODUCTS.map((product) => product.category))];
}

/** Subcategorías de una categoría (o de todas si no se indica). */
function getSubcategories(category) {
  const source = category
    ? PRODUCTS.filter((product) => product.category === category)
    : PRODUCTS;
  return [...new Set(source.map((product) => product.subcategory))];
}

/** Lista única de colores disponibles. */
function getAllColors() {
  return [...new Set(PRODUCTS.flatMap((product) => product.colors))];
}

/** Rango de precios del catálogo. */
function getPriceRange() {
  const prices = PRODUCTS.map((product) => product.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Descuento real calculado desde oldPrice (0 si no hay promoción). */
function calcDiscount(product) {
  if (!product.oldPrice || product.oldPrice <= product.price) return product.discount || 0;
  return Math.round((1 - product.price / product.oldPrice) * 100);
}
