# Technical Context: Bengkelku Mobile

## 1. Core Technologies
- **JavaScript Framework:** Vue.js (^3.5.13)
- **UI Component Library:** Vuetify (^3.8.0-beta.0 - *Note: Beta version*)
- **Routing Library:** Vue Router (^4.5.0)
- **Build Tool / Dev Server:** Vite (^6.2.0)
- **Package Manager:** npm (confirmed by `package-lock.json`)
- **Language:** JavaScript (ES6+ syntax likely used within `.vue` files)
- **Styling:** CSS (`src/style.css`), potentially scoped CSS within `.vue` files, and Vuetify's built-in styling.

## 2. Development Environment Setup
- **Node.js & npm:** Required to install dependencies and run scripts defined in `package.json`.
- **Code Editor:** VS Code (implied by user environment).
- **Browser:** For testing and debugging the SPA.

## 3. Key Files & Directories
- `index.html`: Main HTML entry point (likely minimal, Vite injects scripts).
- `package.json`: Project metadata, dependencies, and scripts (e.g., `dev`, `build`).
- `vite.config.js`: Vite configuration file.
- `src/`: Main source code directory.
  - `main.js`: Application entry point.
  - `App.vue`: Root Vue component.
  - `style.css`: Global CSS styles.
  - `assets/`: Static assets like images.
  - `components/`: Reusable UI components.
  - `layouts/`: Layout components (e.g., `MainLayout.vue`).
  - `plugins/`: Plugin configurations (e.g., `vuetify.js`).
  - `router/`: Routing configuration (`index.js`).
  - `views/`: Page-level components mapped by the router.
- `public/`: Static assets copied directly to the build output.
- `memory-bank/`: Project documentation and context (this directory).

## 4. Dependencies (Confirmed from `package.json`)
- **Core:** `vue`, `vuetify`, `vue-router`
- **Build:** `@vitejs/plugin-vue`, `vite`
- **Styling:** `@mdi/font` (Material Design Icons)

## 5. Technical Constraints / Considerations
- **Client-Side Only:** Currently appears to be a frontend-only application. Data persistence is likely handled via browser storage or needs a backend API.
- **Mobile Focus:** Although built with web technologies, the naming and potential use case suggest a mobile-first design approach. Responsiveness is important.
- **Vuetify Version:** Compatibility between Vue, Vuetify, and Vue Router versions is crucial.

*This context is based on the file structure and established patterns. Reviewing `package.json` and specific code files will provide more detail.*
