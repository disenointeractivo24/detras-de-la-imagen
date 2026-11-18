import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Rutas relativas: el sitio funciona en GitHub Pages (servido en una subcarpeta).
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
