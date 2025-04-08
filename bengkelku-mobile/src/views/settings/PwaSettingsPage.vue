<template>
  <v-container>
    <h1 class="mb-4">Pengaturan PWA</h1>
    <!-- Removed placeholder alert -->

    <!-- PWA Settings Card -->
    <v-card variant="outlined">
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
            variant="outlined"
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isInstalling = ref(false);
const installPrompt = ref(null); // To store the install prompt event

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

// --- PWA Install Logic ---
const handleBeforeInstallPrompt = (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  installPrompt.value = e;
  console.log("'beforeinstallprompt' event captured.");
  // Optionally, update UI notify the user they can install the PWA
};

async function triggerInstallPrompt() {
  if (!installPrompt.value) {
    showSnackbar("Prompt instalasi tidak tersedia.", "warning");
    return;
  }
  isInstalling.value = true;
  try {
    // Show the install prompt
    installPrompt.value.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.value.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      showSnackbar("Instalasi aplikasi dimulai...", "success");
    } else {
      showSnackbar("Instalasi dibatalkan.", "info");
    }
  } catch (error) {
     console.error("Error triggering install prompt:", error);
     showSnackbar("Gagal menampilkan prompt instalasi.", "error");
  } finally {
     // We've used the prompt, and can't use it again, discard it
     installPrompt.value = null;
     isInstalling.value = false;
  }
}

// --- Cache Logic (Placeholder) ---
function clearCachePlaceholder() {
    showSnackbar("Fitur hapus cache belum diimplementasikan.", "info");
    // Actual cache clearing is complex, involves Service Workers
    // Example: navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister())); caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
}


// --- Lifecycle Hooks ---
onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});

function goBack() {
  router.push('/pengaturan');
}
</script>

<style scoped>
/* Add specific styles if needed */
</style>
