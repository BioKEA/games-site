import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Stub the cloudflare:workers virtual module so unit tests can import
      // API endpoint files without the Workers runtime.
      'cloudflare:workers': fileURLToPath(
        new URL('./tests/unit/__mocks__/cloudflare-workers.ts', import.meta.url),
      ),
    },
  },
});
