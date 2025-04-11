
<template>
  <v-container class="pa-2">
    <!-- Compact Header -->
    <v-card class="mb-4 header-card" variant="flat">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-package-variant" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">Manajemen Stok</v-card-title>
        <v-card-subtitle>Kelola inventaris sparepart dan barang bengkel</v-card-subtitle>

        <template v-slot:append>
          <!-- Desktop buttons -->
          <div class="d-none d-sm-flex gap-2">
            <v-btn color="primary" prepend-icon="mdi-plus-box-outline" @click="goToAddItem">
              Tambah Barang
            </v-btn>
            <v-btn color="info" variant="flat" prepend-icon="mdi-history" to="/stok/riwayat-pembelian">
              Riwayat Pembelian
            </v-btn>
          </div>

          <!-- Mobile buttons -->
          <div class="d-flex d-sm-none">
            <v-btn color="primary" icon="mdi-plus-box-outline" size="small" @click="goToAddItem"></v-btn>
            <v-btn color="info" icon="mdi-history" size="small" class="ms-2" to="/stok/riwayat-pembelian"></v-btn>
          </div>
        </template>
      </v-card-item>
    </v-card>

    <!-- Search and Filter Bar -->
    <div class="search-filter-bar mb-3">
      <v-text-field
        v-model="searchQuery"
        placeholder="Cari barang..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="search-field"
      ></v-text-field>
      
      <div class="d-flex gap-1 mt-2">
        <v-select
          v-model="stockFilter"
          :items="stockFilterOptions"
          label="Filter"
          variant="outlined"
          density="compact"
          hide-details
          class="filter-select"
          :menu-props="{ maxHeight: 300 }"
          @update:model-value="onFilterChange"
          :return-object="false"
        ></v-select>
        
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="tonal"
              desity="compact"
              class="sort-button ms-1"
              size="normal"
            >
              <v-icon start>mdi-sort</v-icon>
              <span class="d-none">Urut</span>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
              :title="option.title"
              @click="sortOption = option.value"
              :active="sortOption === option.value"
            >
              <template v-slot:prepend>
                <v-icon v-if="sortOption === option.value" icon="mdi-check" size="small"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-center pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-2">Memuat data stok...</p>
    </div>

    <!-- Stock List (Compact Card View) -->
    <div v-else-if="filteredStock.length > 0" class="stock-list">
      <v-card
        v-for="item in filteredStock"
        :key="item.id"
        class="mb-2 stock-item-card"
        :class="{'stock-low-card': Number(item.stokMinimal || 0) > 0 && Number(item.stokSaatIni || 0) <= Number(item.stokMinimal || 0)}"
        variant="flat"
        density="compact"
      >
        <div class="d-flex align-center pa-2">
          <!-- Status Icon -->
          <v-avatar :color="getStockStatusColor(item)" size="32" class="me-2">
            <v-icon icon="mdi-package-variant" size="small" color="white"></v-icon>
          </v-avatar>
          
          <!-- Item Info -->
          <div class="flex-grow-1 item-info">
            <div class="d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-medium text-truncate">{{ item.nama }}</div>
              <v-chip
                v-if="Number(item.stokMinimal || 0) > 0 && Number(item.stokSaatIni || 0) <= Number(item.stokMinimal || 0)"
                color="warning"
                size="x-small"
                variant="elevated"
                class="ms-1"
              >
                Stok Menipis
              </v-chip>
            </div>
            
            <div class="d-flex align-center justify-space-between mt-1">
              <div class="d-flex align-center">
                <span class="text-body-2 font-weight-medium">{{ Number(item.stokSaatIni || 0) }} {{ item.satuan || '' }}</span>
                <span class="text-caption text-grey mx-1">|</span>
                <span class="text-caption text-grey">{{ item.kode || 'No Kode' }}</span>
              </div>
              <span class="text-body-2 primary--text font-weight-medium">{{ formatCurrency(item.hargaJual) }}</span>
            </div>
          </div>
          
          <!-- Action Menu -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                density="compact"
              ></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="goToRecordPurchaseForItem(item)" prepend-icon="mdi-cart-plus" title="Beli"></v-list-item>
              <v-list-item @click="openEditItemDialog(item)" prepend-icon="mdi-pencil-outline" title="Edit"></v-list-item>
              <v-list-item @click="openDeleteItemDialog(item)" prepend-icon="mdi-delete-outline" title="Hapus" color="error"></v-list-item>
            </v-list>
          </v-menu>
        </div>
        
        <!-- Stock Progress Bar -->
        <div v-if="item && Number(item.stokMinimal || 0) > 0" class="px-2 pb-2">
          <v-tooltip :text="`Minimal: ${Number(item.stokMinimal || 0)} ${item.satuan || ''}`">
            <template v-slot:activator="{ props }">
              <v-progress-linear
                v-bind="props"
                :model-value="getStockPercentage(item)"
                :color="getStockStatusColor(item)"
                height="4"
                rounded
              ></v-progress-linear>
            </template>
          </v-tooltip>
        </div>
      </v-card>
    </div>

    <!-- Enhanced No Data Message -->
    <v-card v-else class="pa-4 text-center" variant="flat">
      <div class="d-flex flex-column align-center py-4">
        <v-icon icon="mdi-package-variant-remove" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
        <h3 class="text-h6 mb-2">Tidak ada data stok</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ searchQuery ? 'Barang tidak ditemukan. Coba kata kunci lain atau ubah filter.' : 'Belum ada barang yang ditambahkan ke stok.' }}
        </p>
        <v-btn color="primary" prepend-icon="mdi-plus-box-outline" @click="goToAddItem">
          Tambah Barang Baru
        </v-btn>
      </div>
    </v-card>

    <!-- FAB for Mobile -->
    <v-btn
      color="primary"
      icon="mdi-plus"
      class="fab-button"
      size="large"
      position="fixed"
      location="bottom right"
      @click="goToAddItem"
    ></v-btn>

    <!-- Enhanced Edit Item Dialog -->
    <v-dialog v-model="showEditItemDialog" persistent max-width="600px">
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title class="text-white">Edit Barang Stok</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="cancelEditItem"></v-btn>
        </v-toolbar>

        <v-card-text class="pt-4">
          <v-form ref="editForm">
            <v-text-field
              v-model="editableItem.nama"
              label="Nama Barang*"
              :rules="requiredRule"
              required
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-package-variant"
              class="mb-2"
            ></v-text-field>

            <div class="d-flex gap-2 mb-2">
              <v-text-field
                v-model="editableItem.kode"
                label="Kode Barang"
                :rules="editItemCodeRule"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-barcode"
                class="flex-grow-1"
              ></v-text-field>

              <v-text-field
                v-model="editableItem.satuan"
                label="Satuan*"
                :rules="requiredRule"
                required
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-ruler"
                class="flex-grow-1"
              ></v-text-field>
            </div>

            <div class="d-flex gap-2 mb-2">
              <v-text-field
                v-model.number="editableItem.hargaBeli"
                label="Harga Beli"
                type="number"
                prefix="Rp"
                :rules="numberRule"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-cash-register"
                class="flex-grow-1"
              ></v-text-field>

              <v-text-field
                v-model.number="editableItem.hargaJual"
                label="Harga Jual"
                type="number"
                prefix="Rp"
                :rules="hargaJualRule"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-tag-outline"
                class="flex-grow-1"
              ></v-text-field>
            </div>

            <v-text-field
              v-model.number="editableItem.stokMinimal"
              label="Stok Minimal"
              type="number"
              :rules="numberRule"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-alert-circle-outline"
              hint="Jumlah stok minimum sebelum peringatan stok menipis"
              persistent-hint
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelEditItem" :disabled="isUpdatingItem">
            Batal
          </v-btn>
          <v-btn color="primary" variant="flat" @click="executeItemUpdate" :loading="isUpdatingItem">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Enhanced Delete Item Confirmation Dialog -->
    <v-dialog v-model="showDeleteItemDialog" persistent max-width="450px">
      <v-card>
        <v-toolbar color="error" density="compact">
          <v-toolbar-title class="text-white">Konfirmasi Hapus</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="cancelDeleteItem" :disabled="isDeletingItem"></v-btn>
        </v-toolbar>

        <v-card-text class="pt-4">
          <div class="d-flex align-center mb-4">
            <v-avatar color="error" class="me-3">
              <v-icon color="white">mdi-alert</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 mb-1">Hapus Barang</div>
              <div>Apakah Anda yakin ingin menghapus barang <strong>{{ itemToDelete?.nama }}</strong>?</div>
            </div>
          </div>

          <v-alert type="warning" variant="tonal" density="compact" class="mb-0">
            <div class="text-body-2">
              <v-icon start>mdi-information-outline</v-icon>
              Tindakan ini tidak dapat dibatalkan. Riwayat pembelian atau penggunaan dalam servis TIDAK akan terhapus.
            </div>
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelDeleteItem" :disabled="isDeletingItem">
            Batal
          </v-btn>
          <v-btn color="error" variant="flat" @click="executeItemDelete" :loading="isDeletingItem">
            Hapus
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
import { ref, reactive, computed, onMounted, watch } from "vue";
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

