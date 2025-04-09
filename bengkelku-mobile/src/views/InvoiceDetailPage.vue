<template>
  <v-container>
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="d-flex justify-center my-5">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="!invoice" type="error" class="my-5">
      Invoice tidak ditemukan atau telah dihapus.
      <div class="mt-4">
        <v-btn color="primary" to="/invoice">Kembali ke Daftar Invoice</v-btn>
      </div>
    </v-alert>

    <!-- Invoice Detail -->
    <div v-else>
      <!-- Header Actions -->
      <div class="d-flex justify-space-between align-center mb-4">
        <h1>{{ isEditMode ? 'Edit Invoice' : 'Detail Invoice' }}</h1>
        <div>
          <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mr-2"></v-btn>
          <template v-if="!isEditMode">
            <v-btn color="primary" prepend-icon="mdi-printer" @click="printInvoice">
              Cetak
            </v-btn>
            <v-btn color="info" prepend-icon="mdi-download" @click="downloadInvoice" class="ml-2">
              Download
            </v-btn>
            <v-btn
              v-if="invoice.status !== 'Dibayar'"
              color="warning"
              prepend-icon="mdi-pencil"
              @click="startEdit"
              class="ml-2"
            >
              Edit
            </v-btn>
          </template>
          <template v-else>
            <v-btn color="success" prepend-icon="mdi-content-save" @click="saveChanges" :loading="isSaving">
              Simpan
            </v-btn>
            <v-btn color="error" prepend-icon="mdi-close" @click="cancelEdit" class="ml-2">
              Batal
            </v-btn>
          </template>
        </div>
      </div>

      <!-- Invoice Card -->
      <v-card class="mb-4">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon :icon="invoice.status === 'Dibayar' ? 'mdi-check-circle' : 'mdi-clock-outline'"
              :color="invoice.status === 'Dibayar' ? 'success' : 'warning'" size="large"></v-icon>
          </template>
          <v-card-title>{{ invoice.id }}</v-card-title>
          <v-card-subtitle>{{ formatDate(invoice.tanggalInvoice) }}</v-card-subtitle>

          <template v-slot:append>
            <div class="d-flex flex-column align-end">
              <v-chip
                :color="invoice.status === 'Dibayar' ? 'success' : 'warning'"
                size="small"
                class="mb-1"
              >
                {{ invoice.status }}
              </v-chip>
              <v-chip
                v-if="invoice.isWalkIn"
                color="info"
                size="small"
              >
                Pelanggan Langsung
              </v-chip>
            </div>
          </template>
        </v-card-item>
      </v-card>

      <!-- Workshop Info -->
      <v-card class="mb-4">
        <v-card-title>Informasi Bengkel</v-card-title>
        <v-card-text>
          <div class="text-h6">{{ invoice.workshopInfo.nama }}</div>
          <div v-if="invoice.workshopInfo.alamat">{{ invoice.workshopInfo.alamat }}</div>
          <div v-if="invoice.workshopInfo.telepon">Tel: {{ invoice.workshopInfo.telepon }}</div>
        </v-card-text>
      </v-card>

      <!-- Customer & Vehicle Info -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title>Informasi Pelanggan</v-card-title>
            <v-card-text>
              <div v-if="!isEditMode || !invoice.isWalkIn">
                <div><strong>Nama:</strong> {{ invoice.pelangganNama }}</div>
                <div><strong>No. HP:</strong> {{ invoice.pelangganNoHp }}</div>
              </div>
              <div v-else>
                <v-text-field
                  v-model="invoice.pelangganNama"
                  label="Nama Pelanggan"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                ></v-text-field>
                <v-text-field
                  v-model="invoice.pelangganNoHp"
                  label="No. HP"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title>Informasi Kendaraan</v-card-title>
            <v-card-text>
              <div v-if="!isEditMode || !invoice.isWalkIn">
                <div><strong>Nomor Polisi:</strong> {{ invoice.nomorPolisi }}</div>
                <div><strong>Merk/Tipe:</strong> {{ invoice.merkTipe }}</div>
                <div><strong>Tanggal Servis:</strong> {{ formatDate(invoice.tanggalServis) }}</div>
              </div>
              <div v-else>
                <v-text-field
                  v-model="invoice.nomorPolisi"
                  label="Nomor Polisi"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                ></v-text-field>
                <v-text-field
                  v-model="invoice.merkTipe"
                  label="Merk/Tipe"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Invoice Items -->
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Detail Servis</span>
          <v-btn
            v-if="isEditMode"
            color="primary"
            size="small"
            prepend-icon="mdi-plus"
            @click="openAddItemDialog"
          >
            Tambah Item
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-table>
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th class="text-center">Jumlah</th>
                <th class="text-right">Harga</th>
                <th class="text-right">Subtotal</th>
                <th v-if="isEditMode" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in invoice.items" :key="index">
                <td>
                  {{ item.deskripsi }}
                  <v-chip size="x-small" :color="item.type === 'jasa' ? 'info' : 'success'" class="ml-2">
                    {{ item.type === 'jasa' ? 'Jasa' : 'Part' }}
                  </v-chip>
                </td>
                <td class="text-center">{{ item.jumlah }}</td>
                <td class="text-right">{{ formatCurrency(item.biaya) }}</td>
                <td class="text-right">{{ formatCurrency(item.subtotal) }}</td>
                <td v-if="isEditMode" class="text-center">
                  <v-btn icon="mdi-pencil" size="x-small" color="warning" variant="text" @click="openEditItemDialog(index)" class="mr-1"></v-btn>
                  <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="removeItem(index)"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <!-- Totals -->
      <v-card class="mb-4">
        <v-card-text>
          <div class="d-flex justify-space-between mb-2">
            <div class="text-subtitle-1">Total Jasa:</div>
            <div>{{ formatCurrency(jasaTotal) }}</div>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <div class="text-subtitle-1">Total Sparepart:</div>
            <div>{{ formatCurrency(partsTotal) }}</div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="d-flex justify-space-between">
            <div class="text-h6">TOTAL:</div>
            <div class="text-h6">{{ formatCurrency(totalAmount) }}</div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Notes -->
      <v-card class="mb-4">
        <v-card-title>Catatan</v-card-title>
        <v-card-text>
          <div v-if="!isEditMode">
            {{ invoice.catatan || 'Tidak ada catatan' }}
          </div>
          <div v-else>
            <v-textarea
              v-model="invoice.catatan"
              label="Catatan"
              variant="outlined"
              rows="3"
              counter
              maxlength="500"
            ></v-textarea>
          </div>
        </v-card-text>
      </v-card>

      <!-- Payment Status -->
      <v-card v-if="invoice.status === 'Dibayar'" class="mb-4 bg-success-lighten-5">
        <v-card-text>
          <div class="d-flex align-center">
            <v-icon icon="mdi-check-circle" color="success" class="mr-2"></v-icon>
            <div>
              <div class="text-h6">Pembayaran Selesai</div>
              <div v-if="invoice.tanggalPembayaran">
                Dibayar pada: {{ formatDate(invoice.tanggalPembayaran) }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Actions -->
      <v-card v-else>
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h6">Status Pembayaran</div>
              <div>Invoice ini belum dibayar</div>
            </div>
            <v-btn color="success" @click="markAsPaid">
              Tandai Sebagai Dibayar
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Add/Edit Item Dialog -->
    <v-dialog v-model="showAddItemDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingItemIndex === -1 ? 'Tambah Item' : 'Edit Item' }}</v-card-title>
        <v-card-text>
          <v-radio-group v-model="newItem.type" inline class="mb-3">
            <v-radio value="jasa" label="Jasa"></v-radio>
            <v-radio value="part" label="Sparepart"></v-radio>
          </v-radio-group>

          <!-- Jasa Selection -->
          <div v-if="newItem.type === 'jasa'">
            <v-autocomplete
              v-model="selectedJasa"
              :items="predefinedJasaItems"
              item-title="title"
              item-value="deskripsi"
              label="Pilih Jasa (Opsional)"
              return-object
              clearable
              variant="outlined"
              class="mb-3"
              @update:model-value="onJasaSelectionChange"
            ></v-autocomplete>

            <v-text-field
              v-model="newItem.deskripsi"
              label="Deskripsi Jasa*"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              :rules="[v => !!v || 'Deskripsi wajib diisi']"
            ></v-text-field>

            <!-- Quick Price Buttons for Jasa -->
            <div class="d-flex flex-wrap mb-3">
              <v-btn size="small" variant="outlined" class="mr-2 mb-2" @click="newItem.biaya = 10000">10rb</v-btn>
              <v-btn size="small" variant="outlined" class="mr-2 mb-2" @click="newItem.biaya = 15000">15rb</v-btn>
              <v-btn size="small" variant="outlined" class="mr-2 mb-2" @click="newItem.biaya = 20000">20rb</v-btn>
              <v-btn size="small" variant="outlined" class="mr-2 mb-2" @click="newItem.biaya = 25000">25rb</v-btn>
              <v-btn size="small" variant="outlined" class="mr-2 mb-2" @click="newItem.biaya = 50000">50rb</v-btn>
            </div>
          </div>

          <!-- Part Selection -->
          <div v-else>
            <v-autocomplete
              v-model="selectedItem"
              :items="availableItems"
              item-title="title"
              label="Pilih Sparepart*"
              return-object
              variant="outlined"
              class="mb-3"
              :loading="isLoadingItems"
              :rules="[v => !!v || 'Sparepart wajib dipilih']"
              @update:model-value="onItemSelectionChange"
            ></v-autocomplete>

            <div v-if="selectedItem" class="mb-3 text-caption">
              Stok tersedia: {{ selectedItem.stokSaatIni }} {{ selectedItem.satuan }}
            </div>
          </div>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.jumlah"
                label="Jumlah*"
                variant="outlined"
                density="comfortable"
                type="number"
                min="1"
                :rules="[
                  v => v > 0 || 'Jumlah harus lebih dari 0',
                  v => newItem.type !== 'part' || !selectedItem || v <= selectedItem.stokSaatIni || `Stok hanya ${selectedItem.stokSaatIni}`
                ]"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.biaya"
                label="Harga Satuan*"
                variant="outlined"
                density="comfortable"
                type="number"
                min="0"
                :rules="[v => v >= 0 || 'Harga tidak boleh negatif']"
              ></v-text-field>
            </v-col>
          </v-row>

          <div class="text-subtitle-1 mb-2">Subtotal: {{ formatCurrency(newItemSubtotal) }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="showAddItemDialog = false">Batal</v-btn>
          <v-btn
            color="primary"
            @click="saveItem"
            :disabled="!isItemValid"
          >
            Simpan
          </v-btn>
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getInvoiceById, updateInvoice, getAllItems } from '../stores/localStorage.js';
import {
  formatCurrency,
  formatDate,
  printInvoice as printInvoiceUtil,
  downloadInvoice as downloadInvoiceUtil
} from '../utils/invoiceGenerator.js';

