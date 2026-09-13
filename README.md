# Portafolio — petersxx

Sitio web personal para mostrar mis trabajos de desarrollo de páginas web y creación de software.

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
├── js/main.js      # Interactividad (menú, tema, animaciones, formulario)
└── js/chrome.js    # Shader WebGL del fondo de cromo líquido
```

## Ver en local

Abrí `index.html` en el navegador, o levantá un servidor simple:

```bash
python3 -m http.server 8000
```

y entrá a http://localhost:8000

## Personalizar

- **Proyectos:** editá las tarjetas en la sección `#proyectos` de `index.html`.
- **Email de contacto:** cambiá `CONTACT_EMAIL` al inicio de `js/main.js`.
- **Estadísticas:** ajustá los números en `STATS` dentro de `js/main.js`.
- **Colores:** modificá las variables CSS en `:root` de `css/styles.css`.

## Publicar con GitHub Pages

En el repo: **Settings → Pages → Source: Deploy from a branch → `main` / root**.
El sitio quedará en `https://petersxx.github.io/portafolio/`.
