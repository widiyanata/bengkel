<template>
  <v-container>
    <div v-if="service && !loading">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-4">
        <h1>Detail Servis</h1>
        <v-chip :color="getStatusColor(service.status)" label>
          {{ service.status }}
        </v-chip>
      </div>

      <!-- Customer & Vehicle Info -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>Informasi Kendaraan & Pelanggan</v-card-title>
        <v-card-text>
          <div><strong>No. Polisi:</strong> {{ service.nomorPolisi }}</div>
          <div><strong>Pelanggan:</strong> {{ service.customerName || 'Tidak Ditemukan' }}</div>
          <div><strong>Kendaraan:</strong> {{ service.vehicleInfo || 'Tidak Ditemukan' }}</div>
          <div v-if="service.customerPhone"><strong>No. HP:</strong> {{ service.customerPhone }}</div>
        </v-card-text>
      </v-card>

      <!-- Initial Complaint -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>Keluhan Awal & Jenis Servis</v-card-title>
        <v-card-text>
          <div><strong>Jenis Servis Diminta:</strong> {{ service.jenisServisNames?.join(', ') || 'N/A' }}</div>
          <div v-if="service.keterangan"><strong>Keluhan Awal:</strong> {{ service.keterangan }}</div>
          <div class="text-caption text-grey mt-1">Tanggal Masuk: {{ formatTimestamp(service.timestamp) }}</div>
        </v-card-text>
      </v-card>

      <!-- Jasa / Service Fees -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Jasa / Biaya Servis</span>
          <v-btn color="secondary" size="small" @click="openAddJasaDialog" prepend-icon="mdi-plus-box-outline">
            Tambah Jasa
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list lines="one" v-if="service.jasa && service.jasa.length > 0">
            <v-list-item v-for="(j, index) in service.jasa" :key="`jasa-${index}`">
              <v-list-item-title>{{ j.deskripsi }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatCurrency(j.biaya) }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-btn icon="mdi-delete-outline" variant="text" color="error" size="x-small"
                  @click="removeJasa(index)"></v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal" density="compact">Belum ada jasa yang ditambahkan.</v-alert>
        </v-card-text>
      </v-card>

      <!-- Spare Parts Used -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Spare Part Digunakan</span>
          <v-btn color="secondary" size="small" @click="showAddPartDialog = true" prepend-icon="mdi-plus-box-outline">
            Tambah Part
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list lines="two" v-if="service.parts && service.parts.length > 0">
            <v-list-item v-for="(p, index) in service.parts" :key="`part-${p.itemId}`">
              <v-list-item-title>{{ p.nama }} ({{ p.kode || 'N/A' }})</v-list-item-title>
              <v-list-item-subtitle>
                {{ p.jumlah }} {{ p.satuan }} @ {{ formatCurrency(p.hargaJual) }} =
                {{ formatCurrency(p.jumlah * p.hargaJual) }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn icon="mdi-delete-outline" variant="text" color="error" size="x-small"
                  @click="removePart(index)"></v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal" density="compact">Belum ada spare part yang ditambahkan.</v-alert>
        </v-card-text>
      </v-card>

      <!-- Cost Summary & Status -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>Biaya & Status</v-card-title>
        <v-card-text>
          <div><strong>Total Jasa:</strong> {{ formatCurrency(totalBiayaJasa) }}</div>
          <div><strong>Total Spare Part:</strong> {{ formatCurrency(totalBiayaParts) }}</div>
          <v-divider class="my-2"></v-divider>
          <div class="text-h6"><strong>Total Biaya Keseluruhan:</strong> {{ formatCurrency(totalBiayaKeseluruhan) }}
          </div>
          <v-divider class="my-3"></v-divider>
          <p><strong>Update Status:</strong></p>
          <v-chip-group v-model="editableStatus" mandatory>
            <v-chip filter value="Antri" color="blue">Antri</v-chip>
            <v-chip filter value="Dikerjakan" color="orange">Dikerjakan</v-chip>
            <v-chip filter value="Tunggu Part" color="purple">Tunggu Part</v-chip>
            <v-chip filter value="Selesai" color="green">Selesai</v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>

      <!-- Save Button -->
      <v-btn color="success" block size="large" @click="saveChanges" :loading="isSaving" :disabled="isSaving">
        Simpan Perubahan
      </v-btn>
      <!-- Delete Button -->
      <v-btn color="error" variant="outlined" block class="mt-4" @click="showDeleteConfirmDialog = true"
        prepend-icon="mdi-delete-outline">
        Hapus Servis Ini
      </v-btn>
      <v-btn variant="text" block class="mt-2" @click="goBack">Kembali ke Daftar</v-btn>

    </div>
    <!-- Loading / Not Found States -->
    <div v-else-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p>Memuat data servis...</p>
    </div>
    <div v-else>
      <v-alert type="warning" variant="tonal">
        Data servis dengan ID <strong>{{ props.id }}</strong> tidak ditemukan.
      </v-alert>
      <v-btn variant="text" block class="mt-2" @click="goBack">Kembali ke Daftar</v-btn>
    </div>

    <!-- Dialog Add Jasa -->
    <v-dialog v-model="showAddJasaDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>Tambah Jasa</v-card-title>
        <v-card-text>
          <v-autocomplete v-model="selectedPredefinedJasa" :items="predefinedJasaItems" item-title="title"
            item-value="deskripsi" label="Pilih Jasa (Opsional)" return-object clearable variant="outlined" class="mb-3"
            @update:modelValue="onJasaSelectionChange"></v-autocomplete>
          <v-text-field v-model="newJasa.deskripsi" label="Deskripsi Jasa*" required variant="outlined"
            class="mb-3"></v-text-field>
          <v-text-field v-model.number="newJasa.biaya" label="Biaya Jasa*" type="number" prefix="Rp" required
            variant="outlined" class="mb-1"></v-text-field> <!-- Reduced bottom margin -->
          <!-- Quick Price Buttons -->
          <div class="mb-3">
            <span class="text-caption">Input Cepat:</span>
            <v-chip size="small" class="mx-1" @click="setJasaBiaya(5000)">5rb</v-chip>
            <v-chip size="small" class="mx-1" @click="setJasaBiaya(10000)">10rb</v-chip>
            <v-chip size="small" class="mx-1" @click="setJasaBiaya(15000)">15rb</v-chip>
            <v-chip size="small" class="mx-1" @click="setJasaBiaya(20000)">20rb</v-chip>
            <v-chip size="small" class="mx-1" @click="setJasaBiaya(25000)">25rb</v-chip>
            <v-chip size="small" class="mx-1" @click="setJasaBiaya(50000)">50rb</v-chip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="cancelAddJasa">Batal</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="addJasaToList"
            :disabled="!newJasa.deskripsi || newJasa.biaya === null || newJasa.biaya < 0">Tambah</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Add Spare Part -->
    <v-dialog v-model="showAddPartDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>Tambah Spare Part</v-card-title>
        <v-card-text>
          <v-autocomplete v-model="selectedPart" :items="availableStockItems" item-title="nama" item-value="id"
            label="Pilih Spare Part*" return-object required variant="outlined" class="mb-3" clearable
            :loading="loadingItems" placeholder="Ketik nama atau kode barang..."
            @update:modelValue="onPartSelectionChange"></v-autocomplete>
          <div v-if="selectedPart">
            <p class="text-caption">Stok Tersedia: {{ selectedPart.stokSaatIni || 0 }} {{ selectedPart.satuan }}</p>
            <p class="text-caption mb-2">Harga Jual: {{ formatCurrency(selectedPart.hargaJual) }}</p>
            <v-text-field v-model.number="newPart.jumlah" label="Jumlah Digunakan*" type="number" min="1"
              :max="selectedPart.stokSaatIni || 0" required variant="outlined" class="mb-3"
              :error-messages="partJumlahError"></v-text-field>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="cancelAddPart">Batal</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="addPartToList"
            :disabled="!selectedPart || !newPart.jumlah || newPart.jumlah <= 0 || newPart.jumlah > (selectedPart?.stokSaatIni || 0)">Tambah</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Confirm Delete -->
    <v-dialog v-model="showDeleteConfirmDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5 error--text">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus data servis untuk <strong>{{ service?.nomorPolisi }}</strong>?
          <br>
          Tindakan ini tidak dapat dibatalkan. Stok part yang digunakan TIDAK akan dikembalikan secara otomatis.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelDelete">Batal</v-btn>
          <v-btn color="error" variant="flat" @click="executeDelete" :loading="isDeleting">Hapus</v-btn>
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
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  getServiceById,
  getCustomerById,
  getVehicleById,
  updateService,
  getAllItems,
  updateItemStock,
  getItemById,
  deleteService, // Import deleteService
} from "../stores/localStorage.js";

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const service = ref(null); // Holds the enhanced service details including jasa and parts arrays
const editableStatus = ref('');
const loading = ref(true);
const isSaving = ref(false);
const isDeleting = ref(false); // State for delete loading

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info"); // Default color

