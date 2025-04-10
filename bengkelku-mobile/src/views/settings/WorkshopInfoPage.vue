<template>
  <v-container>
    <h1 class="mb-4">Informasi Bengkel</h1>
    <!-- Removed placeholder alert -->

    <!-- Workshop Info Form -->
    <v-card variant="flat">
      <v-form ref="form" @submit.prevent="saveChanges">
        <v-card-text>
          <p class="mb-4">Atur nama bengkel, alamat, nomor telepon, dan informasi lainnya yang mungkin muncul di nota atau laporan.</p>
          <v-text-field
            v-model="workshopInfo.nama"
            label="Nama Bengkel*"
            :rules="requiredRule"
            required
            variant="flat"
            density="compact"
            class="mb-3"></v-text-field>
          <v-textarea
            v-model="workshopInfo.alamat"
            label="Alamat Bengkel"
            variant="flat"
            density="compact"
            rows="3"
            class="mb-3"></v-textarea>
          <v-text-field
            v-model="workshopInfo.telepon"
            label="Nomor Telepon Bengkel"
            type="tel"
            :rules="phoneRuleOptional"
            variant="flat"
            density="compact"
            class="mb-3"></v-text-field>
           <!-- Add other fields like NPWP, footer nota etc. later if needed -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn type="submit" color="primary" :loading="isSaving">Simpan Informasi</v-btn>
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
import { getWorkshopInfo, saveWorkshopInfo } from '../../stores/localStorage.js'; // Import storage functions

const router = useRouter();
const form = ref(null);
const isSaving = ref(false);

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info");

// Workshop Info State
const workshopInfo = reactive({
  nama: '',
  alamat: '',
  telepon: '',
});

// Validation Rules
const requiredRule = [v => !!v || 'Field ini wajib diisi'];
const phoneRuleOptional = [ // Allow empty value
  v => !v || /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(v) || 'Format Nomor HP tidak valid',
  v => !v || (v && v.length >= 8 && v.length <= 15) || 'Nomor HP harus antara 8-15 digit'
];

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Load existing data on mount
onMounted(() => {
  loadWorkshopInfo();
});

function loadWorkshopInfo() {
  try {
    const existingInfo = getWorkshopInfo();
    Object.assign(workshopInfo, existingInfo); // Populate reactive state
  } catch (error) {
    console.error("Error loading workshop info:", error);
    showSnackbar("Gagal memuat informasi bengkel.", "error");
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
    saveWorkshopInfo({ ...workshopInfo }); // Save the reactive object data
    showSnackbar("Informasi bengkel berhasil disimpan.", "success");
  } catch (error) {
    console.error("Error saving workshop info:", error);
    showSnackbar("Gagal menyimpan informasi bengkel.", "error");
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
