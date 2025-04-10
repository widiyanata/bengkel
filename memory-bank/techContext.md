# Technical Context: Bengkelku Mobile

## 1. Core Technologies
- **JavaScript Framework:** Vue.js (^3.5.13)
- **UI Component Library:** Vuetify (^3.8.0-beta.0 - *Note: Beta version*)
- **Routing Library:** Vue Router (^4.5.0)
- **Build Tool / Dev Server:** Vite (^6.2.0)
- **PWA Plugin:** `vite-plugin-pwa`
- **Package Manager:** npm (confirmed by `package-lock.json`)
- **Language:** JavaScript (ES6+ syntax used within `.vue` files and `.js` modules).
- **Styling:** CSS (`src/style.css`), scoped CSS within `.vue` files, and Vuetify's built-in styling (using MD3 blueprint and custom theme).
- **Data Storage:** Browser Local Storage (managed via `src/stores/localStorage.js`).

## 2. Development Environment Setup
- **Operating System:** Windows (user environment)
- **Shell:** Windows PowerShell (user preference)
- **Node.js & npm:** Required for dependencies and scripts.
- **Code Editor:** VS Code (user environment).
- **Browser:** For testing and debugging the PWA.
- **Run Scripts:** `.bat` files (`start-bengkelku.bat`, `bengkelku-menu.bat`) are provided for easier execution of `npm run dev`, `build`, etc., on Windows.

## 3. Key Files & Directories
- `index.html`: Main HTML entry point.
- `package.json`: Project metadata, dependencies, scripts.
- `vite.config.js`: Vite configuration file.
- `src/`: Main source code directory.
  - `main.js`: Application entry point.
  - `App.vue`: Root Vue component.
  - `style.css`: Global CSS styles.
  - `assets/`: Static assets like images.
  - `components/`: Reusable UI components.
  - `layouts/`: Layout components (e.g., `MainLayout.vue`).
  - `plugins/`: Plugin configurations (`vuetify.js`).
  - `router/`: Routing configuration (`index.js`).
  - `stores/`: Data management logic (`localStorage.js`).
  - `composables/`: Reusable stateful logic (`usePwaInstall.js`, etc.).
  - `utils/`: Utility functions.
  - `views/`: Page-level components mapped by the router.
- `public/`: Static assets (icons, screenshots) copied directly to the build output.
- `memory-bank/`: Project documentation and context.
- `.clinerules`: Project-specific AI assistant guidelines.
- `.bat` files: Helper scripts for running the application on Windows.

## 4. Dependencies (Key - Confirmed from `package.json` & Usage)
- **Core:** `vue` (^3.5.13), `vuetify` (^3.8.0-beta.0), `vue-router` (^4.5.0)
- **Build:** `@vitejs/plugin-vue`, `vite` (^6.2.0)
- **PWA:** `vite-plugin-pwa`
- **Styling:** `@mdi/font` (Material Design Icons)

## 5. Technical Constraints / Considerations
- **Client-Side Only / Local Storage:** The application is entirely client-side. All data persistence relies **solely on Browser Local Storage**. This has limitations:
    - **Data Loss:** Data is lost if browser data is cleared. No server backup.
    - **Storage Limits:** Browsers impose limits on Local Storage size (typically 5-10MB).
    - **Synchronous:** Local Storage operations are synchronous, which can potentially block the main thread with large amounts of data (though less likely with current scope).
    - **No Multi-User/Device Sync:** Data is isolated to the specific browser instance.
- **Mobile-First PWA:** Design and functionality prioritize mobile use cases and leverage PWA features (installability, offline potential via service worker).
- **Vuetify Beta Version:** Using `^3.8.0-beta.0` might introduce instability or require adjustments when upgrading to stable releases.
- **No Backend:** Features requiring server-side logic (secure auth, multi-user collaboration, robust backups, complex reporting) are not feasible with the current architecture.

*This context incorporates details from `memori-agment.md` and confirmed project state.*
