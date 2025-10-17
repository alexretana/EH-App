import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDevelopment = mode === 'development';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: isDevelopment ? {
        '/api': {
          target: env.DOCKER_ENV === 'true'
            ? 'http://eh-app-backend:8000'
            : 'http://localhost:8000',
          changeOrigin: true,
        },
      } : undefined,
      watch: {
        usePolling: true,
        interval: 1000,
      },
      host: true,
      strictPort: true,
      port: 5173,
      allowedHosts: ['localhost', '127.0.0.1'],
    },
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: isDevelopment ? false : 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
          },
        },
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/api'),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'development'),
    },
  };
});