// --- Jasa Management State ---
const showAddJasaDialog = ref(false);
const newJasa = reactive({ deskripsi: '', biaya: null });
const selectedPredefinedJasa = ref(null); // For the autocomplete

// Define predefined Jasa items
const predefinedJasaItems = ref([
  { title: 'Jasa Ganti Oli Mesin', deskripsi: 'Jasa Ganti Oli Mesin', biaya: 25000 },
  { title: 'Jasa Servis Ringan', deskripsi: 'Jasa Servis Ringan (Cek + Setel)', biaya: 50000 },
  { title: 'Jasa Ganti Busi', deskripsi: 'Jasa Ganti Busi', biaya: 15000 },
  { title: 'Jasa Tambal Ban Tubeless', deskripsi: 'Jasa Tambal Ban Tubeless', biaya: 20000 },
  { title: 'Jasa Ganti Kampas Rem Depan', deskripsi: 'Jasa Ganti Kampas Rem Depan', biaya: 20000 },
  { title: 'Jasa Ganti Kampas Rem Belakang', deskripsi: 'Jasa Ganti Kampas Rem Belakang', biaya: 25000 },
  { title: 'Jasa Ganti Oli Gardan', deskripsi: 'Jasa Ganti Oli Gardan', biaya: 10000 },
  { title: 'Jasa Kuras Air Radiator', deskripsi: 'Jasa Kuras Air Radiator', biaya: 30000 },
]);

