<template>
  <v-app>
    <!-- Enhanced App Bar -->
    <v-app-bar
      app
      color="primary"
      :elevation="scrolled ? 4 : 0"
      class="px-2"
      :class="{ 'app-bar-scrolled': scrolled }"
    >
      <!-- Show back button on detail pages -->
      <v-btn
        v-if="showBackButton"
        icon="mdi-arrow-left"
        @click="goBack"
        class="me-2"
      ></v-btn>

      <v-app-bar-title class="text-truncate d-none d-sm-block">
        {{ pageTitle }}
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Global Search -->
      <v-slide-x-transition>
        <v-text-field
          v-if="isSearchActive"
          v-model="searchQuery"
          density="compact"
          variant="solo"
          hide-details
          placeholder="Cari servis, pelanggan, part..."
          prepend-inner-icon="mdi-magnify"
          class="global-search"
          @keyup.enter="performSearch"
        ></v-text-field>
      </v-slide-x-transition>

      <v-btn v-if="!isSearchActive" icon @click="toggleSearch">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn v-if="isSearchActive" icon @click="toggleSearch">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <!-- Notification Button -->
      <v-btn icon class="ml-2" @click="showNotifications = !showNotifications">
        <v-badge
          :content="totalNotificationCount"
          :value="totalNotificationCount > 0"
          color="error"
          overlap
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <!-- Profile Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-account-circle" v-bind="props"></v-btn>
        </template>
        <v-list density="compact">
          <v-list-item to="/pengaturan/profil" prepend-icon="mdi-account">
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>
          <v-list-item to="/invoice" prepend-icon="mdi-file-document-outline">
            <v-list-item-title>Invoice</v-list-item-title>
          </v-list-item>
          <v-list-item to="/pengaturan" prepend-icon="mdi-cog">
            <v-list-item-title>Pengaturan Lainnya</v-list-item-title>
          </v-list-item>
          <!-- Add other items like Logout here later if needed -->
        </v-list>
      </v-menu>

      <!-- PWA Install Button -->
      <v-btn
        v-if="installPrompt"
        icon="mdi-download"
        title="Install Aplikasi"
        @click="triggerInstallPromptAction"
      ></v-btn>
    </v-app-bar>

    <!-- Notification Panel -->
    <v-navigation-drawer
      v-model="showNotifications"
      location="right"
      temporary
      width="300"
    >
      <v-list>
        <v-list-subheader>Notifikasi</v-list-subheader>

        <!-- Service Notifications -->
        <template v-if="pendingServicesCount > 0">
          <v-list-item
            prepend-icon="mdi-hammer-wrench"
            :title="`${pendingServicesCount} servis aktif`"
            subtitle="Klik untuk melihat detail"
            to="/servis"
            color="primary"
          ></v-list-item>
        </template>

        <!-- Low Stock Notifications -->
        <template v-if="lowStockCount > 0">
          <v-list-item
            prepend-icon="mdi-package-variant-closed-alert"
            :title="`${lowStockCount} stok menipis`"
            subtitle="Klik untuk melihat detail"
            to="/stok"
            color="warning"
          ></v-list-item>
        </template>

        <!-- No Notifications -->
        <v-list-item v-if="totalNotificationCount === 0">
          <v-list-item-title>Tidak ada notifikasi baru</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <!-- The main content for each page will be rendered here -->
      <router-view />
    </v-main>

    <!-- Enhanced Bottom Navigation -->
    <div class="bottom-nav-wrapper">
      <v-bottom-navigation
        v-model="activeTab"
        color="primary"
        grow
        :elevation="3"
        :class="{ 'bottom-nav-hidden': hideBottomNav }"
        class="bottom-nav-custom"
      >
      <v-btn value="home" to="/">
        <div class="nav-btn-content">
          <v-icon>mdi-home</v-icon>
          <span class="text-caption">Beranda</span>
        </div>
      </v-btn>

      <v-btn value="services" to="/servis">
        <div class="nav-btn-content">
          <v-badge
            :content="pendingServicesCount"
            :value="pendingServicesCount > 0"
            color="error"
            location="top end"
            offset-x="0"
            offset-y="0"
            class="badge-elevated"
          >
            <v-icon>mdi-hammer-wrench</v-icon>
          </v-badge>
          <span class="text-caption">Servis</span>
        </div>
      </v-btn>

      <v-btn value="inventory" to="/stok">
        <div class="nav-btn-content">
          <v-badge
            :content="lowStockCount"
            :value="lowStockCount > 0"
            color="warning"
            location="top end"
            offset-x="0"
            offset-y="0"
            class="badge-elevated"
          >
            <v-icon>mdi-archive-outline</v-icon>
          </v-badge>
          <span class="text-caption">Stok</span>
        </div>
      </v-btn>

      <v-btn value="invoices" to="/invoice">
        <div class="nav-btn-content">
          <v-icon>mdi-receipt</v-icon>
          <span class="text-caption">Invoice</span>
        </div>
      </v-btn>

      <v-btn value="more" @click="showMoreMenu = !showMoreMenu">
        <div class="nav-btn-content">
          <v-icon>mdi-dots-horizontal</v-icon>
          <span class="text-caption">Lainnya</span>
        </div>
      </v-btn>
    </v-bottom-navigation>
    </div>

    <!-- More Menu -->
    <v-bottom-sheet v-model="showMoreMenu">
      <v-list>
        <v-list-subheader>Menu Lainnya</v-list-subheader>
        <v-list-item to="/pelanggan" prepend-icon="mdi-account-group-outline" title="Pelanggan"></v-list-item>
        <v-list-item to="/laporan" prepend-icon="mdi-chart-bar" title="Laporan"></v-list-item>
        <v-list-item to="/pengaturan" prepend-icon="mdi-cog" title="Pengaturan"></v-list-item>
      </v-list>
    </v-bottom-sheet>

    <!-- Floating Action Button - Contextual -->
    <v-btn
      v-if="showFab && !hideFab"
      icon
      color="primary"
      position="fixed"
      size="large"
      class="floating-action-btn"
      :to="fabDestination"
      :class="{ 'fab-hidden': hideFab }"
    >
      <v-icon>{{ fabIcon }}</v-icon>
    </v-btn>

    <!-- Floating Action Button for Purchase Cart - Show only on Stock page -->
    <v-btn
      v-if="route.path === '/stok' && cartItemCount > 0 && !hideFab"
      icon
      color="secondary"
      position="fixed"
      size="large"
      class="cart-btn"
      to="/keranjang-pembelian"
      :class="{ 'fab-hidden': hideFab }"
    >
      <v-badge :content="cartItemCount" color="error" floating>
        <v-icon>mdi-cart-outline</v-icon>
      </v-badge>
    </v-btn>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePwaInstall } from '../composables/usePwaInstall.js';
