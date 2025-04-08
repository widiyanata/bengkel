<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-3"> <!-- Reduced margin -->
      <h1 class="text-h6">Riwayat Pembelian Stok</h1> <!-- Smaller heading -->
      <v-btn variant="text" @click="goBackToStock" size="small">Kembali ke Stok</v-btn> <!-- Smaller button -->
    </div>

    <!-- TODO: Add Date Range Filter -->

    <v-row dense class="mt-2"> <!-- Added margin top -->
      <!-- Loading Indicator -->
      <v-col v-if="loading" cols="12" class="text-center py-4"> <!-- Added padding -->
        <v-progress-circular indeterminate color="primary" size="small"></v-progress-circular> <!-- Smaller spinner -->
        <p>Memuat riwayat pembelian...</p>
      </v-col>

      <!-- Purchase History List -->
      <v-col v-else-if="purchases.length > 0" v-for="purchase in purchases" :key="purchase.id" cols="12">
        <v-card class="mb-2" variant="tonal" density="compact"> <!-- Reduced margin, added density, variant -->
          <v-card-title class="d-flex justify-space-between text-body-1" prepend-icon="mdi-receipt-text-outline"> <!-- Smaller title, added icon -->
            <span>Nota: {{ purchase.noNota || '-' }}</span>
            <span class="text-caption">{{ formatDate(purchase.tanggal) }}</span>
          </v-card-title>
          <v-card-subtitle v-if="purchase.supplier" class="text-caption">Supplier: {{ purchase.supplier }}</v-card-subtitle> <!-- Smaller subtitle -->
          <v-divider class="my-1"></v-divider> <!-- Reduced margin -->
          <v-card-text class="py-1"> <!-- Reduced padding -->
            <v-list density="compact" lines="one" class="py-0 bg-transparent"> <!-- Reduced padding, transparent bg -->
              <v-list-subheader class="text-caption">Item Dibeli:</v-list-subheader> <!-- Smaller subheader -->
              <v-list-item v-for="item in purchase.items" :key="item.itemId" class="px-1"> <!-- Reduced padding -->
                <v-list-item-title class="text-caption">{{ getItemName(item.itemId) }}</v-list-item-title> <!-- Smaller title -->
                <v-list-item-subtitle class="text-caption"> <!-- Already caption -->
                  {{ item.quantity }} {{ getItemUnit(item.itemId) }} @ {{ formatCurrency(item.purchasePrice) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="justify-end">
            <span class="font-weight-bold mr-2">Total: {{ formatCurrency(purchase.totalCost) }}</span>
            <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small"
              @click="openDeletePurchaseDialog(purchase)"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- No Data Message -->
      <v-col v-else cols="12">
        <v-alert type="info" variant="tonal">Belum ada riwayat pembelian yang tercatat.</v-alert>
      </v-col>
    </v-row>

    <!-- Delete Purchase Confirmation Dialog -->
    <v-dialog v-model="deleteDialogVisible" persistent max-width="400px">
      <v-card density="compact"> <!-- Added density -->
        <v-card-title class="text-h6 error--text">Konfirmasi Hapus</v-card-title> <!-- Smaller title -->
        <v-card-text class="pt-3"> <!-- Added padding top -->
          Apakah Anda yakin ingin menghapus riwayat pembelian ini?
          <br><br>
          <strong class="info--text">Perhatian:</strong> Stok barang yang terkait dengan pembelian ini akan dikurangi
          kembali. Tindakan ini tidak dapat dibatalkan.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelDeletePurchase">Batal</v-btn>
          <v-btn color="error darken-1" text @click="executeDeletePurchase">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getAllPurchases,
  getAllItems,
  deletePurchase,
} from "../stores/localStorage.js"; // Import functions

const router = useRouter();
const purchases = ref([]);
const allItems = ref([]); // To map itemId to name/unit
const loading = ref(true);
const deleteDialogVisible = ref(false);
const purchaseToDelete = ref(null);

onMounted(() => {
  loadData();
});

function loadData() {
  loading.value = true;
  try {
    // Fetch all items first for mapping
    allItems.value = getAllItems();
    // Fetch purchases and sort by date descending (most recent first)
    purchases.value = getAllPurchases().sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  } catch (error) {
    console.error("Error loading purchase history:", error);
    // TODO: Show error message
  } finally {
    loading.value = false;
  }
}

// Helper function to get item name from ID
function getItemName(itemId) {
  const item = allItems.value.find(i => i.id === itemId);
  return item ? item.nama : 'Barang Tidak Ditemukan';
}

// Helper function to get item unit from ID
function getItemUnit(itemId) {
  const item = allItems.value.find(i => i.id === itemId);
  return item ? item.satuan : '';
}


function formatDate(dateString) {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
}

function goBackToStock() {
  router.push("/stok");
}

// --- Delete Purchase Logic ---
function openDeletePurchaseDialog(purchase) {
  purchaseToDelete.value = purchase;
  deleteDialogVisible.value = true;
}

function cancelDeletePurchase() {
  deleteDialogVisible.value = false;
  purchaseToDelete.value = null;
}

function executeDeletePurchase() {
  if (!purchaseToDelete.value) return;

  try {
    const success = deletePurchase(purchaseToDelete.value.id);
    if (success) {
      console.log("Purchase deleted successfully");
      // Refresh the list
      loadData();
    } else {
      console.error("Failed to delete purchase (not found or error)");
      // TODO: Show error notification to user
    }
  } catch (error) {
    console.error("Error executing delete purchase:", error);
    // TODO: Show error notification to user
  } finally {
    cancelDeletePurchase(); // Close dialog regardless of outcome
  }
}

</script>

<style scoped>
/* Add specific styles if needed */
</style>
