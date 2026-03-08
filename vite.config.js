import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // In production, VITE_API_URL will be the full backend URL, e.g.:
  //   https://api.lexilearn.example.com/api
  // In development it stays as /api (proxied below)
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    define: {
      // Shim required for amazon-cognito-identity-js in the browser
      global: 'window',
    },
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      // Generate source maps for easier debugging in production
      sourcemap: false,
      // Chunk large vendor libs so Amplify CDN can cache them separately
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            aws: ['amazon-cognito-identity-js'],
          },
        },
      },
    },
  }
})
