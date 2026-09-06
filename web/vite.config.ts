import { defineConfig } from 'vite';

// Builds a static bundle embedded into the Go binary via go:embed.
// Output goes to internal/serve/dist so `git-who serve` serves it with no
// extra runtime. Vite is only a build-time devDependency (see README).
export default defineConfig({
  build: {
    outDir: '../internal/serve/dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8080',
    },
  },
});
