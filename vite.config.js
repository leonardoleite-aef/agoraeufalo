import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    open: false
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
});