// New filter and sort options
const stockFilter = ref('all');
const stockFilterOptions = [
  { title: 'Semua Barang', value: 'all' },
  { title: 'Stok Menipis', value: 'low' },
  { title: 'Stok Tersedia', value: 'available' },
  { title: 'Stok Kosong', value: 'empty' }
];

const sortOption = ref('name-asc');
const sortOptions = [
  { title: 'Nama (A-Z)', value: 'name-asc' },
  { title: 'Nama (Z-A)', value: 'name-desc' },
  { title: 'Stok (Terendah)', value: 'stock-asc' },
  { title: 'Stok (Tertinggi)', value: 'stock-desc' },
  { title: 'Harga (Terendah)', value: 'price-asc' },
  { title: 'Harga (Tertinggi)', value: 'price-desc' }
];

// Toggle state for filter options on mobile
const showFilterOptions = ref(false);

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

// Handler functions for filter and sort changes
function onFilterChange(value) {
  console.log('Filter changed to:', value);
  // No need to set stockFilter.value = value as v-model already does this
  // Just add any additional logic here if needed
}

function onSortChange(value) {
  console.log('Sort changed to:', value);
  // No need to set sortOption.value = value as v-model already does this
  // Just add any additional logic here if needed
}

// Watch for changes in filter and sort options
watch(stockFilter, (newValue) => {
  console.log('Stock filter changed:', newValue);
});

