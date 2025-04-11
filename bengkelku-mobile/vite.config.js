import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({ // Add the PWA plugin configuration
      registerType: 'autoUpdate', // Automatically update the service worker
      injectRegister: 'auto', // Let the plugin handle registration script injection
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'], // Cache common assets
      },
      manifest: {
        name: 'BengkelPro Mobile',
        short_name: 'BengkelPro',
        description: 'Aplikasi Manajemen Bengkel Sederhana',
        theme_color: '#37474F', // Primary color as theme color
        background_color: '#F5F5F5', // Light grey background
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [ // Define app icons
          {
            src: 'icons/icon-192x192.png', // Placeholder path
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png', // Placeholder path
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png', // Maskable icon placeholder
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          }
        ],
        // Add screenshots for richer install UI
        screenshots: [
          {
            src: 'screenshots/screenshot1.png', // Placeholder path - User needs to create this
            sizes: '1080x1920', // Example size, adjust as needed
            type: 'image/png',
            form_factor: 'narrow', // Indicate it's for mobile portrait
            label: 'Tampilan Utama Mobile' // Description of the screenshot
          },
          {
            src: 'screenshots/screenshot2.png', // Placeholder path - User needs to create this
            sizes: '1920x1080', // Example size for desktop, adjust as needed
            type: 'image/png',
            form_factor: 'wide', // Indicate it's for desktop/wide screens
            label: 'Tampilan Utama Desktop' // Description of the screenshot
          }
        ],
        // Add categories
        categories: ['business', 'productivity', 'utilities'],
        // Add protocol handlers
        protocol_handlers: [
          {
            protocol: "web+bengkelpro",
            url: "/handle-url?url=%s" // Example URL structure, adjust as needed
          }
        ]
      },
    }),
  ],
});
