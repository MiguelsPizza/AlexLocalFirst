import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from "vite-plugin-wasm";
import topLevelAwait from 'vite-plugin-top-level-await'
import tsconfigPaths from 'vite-tsconfig-paths'



import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  worker: {
    format: 'es',
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        // type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,mjs,onnx}'],
      },
      strategies: 'generateSW',
      // srcDir: 'src',
      // filename: 'service-worker.js',
      // manifestFilename: 'manifest.json',
      // injectManifest: {
      //   swSrc: 'src/service-worker.tsx',
      //   sourcemap: true,
      //   enableWorkboxModulesLogs: true,
      //   globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,mjs,onnx}'],
      // },
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src/components') },
    ],
  },
});
