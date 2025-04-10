<template>
  <v-container>
    <!-- Enhanced Header with Card -->
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

    <!-- Enhanced Search and Filter Section -->
    <v-card class="mb-4" variant="flat">
      <v-card-text class="pa-2 pa-sm-4">
        <!-- Search Field (Always visible) -->
        <v-text-field
          v-model="searchQuery"
          label="Cari Barang (Nama/Kode)"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-3"
        ></v-text-field>

        <!-- Filter Controls with Toggle for Mobile -->
        <div class="d-flex align-center mb-2">
          <span class="text-body-2 text-medium-emphasis">Filter & Urutan:</span>
          <v-spacer></v-spacer>
          <v-btn
            density="compact"
            variant="text"
            @click="showFilterOptions = !showFilterOptions"
            class="d-flex d-sm-none"
          >
            <v-icon start>{{ showFilterOptions ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            {{ showFilterOptions ? 'Sembunyikan' : 'Tampilkan' }}
          </v-btn>
        </div>

        <!-- Filter Options (Responsive) -->
        <div class="filter-options" :class="{'d-none': !showFilterOptions && $vuetify.display.xs}">
          <div class="d-flex flex-column flex-sm-row gap-3">
            <!-- Filter Dropdown -->
            <v-select
              v-model="stockFilter"
              :items="stockFilterOptions"
              label="Filter Stok"
              variant="outlined"
              density="compact"
              hide-details
              class="filter-select"
              :menu-props="{ maxHeight: 300 }"
              @update:model-value="onFilterChange"
              :return-object="false"
            ></v-select>

            <!-- Sort Dropdown -->
            <v-select
              v-model="sortOption"
              :items="sortOptions"
              label="Urutkan"
              variant="outlined"
              density="compact"
              hide-details
              class="filter-select"
              :menu-props="{ maxHeight: 300 }"
              @update:model-value="onSortChange"
              :return-object="false"
            ></v-select>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-center pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-2">Memuat data stok...</p>
    </div>

    <!-- Stock Grid with Cards -->
    <div v-else-if="filteredStock.length > 0">
      <v-row>
        <v-col v-for="item in filteredStock" :key="item.id" cols="12" sm="6" md="4" lg="3">
          <v-card :class="{'stock-low-card': Number(item.stokMinimal || 0) > 0 && Number(item.stokSaatIni || 0) <= Number(item.stokMinimal || 0)}">
            <!-- Card Header with Stock Status -->
            <v-card-item>
              <template v-slot:prepend>
                <v-icon :color="getStockStatusColor(item)" icon="mdi-package-variant-closed"></v-icon>
              </template>

              <v-card-title class="text-subtitle-1 font-weight-bold text-truncate">{{ item.nama }}</v-card-title>

              <template v-slot:append>
                <v-chip v-if="Number(item.stokMinimal || 0) > 0 && Number(item.stokSaatIni || 0) <= Number(item.stokMinimal || 0)"
                  color="warning"
                  size="small"
                  variant="elevated"
                  class="font-weight-medium">
                  Stok Menipis
                </v-chip>
              </template>
            </v-card-item>

            <!-- Card Content -->
            <v-card-text class="pt-0">
              <div class="d-flex flex-column gap-1">
                <div class="d-flex align-center" v-if="item && item.kode">
                  <v-icon size="small" color="grey" class="me-1">mdi-barcode</v-icon>
                  <span class="text-caption text-medium-emphasis">{{ item.kode }}</span>
                </div>

                <div class="d-flex align-center">
                  <v-icon size="small" color="grey" class="me-1">mdi-cube-outline</v-icon>
                  <span class="text-body-2">{{ Number(item.stokSaatIni || 0) }} {{ item.satuan || '' }}</span>
                </div>

                <div class="d-flex align-center" v-if="item && item.hargaJual">
                  <v-icon size="small" color="grey" class="me-1">mdi-tag-outline</v-icon>
                  <span class="text-body-2">{{ formatCurrency(item.hargaJual) }}</span>
                </div>
              </div>
            </v-card-text>

            <!-- Stock Progress Bar -->
            <div class="px-4 pb-2" v-if="item && Number(item.stokMinimal || 0) > 0">
              <v-tooltip :text="`Minimal: ${Number(item.stokMinimal || 0)} ${item.satuan || ''}`">
                <template v-slot:activator="{ props }">
                  <v-progress-linear
                    v-bind="props"
                    :model-value="getStockPercentage(item)"
                    :color="getStockStatusColor(item)"
                    height="8"
                    rounded
                  ></v-progress-linear>
                </template>
              </v-tooltip>
            </div>

            <!-- Action Buttons - Enhanced for Mobile -->
            <v-divider></v-divider>
            <v-card-actions class="action-buttons pa-2">
              <!-- Add Purchase Button -->
              <v-btn
                variant="tonal"
                color="primary"
                density="comfortable"
                class="flex-grow-1 action-button"
                @click.stop="goToRecordPurchaseForItem(item)"
              >
                <v-icon start>mdi-cart-plus</v-icon>
                <span class="action-text">Beli</span>
              </v-btn>

              <!-- Edit Button -->
              <v-btn
                color="info"
                density="comfortable"
                class="flex-grow-1 action-button"
                @click.stop="openEditItemDialog(item)"
              >
                <v-icon start>mdi-pencil-outline</v-icon>
                <span class="action-text">Edit</span>
              </v-btn>

              <!-- Delete Button -->
              <v-btn
                color="error"
                density="comfortable"
                class="flex-grow-1 action-button"
                @click.stop="openDeleteItemDialog(item)"
              >
                <v-icon start>mdi-delete-outline</v-icon>
                <span class="action-text">Hapus</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
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
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editableItem.nama"
                  label="Nama Barang*"
                  :rules="requiredRule"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-package-variant"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editableItem.kode"
                  label="Kode Barang (Opsional)"
                  :rules="editItemCodeRule"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-barcode"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editableItem.satuan"
                  label="Satuan*"
                  :rules="requiredRule"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-ruler"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editableItem.hargaBeli"
                  label="Harga Beli (Opsional)"
                  type="number"
                  prefix="Rp"
                  :rules="numberRule"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-cash-register"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editableItem.hargaJual"
                  label="Harga Jual (Opsional)"
                  type="number"
                  prefix="Rp"
                  :rules="hargaJualRule"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-tag-outline"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editableItem.stokMinimal"
                  label="Stok Minimal (Opsional)"
                  type="number"
                  :rules="numberRule"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-alert-circle-outline"
                  hint="Jumlah stok minimum sebelum peringatan stok menipis"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn color="grey" variant="flat" @click="cancelEditItem" :disabled="isUpdatingItem">
            <v-icon start>mdi-cancel</v-icon>
            Batal
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="elevated" @click="executeItemUpdate" :loading="isUpdatingItem">
            <v-icon start>mdi-content-save</v-icon>
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
          <v-btn color="grey" variant="flat" @click="cancelDeleteItem" :disabled="isDeletingItem">
            <v-icon start>mdi-cancel</v-icon>
            Batal
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="elevated" @click="executeItemDelete" :loading="isDeletingItem">
            <v-icon start>mdi-delete</v-icon>
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
    // Fetch full item details to get current purchase price if needed
    const fullItemData = getItemById(item.id);
    const itemToAdd = {
      itemId: item.id,
      nama: item.nama,
      satuan: item.satuan,
      jumlahBeli: 1, // Default quantity to add
      hargaBeli: fullItemData?.hargaBeli || null // Use last known purchase price or null
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
/* Enhanced styles for stock page */
.header-card {
  background-color: #f8f9fa;
  border-left: 4px solid var(--v-primary-base);
}

.stock-low-card {
  border-left: 4px solid var(--v-warning-base);
}

/* Card hover effect */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Filter styles */
.filter-options {
  transition: all 0.3s ease;
}

.filter-select {
  flex: 1;
  min-width: 0;
}

/* Action button styles */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  border-radius: 8px;
  min-width: 0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  
  .action-text {
    font-size: 0.8rem;
  }

  .action-buttons {
    padding: 8px 4px !important;
  }

  .action-button {
    padding: 0 8px !important;
  }

  /* Improve touch targets */
  .v-btn {
    min-height: 40px;
  }

  /* Better spacing for filter toggles */
  .filter-options {
    margin-top: 8px;
  }

  /* Fix for mobile select menus */
  .v-select__selection {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Ensure menu doesn't get cut off */
  :deep(.v-menu__content) {
    max-width: 90vw !important;
  }

  /* Fix for select display */
  :deep(.v-field__input) {
    padding-top: 6px;
  }
}
</style>
