# Progress: Bengkelku Mobile

## 1. What Works
- **Project Structure:** Basic Vue/Vite project structure is in place.
- **Core Dependencies:** Vue (^3.5.13), Vuetify (^3.8.0-beta.0), Vue Router (^4.5.0) are set up and initialized correctly (`main.js`, `plugins/vuetify.js`, `router/index.js`).
- **Routing:** Routes are defined for all core views, using lazy loading (`router/index.js`).
- **Layout:** `MainLayout.vue` provides the main app structure with a top app bar (including a conditional PWA install button) and compact bottom navigation. Includes conditional Purchase Cart FAB. Uses `usePwaInstall` composable.
- **Root Component:** `App.vue` correctly uses the router view.
- **HomePage:** `HomePage.vue` displays a welcome message and includes a functional button to navigate to the "Add Service" page.
- **AddServicePage:** `AddServicePage.vue` UI is built, saves new customers/vehicles, and **now allows saving services without selecting/adding a customer (walk-in)**.
- **ServiceListPage:** `ServiceListPage.vue` fetches and displays services from Local Storage.
- **ServiceDetailPage:** `ServiceDetailPage.vue` fetches and displays service details, allows adding Jasa (with predefined options/quick prices) & Parts, calculates cost, updates status, and deletes services. Stock is deducted when parts are used, and **stock is now reverted when services are deleted**.
- **localStorage.js:** Implemented core functions for managing Services, Customers, Vehicles, Stock Items, Purchases, and Purchase Cart (Add, Get, Update, Delete where applicable, Clear All). Both `deletePurchase` and **`deleteService` now include stock reversal logic**. Includes sample data initialization. **Fixed duplicate `itemId` generation in `addItem` function used during initialization.** **Corrected handling of string-based `itemId`s in `getItemById`, `updateItem`, `deleteItem`, and `updateItemStock` by removing incorrect `Number()` conversions.**
- **AddItemPage:** Saves new stock items with basic validation.
- **StockPage:** Lists, searches, edits (incl. `stokMinimal`), and deletes stock items. Includes low stock alert, "Beli Stok" button to add items to the purchase cart (now passes `null` for `hargaBeli` if not available), and a button to navigate to Purchase History.
- **PurchaseCartPage:** Displays items added to the cart, allows editing quantity/price, removing items, clearing the cart, and finalizing the purchase (which saves the record and updates stock).
- **CustomerListPage:** Lists, searches, edits, and deletes customers. Navigates to detail page.
- **CustomerDetailPage:** Displays customer info, vehicle list (with Add/Edit/Delete), and service history. Allows editing/deleting the customer.
- **PurchaseHistoryPage:** Fetches and displays recorded purchases.
- **SettingsPage:** Includes "Clear All Data" functionality. Settings items (Profile, Info, PWA, Logout) now navigate to placeholder pages.
- **UI Notifications:** Replaced standard `alert()` calls with Vuetify `v-snackbar` components across multiple views (`StockPage`, `SettingsPage`, `ServiceDetailPage`, `PurchaseCartPage`, `CustomerListPage`, `CustomerDetailPage`, `AddServicePage`, `AddItemPage`) for improved user feedback.
- **Settings Sub-Pages:** Created placeholder views (`UserProfilePage.vue`, `WorkshopInfoPage.vue`, `PwaSettingsPage.vue`) and corresponding routes.
- **Form Validation:** Enhanced validation rules in several forms:
    - `AddItemPage.vue`: Added rule for Harga Jual >= Harga Beli and **unique item code check**.
    - `AddServicePage.vue`: Added phone number format validation for new customer dialog.
    - `CustomerListPage.vue`: Added phone number format validation for edit dialog.
    - `CustomerDetailPage.vue`: Added phone number format validation for edit dialog.
    - `StockPage.vue`: Added required, number, Harga Jual, and **unique item code rules** to edit dialog.
- **Workshop Info Settings:** Implemented functionality to save and load workshop name, address, and phone number in `WorkshopInfoPage.vue` using Local Storage.
- **User Profile Settings:** Implemented basic functionality to save and load user display name (`namaTampilan`) in `UserProfilePage.vue` using Local Storage.
- **PWA Settings:** Refactored to use shared `usePwaInstall` composable for install prompt logic. Displays install button based on composable state. Added placeholder for cache management. **`vite-plugin-pwa` configured in `vite.config.js` for manifest (incl. narrow/wide screenshots, categories, protocol_handlers) and service worker generation. Required icon/screenshot files need to be created by user.**
- **Reporting Page:** Created `ReportingPage.vue` with basic service summary and **stock summary (total items, low stock count)**. Added navigation link in `MainLayout.vue`.
- **UI Theme:** Applied a custom light theme (Sleek Grey/Charcoal: Primary `#37474F`, Secondary `#42A5F5`) in `src/plugins/vuetify.js`.
- **UI Blueprint:** Applied the Vuetify MD3 blueprint for modern component styling in `src/plugins/vuetify.js`.
- **UI Navigation:** Revised navigation in `MainLayout.vue`:
    - Bottom Navigation: Home, Services, Stock, Customers, Laporan.
    - App Bar: Added Profile icon menu with links to Profil and Pengaturan Lainnya.
- **UI Compactness:**
    - Refactored `StockPage.vue` from cards to a compact list view.
    - Applied `density="compact"` to list, cards, and form fields in `PurchaseCartPage.vue`.

## 2. What's Left to Build / Verify
- **Functionality Implementation:** Potential future enhancements:
    - **Reporting:** Add more detailed reports (e.g., list low stock items, purchase history summary).
    - **Settings:** Implement actual functionality within the remaining placeholder settings pages (Logout - requires secure backend for proper implementation). Implement password change (requires secure backend). Implement PWA cache clearing (requires Service Worker).
- **Data Persistence:** Consider data relationships on delete (e.g., orphan handling for customers/vehicles).
- **UI Completeness & Polish:** Continue refining UI/UX based on the new theme. Add missing loading/error states.
- **Validation:** Continue implementing more robust form validation where needed (e.g., unique constraints).
- **Error Handling:** Implement proper error handling for data operations.
- **Testing:** Implement unit/integration tests.

## 3. Current Status
- **Core Features Implemented:** Basic CRUD operations for Services, Stock, Customers, and Vehicles are functional using Local Storage. Purchase Cart workflow is implemented.

## 4. Known Issues / Blockers
- **Filtering/Status Logic:** Filtering in lists could be enhanced.
- **PWA Install Prompt:** Needs testing in a production build served over HTTPS to confirm prompt appearance.
- **~~Duplicate Item IDs:~~** ~~`itemId`s were identical during dummy data initialization due to non-unique ID generation.~~ **(Fixed)**

*This document reflects the current state after applying compactness improvements to Stock and Purchase Cart pages.*
