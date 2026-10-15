# 💸 Mis Gastos

App web para controlar ingresos y gastos. Sin dependencias ni build: HTML + CSS + JavaScript puro. Los datos se guardan en el `localStorage` del navegador.

## Estructura

```
gastos-app/
├── index.html
├── css/styles.css
├── js/app.js
└── README.md
```

## Probar en local

Abre `index.html` en el navegador (doble clic).

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `gastos-app`).
2. Sube el contenido de esta carpeta a la rama `main`:
   ```bash
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/gastos-app.git
   git push -u origin main
   ```
3. En el repo: **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, carpeta `/ (root)`. Guarda.
4. En 1-2 minutos tu app estará en `https://TU_USUARIO.github.io/gastos-app/`.