// --- Part Management State ---
const showAddPartDialog = ref(false);
const availableStockItems = ref([]);
const loadingItems = ref(false);
const selectedPart = ref(null); // Holds the selected item object { id, nama, satuan, stokSaatIni, hargaJual }
const newPart = reactive({ jumlah: 1 });
const partJumlahError = ref('');

// State for Delete Confirmation Dialog
const showDeleteConfirmDialog = ref(false);

// Mapping for service types
const serviceTypeMap = [
  "Ganti Oli",
  "Servis Rutin",
  "Cek Rem",
  "Ban Bocor",
  "Aki",
  "Lainnya...",
];

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// --- Lifecycle & Data Loading ---
onMounted(() => {
  loadServiceDetails();
  loadAvailableItems(); // Load items for the parts dialog
});

function loadServiceDetails() {
  loading.value = true;
  service.value = null;
  try {
    const fetchedService = getServiceById(props.id);
    if (fetchedService) {
      const customer = getCustomerById(fetchedService.pelangganId);
      const vehicle = getVehicleById(fetchedService.kendaraanId);
      const serviceIndices = Array.isArray(fetchedService.jenisServis) ? fetchedService.jenisServis : [];
      const serviceNames = serviceIndices.map(index => serviceTypeMap[index] || 'Unknown');

      service.value = {
        ...fetchedService,
        customerName: customer ? customer.nama : 'N/A',
        customerPhone: customer ? customer.noHp : null,
        vehicleInfo: vehicle ? vehicle.merkTipe : 'N/A',
        jenisServisNames: serviceNames,
        totalBiaya: fetchedService.totalBiaya || 0,
        // Initialize jasa and parts arrays if they don't exist
        jasa: fetchedService.jasa || [],
        parts: fetchedService.parts || [],
      };
      editableStatus.value = service.value.status;
    } else {
      console.error(`Service with ID ${props.id} not found.`);
    }
  } catch (error) {
    console.error("Error loading service details:", error);
  } finally {
    loading.value = false;
  }
}

