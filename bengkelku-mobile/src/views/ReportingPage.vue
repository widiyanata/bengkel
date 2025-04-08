<template>
  <v-container>
    <h1 class="mb-4">Laporan Bengkel</h1>

    <v-row dense> <!-- Add dense to the row for tighter spacing -->
      <!-- Service Summary Card -->
      <v-col cols="12" md="6">
        <v-card variant="outlined" density="compact"> <!-- Add density -->
          <v-card-title prepend-icon="mdi-wrench-clock">Ringkasan Servis</v-card-title> <!-- Add icon -->
          <v-card-text v-if="!loading">
            <p class="mb-1">Total Servis Tercatat: <strong>{{ totalServices }}</strong></p> <!-- Reduce margin -->
            <v-list density="compact" class="py-0"> <!-- Reduce padding -->
              <v-list-subheader>Status Servis:</v-list-subheader>
              <v-list-item v-for="(count, status) in serviceStatusCounts" :key="status" class="px-1"> <!-- Reduce padding -->
                <v-list-item-title class="text-body-2">{{ status }}</v-list-item-title> <!-- Smaller font -->
                <template v-slot:append>
                  <v-chip size="small" :color="getStatusColor(status)" label>{{ count }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-divider class="my-1"></v-divider> <!-- Reduce margin -->
            <p class="mt-1">Total Estimasi Pendapatan (Selesai): <strong>{{ formatCurrency(totalRevenueCompleted) }}</strong></p> <!-- Reduce margin -->
          </v-card-text>
          <v-card-text v-else class="text-center py-4"> <!-- Adjust padding -->
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Memuat data servis...</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Stock Summary Card -->
       <v-col cols="12" md="6">
         <v-card variant="outlined" class="fill-height" density="compact"> <!-- Add density -->
           <v-card-title prepend-icon="mdi-package-variant-closed">Ringkasan Stok</v-card-title> <!-- Add icon -->
           <v-card-text v-if="!loading">
             <p class="mb-1">Total Jenis Barang: <strong>{{ totalStockItems }}</strong></p> <!-- Reduce margin -->
             <p class="mb-1">Barang Stok Menipis: <!-- Reduce margin -->
                <v-chip size="small" :color="lowStockItemsCount > 0 ? 'error' : 'success'" label>
                   <strong>{{ lowStockItemsCount }}</strong>
                 </v-chip>
                 <span class="text-caption ml-1">(Stok <= Stok Minimal)</span>
              </p>

              <!-- List of Low Stock Items -->
              <v-list v-if="lowStockItemsCount > 0" density="compact" class="mt-1 py-0"> <!-- Reduce margin/padding -->
                <v-list-subheader>Daftar Barang Stok Menipis:</v-list-subheader>
                <v-list-item v-for="item in lowStockItemsList" :key="item.id" class="px-1"> <!-- Reduce padding -->
                  <v-list-item-title class="text-body-2">{{ item.nama }} ({{ item.kode }})</v-list-item-title> <!-- Smaller font -->
                  <v-list-item-subtitle class="text-caption"> <!-- Smaller font -->
                    Stok: {{ item.stokSaatIni }} / Minimal: {{ item.stokMinimal }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <!-- End List -->

           </v-card-text>
            <v-card-text v-else class="text-center py-4"> <!-- Adjust padding -->
              <v-progress-circular indeterminate color="primary" size="small"></v-progress-circular> <!-- Smaller spinner -->
              <p>Memuat data stok...</p>
            </v-card-text>
         </v-card>
       </v-col>

      <!-- Purchase Summary Card -->
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="fill-height" density="compact"> <!-- Add density -->
          <v-card-title prepend-icon="mdi-cart-arrow-down">Ringkasan Pembelian Stok</v-card-title> <!-- Add icon -->
          <v-card-text v-if="!loading">
            <p class="mb-1">Total Pembelian (7 Hari Terakhir): <strong>{{ formatCurrency(purchaseTotalLast7Days) }}</strong></p> <!-- Reduce margin -->
            <p class="mb-1">Total Pembelian (30 Hari Terakhir): <strong>{{ formatCurrency(purchaseTotalLast30Days) }}</strong></p> <!-- Reduce margin -->
            <!-- Add more purchase details later if needed -->
          </v-card-text>
          <v-card-text v-else class="text-center py-4"> <!-- Adjust padding -->
            <v-progress-circular indeterminate color="primary" size="small"></v-progress-circular> <!-- Smaller spinner -->
            <p>Memuat data pembelian...</p>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllServices, getAllItems, getAllPurchases } from '../stores/localStorage.js'; // Import functions

const loading = ref(true);
const services = ref([]);
const stockItems = ref([]); // Add ref for stock items
const purchases = ref([]); // Add ref for purchase records

// Computed properties for reporting
const totalServices = computed(() => services.value.length);

const serviceStatusCounts = computed(() => {
  const counts = {};
  services.value.forEach(service => {
    const status = service.status || 'Tidak Diketahui';
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
});

const totalRevenueCompleted = computed(() => {
  return services.value
    .filter(service => service.status === 'Selesai')
    .reduce((sum, service) => sum + (Number(service.totalBiaya) || 0), 0);
});

// Computed properties for stock report
const totalStockItems = computed(() => stockItems.value.length);

const lowStockItemsCount = computed(() => {
  return stockItems.value.filter(item =>
    item.stokMinimal > 0 && (Number(item.stokSaatIni) || 0) <= Number(item.stokMinimal)
  ).length;
});

// New computed property for the list of low stock items
const lowStockItemsList = computed(() => {
  return stockItems.value.filter(item =>
    item.stokMinimal > 0 && (Number(item.stokSaatIni) || 0) <= Number(item.stokMinimal)
  );
});

// Computed properties for purchase report
const purchaseTotalLast7Days = computed(() => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return purchases.value
    .filter(p => new Date(p.timestamp) >= sevenDaysAgo)
    .reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
});

const purchaseTotalLast30Days = computed(() => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return purchases.value
    .filter(p => new Date(p.timestamp) >= thirtyDaysAgo)
    .reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
});


// Fetch data on mount
onMounted(() => {
  loadReportData();
});

function loadReportData() {
  loading.value = true;
  try {
    services.value = getAllServices();
    stockItems.value = getAllItems(); // Load stock items
    purchases.value = getAllPurchases(); // Load purchase records
    // Load other data if needed for more reports
  } catch (error) {
    console.error("Error loading report data:", error);
    // Handle error display if necessary
  } finally {
    loading.value = false;
  }
}

// Helper function for status color (similar to ServiceDetailPage)
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

// Helper function for currency formatting
function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
}

</script>

<style scoped>
.fill-height {
  height: 100%;
}
</style>