import { useAppStatus } from '../composables/useAppStatus.js';

// Use router for navigation
const router = useRouter();
const route = useRoute();

// App status composable
const {
  pendingServicesCount,
  lowStockCount,
  totalNotificationCount,
  cartItemCount,
  pageTitle,
  fabIcon,
  fabDestination,
  showFab,
  hideFab,
  searchQuery,
  isSearchActive,
  hideBottomNav,
  toggleSearch,
  performSearch,
  loadData,
  cleanup
} = useAppStatus();

// PWA Install
const { installPrompt, triggerInstallPrompt } = usePwaInstall();

// UI state
const scrolled = ref(false);
const showBackButton = ref(false);
const showNotifications = ref(false);
const showMoreMenu = ref(false);
const activeTab = ref('home');

// Check if we should show back button
watch(() => route.path, (newPath) => {
  // Show back button on detail pages
  showBackButton.value = newPath.match(/\/servis\/\d+/) ||
                         newPath.match(/\/pelanggan\/\d+/) ||
                         newPath.match(/\/invoice\/\d+/) ||
                         newPath.includes('/baru') ||
                         newPath.includes('/edit');

  // Update active tab based on current route
  if (newPath === '/') activeTab.value = 'home';
  else if (newPath.includes('/servis')) activeTab.value = 'services';
  else if (newPath.includes('/stok')) activeTab.value = 'inventory';
  else if (newPath.includes('/invoice')) activeTab.value = 'invoices';
  else if (newPath.includes('/pelanggan') ||
           newPath.includes('/laporan') ||
           newPath.includes('/pengaturan')) activeTab.value = 'more';
});

// Handle scroll events
function handleScroll() {
  scrolled.value = window.scrollY > 0;
}

// Go back function
function goBack() {
  router.go(-1);
}

// PWA install prompt
async function triggerInstallPromptAction() {
  const { outcome } = await triggerInstallPrompt();
  if (outcome === 'accepted') {
    console.log('PWA installation accepted from layout.');
  } else {
    console.log('PWA installation dismissed from layout.');
  }
}

// Lifecycle hooks
onMounted(() => {
  loadData();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  cleanup();
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* App Bar Styles */
.global-search {
  max-width: 300px;
  transition: all 0.3s ease;
}

.app-bar-scrolled {
  backdrop-filter: blur(10px);
  background-color: rgba(var(--v-theme-primary), 0.95) !important;
}

/* Bottom Navigation Styles */
.bottom-nav-hidden {
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

/* Floating Action Button Styles */
.floating-action-btn, .cart-btn {
  position: fixed;
  bottom: 90px; /* Adjusted for the wrapper padding */
  right: 16px;
  z-index: 99;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease;
  transform: scale(1) translateY(0);
  opacity: 1;
}

.fab-hidden {
  transform: scale(0.8) translateY(80px);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.3s ease;
}

/* Ensure FAB and cart button don't overlap */
.floating-action-btn.with-cart {
  bottom: 130px;
}

/* Bottom Navigation Styling */
.bottom-nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: visible !important;
  padding-top: 20px; /* Space for badges to show above */
}

.bottom-nav-custom {
  overflow: visible !important;
  z-index: 100;
}

.nav-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 16px; /* Space for badge to show above */
}

/* Badge Styling */
.badge-elevated :deep(.v-badge__badge) {
  border: 2px solid rgb(var(--v-theme-surface));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 101;
  transform: scale(1.2);
  top: -20px !important;
  right: -5px !important;
  position: absolute;
}

/* Transitions */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
