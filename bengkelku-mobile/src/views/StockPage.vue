<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>Manajemen Stok</h1>
      <div>
        <v-btn color="secondary" class="mr-2" prepend-icon="mdi-plus-box-outline" @click="goToAddItem">
          Barang Baru
        </v-btn>
        <!-- Add Purchase History Button -->
        <v-btn color="info" variant="outlined" prepend-icon="mdi-history" to="/stok/riwayat-pembelian">
          Riwayat Beli
        </v-btn>
      </div>
    </div>

    <!-- Search/Filter functionality -->
    <v-text-field v-model="searchQuery" label="Cari Barang (Nama/Kode)" prepend-inner-icon="mdi-magnify"
      variant="outlined" density="compact" clearable class="mb-4"></v-text-field>

    <!-- Stock List Cards -->
    <v-row dense>
      <!-- Loading Indicator -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p>Memuat data stok...</p>
      </v-col>

      <!-- Item Cards -->
      <v-col v-else-if="filteredStock.length > 0" v-for="item in filteredStock" :key="item.id" cols="12" sm="6" md="4">
        <v-card class="mb-3" variant="tonal">
          <!-- Card Content -->
          <div> <!-- Removed clickable wrapper for now -->
            <v-card-title class="d-flex justify-space-between">
              <span>{{ item.nama }}</span>
              <v-chip size="small" label>
                Stok: {{ item.stokSaatIni }} {{ item.satuan }}
              </v-chip>
            </v-card-title>
            <v-card-subtitle v-if="item.kode">Kode: {{ item.kode }}</v-card-subtitle>
            <v-card-text>
              <div v-if="item.hargaJual">Harga Jual: {{ formatCurrency(item.hargaJual) }}</div>
              <div v-if="item.hargaBeli">Harga Beli: {{ formatCurrency(item.hargaBeli) }}</div>
              <!-- Enable Stok Minimal Alert -->
              <div v-if="item.stokMinimal > 0">Stok Minimal: {{ item.stokMinimal }} {{ item.satuan }}</div>
              <v-alert v-if="item.stokMinimal > 0 && item.stokSaatIni <= item.stokMinimal" type="warning"
                density="compact" class="mt-2" variant="tonal">
                Stok menipis!
              </v-alert>
            </v-card-text>
          </div>
          <!-- Action Buttons -->
          <v-card-actions>
            <!-- Add Purchase Button -->
            <v-btn prepend-icon="mdi-cart-plus" color="primary" variant="tonal" size="small"
              @click="goToRecordPurchaseForItem(item)">
              Beli
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-pencil-outline" color="info" variant="text" size="small"
              @click="openEditItemDialog(item)"></v-btn>
            <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small"
              @click="openDeleteItemDialog(item)"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- No Data Message -->
      <v-col v-else cols="12">
        <v-alert type="info" variant="tonal">Tidak ada data stok atau barang tidak ditemukan.</v-alert>
      </v-col>
    </v-row>

    <!-- Edit Item Dialog -->
    <v-dialog v-model="showEditItemDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>Edit Barang Stok</v-card-title>
        <v-card-text>
          <v-form ref="editForm"> <!-- Wrap in v-form -->
            <v-text-field v-model="editableItem.nama" label="Nama Barang*" :rules="requiredRule" required variant="outlined" density="compact"
              class="mb-3"></v-text-field>
            <v-text-field v-model="editableItem.kode" label="Kode Barang (Opsional)" :rules="editItemCodeRule" variant="outlined" density="compact"
              class="mb-3"></v-text-field> <!-- Apply editItemCodeRule -->
            <v-text-field v-model="editableItem.satuan" label="Satuan*" :rules="requiredRule" required variant="outlined" density="compact"
              class="mb-3"></v-text-field>
            <v-text-field v-model.number="editableItem.hargaBeli" label="Harga Beli (Opsional)" type="number" prefix="Rp"
              :rules="numberRule" variant="outlined" density="compact" class="mb-3"></v-text-field>
            <v-text-field v-model.number="editableItem.hargaJual" label="Harga Jual (Opsional)" type="number" prefix="Rp"
              :rules="hargaJualRule" variant="outlined" density="compact" class="mb-3"></v-text-field> <!-- Apply hargaJualRule -->
            <!-- Add Stok Minimal field -->
            <v-text-field v-model.number="editableItem.stokMinimal" label="Stok Minimal (Opsional)" type="number"
              :rules="numberRule" variant="outlined" density="compact" class="mb-3"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelEditItem">Batal</v-btn>
          <v-btn color="info" variant="flat" @click="executeItemUpdate" :loading="isUpdatingItem">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Item Confirmation Dialog -->
    <v-dialog v-model="showDeleteItemDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5 error--text">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus barang <strong>{{ itemToDelete?.nama }}</strong>?
          <br><br>
          Tindakan ini tidak dapat dibatalkan. Riwayat pembelian atau penggunaan dalam servis TIDAK akan terhapus.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelDeleteItem">Batal</v-btn>
          <v-btn color="error" variant="flat" @click="executeItemDelete" :loading="isDeletingItem">Hapus</v-btn>
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
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getAllItems,
  updateItem,
  deleteItem,
  addItemToCart,
  getItemById,
  doesItemCodeExist, // Import the checker function
} from "../stores/localStorage.js"; // Import functions

