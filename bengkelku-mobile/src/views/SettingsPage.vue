<template>
  <v-container>
    <h1>Pengaturan</h1>

    <v-list lines="one">
      <v-list-item title="Profil Pengguna" subtitle="Ubah nama, password, dll."
        prepend-icon="mdi-account-circle-outline" @click="goToUserProfile" ></v-list-item>

      <v-list-item title="Informasi Bengkel" subtitle="Nama, alamat, kontak bengkel" prepend-icon="mdi-store-outline"
        @click="goToWorkshopInfo" ></v-list-item>

      <v-list-item title="Pengaturan PWA" subtitle="Install aplikasi, cek status offline"
        prepend-icon="mdi-cellphone-arrow-down" @click="managePWA" ></v-list-item>

      <v-list-item title="Tentang Aplikasi" subtitle="Versi, Lisensi" prepend-icon="mdi-information-outline"
        @click="showAbout"></v-list-item>

      <!-- Added Divider and Clear Data Option -->
      <v-divider class="my-4"></v-divider>

      <v-list-item title="Hapus Semua Data Aplikasi" subtitle="Hapus semua data servis, stok, pelanggan, dll."
        prepend-icon="mdi-delete-sweep-outline" @click="showClearDataConfirmDialog = true" base-color="error">
      </v-list-item>

      <v-list-item title="Logout" prepend-icon="mdi-logout" @click="logout" base-color="error" ></v-list-item>
    </v-list>

    <!-- Dialog Confirm Clear Data -->
    <v-dialog v-model="showClearDataConfirmDialog" persistent max-width="450px">
      <v-card>
        <v-card-title class="text-h5 warning--text">Konfirmasi Hapus Semua Data</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus <strong>SEMUA</strong> data aplikasi (servis, stok, pelanggan, pembelian)?
          <br><br>
          <strong>Tindakan ini tidak dapat dibatalkan!</strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelClearData">Batal</v-btn>
          <v-btn color="warning" variant="flat" @click="executeClearData" :loading="isClearing">Hapus Semua Data</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { clearAllData } from "../stores/localStorage.js"; // Import clearAllData

const router = useRouter();
const showClearDataConfirmDialog = ref(false);
const isClearing = ref(false);

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info"); // Default color

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

function goToUserProfile() {
  console.log('Navigating to User Profile');
  // showSnackbar('Fitur Profil Pengguna belum diimplementasikan.', 'info');
  router.push('/pengaturan/profil'); // Enable navigation
}

function goToWorkshopInfo() {
  console.log('Navigating to Workshop Info');
  // showSnackbar('Fitur Info Bengkel belum diimplementasikan.', 'info');
  router.push('/pengaturan/bengkel'); // Enable navigation
}

function managePWA() {
  console.log('Managing PWA settings');
  // showSnackbar('Fitur PWA belum diimplementasikan sepenuhnya.', 'info');
  router.push('/pengaturan/pwa'); // Enable navigation
}

function showAbout() {
  console.log('Showing About info');
  // TODO: Get version from package.json dynamically if possible
  showSnackbar('BengkelKu Mobile v0.1.0\nDeveloped by Cline', 'info');
}

function logout() {
  // Simple logout for client-side app: clear data and go home
  console.log('Logging out (clearing data and navigating home)');
  showSnackbar('Logout: Menghapus semua data sesi...', 'info');
  // Trigger the clear data process, which will handle navigation on success
  executeClearData();
}

// --- Clear Data Logic ---
function cancelClearData() {
  showClearDataConfirmDialog.value = false;
}

function executeClearData() {
  isClearing.value = true;
  try {
    const success = clearAllData();
    if (success) {
      showSnackbar('Semua data aplikasi berhasil dihapus.', 'success');
      // Navigate home after clearing data
      router.push('/');
    } else {
      showSnackbar('Gagal menghapus data.', 'error');
    }
  } catch (error) {
    console.error("Error executing clear data:", error);
    showSnackbar('Terjadi kesalahan saat menghapus data.', 'error');
  } finally {
    isClearing.value = false;
    showClearDataConfirmDialog.value = false;
  }
}
</script>

<style scoped>
/* Add specific styles if needed */
</style>