const props = defineProps({
  id: { type: String, required: true }
});

const router = useRouter();
const invoice = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isEditMode = ref(false);

// Backup of original invoice data for canceling edits
const originalInvoice = ref(null);

// Snackbar state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');

// Add/edit item dialog
const showAddItemDialog = ref(false);
const editingItemIndex = ref(-1);
const newItem = reactive({
  type: 'jasa',
  deskripsi: '',
  jumlah: 1,
  biaya: 0
});

// Available items data
const availableItems = ref([]);
const selectedItem = ref(null);
const selectedJasa = ref(null);
const isLoadingItems = ref(false);

// Predefined jasa items
const predefinedJasaItems = ref([
  { title: 'Jasa Ganti Oli Mesin', deskripsi: 'Jasa Ganti Oli Mesin', biaya: 25000 },
  { title: 'Jasa Servis Ringan', deskripsi: 'Jasa Servis Ringan (Cek + Setel)', biaya: 50000 },
  { title: 'Jasa Ganti Busi', deskripsi: 'Jasa Ganti Busi', biaya: 15000 },
  { title: 'Jasa Tambal Ban Tubeless', deskripsi: 'Jasa Tambal Ban Tubeless', biaya: 20000 },
  { title: 'Jasa Ganti Kampas Rem Depan', deskripsi: 'Jasa Ganti Kampas Rem Depan', biaya: 20000 },
  { title: 'Jasa Ganti Kampas Rem Belakang', deskripsi: 'Jasa Ganti Kampas Rem Belakang', biaya: 25000 },
  { title: 'Jasa Ganti Oli Gardan', deskripsi: 'Jasa Ganti Oli Gardan', biaya: 10000 },
]);

