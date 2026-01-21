import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  test: {
    include: ['src/engine/test/**/*.test.ts'],
    exclude: ['tests/**/*'],
  },
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
});
