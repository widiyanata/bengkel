# System Patterns: Bengkelku Mobile

## 1. Architecture Style
- **Single Page Application (SPA):** The application uses Vue Router to manage navigation within a single HTML page (`index.html`), dynamically loading different views (`.vue` files) without full page reloads.
- **Component-Based Architecture:** The UI is built using reusable Vue components (`.vue` files located in `src/components/` and `src/views/`). Views likely compose smaller components.

## 2. Key Technical Decisions & Patterns
- **UI Framework:** Vuetify is used for UI components, layout, and styling, ensuring a consistent Material Design look and feel. (`src/plugins/vuetify.js`)
- **Routing:** Vue Router handles client-side routing, mapping URLs to specific views. (`src/router/index.js`)
- **Layout Management:** A main layout component (`src/layouts/MainLayout.vue`) likely provides the consistent structure (e.g., app bar, navigation drawer) across different views. `App.vue` probably uses this layout.
- **Build System:** Vite is used for development server and production builds, offering fast Hot Module Replacement (HMR). (`vite.config.js`)
- **Entry Point:** `src/main.js` initializes the Vue app instance, registers plugins (Vuetify, Router), and mounts the root component (`App.vue`).

## 3. Data Management (Confirmed)
- **Current State:** No dedicated state management library (like Pinia or Vuex) is installed according to `package.json`.
- **Likely Approaches:**
    - **Component Local State:** Data is likely managed within individual components using `ref` or `reactive`.
    - **Props/Events:** Parent components might pass data down via props and receive updates via emitted events.
- **Provide/Inject:** Vue's provide/inject API might be used for deeper state sharing (Usage not confirmed).
- **Local Storage:** **Primary data persistence mechanism.** All core application data (services, stock, customers, vehicles, purchases, settings) is managed via functions within `src/stores/localStorage.js`.
- **Composables:** Reusable stateful logic is extracted into composables (e.g., `src/composables/usePwaInstall.js`, `useAppStatus.js`, `useDashboardStats.js`).
- **State Management Library:** No dedicated library (Pinia/Vuex) is currently used. State is managed locally, via props/events, or through composables.

## 4. PWA Patterns
- **Configuration:** `vite-plugin-pwa` is used in `vite.config.js` to configure the manifest, service worker generation (`GenerateSW`), icons, screenshots, etc.
- **Install Prompt:** Managed via the `beforeinstallprompt` event, typically handled within a composable (`usePwaInstall.js`) and exposed to UI components (`MainLayout.vue`, `PwaSettingsPage.vue`).

## 5. Component Relationships (High-Level)
- `main.js` -> Initializes Vue App with `App.vue`, registers plugins (Router, Vuetify).
- `App.vue` -> Uses `MainLayout.vue` and `<router-view>`.
- `MainLayout.vue` -> Provides structure (App Bar, Bottom Navigation, FAB), contains `<router-view>`, and may utilize composables (e.g., `usePwaInstall`).
- `router/index.js` -> Defines routes mapping paths to specific Views (e.g., `/stok` -> `StockPage.vue`), uses lazy loading.
- Views (`src/views/*.vue`) -> Represent distinct pages/screens, potentially composing smaller components from `src/components/` and utilizing composables.
- `localStorage.js` -> Central module for all data interactions with Browser Local Storage.

*This document incorporates confirmed patterns from code analysis and `memori-agment.md`.*