const router = useRouter();
const searchQuery = ref('');
const stockItems = ref([]); // Initialize as empty array
const loading = ref(true);
const editForm = ref(null); // Ref for the edit form

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
// Custom rule for Harga Jual vs Harga Beli (needs access to editableItem)
const hargaJualRule = [
  v => v === null || !isNaN(parseFloat(v)) || 'Harus berupa angka',
  v => v === null || v >= 0 || 'Tidak boleh negatif',
  v => (v === null || editableItem.hargaBeli === null || Number(v) >= Number(editableItem.hargaBeli)) || 'Harga Jual tidak boleh lebih kecil dari Harga Beli'
];
// Custom rule for unique item code during edit
const editItemCodeRule = [
  v => !v || !doesItemCodeExist(v, editableItem.id) || 'Kode Barang ini sudah digunakan oleh item lain.'
];

// State for Edit Item Dialog
const showEditItemDialog = ref(false);
const editableItem = reactive({ id: null, nama: '', kode: '', satuan: '', hargaBeli: null, hargaJual: null, stokMinimal: null }); // Add stokMinimal
const isUpdatingItem = ref(false);

// State for Delete Item Dialog
const showDeleteItemDialog = ref(false);
const itemToDelete = ref(null);
const isDeletingItem = ref(false);

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Fetch data when component is mounted
onMounted(() => {
  loadStockItems();
});

function loadStockItems() {
  loading.value = true;
  try {
    stockItems.value = getAllItems().sort((a, b) => a.nama.localeCompare(b.nama));
  } catch (error) {
    console.error("Error loading stock items:", error);
  } finally {
    loading.value = false;
  }
}

const filteredStock = computed(() => {
  const items = stockItems.value;
  if (!searchQuery.value) {
    return items;
  }
  const lowerQuery = searchQuery.value.toLowerCase().trim();
  if (!lowerQuery) return items;

  return items.filter(item =>
    item.nama.toLowerCase().includes(lowerQuery) ||
    (item.kode && item.kode.toLowerCase().includes(lowerQuery))
  );
});

function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
}

function goToAddItem() {
  router.push('/stok/barang-baru');
}

function goToRecordPurchase() {
  router.push('/stok/pembelian-baru');
}

// Add item to purchase cart
function goToRecordPurchaseForItem(item) {
  console.log('Adding item to purchase cart:', item.nama, 'ID:', item.id);
  try {
    // Fetch full item details to get current purchase price if needed
    const fullItemData = getItemById(item.id);
    const itemToAdd = {
      itemId: item.id,
      nama: item.nama,
      satuan: item.satuan,
      jumlahBeli: 1, // Default quantity to add
      hargaBeli: fullItemData?.hargaBeli || 0 // Use last known purchase price or 0
    };
    addItemToCart(itemToAdd);
    showSnackbar(`${item.nama} ditambahkan ke keranjang pembelian.`, 'success');
    // Optionally navigate to the cart page immediately? Or just add? Staying here for now.
    // router.push('/keranjang-pembelian'); // Need to create this route/page
  } catch (error) {
    console.error("Error adding item to cart:", error);
    showSnackbar("Gagal menambahkan item ke keranjang.", 'error');
  }
}

