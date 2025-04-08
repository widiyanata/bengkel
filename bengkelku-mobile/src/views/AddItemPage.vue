<template>
  <v-container>
    <h1 class="text-h6 mb-3">Tambah Barang Baru</h1> <!-- Smaller heading, reduced margin -->
    <v-form ref="form" @submit.prevent="saveItem">
      <v-text-field v-model="itemData.nama" label="Nama Barang*" :rules="requiredRule" required variant="outlined"
        density="compact" class="mb-3"></v-text-field> <!-- Added density -->

      <v-text-field v-model="itemData.kode" label="Kode Barang (Opsional)" :rules="itemCodeRule" variant="outlined"
        density="compact" class="mb-3"></v-text-field> <!-- Added density -->

      <v-text-field v-model="itemData.satuan" label="Satuan*" :rules="requiredRule" required
        placeholder="Contoh: Pcs, Ltr, Set, Box" variant="outlined" density="compact" class="mb-3"></v-text-field> <!-- Added density -->

      <v-text-field v-model.number="itemData.stokMinimal" label="Stok Minimal (Opsional)" type="number"
        :rules="numberRule" variant="outlined" density="compact" class="mb-3"></v-text-field> <!-- Added density -->

      <!-- Added Harga Beli field -->
      <v-text-field v-model.number="itemData.hargaBeli" label="Harga Beli (Opsional)" type="number" prefix="Rp"
        :rules="numberRule" variant="outlined" density="compact" class="mb-3"></v-text-field> <!-- Added density -->

      <v-text-field v-model.number="itemData.hargaJual" label="Harga Jual (Opsional)" type="number" prefix="Rp"
        :rules="hargaJualRule" variant="outlined" density="compact" class="mb-3"></v-text-field> <!-- Added density -->

      <v-btn color="primary" size="default" block type="submit" :loading="isSaving" class="mt-3"> <!-- Default size, added margin -->
        Simpan Barang Baru
      </v-btn>
      <v-btn variant="text" block class="mt-1" @click="goBack" size="small"> <!-- Smaller button, reduced margin -->
        Batal
      </v-btn>
    </v-form>

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
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { addItem, doesItemCodeExist } from "../stores/localStorage.js"; // Import functions

const router = useRouter();
const form = ref(null); // Reference to the form
const isSaving = ref(false);

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info"); // Default color

// Validation Rules
const requiredRule = [v => !!v || 'Field ini wajib diisi'];
const numberRule = [
  v => v === null || !isNaN(parseFloat(v)) || 'Harus berupa angka',
  v => v === null || v >= 0 || 'Tidak boleh negatif' // Allow null or non-negative numbers
];

// Custom rule for Harga Jual vs Harga Beli
const hargaJualRule = [
  v => v === null || !isNaN(parseFloat(v)) || 'Harus berupa angka',
  v => v === null || v >= 0 || 'Tidak boleh negatif',
  v => (v === null || itemData.hargaBeli === null || Number(v) >= Number(itemData.hargaBeli)) || 'Harga Jual tidak boleh lebih kecil dari Harga Beli'
];

// Custom rule for unique item code
const itemCodeRule = [
  v => !v || !doesItemCodeExist(v) || 'Kode Barang ini sudah digunakan.'
];

const itemData = reactive({
  nama: '', // Changed key to 'nama' to match localStorage function expectation
  kode: '',
  satuan: '',
  stokAwal: 0, // Add stokAwal, default to 0
  hargaBeli: null,
  hargaJual: null,
  stokMinimal: null, // Add stokMinimal to the form data
});

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

async function saveItem() {
  // Trigger validation
  const { valid } = await form.value.validate();

  if (!valid) {
    showSnackbar('Harap perbaiki error pada form sebelum menyimpan.', 'warning');
    return;
  }

  // Optional: Additional manual validation if needed (already covered by rules mostly)
  /* if (itemData.hargaJual !== null && isNaN(Number(itemData.hargaJual))) {
      showSnackbar('Harga Jual harus berupa angka.', 'warning');
      return;
  }
   if (itemData.hargaBeli !== null && isNaN(Number(itemData.hargaBeli))) {
      showSnackbar('Harga Beli harus berupa angka.', 'warning');
      return;
  }
   if (itemData.stokAwal !== null && isNaN(Number(itemData.stokAwal))) {
      showSnackbar('Stok Awal harus berupa angka.', 'warning');
      return;
  } */


  isSaving.value = true;
  try {
    // Prepare data, ensuring numbers are numbers
    const dataToSave = {
      nama: itemData.nama,
      kode: itemData.kode || '', // Ensure kode is string or empty
      satuan: itemData.satuan,
      stokAwal: Number(itemData.stokAwal) || 0,
      hargaBeli: itemData.hargaBeli !== null ? Number(itemData.hargaBeli) : 0,
      hargaJual: itemData.hargaJual !== null ? Number(itemData.hargaJual) : 0,
      stokMinimal: itemData.stokMinimal !== null ? Number(itemData.stokMinimal) : 0, // Include stokMinimal
    };
    const savedItem = addItem(dataToSave);
    console.log('New item saved:', savedItem);
    showSnackbar(`Barang "${savedItem.nama}" berhasil disimpan.`, 'success');
    router.push('/stok'); // Go back to stock list
  } catch (error) {
    console.error("Error saving item:", error);
    showSnackbar('Gagal menyimpan barang baru. Silakan coba lagi.', 'error');
  } finally {
    isSaving.value = false;
  }
}

function goBack() {
  router.push('/stok');
}
</script>

<style scoped>
/* Add specific styles if needed */
</style>
