<template>
  <v-container>
    <h1 class="mb-4">Profil Pengguna</h1>
    <!-- Removed placeholder alert -->

    <!-- User Profile Form -->
    <v-card variant="flat">
       <v-form ref="form" @submit.prevent="saveChanges">
        <v-card-text>
          <p class="mb-4">Atur nama tampilan Anda.</p>
          <v-text-field
            v-model="userProfile.namaTampilan"
            label="Nama Tampilan*"
            :rules="requiredRule"
            required
            variant="flat"
            density="compact"
            class="mb-3"></v-text-field>
          <!-- Password fields are complex and insecure without a backend, omitted for now -->
          <!-- <v-text-field label="Password Lama" type="password" variant="flat" density="compact"></v-text-field> -->
          <!-- <v-text-field label="Password Baru" type="password" variant="flat" density="compact"></v-text-field> -->
          <!-- <v-text-field label="Konfirmasi Password Baru" type="password" variant="flat" density="compact"></v-text-field> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn type="submit" color="primary" :loading="isSaving">Simpan Profil</v-btn>
        </v-card-actions>
      </v-form>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUserProfile, saveUserProfile } from '../../stores/localStorage.js'; // Import storage functions

const router = useRouter();
const form = ref(null);
const isSaving = ref(false);

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info");

// User Profile State
const userProfile = reactive({
  namaTampilan: '',
  // Add other profile fields here if needed (e.g., username)
});

// Validation Rules
const requiredRule = [v => !!v || 'Nama Tampilan wajib diisi'];

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Load existing data on mount
onMounted(() => {
  loadUserProfile();
});

function loadUserProfile() {
  try {
    const existingProfile = getUserProfile();
    // Set default if not present
    if (!existingProfile.namaTampilan) {
        existingProfile.namaTampilan = 'Pengguna BengkelKu'; // Default name
    }
    Object.assign(userProfile, existingProfile); // Populate reactive state
  } catch (error) {
    console.error("Error loading user profile:", error);
    showSnackbar("Gagal memuat profil pengguna.", "error");
  }
}

// Save changes
async function saveChanges() {
  const { valid } = await form.value.validate();
  if (!valid) {
    showSnackbar("Harap perbaiki error pada form.", "warning");
    return;
  }

  isSaving.value = true;
  try {
    saveUserProfile({ ...userProfile }); // Save the reactive object data
    showSnackbar("Profil pengguna berhasil disimpan.", "success");
  } catch (error) {
    console.error("Error saving user profile:", error);
    showSnackbar("Gagal menyimpan profil pengguna.", "error");
  } finally {
    isSaving.value = false;
  }
}

function goBack() {
  router.push('/pengaturan');
}
</script>

<style scoped>
/* Add specific styles if needed */
</style>
