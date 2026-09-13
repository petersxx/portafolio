# Main Technologies

Sitio web de Main Technologies, empresa de desarrollo de software: servicios, proyectos y contacto.

## Tecnologías

- HTML5 semántico
- CSS3 (variables, grid, modo claro/oscuro)
- JavaScript vanilla (sin dependencias ni build)
- WebGL para el fondo de cromo líquido animado
- three.js (desde CDN) para el disco 3D que gira con el scroll

## Estructura

```
portafolio/
├── index.html      # Página principal
├── css/styles.css  # Estilos
├── js/main.js      # Interactividad (menú, tema, animaciones, formulario)
├── js/chrome.js    # Shader WebGL del fondo de cromo líquido
├── js/disc.js      # Disco 3D (three.js): foco de luz y rotación con scroll
└── assets/models/disco.glb  # Modelo del disco, optimizado (meshopt + WebP)
```

## Ver en local

Levantá un servidor simple (el disco 3D no carga si abrís `index.html` directo como archivo):

```bash
python3 -m http.server 8000
```

y entrá a http://localhost:8000

## Personalizar

- **Proyectos:** editá las tarjetas en la sección `#proyectos` de `index.html`.
- **Número de WhatsApp:** cambiá `WHATSAPP_NUMBER` al inicio de `js/main.js` (con código de país, sin `+` ni espacios).
- **Estadísticas:** ajustá los números en `STATS` dentro de `js/main.js`.
- **Colores:** modificá las variables CSS en `:root` de `css/styles.css`.

## Publicar con GitHub Pages

En el repo: **Settings → Pages → Source: Deploy from a branch → `main` / root**.
El sitio quedará en `https://petersxx.github.io/portafolio/`.
