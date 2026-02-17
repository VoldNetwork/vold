import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const target = process.env.VITE_BUILD_TARGET || 'app'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@app': path.resolve(__dirname, './src/app'),
        '@dashboard': path.resolve(__dirname, './src/dashboard'),
      },
    },
    define: {
      'import.meta.env.VITE_BUILD_TARGET': JSON.stringify(target),
    },
  }
})