// --- Edit Item Logic ---
function openEditItemDialog(item) {
  // Copy item data to editable object
  Object.assign(editableItem, {
    id: item.id,
    nama: item.nama,
    kode: item.kode || '',
    satuan: item.satuan,
    hargaBeli: item.hargaBeli ?? null,
    hargaJual: item.hargaJual ?? null,
    stokMinimal: item.stokMinimal ?? null, // Copy stokMinimal
  });
  showEditItemDialog.value = true;
}

function cancelEditItem() {
  showEditItemDialog.value = false;
  if (editForm.value) {
    editForm.value.resetValidation(); // Reset validation state on cancel
  }
}

async function executeItemUpdate() {
  // Trigger validation on the edit form
  const { valid } = await editForm.value.validate();

  if (!valid) {
    showSnackbar('Harap perbaiki error pada form sebelum menyimpan.', 'warning');
    return;
  }

  // Basic Validation (already covered by rules, but kept as safeguard)
  // if (!editableItem.id || !editableItem.nama || !editableItem.satuan) {
  //   showSnackbar("Nama Barang dan Satuan wajib diisi.", 'warning');
  //   return;
  // }
  // // Optional validation for numeric fields (already covered by rules)
  // if (editableItem.hargaBeli !== null && isNaN(Number(editableItem.hargaBeli))) {
  //   showSnackbar('Harga Beli harus berupa angka.', 'warning'); return;
  // }
  // if (editableItem.hargaJual !== null && isNaN(Number(editableItem.hargaJual))) {
  //   showSnackbar('Harga Jual harus berupa angka.', 'warning'); return;
  // }

  isUpdatingItem.value = true;
  try {
    const dataToUpdate = {
      nama: editableItem.nama,
      kode: editableItem.kode || '',
      satuan: editableItem.satuan,
      hargaBeli: editableItem.hargaBeli !== null ? Number(editableItem.hargaBeli) : 0,
      hargaJual: editableItem.hargaJual !== null ? Number(editableItem.hargaJual) : 0,
      stokMinimal: editableItem.stokMinimal !== null ? Number(editableItem.stokMinimal) : 0, // Include stokMinimal
    };
    const updated = updateItem(editableItem.id, dataToUpdate);
    if (updated) {
      showSnackbar("Data barang berhasil diperbarui.", 'success');
      loadStockItems(); // Refresh list
      cancelEditItem(); // Close dialog
    } else {
      showSnackbar("Gagal memperbarui data: Barang tidak ditemukan.", 'error');
    }
  } catch (error) {
    console.error("Error updating item:", error);
    showSnackbar("Terjadi kesalahan saat memperbarui data barang.", 'error');
  } finally {
    isUpdatingItem.value = false;
  }
}

// --- Delete Item Logic ---
function openDeleteItemDialog(item) {
  itemToDelete.value = item;
  showDeleteItemDialog.value = true;
}

function cancelDeleteItem() {
  showDeleteItemDialog.value = false;
  itemToDelete.value = null;
}

function executeItemDelete() {
  if (!itemToDelete.value) return;
  isDeletingItem.value = true;
  try {
    const success = deleteItem(itemToDelete.value.id);
    if (success) {
      showSnackbar(`Barang "${itemToDelete.value.nama}" berhasil dihapus.`, 'success');
      loadStockItems(); // Refresh list
      cancelDeleteItem(); // Close dialog
    } else {
      showSnackbar("Gagal menghapus barang: Data tidak ditemukan.", 'error');
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    showSnackbar("Terjadi kesalahan saat menghapus barang.", 'error');
  } finally {
    isDeletingItem.value = false;
  }
}

</script>

<style scoped>
/* Add specific styles if needed */
</style>
