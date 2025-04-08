<template>
  <v-app>
    <!-- Add App Bar -->
    <v-app-bar app color="primary" density="compact">
      <v-app-bar-title>Bengkelku</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- Profile Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-account-circle" v-bind="props"></v-btn>
        </template>
        <v-list density="compact">
          <v-list-item to="/pengaturan/profil" prepend-icon="mdi-account">
            <v-list-item-title>Profil</v-list-item-title>
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

    <v-main>
      <!-- The main content for each page will be rendered here -->
      <router-view />
    </v-main>

    <!-- Added style for compactness -->
    <v-bottom-navigation style="height: 56px;"  mode="shift" color="primary">
      <v-btn value="home" to="/">
        <v-icon>mdi-home</v-icon>
        <span>Beranda</span>
      </v-btn>

      <v-btn value="servis" to="/servis">
        <v-icon>mdi-hammer-wrench</v-icon> <!-- Changed icon for Servis -->
        <span>Servis</span>
      </v-btn>

      <v-btn value="stok" to="/stok">
        <v-icon>mdi-archive-outline</v-icon> <!-- Changed icon for Stok -->
        <span>Stok</span>
      </v-btn>

      <v-btn value="pelanggan" to="/pelanggan">
        <v-icon>mdi-account-group-outline</v-icon> <!-- Changed icon for Pelanggan -->
        <span>Pelanggan</span>
      </v-btn>

      <!-- Re-add Reporting Button -->
      <v-btn value="laporan" to="/laporan">
        <v-icon>mdi-chart-bar</v-icon>
        <span>Laporan</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Floating Action Button for Purchase Cart - Show only on Stock page -->
    <!-- Adjusted bottom position for compact nav -->
    <v-btn v-if="route.path === '/stok'" icon color="primary" position="fixed" size="large" class="ma-4"
      style="bottom: 64px; right: 16px;" to="/keranjang-pembelian">
      <v-badge :content="cartItemCount" color="error" floating v-if="cartItemCount > 0">
        <v-icon>mdi-cart-outline</v-icon>
      </v-badge>
      <v-icon v-else>mdi-cart-outline</v-icon> <!-- Show icon without badge if cart is empty -->
    </v-btn>

  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getPurchaseCart } from '../stores/localStorage.js';
import { usePwaInstall } from '../composables/usePwaInstall.js'; // Import the composable

const cartItemCount = ref(0);
const route = useRoute();

// --- PWA Install ---
const { installPrompt, triggerInstallPrompt } = usePwaInstall(); // Use the composable

async function triggerInstallPromptAction() {
  const { outcome } = await triggerInstallPrompt();
  if (outcome === 'accepted') {
    // Optionally show a global message/snackbar if needed
    console.log('PWA installation accepted from layout.');
  } else {
    console.log('PWA installation dismissed from layout.');
  }
}
// --- End PWA Install ---


function updateCartCount() {
  try {
    const cart = getPurchaseCart();
    cartItemCount.value = cart.length;
  } catch (e) {
    console.error("Error getting cart count:", e);
    cartItemCount.value = 0;
  }
}

// Update count when component mounts
onMounted(() => {
  updateCartCount();
});

// Watch for route changes to update the count when navigating
// This is a simple way; a more robust solution might involve event emitters or state management
watch(() => route.path, () => {
  updateCartCount();
});

</script>

<style scoped>
/* Add any layout-specific styles here if needed */
</style>
