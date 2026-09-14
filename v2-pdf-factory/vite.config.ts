import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Configuração do Vite projetada para rodar em paralelo (Strangler Fig) com a raiz do site.
export default defineConfig({
  plugins: [react()],
  base: './', // Para caminhos relativos
  build: {
    outDir: '../dist/v2-factory', // Não sobrescreve a raiz inteira
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  server: {
    port: 3001,
    strictPort: true
  }
});
