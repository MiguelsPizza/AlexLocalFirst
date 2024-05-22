import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from "vite-plugin-wasm";
import topLevelAwait from 'vite-plugin-top-level-await'


import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wasm(), topLevelAwait(), react(), VitePWA({
    registerType: 'autoUpdate', devOptions: {
      enabled: true
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,mjs}']
    }
  })],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src/components') },
    ],
  },

})
