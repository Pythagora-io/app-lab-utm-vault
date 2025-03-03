import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["localhost", ".deployments.pythagora.ai"],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Make sure Google OAuth callback is properly proxied
      '/api/google/callback': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
})