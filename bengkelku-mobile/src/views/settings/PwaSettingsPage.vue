<template>
  <v-container>
    <h1 class="mb-4">Pengaturan PWA</h1>
    <!-- Removed placeholder alert -->

    <!-- PWA Settings Card -->
    <v-card variant="flat">
       <v-card-text>
        <p class="mb-4">Kelola instalasi Progressive Web App (PWA) untuk pengalaman seperti aplikasi asli.</p>

        <!-- Install Button -->
        <div v-if="installPrompt" class="mb-4">
          <v-btn
            prepend-icon="mdi-download"
            color="primary"
            @click="triggerInstallPrompt"
            :loading="isInstalling">
            Install Aplikasi ke Perangkat
          </v-btn>
          <p class="text-caption mt-1">Instal aplikasi ini untuk akses offline dan ikon di layar utama.</p>
        </div>
        <div v-else>
           <p class="text-grey">Aplikasi sudah terinstal atau browser tidak mendukung instalasi PWA.</p>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Cache Management (Placeholder) -->
        <div>
          <h3 class="text-subtitle-1 mb-2">Manajemen Cache</h3>
          <p class="text-caption mb-2">Menghapus cache dapat memperbaiki masalah data, tetapi mungkin memerlukan sinkronisasi ulang.</p>
          <v-btn
            disabled
            prepend-icon="mdi-cached"
            color="secondary"
            variant="flat"
            @click="clearCachePlaceholder">
            Hapus Cache Aplikasi (Segera Hadir)
          </v-btn>
        </div>

      </v-card-text>
    </v-card>

    <v-btn variant="text" @click="goBack" class="mt-4">Kembali ke Pengaturan</v-btn>

     <!-- Snackbar for Notifications -->
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" location="top right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref } from 'vue'; // Removed onMounted, onBeforeUnmount
import { useRouter } from 'vue-router';
import { usePwaInstall } from '../../composables/usePwaInstall'; // Import the composable

const router = useRouter();
const isInstalling = ref(false); // Keep for button loading state

// --- Use PWA Composable ---
const { installPrompt, triggerInstallPrompt } = usePwaInstall(); // Get shared state and function

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info");

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// --- PWA Install Action (using composable) ---
async function triggerInstallPromptAction() {
  isInstalling.value = true;
  const { outcome, error } = await triggerInstallPrompt(); // Call composable function

  if (error) {
    showSnackbar("Gagal menampilkan prompt instalasi.", "error");
  } else if (outcome === 'accepted') {
    showSnackbar("Instalasi aplikasi dimulai...", "success");
  } else {
    showSnackbar("Instalasi dibatalkan atau prompt tidak tersedia.", "info"); // Handle dismissed or unavailable
  }
  isInstalling.value = false;
}


// --- Cache Logic (Placeholder) ---
function clearCachePlaceholder() {
    showSnackbar("Fitur hapus cache belum diimplementasikan.", "info");
    // Actual cache clearing is complex, involves Service Workers
    // Example: navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister())); caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
}


// --- Lifecycle Hooks Removed (Handled by composable/MainLayout) ---


function goBack() {
  router.push('/pengaturan');
}
</script>

<style scoped>
/* Add specific styles if needed */
</style>
