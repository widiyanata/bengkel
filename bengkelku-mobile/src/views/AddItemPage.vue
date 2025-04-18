<template>
  <v-container class="pa-0">
    <v-app-bar flat density="compact">
      <v-btn icon="mdi-arrow-left" variant="text" density="compact" @click="goBack"></v-btn>
      <v-app-bar-title class="text-subtitle-1">Tambah Barang</v-app-bar-title>
    </v-app-bar>

    <div class="form-wrapper mt-2 px-2">
      <v-form ref="form" @submit.prevent="saveItem" class="form-container">
        <!-- Basic Info -->
        <v-card variant="flat" class="mb-3 pa-2">
          <div class="d-flex align-center mb-2">
            <v-icon size="small" color="primary" class="me-2">mdi-information-outline</v-icon>
            <span class="text-subtitle-2">Informasi Barang</span>
          </div>

          <v-text-field
            v-model="itemData.nama"
            label="Nama Barang"
            :rules="requiredRule"
            density="compact"
            variant="outlined"
            hide-details="auto"
            class="mb-2"
          ></v-text-field>

          <div class="d-flex gap-2">
            <v-text-field
              v-model="itemData.kode"
              label="Kode"
              :rules="itemCodeRule"
              density="compact"
              variant="outlined"
              hide-details="auto"
              placeholder="OLI-001"
            ></v-text-field>

            <v-text-field
              v-model="itemData.satuan"
              label="Satuan"
              :rules="requiredRule"
              density="compact"
              variant="outlined"
              hide-details="auto"
              placeholder="Pcs"
            ></v-text-field>
          </div>
        </v-card>

        <!-- Price Info -->
        <v-card variant="flat" class="mb-3 pa-2">
          <div class="d-flex align-center mb-2">
            <v-icon size="small" color="primary" class="me-2">mdi-currency-usd</v-icon>
            <span class="text-subtitle-2">Informasi Harga</span>
          </div>

          <div class="d-flex gap-2 mb-2">
            <v-text-field
              v-model.number="itemData.hargaBeli"
              label="Harga Beli"
              type="number"
              prefix="Rp"
              :rules="numberRule"
              density="compact"
              variant="outlined"
              hide-details="auto"
            ></v-text-field>

            <v-text-field
              v-model.number="itemData.hargaJual"
              label="Harga Jual"
              type="number"
              prefix="Rp"
              :rules="hargaJualRule"
              density="compact"
              variant="outlined"
              hide-details="auto"
            ></v-text-field>
          </div>

          <v-slide-y-transition>
            <v-chip
              v-if="showMarginInfo"
              :color="marginColor"
              size="small"
              class="mb-1"
            >
              <template v-slot:prepend>
                <v-icon size="x-small">{{ marginIcon }}</v-icon>
              </template>
              Margin {{ calculateMargin }}% ({{ formatCurrency(calculateProfit) }})
            </v-chip>
          </v-slide-y-transition>
        </v-card>

        <!-- Stock Info -->
        <v-card variant="flat" class="mb-3 pa-2">
          <div class="d-flex align-center mb-2">
            <v-icon size="small" color="primary" class="me-2">mdi-package-variant</v-icon>
            <span class="text-subtitle-2">Informasi Stok</span>
          </div>

          <div class="d-flex gap-2">
            <v-text-field
              v-model.number="itemData.stokAwal"
              label="Stok Awal"
              type="number"
              :rules="numberRule"
              density="compact"
              variant="outlined"
              hide-details="auto"
            ></v-text-field>

            <v-text-field
              v-model.number="itemData.stokMinimal"
              label="Stok Min"
              type="number"
              :rules="numberRule"
              density="compact"
              variant="outlined"
              hide-details="auto"
            ></v-text-field>
          </div>
        </v-card>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <v-btn
            color="primary"
            block
            type="submit"
            :loading="isSaving"
            :disabled="isSaving"
            class="mb-1"
          >
            <v-icon size="small" class="me-1">mdi-content-save</v-icon>
            Simpan
          </v-btn>

          <v-btn
            variant="text"
            block
            @click="goBack"
            :disabled="isSaving"
          >
            Batal
          </v-btn>
        </div>
      </v-form>
    </div>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="top"
      :timeout="2000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { addItem, doesItemCodeExist } from "../stores/localStorage.js"; // Import functions
import { useAppStatus } from "../composables/useAppStatus.js"; // Import for notifications

const router = useRouter();
const form = ref(null); // Reference to the form
const isSaving = ref(false);

// Get updateNotifications function from useAppStatus
const { updateNotifications } = useAppStatus();

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
    updateNotifications(); // Update notification badges for low stock
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

// New computed properties for margin calculation
const showMarginInfo = computed(() => {
  return itemData.hargaBeli && itemData.hargaJual &&
         Number(itemData.hargaBeli) > 0 && Number(itemData.hargaJual) > 0;
});

const calculateMargin = computed(() => {
  if (!showMarginInfo.value) return 0;
  const margin = ((itemData.hargaJual - itemData.hargaBeli) / itemData.hargaBeli) * 100;
  return Math.round(margin);
});

const calculateProfit = computed(() => {
  if (!showMarginInfo.value) return 0;
  return itemData.hargaJual - itemData.hargaBeli;
});

const marginColor = computed(() => {
  const margin = calculateMargin.value;
  if (margin <= 0) return 'error';
  if (margin < 10) return 'warning';
  return 'success';
});

const marginIcon = computed(() => {
  const margin = calculateMargin.value;
  if (margin <= 0) return 'mdi-alert';
  if (margin < 10) return 'mdi-alert-circle';
  return 'mdi-check-circle';
});

// Helper function for currency formatting
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
</script>

<style scoped>
.form-wrapper {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 120px;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-field) {
  border-radius: 8px !important;
}

:deep(.v-card) {
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 8px;
}

.action-buttons {
  /* position: fixed;
  bottom: 0;
  left: 0;
  right: 0; */
  /* padding: 12px;
  background: rgb(var(--v-theme-background));
  z-index: 99;
  box-shadow: 0 -1px 4px rgba(0,0,0,0.1); */
}

@media (min-width: 600px) {
  .action-buttons {
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
  }

  .form-wrapper {
    padding: 16px;
    padding-bottom: 120px;
  }
}
</style>
