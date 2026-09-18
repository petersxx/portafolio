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
├── css/styles.css  # Estilos
├── js/main.js      # Interactividad (menú, tema, animaciones, CD con scroll, formulario)
├── js/chrome.js    # Shader WebGL del fondo de cromo líquido
└── assets/img/     # Cuadros del CD del hero (cambian con el scroll)
```

## Ver en local

Levantá un servidor simple:

```bash
python3 -m http.server 8000
```

y entrá a http://localhost:8000

## Personalizar

- **Proyectos:** editá las tarjetas en la sección `#proyectos` de `index.html`.
- **Número de WhatsApp:** cambiá `WHATSAPP_NUMBER` al inicio de `js/main.js` (con código de país, sin `+` ni espacios).
- **Estadísticas:** ajustá los números en `STATS` dentro de `js/main.js`.
- **Colores:** modificá las variables CSS en `:root` de `css/styles.css`.

## Publicar

El sitio está desplegado en Vercel (proyecto `portafolio`). Al ser estático no necesita build:
desde la carpeta del proyecto, `vercel` publica una vista previa y `vercel --prod` la versión de producción.
