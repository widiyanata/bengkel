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
             <!-- List Low Stock Items -->
             <v-list v-if="lowStockItemsList.length > 0" density="compact" class="mt-2">
                <v-list-subheader>Barang Stok Menipis:</v-list-subheader>
                <v-list-item
                  v-for="item in lowStockItemsList"
                  :key="item.itemId"
                  :title="item.namaItem"
                >
                  <template v-slot:append>
                    <v-chip size="x-small" color="error" label>
                      Stok: {{ item.stokSaatIni }} / Min: {{ item.stokMinimal }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else class="text-caption mt-2">Tidak ada barang yang stoknya menipis.</p>

           </v-card-text>
            <v-card-text v-else class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p>Memuat data stok...</p>
            </v-card-text>
         </v-card>
       </v-col>

      <!-- Daily Revenue Card -->
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="fill-height">
          <v-card-title>Pendapatan Harian (Servis Selesai)</v-card-title>
          <v-card-text v-if="!loading">
            <v-list v-if="dailyRevenueData.length > 0" density="compact">
              <v-list-item
                v-for="item in dailyRevenueData"
                :key="item.date"
                :title="formatDate(item.date)"
              >
                <template v-slot:append>
                  <v-chip size="small" color="success" label>
                    {{ formatCurrency(item.revenue) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-caption">Belum ada data pendapatan harian.</p>
          </v-card-text>
          <v-card-text v-else class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Memuat data pendapatan...</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Parts Usage Card -->
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="fill-height">
          <v-card-title>Penggunaan Part (Servis Selesai)</v-card-title>
          <v-card-text v-if="!loading">
            <v-list v-if="partsUsageData.length > 0" density="compact">
              <v-list-item
                v-for="item in partsUsageData"
                :key="item.itemId"
                :title="item.namaItem"
                :subtitle="`Kode: ${item.kodeItem || '-'}`"
              >
                <template v-slot:append>
                  <v-chip size="small" color="info" label>
                    Total Digunakan: {{ item.totalQuantity }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-caption">Belum ada data penggunaan part.</p>
          </v-card-text>
          <v-card-text v-else class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Memuat data penggunaan part...</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Completed Services List Card -->
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-title>Daftar Servis Selesai</v-card-title>
          <v-card-text v-if="!loading">
            <v-list v-if="completedServicesList.length > 0" density="compact">
              <v-list-item
                v-for="service in completedServicesList"
                :key="service.serviceId"
                :title="`Servis ID: ${service.serviceId}`"
                :subtitle="`Pelanggan: ${service.customer?.nama || 'Walk-in'}, Kendaraan: ${service.vehicle?.nomorPolisi || '-'}`"
              >
                <template v-slot:append>
                  <div class="text-right">
                     <div class="text-caption">Selesai: {{ formatDate(service.tanggalSelesai) }}</div>
                     <v-chip size="small" color="success" label class="mt-1">
                       {{ formatCurrency(service.totalBiaya) }}
                     </v-chip>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-caption">Belum ada servis yang selesai.</p>
          </v-card-text>
          <v-card-text v-else class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Memuat data servis selesai...</p>
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

// Computed property to get the list of low stock items
const lowStockItemsList = computed(() => {
  return stockItems.value.filter(item =>
    item.stokMinimal > 0 && (Number(item.stokSaatIni) || 0) <= Number(item.stokMinimal)
  ).sort((a, b) => (a.stokSaatIni / a.stokMinimal) - (b.stokSaatIni / b.stokMinimal)); // Sort by severity
});

// Computed property for daily revenue
const dailyRevenueData = computed(() => {
  const revenueByDate = {};
  services.value
    .filter(service => service.status === 'Selesai' && service.tanggalSelesai) // Ensure service is completed and has a completion date
    .forEach(service => {
      try {
        // Extract date part (YYYY-MM-DD) from ISO string or similar
        const date = service.tanggalSelesai.substring(0, 10);
        revenueByDate[date] = (revenueByDate[date] || 0) + (Number(service.totalBiaya) || 0);
      } catch (e) {
        console.warn(`Could not parse date for service ${service.serviceId}: ${service.tanggalSelesai}`);
      }
    });

  // Convert to array and sort by date descending
  return Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

// Computed property for parts usage
const partsUsageData = computed(() => {
  const usageMap = new Map(); // Use a Map for easier item lookup

  // Populate map with all known items first to include items with 0 usage if needed (optional)
  // stockItems.value.forEach(item => {
  //   usageMap.set(item.itemId, { ...item, totalQuantity: 0 });
  // });

  services.value
    .filter(service => service.status === 'Selesai' && service.parts && service.parts.length > 0)
    .forEach(service => {
      service.parts.forEach(part => {
        const itemId = part.itemId;
        const quantity = Number(part.jumlah) || 0;
        if (quantity > 0) {
          if (usageMap.has(itemId)) {
            usageMap.get(itemId).totalQuantity += quantity;
          } else {
            // Find item details from stockItems if not already in map
            const itemDetails = stockItems.value.find(stockItem => stockItem.itemId === itemId);
            usageMap.set(itemId, {
              itemId: itemId,
              namaItem: itemDetails?.namaItem || `Part ID: ${itemId}`, // Fallback name
              kodeItem: itemDetails?.kodeItem,
              totalQuantity: quantity,
            });
          }
        }
      });
    });

  // Convert map values to array and sort by quantity descending
  return Array.from(usageMap.values())
    .filter(item => item.totalQuantity > 0) // Only show items that were actually used
    .sort((a, b) => b.totalQuantity - a.totalQuantity);
});

// Computed property for completed services list
const completedServicesList = computed(() => {
  return services.value
    .filter(service => service.status === 'Selesai')
    .sort((a, b) => {
      // Sort by completion date descending, handle cases where date might be missing
      const dateA = a.tanggalSelesai || '0';
      const dateB = b.tanggalSelesai || '0';
      return dateB.localeCompare(dateA);
    });
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

// Helper function for date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Adjust for potential timezone issues if needed, assuming local timezone display is fine
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString; // Return original string if parsing fails
  }
}
</script>

<style scoped>
.fill-height {
  height: 100%;
}
</style>
