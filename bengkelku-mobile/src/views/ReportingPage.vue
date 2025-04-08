<template>
  <v-container>
    <h1 class="mb-4">Laporan Bengkel</h1>

    <v-row>
      <!-- Service Summary Card -->
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title>Ringkasan Servis</v-card-title>
          <v-card-text v-if="!loading">
            <p>Total Servis Tercatat: <strong>{{ totalServices }}</strong></p>
            <v-list density="compact">
              <v-list-subheader>Status Servis:</v-list-subheader>
              <v-list-item v-for="(count, status) in serviceStatusCounts" :key="status">
                <v-list-item-title>{{ status }}</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="small" :color="getStatusColor(status)" label>{{ count }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-divider class="my-2"></v-divider>
            <p>Total Estimasi Pendapatan (Selesai): <strong>{{ formatCurrency(totalRevenueCompleted) }}</strong></p>
          </v-card-text>
          <v-card-text v-else class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Memuat data servis...</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Stock Summary Card -->
       <v-col cols="12" md="6">
         <v-card variant="outlined" class="fill-height">
           <v-card-title>Ringkasan Stok</v-card-title>
           <v-card-text v-if="!loading">
             <p>Total Jenis Barang: <strong>{{ totalStockItems }}</strong></p>
             <p>Barang Stok Menipis:
                <v-chip size="small" :color="lowStockItemsCount > 0 ? 'error' : 'success'" label>
                   <strong>{{ lowStockItemsCount }}</strong>
                 </v-chip>
                 <span class="text-caption ml-1">(Stok &lt;= Stok Minimal)</span> <!-- Corrected Entity -->
              </p>
             <!-- Add more stock details later if needed -->
             <!-- e.g., list low stock items -->
           </v-card-text>
            <v-card-text v-else class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p>Memuat data stok...</p>
            </v-card-text>
         </v-card>
       </v-col>

    </v-row>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllServices, getAllItems } from '../stores/localStorage.js'; // Import functions

const loading = ref(true);
const services = ref([]);
const stockItems = ref([]); // Add ref for stock items

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


// Fetch data on mount
onMounted(() => {
  loadReportData();
});

function loadReportData() {
  loading.value = true;
  try {
    services.value = getAllServices();
    stockItems.value = getAllItems(); // Load stock items
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
