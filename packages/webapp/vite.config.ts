import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

// Use single-file build for AI Studio Build deployment (set VITE_SINGLE_FILE=true)
const useSingleFile = process.env.VITE_SINGLE_FILE === 'true';

export default defineConfig({
  envPrefix: ['GEMINI_', 'VITE_'],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    ...(useSingleFile ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  build: {
    rollupOptions: {
      output: useSingleFile ? {} : {
        manualChunks: {
          react: ['react', 'react-dom'],
          lucide: ['lucide-react'],
          genai: ['@google/genai'],
        },
      },
    },
  },
});
