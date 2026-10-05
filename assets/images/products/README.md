# imágenes locales de productos

Coloca aquí las fotos de tus gorras si prefieres no depender de imágenes externas.

## Cómo reemplazar una imagen externa por una local

1. Guarda la foto en esta carpeta, por ejemplo: `urban-black-cap-1.jpg`
2. Abre `js/products.js` y localiza el producto.
3. Reemplaza la URL remota por la ruta local:

```js
// antes
images: [px(18670550), px(13876038), px(30731085)]

// después
images: [
  "assets/images/products/urban-black-cap-1.jpg",
  "assets/images/products/urban-black-cap-2.jpg",
  "assets/images/products/urban-black-cap-3.jpg"
]
```

> Nota: las páginas dentro de `pages/` construyen las rutas con `BASE_PATH`,
> por lo que la ruta local debe escribirse **relativa a la raíz del proyecto**
> tal como aparece arriba. Si una imagen no carga, se muestra automáticamente
> `placeholder.svg`.
