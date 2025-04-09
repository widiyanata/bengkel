import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../layouts/MainLayout.vue"; // We will create this layout component

// Placeholder view components (we will create these files)
const HomePage = () => import("../views/HomePage.vue");
const ServiceListPage = () => import("../views/ServiceListPage.vue");
const StockPage = () => import("../views/StockPage.vue");
const CustomerListPage = () => import("../views/CustomerListPage.vue");
const SettingsPage = () => import("../views/SettingsPage.vue");
const AddServicePage = () => import("../views/AddServicePage.vue");
const ServiceDetailPage = () => import("../views/ServiceDetailPage.vue");
const AddItemPage = () => import("../views/AddItemPage.vue");
// const RecordPurchasePage = () => import("../views/RecordPurchasePage.vue"); // Removed old page import
const CustomerDetailPage = () => import("../views/CustomerDetailPage.vue");
const AddCustomerPage = () => import("../views/AddCustomerPage.vue");
const PurchaseHistoryPage = () => import("../views/PurchaseHistoryPage.vue");
const PurchaseCartPage = () => import("../views/PurchaseCartPage.vue");
const InvoiceListPage = () => import("../views/InvoiceListPage.vue");
const InvoiceDetailPage = () => import("../views/InvoiceDetailPage.vue");
const WalkInInvoicePage = () => import("../views/WalkInInvoicePage.vue");

// Placeholder Settings Views
const UserProfilePage = () => import("../views/settings/UserProfilePage.vue");
const WorkshopInfoPage = () => import("../views/settings/WorkshopInfoPage.vue");
const PwaSettingsPage = () => import("../views/settings/PwaSettingsPage.vue");

// Reporting View
const ReportingPage = () => import("../views/ReportingPage.vue");


const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "", name: "Home", component: HomePage },
      { path: "/servis", name: "Servis", component: ServiceListPage },
      { path: "/stok", name: "Stok", component: StockPage },
      { path: "/pelanggan", name: "Pelanggan", component: CustomerListPage },
      { path: "/laporan", name: "Laporan", component: ReportingPage }, // Add Reporting route
      {
        path: "/pengaturan",
        name: "Pengaturan",
        component: SettingsPage,
        // Add children routes for settings sub-pages
        // children: [ // Consider if these should be nested or top-level within MainLayout
        //   { path: "profil", name: "UserProfile", component: UserProfilePage },
        //   { path: "bengkel", name: "WorkshopInfo", component: WorkshopInfoPage },
        //   { path: "pwa", name: "PwaSettings", component: PwaSettingsPage },
        // ]
      },
      // Define settings routes directly under MainLayout for simplicity for now
      { path: "/pengaturan/profil", name: "UserProfile", component: UserProfilePage },
      { path: "/pengaturan/bengkel", name: "WorkshopInfo", component: WorkshopInfoPage },
      { path: "/pengaturan/pwa", name: "PwaSettings", component: PwaSettingsPage },

      { path: "/servis/baru", name: "AddService", component: AddServicePage },
      { path: "/servis/:id", name: "ServiceDetail", component: ServiceDetailPage, props: true },
      { path: "/stok/barang-baru", name: "AddItem", component: AddItemPage },
      { path: "/pelanggan/baru", name: "AddCustomer", component: AddCustomerPage },
      // { path: "/stok/pembelian-baru", name: "RecordPurchase", component: RecordPurchasePage }, // Removed old route
      {
        path: "/pelanggan/:id",
        name: "CustomerDetail",
        component: CustomerDetailPage,
        props: true,
      },
      { path: "/stok/riwayat-pembelian", name: "PurchaseHistory", component: PurchaseHistoryPage },
      { path: "/keranjang-pembelian", name: "PurchaseCart", component: PurchaseCartPage }, // Add route for purchase cart
      { path: "/invoice", name: "InvoiceList", component: InvoiceListPage },
      { path: "/invoice/walk-in", name: "WalkInInvoice", component: WalkInInvoicePage },
      { path: "/invoice/:id", name: "InvoiceDetail", component: InvoiceDetailPage, props: true }
    ],
  },
  // Add other routes or layouts here if needed later
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Use history mode
  routes,
});

export default router;