watch(sortOption, (newValue) => {
  console.log('Sort option changed:', newValue);
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

// Enhanced filtered and sorted stock items
const filteredStock = computed(() => {
  try {
    // Start with a fresh copy of the items
    let items = [...(stockItems.value || [])];
    const lowerQuery = (searchQuery.value || '').toLowerCase().trim();

    // Apply search filter
    if (lowerQuery) {
      items = items.filter(item => {
        if (!item) return false;

        const itemName = (item.nama || '').toLowerCase();
        const itemCode = (item.kode || '').toLowerCase();

        return itemName.includes(lowerQuery) || itemCode.includes(lowerQuery);
      });
    }

    // Apply stock status filter
    const currentFilter = stockFilter.value;
    if (currentFilter && currentFilter !== 'all') {
      console.log('Applying filter:', currentFilter);
      switch (currentFilter) {
        case 'low':
          items = items.filter(item => {
            if (!item) return false;
            const stokSaatIni = Number(item.stokSaatIni) || 0;
            const stokMinimal = Number(item.stokMinimal) || 0;
            const isLowStock = stokMinimal > 0 && stokSaatIni <= stokMinimal && stokSaatIni > 0;
            return isLowStock;
          });
          break;
        case 'available':
          items = items.filter(item => {
            if (!item) return false;
            const stokSaatIni = Number(item.stokSaatIni) || 0;
            return stokSaatIni > 0;
          });
          break;
        case 'empty':
          items = items.filter(item => {
            if (!item) return false;
            const stokSaatIni = Number(item.stokSaatIni) || 0;
            return stokSaatIni === 0;
          });
          break;
      }
    }

    // Apply sorting
    const currentSort = sortOption.value;
    if (currentSort) {
      const result = sortItems(items, currentSort);
      console.log('Filtered items count:', result.length);
      return result;
    }

    return items;
  } catch (error) {
    console.error('Error in filteredStock computed property:', error);
    return [];
  }
});

// Function to sort items based on selected sort option
function sortItems(items, sortBy) {
  try {
    console.log('Sorting by:', sortBy);
    // Create a copy to avoid mutating the original array
    const sortedItems = [...items];

    if (!sortBy) {
      return sortedItems; // Return unsorted if no sort option
    }

    switch (sortBy) {
      case 'name-asc':
        return sortedItems.sort((a, b) => {
          return (a.nama || '').localeCompare(b.nama || '');
        });
      case 'name-desc':
        return sortedItems.sort((a, b) => {
          return (b.nama || '').localeCompare(a.nama || '');
        });
      case 'stock-asc':
        return sortedItems.sort((a, b) => {
          const aStock = Number(a.stokSaatIni) || 0;
          const bStock = Number(b.stokSaatIni) || 0;
          return aStock - bStock;
        });
      case 'stock-desc':
        return sortedItems.sort((a, b) => {
          const aStock = Number(a.stokSaatIni) || 0;
          const bStock = Number(b.stokSaatIni) || 0;
          return bStock - aStock;
        });
      case 'price-asc':
        return sortedItems.sort((a, b) => {
          const aPrice = Number(a.hargaJual) || 0;
          const bPrice = Number(b.hargaJual) || 0;
          return aPrice - bPrice;
        });
      case 'price-desc':
        return sortedItems.sort((a, b) => {
          const aPrice = Number(a.hargaJual) || 0;
          const bPrice = Number(b.hargaJual) || 0;
          return bPrice - aPrice;
        });
      default:
        return sortedItems;
    }
  } catch (error) {
    console.error('Error in sortItems function:', error);
    return items; // Return original items on error
  }
}

// Function to get stock status color
function getStockStatusColor(item) {
  try {
    if (!item) return 'grey';

    const stokSaatIni = Number(item.stokSaatIni) || 0;
    const stokMinimal = Number(item.stokMinimal) || 0;

    if (stokSaatIni === 0) {
      return 'error';
    } else if (stokMinimal > 0 && stokSaatIni <= stokMinimal) {
      return 'warning';
    } else {
      return 'success';
    }
  } catch (error) {
    console.error('Error in getStockStatusColor function:', error);
    return 'grey';
  }
}

// Function to calculate stock percentage for progress bar
function getStockPercentage(item) {
  try {
    if (!item) return 0;

    const stokSaatIni = Number(item.stokSaatIni) || 0;
    const stokMinimal = Number(item.stokMinimal) || 0;

    if (stokMinimal <= 0) return 100;

    const percentage = (stokSaatIni / (stokMinimal * 2)) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Ensure between 0-100
  } catch (error) {
    console.error('Error in getStockPercentage function:', error);
    return 0;
  }
}

// Function to format currency values
function formatCurrency(value) {
  try {
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
  } catch (error) {
    console.error('Error in formatCurrency function:', error);
    return 'N/A';
  }
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
    const fullItemData = getItemById(item.id);
    const itemToAdd = {
      itemId: item.id,
      nama: item.nama,
      satuan: item.satuan,
      jumlahBeli: 1,
      hargaBeli: fullItemData?.hargaBeli || null
    };
    addItemToCart(itemToAdd);
    showSnackbar(`${item.nama} ditambahkan ke keranjang pembelian.`, 'success');
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
/* Compact and Modern Styling */
.search-filter-bar {
  /* background-color: rgba(var(--v-theme-surface), 1); */
  border-radius: 8px;
}

.search-field {
  width: 100%;
}

.filter-select {
  flex-grow: 1;
}

.sort-button {
  min-width: 48px;
}

.stock-item-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stock-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stock-low-card {
  border-left: 3px solid rgb(var(--v-theme-warning))!important;
}

.item-info {
  min-width: 0; /* Ensures text truncation works */
}

.fab-button {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .v-container {
    padding: 8px !important;
  }
  
  .stock-item-card {
    margin-bottom: 8px;
  }
  
  .text-subtitle-1 {
    font-size: 0.9rem !important;
  }
  
  .text-body-2 {
    font-size: 0.8rem !important;
  }
  
  .text-caption {
    font-size: 0.7rem !important;
  }
}
</style>