function loadAvailableItems() {
  loadingItems.value = true;
  try {
    availableStockItems.value = getAllItems().map(item => ({
      id: item.id,
      nama: item.nama,
      satuan: item.satuan,
      kode: item.kode,
      stokSaatIni: item.stokSaatIni,
      hargaJual: item.hargaJual,
    })).sort((a, b) => a.nama.localeCompare(b.nama));
  } catch (error) {
    console.error("Error loading available stock items:", error);
  } finally {
    loadingItems.value = false;
  }
}

// --- Computed Properties for Totals ---
const totalBiayaJasa = computed(() => {
  return service.value?.jasa?.reduce((sum, j) => sum + (Number(j.biaya) || 0), 0) || 0;
});

const totalBiayaParts = computed(() => {
  return service.value?.parts?.reduce((sum, p) => sum + (Number(p.jumlah) || 0) * (Number(p.hargaJual) || 0), 0) || 0;
});

const totalBiayaKeseluruhan = computed(() => {
  return totalBiayaJasa.value + totalBiayaParts.value;
});


// --- Jasa Management ---
// Function to handle selection from predefined Jasa autocomplete
function onJasaSelectionChange(selected) {
  if (selected) {
    newJasa.deskripsi = selected.deskripsi;
    newJasa.biaya = selected.biaya;
  } else {
    // Optionally clear if the selection is cleared
    // newJasa.deskripsi = '';
    // newJasa.biaya = null;
  }
}

function addJasaToList() {
  if (newJasa.deskripsi && newJasa.biaya !== null && newJasa.biaya >= 0) {
    if (!service.value.jasa) service.value.jasa = []; // Ensure array exists
    service.value.jasa.push({ ...newJasa });
    cancelAddJasa();
  } else {
    showSnackbar("Deskripsi dan biaya jasa harus diisi dengan benar.", 'warning');
  }
}

function removeJasa(index) {
  if (service.value?.jasa) {
    service.value.jasa.splice(index, 1);
  }
}

function openAddJasaDialog() {
  // Reset dialog state before opening
  selectedPredefinedJasa.value = null;
  newJasa.deskripsi = '';
  newJasa.biaya = null;
  showAddJasaDialog.value = true;
}


function cancelAddJasa() {
  showAddJasaDialog.value = false;
  // Reset is handled by openAddJasaDialog
}

// Function to set Jasa cost from quick buttons
function setJasaBiaya(amount) {
  newJasa.biaya = amount;
}

// --- Part Management ---
function onPartSelectionChange() {
  newPart.jumlah = 1; // Reset jumlah when item changes
  partJumlahError.value = ''; // Clear previous error
}

watch(() => newPart.jumlah, (newVal) => {
  const maxStock = selectedPart.value?.stokSaatIni || 0;
  if (newVal > maxStock) {
    partJumlahError.value = `Stok hanya ${maxStock}`;
  } else {
    partJumlahError.value = '';
  }
});


function addPartToList() {
  const qty = Number(newPart.jumlah);
  const maxStock = selectedPart.value?.stokSaatIni || 0;

  if (!selectedPart.value) { showSnackbar("Pilih spare part.", 'warning'); return; }
  if (isNaN(qty) || qty <= 0) { showSnackbar("Jumlah tidak valid.", 'warning'); return; }
  if (qty > maxStock) { showSnackbar(`Jumlah melebihi stok (${maxStock}).`, 'warning'); return; }

  // Check if part already added
  const existingPartIndex = service.value?.parts?.findIndex(p => p.itemId === selectedPart.value.id);
  if (existingPartIndex > -1) {
    showSnackbar(`Part "${selectedPart.value.nama}" sudah ditambahkan.`, 'info');
    // Optional: focus existing part or offer to update quantity
    return;
  }

  if (!service.value.parts) service.value.parts = []; // Ensure array exists
  service.value.parts.push({
    itemId: selectedPart.value.id,
    nama: selectedPart.value.nama,
    kode: selectedPart.value.kode,
    satuan: selectedPart.value.satuan,
    jumlah: qty,
    hargaJual: selectedPart.value.hargaJual || 0, // Use item's sale price
  });
  cancelAddPart();
}

function removePart(index) {
  if (service.value?.parts) {
    service.value.parts.splice(index, 1);
  }
}

