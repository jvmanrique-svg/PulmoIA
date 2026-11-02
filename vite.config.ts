import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expone el servidor en 0.0.0.0 y localhost
    port: 5173,
    open: true,
  }
});