// Computed properties
const newItemSubtotal = computed(() => {
  return (newItem.jumlah || 0) * (newItem.biaya || 0);
});

const totalAmount = computed(() => {
  if (!invoice.value || !invoice.value.items) return 0;
  return invoice.value.items.reduce((sum, item) => sum + item.subtotal, 0);
});

const jasaTotal = computed(() => {
  if (!invoice.value || !invoice.value.items) return 0;
  return invoice.value.items
    .filter(item => item.type === 'jasa')
    .reduce((sum, item) => sum + item.subtotal, 0);
});

const partsTotal = computed(() => {
  if (!invoice.value || !invoice.value.items) return 0;
  return invoice.value.items
    .filter(item => item.type === 'part')
    .reduce((sum, item) => sum + item.subtotal, 0);
});

// Computed property to validate item form
const isItemValid = computed(() => {
  if (!newItem.deskripsi || newItem.jumlah <= 0 || newItem.biaya < 0) {
    return false;
  }

  // For parts, we need to validate the selected item and stock
  if (newItem.type === 'part') {
    if (!selectedItem.value) return false;
    if (newItem.jumlah > selectedItem.value.stokSaatIni) return false;
  }

  return true;
});

// Methods
function loadInvoice() {
  isLoading.value = true;
  try {
    invoice.value = getInvoiceById(props.id);
    if (!invoice.value) {
      showSnackbar('Invoice tidak ditemukan', 'error');
    }
  } catch (error) {
    console.error('Error loading invoice:', error);
    showSnackbar('Gagal memuat detail invoice', 'error');
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.push('/invoice');
}

function printInvoice() {
  try {
    printInvoiceUtil(invoice.value);
    showSnackbar('Mencetak invoice...', 'info');
  } catch (error) {
    console.error('Error printing invoice:', error);
    showSnackbar('Gagal mencetak invoice', 'error');
  }
}

function downloadInvoice() {
  try {
    downloadInvoiceUtil(invoice.value);
    showSnackbar('Mengunduh invoice...', 'info');
  } catch (error) {
    console.error('Error downloading invoice:', error);
    showSnackbar('Gagal mengunduh invoice', 'error');
  }
}

function markAsPaid() {
  try {
    updateInvoice(invoice.value.id, {
      status: 'Dibayar',
      tanggalPembayaran: new Date().toISOString()
    });
    showSnackbar('Invoice berhasil ditandai sebagai dibayar', 'success');
    loadInvoice(); // Reload invoice to reflect the change
  } catch (error) {
    console.error('Error updating invoice status:', error);
    showSnackbar('Gagal mengubah status invoice', 'error');
  }
}

function showSnackbar(text, color = 'info') {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Edit mode functions
function startEdit() {
  if (invoice.value.status === 'Dibayar') {
    showSnackbar('Invoice yang sudah dibayar tidak dapat diedit', 'error');
    return;
  }

  // Create a deep copy of the invoice for backup
  originalInvoice.value = JSON.parse(JSON.stringify(invoice.value));
  isEditMode.value = true;
}

function cancelEdit() {
  // Restore original invoice data
  if (originalInvoice.value) {
    invoice.value = JSON.parse(JSON.stringify(originalInvoice.value));
  }
  isEditMode.value = false;
  originalInvoice.value = null;
}

function saveChanges() {
  isSaving.value = true;

  try {
    // Update totals before saving
    invoice.value.jasaTotal = jasaTotal.value;
    invoice.value.partsTotal = partsTotal.value;
    invoice.value.totalAmount = totalAmount.value;

    // Save changes to localStorage
    updateInvoice(invoice.value.id, invoice.value);

    showSnackbar('Invoice berhasil diperbarui', 'success');
    isEditMode.value = false;
    originalInvoice.value = null;
  } catch (error) {
    console.error('Error saving invoice:', error);
    showSnackbar('Gagal menyimpan perubahan', 'error');
  } finally {
    isSaving.value = false;
  }
}

// Item management functions
function openAddItemDialog() {
  resetNewItem();
  editingItemIndex.value = -1;
  showAddItemDialog.value = true;
}

function openEditItemDialog(index) {
  const item = invoice.value.items[index];
  newItem.type = item.type;
  newItem.deskripsi = item.deskripsi;
  newItem.jumlah = item.jumlah;
  newItem.biaya = item.biaya;

  // Reset selection
  selectedItem.value = null;
  selectedJasa.value = null;

  // If it's a part, try to find the matching part in availableItems
  if (item.type === 'part') {
    const matchingPart = availableItems.value.find(part => part.nama === item.deskripsi);
    if (matchingPart) {
      selectedItem.value = matchingPart;
    }
  }

  editingItemIndex.value = index;
  showAddItemDialog.value = true;
}

function removeItem(index) {
  invoice.value.items.splice(index, 1);
}

function resetNewItem() {
  newItem.type = 'jasa';
  newItem.deskripsi = '';
  newItem.jumlah = 1;
  newItem.biaya = 0;
  selectedItem.value = null;
  selectedJasa.value = null;
}

function saveItem() {
  // Validate form
  if (!isItemValid.value) {
    return;
  }

  // For parts, ensure we have a selected item
  if (newItem.type === 'part' && !selectedItem.value) {
    showSnackbar('Pilih sparepart terlebih dahulu', 'warning');
    return;
  }

  // Create the item object
  const item = {
    type: newItem.type,
    deskripsi: newItem.deskripsi,
    jumlah: Number(newItem.jumlah),
    biaya: Number(newItem.biaya),
    subtotal: Number(newItem.jumlah) * Number(newItem.biaya)
  };

  // For parts, add additional information
  if (newItem.type === 'part' && selectedItem.value) {
    item.partId = selectedItem.value.id;
    item.kode = selectedItem.value.kode;
    item.satuan = selectedItem.value.satuan;
  }

  if (editingItemIndex.value === -1) {
    // Add new item
    invoice.value.items.push(item);
  } else {
    // Update existing item
    invoice.value.items[editingItemIndex.value] = item;
  }

  showAddItemDialog.value = false;
  resetNewItem();
}

// Load available items
function loadAvailableItems() {
  isLoadingItems.value = true;
  try {
    availableItems.value = getAllItems().map(item => ({
      id: item.id,
      nama: item.nama,
      satuan: item.satuan,
      kode: item.kode,
      stokSaatIni: item.stokSaatIni,
      hargaJual: item.hargaJual,
      title: `${item.nama} (${item.kode || 'N/A'})` // For display in autocomplete
    })).sort((a, b) => a.nama.localeCompare(b.nama));
  } catch (error) {
    console.error('Error loading available items:', error);
    showSnackbar('Gagal memuat daftar barang', 'error');
  } finally {
    isLoadingItems.value = false;
  }
}

// Handle item selection
function onItemSelectionChange() {
  if (selectedItem.value) {
    newItem.deskripsi = selectedItem.value.nama;
    newItem.biaya = selectedItem.value.hargaJual;
    newItem.jumlah = 1;
  }
}

// Handle jasa selection
function onJasaSelectionChange(selected) {
  if (selected) {
    newItem.deskripsi = selected.deskripsi;
    newItem.biaya = selected.biaya;
  }
}

// Watch for item type changes to reset form
watch(() => newItem.type, (newType) => {
  // Reset selection and fields when switching between jasa and part
  selectedItem.value = null;
  selectedJasa.value = null;
  newItem.deskripsi = '';
  newItem.biaya = 0;
  newItem.jumlah = 1;
});

// Lifecycle hooks
onMounted(() => {
  loadInvoice();
  loadAvailableItems();
});
</script>