function cancelAddPart() {
  showAddPartDialog.value = false;
  selectedPart.value = null;
  newPart.jumlah = 1;
  partJumlahError.value = '';
}


// --- General Functions ---
function getStatusColor(status) {
  switch (status) {
    case 'Dikerjakan': return 'orange';
    case 'Selesai': return 'green';
    case 'Antri': return 'blue';
    case 'Tunggu Part': return 'purple';
    case 'Baru': return 'info';
    default: return 'grey';
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
}

function goBack() {
  router.push('/servis');
}

// --- Save Changes ---
function saveChanges() {
  if (!service.value) return;

  isSaving.value = true;
  console.log(`Saving changes for service ${service.value.id}`);

  // Prepare data to save
  const dataToUpdate = {
    status: editableStatus.value,
    jasa: service.value.jasa || [],
    parts: service.value.parts || [],
    totalBiaya: totalBiayaKeseluruhan.value, // Save the calculated total cost
    // Add other fields if they become editable
  };

  // --- Implement Stock Deduction and Service Update ---
  let stockDeductionSuccess = true;
  const partsToDeduct = service.value.parts || [];
  const stockErrors = [];

  // 1. Verify stock availability again and deduct stock
  for (const part of partsToDeduct) {
    try {
      // Re-check current stock before deducting
      const currentItemState = getItemById(part.itemId);
      if (!currentItemState || currentItemState.stokSaatIni < part.jumlah) {
        stockErrors.push(`Stok ${part.nama} tidak mencukupi (tersisa ${currentItemState?.stokSaatIni || 0}, butuh ${part.jumlah}).`);
        stockDeductionSuccess = false;
        continue; // Skip deduction for this item
      }
      // Deduct stock (negative quantity)
      updateItemStock(part.itemId, -part.jumlah);
      console.log(`Deducted ${part.jumlah} from stock for item ID ${part.itemId}`);
    } catch (stockError) {
      console.error(`Error deducting stock for item ID ${part.itemId}:`, stockError);
      stockErrors.push(`Gagal mengurangi stok ${part.nama}.`);
      stockDeductionSuccess = false;
      // Decide if we need to revert previous deductions - complex, maybe just abort
    }
  }

  // 2. If stock deduction failed for any item, abort the service update
  if (!stockDeductionSuccess) {
    showSnackbar(`Gagal menyimpan: Masalah stok.\n- ${stockErrors.join('\n- ')}\n\nHarap periksa kembali spare part yang digunakan dan stok saat ini.`, 'error');
    // TODO: Consider reverting any successful stock deductions if partial failure occurred (more complex)
    isSaving.value = false;
    return;
  }

  // 3. Proceed with saving the service details if stock deduction was successful
  try {
    const updated = updateService(service.value.id, dataToUpdate);
    if (updated) {
      loadServiceDetails(); // Reload to reflect saved state
      showSnackbar('Perubahan berhasil disimpan!', 'success');
    } else {
      showSnackbar('Gagal menyimpan perubahan: Servis tidak ditemukan.', 'error');
      // TODO: Revert stock deductions if service save fails? (Needs careful implementation)
    }
  } catch (error) {
    console.error("Error saving service changes:", error);
    showSnackbar('Terjadi kesalahan saat menyimpan perubahan servis.', 'error');
    // TODO: Revert stock deductions if service save fails?
  } finally {
    isSaving.value = false;
  }
}

// --- Delete Service ---
function cancelDelete() {
  showDeleteConfirmDialog.value = false;
}

function executeDelete() {
  if (!service.value) return;
  isDeleting.value = true;
  try {
    const success = deleteService(service.value.id);
    if (success) {
      // Show snackbar *before* navigating away
      showSnackbar(`Servis untuk ${service.value.nomorPolisi} berhasil dihapus.`, 'success');
      router.push('/servis'); // Go back to list after deletion
    } else {
      showSnackbar('Gagal menghapus servis: Data tidak ditemukan.', 'error');
    }
  } catch (error) {
    console.error("Error deleting service:", error);
    showSnackbar('Terjadi kesalahan saat menghapus servis.', 'error');
  } finally {
    isDeleting.value = false;
    showDeleteConfirmDialog.value = false;
  }
}

</script>

<style scoped>
/* Add specific styles if needed */
</style>
