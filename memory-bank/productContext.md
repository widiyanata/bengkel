# Product Context: Bengkelku Mobile

## 1. Problem Solved
Traditional workshop management often relies on manual record-keeping (paper logs, basic spreadsheets), which can be inefficient, prone to errors, and difficult to track over time. This application aims to digitize and streamline these processes for auto repair workshops ("bengkel").

## 2. Business Model Context
- **Commercial Goal:** To be sold commercially with Free and Pro tiers.
- **Development Strategy:** Implement the Free version first, with Pro features planned as add-on modules.
- **Scope (Free Version):** Focus on core operational needs, deferring features like onboarding/tutorials and appointment booking.

## 3. Target Audience Needs (Workshop Staff)
- **Efficiency:** Faster recording of services, inventory management, invoicing, and customer lookups.
- **Accuracy:** Reduce manual data entry errors, especially in pricing and stock counts.
- **Accessibility:** Easy access to workshop data via a mobile-first PWA interface.
- **Organization:** Centralized tracking of services, stock, customers, purchases, and invoices.
- **Simplicity:** An intuitive interface requiring minimal training.

## 4. Key Features & Workflow (Free Version)
- **Service Management:** Record services (walk-in or for existing customers), add predefined/custom jasa (services) and parts (from inventory), track status (Menunggu, Dalam Pengerjaan, Selesai), search by license plate (flexible search). Stock is deducted when parts are added.
- **Inventory Management:** Record stock items (parts/spare parts) with purchase/sale prices, search by name/code. Stock levels are updated by purchases and service part usage.
- **Invoice Management:** Generate invoices from *completed* services or directly (walk-in). Edit invoices by adding/removing parts/jasa. Print/download invoices. Track payment status.
- **Purchase Management:** Record purchases of stock items, updating inventory levels upon finalization.
- **Customer Management (Basic):** Store customer and vehicle details, view service history per customer. (Partially implemented)
- **Reporting (Basic):** View summaries of daily revenue, parts usage, completed services, stock levels. (Partially implemented)
- **Settings (Basic):** Configure workshop information (name, address, contact), user profile display name. (Partially implemented)

## 5. Key Features (Pro Version - Planned)
- Booking/Appointments
- Advanced Customer Management (Loyalty, Reminders)
- Advanced Reporting & Analytics
- Payment Gateway Integration
- Advanced Inventory Management (Min Stock Alerts, Auto-Ordering)
- Data Export/Import/Sync
- Separate Customer-Facing App

## 6. Business Rules (Free Version)
- Invoices can only be created for services with status "Selesai" (Completed).
- Services cannot be edited if their associated invoice has been marked as paid.
- Adding a service for a walk-in customer should allow invoice creation directly from the service detail page.
- The "View Invoice" button must always function regardless of payment status.
- Stock levels must be correctly adjusted (deducted for service parts, added for purchases) and **reverted** if the corresponding service or purchase record is deleted.
- Item codes must be unique.
- Harga Jual (Selling Price) must be >= Harga Beli (Purchase Price) for stock items.

## 7. User Experience Goals & UI Preferences
- **Core Goals:** Intuitive, Fast, Clear, Reliable, Mobile-First.
- **Visual Style:**
    - Use the custom light theme (Sleek Grey/Charcoal) and MD3 blueprint.
    - Prefer light grey backgrounds over bright white for better contrast.
    - Ensure high contrast between chip background and text color.
- **Layout & Density:**
    - Use compact layouts for mobile (cards, lists, forms, dashboard components). Apply `density="compact"` where appropriate.
    - Use visual grid layout for Stock page cards.
    - Use icon+text layout for homepage quick actions.
- **Component Specifics:**
    - **Dashboard:** Smaller padding, compact fonts, compact lists for active services/low stock.
    - **Stock Page:** Visual cards with stock indicators/progress bars, colored toolbars for dialogs, filter/sort controls (collapsible on mobile), icon-only header buttons on mobile, text+icon action buttons.
    - **Invoice Lists:** Visual cards with status badges (Paid/Unpaid, Walk-in). Responsive filters/sorting.
    - **Invoice Detail:** Organized cards for info (workshop, customer, vehicle), distinct list/table view for items (mobile/desktop), visual cost summary, prominent payment status card, clear action buttons.
    - **AppBar:** Global search (service, customer, part), dynamic title, notification button/badge (active services, low stock), scroll effects (elevation, blur).
    - **Bottom Navigation:** Compact layout, notification badges (Service, Stock), hide-on-scroll behavior, "Lainnya" menu for less frequent items (moved back: Laporan now visible).
    - **FAB:** Contextual Floating Action Button, hide-on-scroll behavior.
- **Interactions:**
    - Use `v-snackbar` for notifications instead of `alert()`.
    - Implement smooth transitions and animations.
    - Provide clear confirmation dialogs for destructive actions.
    - Handle null/undefined values gracefully in the UI.
    - Ensure dropdowns are not cut off on mobile.
    - Implement comprehensive form validation using Vuetify rules.

*This context incorporates details from `memori-agment.md` and reflects the desired product behavior and user experience.*
