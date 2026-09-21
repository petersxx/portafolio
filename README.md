# Main Technologies

Sitio web de Main Technologies, empresa de desarrollo de software: servicios, proyectos y contacto.

## Tecnologías

- HTML5 semántico
- CSS3 (variables, grid, modo claro/oscuro)
- JavaScript vanilla (sin dependencias ni build)
- WebGL para el fondo de cromo líquido animado

## Estructura

```
portafolio/
├── index.html      # Página principal
├── planes.html     # Detalle de cada plan (Básico, Standard, Business)
├── standard.html   # Página propia del plan Standard
├── css/styles.css  # Estilos
├── js/common.js    # Compartido por las dos páginas (tema, menú, apariciones, WhatsApp)
├── js/main.js      # Solo index.html (menú activo, CD con scroll, Servicios, formulario)
├── js/chrome.js    # Shader WebGL del fondo de cromo líquido
└── assets/img/     # Cuadros del CD del hero e imagen para compartir (og-image.jpg)
```

## Ver en local

Levantá un servidor simple:

```bash
python3 -m http.server 8000
```

y entrá a http://localhost:8000

## Personalizar

- **Proyectos:** editá las tarjetas en la sección `#proyectos` de `index.html`.
- **Precios:** editá las tarjetas `.plan-card` en la sección `#precios` de `index.html` el detalle de cada plan en `planes.html` y la página del Standard en `standard.html` (los montos se repiten en los tres archivos).
- **Número de WhatsApp:** cambiá `WHATSAPP_NUMBER` al inicio de `js/common.js` (con código de país, sin `+` ni espacios).
- **Colores:** modificá las variables CSS en `:root` de `css/styles.css`.

## Publicar

El sitio está desplegado en Vercel (proyecto `portafolio`) en https://maintechnologies.dev. Al ser estático no necesita build:
desde la carpeta del proyecto, `vercel` publica una vista previa y `vercel --prod` la versión de producción.
