// src/views/ReportingPage.vue
<template>
  <v-container>
    <v-card class="mb-4 header-card" variant="flat">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-chart-box" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">Laporan Bengkel</v-card-title>
        <v-card-subtitle>Analisis performa bengkel Anda</v-card-subtitle>
        
        <template v-slot:append>
          <export-button
            :data="reportData.generateReportData()"
            filename="bengkelku-report"
            label="Export"
            icon="mdi-file-export"
            density="comfortable"
          />
        </template>
      </v-card-item>
    </v-card>
    
    <!-- Date Range Selector -->
    <report-card
      title="Filter Laporan"
      icon="mdi-calendar-range"
      variant="flat"
      class="mb-2 mb-sm-4"
    >
      <v-card-text class="pa-2">
        <date-range-selector
          :initial-range="dateRange"
          @update:range="updateDateRange"
        />
      </v-card-text>
    </report-card>
    
    <!-- Tabs for different report sections -->
    <v-card variant="flat" class="mb-2 mb-sm-4">
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="center"
        grow
        show-arrows
        density="comfortable"
        slider-color="primary"
      >
        <v-tab value="overview" class="text-caption text-sm-body-2">Ringkasan</v-tab>
        <v-tab value="services" class="text-caption text-sm-body-2">Servis</v-tab>
        <v-tab value="inventory" class="text-caption text-sm-body-2">Inventaris</v-tab>
        <v-tab value="finance" class="text-caption text-sm-body-2">Keuangan</v-tab>
      </v-tabs>
    </v-card>

    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Overview Tab -->
      <v-window-item value="overview">
        <v-row dense>
          <!-- Revenue Card -->
          <v-col cols="12" sm="6" md="3">
            <report-card
              title="Pendapatan"
              icon="mdi-cash"
              icon-color="success"
              :loading="reportData.loading.value"
              color="success"
              variant="tonal"
            >
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">
                  {{ formatCurrency(reportData.totalRevenueCompleted.value) }}
                </div>
                <div class="text-caption text-medium-emphasis">Dari servis selesai</div>
              </v-card-text>
            </report-card>
          </v-col>
          <!-- Service Summary Card -->
          <v-col cols="6" sm="6" md="3">
            <report-card
              title="Total Servis"
              icon="mdi-wrench"
              icon-color="primary"
              :loading="reportData.loading.value"
              color=""
              variant="flat"
            >
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">{{ reportData.totalServices }}</div>
                <div class="text-caption text-medium-emphasis">Dalam periode yang dipilih</div>
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Completed Services Card -->
          <v-col cols="6" sm="6" md="3">
            <report-card
              title="Servis Selesai"
              icon="mdi-check-circle"
              icon-color="success"
              :loading="reportData.loading.value"
              color=""
              variant="flat"
            >
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">
                  {{ reportData.serviceStatusCounts.value['Selesai'] || 0 }}
                </div>
                <div class="text-caption text-medium-emphasis">Dalam periode yang dipilih</div>
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Low Stock Card -->
          <v-col cols="6" sm="6" md="3">
            <report-card
              title="Stok Menipis"
              icon="mdi-alert-circle"
              icon-color="error"
              :loading="reportData.loading.value"
              color=""
              variant="flat"
            >
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold">
                  {{ reportData.lowStockItemsCount }}
                </div>
                <div class="text-caption text-medium-emphasis">Barang perlu diisi ulang</div>
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Status Distribution Chart -->
          <v-col cols="6" md="4">
            <report-card
              title="Distribusi Status Servis"
              icon="mdi-chart-pie"
              icon-color="primary"
              :loading="reportData.loading.value"
            >
              <v-card-text>
                <status-distribution-chart
                  :status-counts="simplifiedStatusCounts"
                />
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Daily Revenue Chart -->
          <v-col cols="12" md="8">
            <report-card
              title="Pendapatan Harian"
              icon="mdi-chart-bar"
              icon-color="success"
              :loading="reportData.loading.value"
            >
              <v-card-text>
                <revenue-bar-chart
                  :data="safeRevenueData"
                  label-key="date"
                  value-key="revenue"
                  :format-label-fn="formatDate"
                  :format-value-fn="formatCurrency"
                  bar-color="rgb(var(--v-theme-success))"
                  :limit="5"
                />
              </v-card-text>
            </report-card>
          </v-col>
        </v-row>
      </v-window-item>
      
      <!-- Services Tab -->
      <v-window-item value="services">
        <v-row dense>
          <!-- Service Status Distribution -->
          <v-col cols="12">
            <report-card
              title="Distribusi Status Servis"
              icon="mdi-chart-pie"
              icon-color="primary"
              :loading="reportData.loading.value"
            >
              <v-card-text>
                <status-distribution-chart
                  :status-counts="simplifiedStatusCounts"
                />
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Completed Services List -->
          <v-col cols="12">
            <report-card
              title="Daftar Servis Selesai"
              icon="mdi-clipboard-check"
              icon-color="success"
              :loading="reportData.loading.value"
            >
              <v-card-text v-if="reportData.completedServicesList.length === 0" class="text-center">
                <v-icon icon="mdi-information" color="info" size="large"></v-icon>
                <p class="mt-2">Belum ada servis yang selesai dalam periode yang dipilih.</p>
              </v-card-text>
              
              <template v-else>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>ID Servis</th>
                      <th>Pelanggan</th>
                      <th>Kendaraan</th>
                      <th>Tanggal Selesai</th>
                      <th class="text-right">Total Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="service in reportData.completedServicesList.value" :key="service?.id || index">
                      <td>{{ service?.id || 'N/A' }}</td>
                      <td>{{ service?.customer?.nama || 'Walk-in' }}</td>
                      <td>{{ service?.vehicle?.nomorPolisi || service?.nomorPolisi || '-' }}</td>
                      <td>{{ formatDate(service?.tanggalSelesai || service?.timestamp) }}</td>
                      <td class="text-right">{{ formatCurrency(service?.totalBiaya) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
            </report-card>
          </v-col>
        </v-row>
      </v-window-item>
      
      <!-- Inventory Tab -->
      <v-window-item value="inventory">
        <v-row dense>
          <!-- Inventory Summary -->
          <v-col cols="12" md="6">
            <report-card
              title="Ringkasan Inventaris"
              icon="mdi-package-variant"
              icon-color="primary"
              :loading="reportData.loading.value"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>Total Jenis Barang:</div>
                  <div class="font-weight-bold">{{ reportData.totalStockItems }}</div>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <div>Barang Stok Menipis:</div>
                  <v-chip
                    size="small"
                    :color="reportData.lowStockItemsCount > 0 ? 'error' : 'success'"
                    label
                  >
                    {{ reportData.lowStockItemsCount }}
                  </v-chip>
                </div>
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Parts Usage -->
          <v-col cols="12" md="6">
            <report-card
              title="Penggunaan Part Teratas"
              icon="mdi-chart-bar"
              icon-color="info"
              :loading="reportData.loading.value"
            >
              <v-card-text v-if="reportData.partsUsageData.length === 0" class="text-center">
                <v-icon icon="mdi-information" color="info" size="large"></v-icon>
                <p class="mt-2">Belum ada penggunaan part dalam periode yang dipilih.</p>
              </v-card-text>
              
              <v-card-text v-else>
                <revenue-bar-chart
                  :data="safePartsUsageData"
                  label-key="namaItem"
                  value-key="totalQuantity"
                  :format-value-fn="(val) => `${val} unit`"
                  bar-color="rgb(var(--v-theme-info))"
                  :limit="5"
                />
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Low Stock Items -->
          <v-col cols="12">
            <report-card
              title="Daftar Barang Stok Menipis"
              icon="mdi-alert-circle"
              icon-color="error"
              :loading="reportData.loading.value"
            >
              <v-card-text v-if="reportData.lowStockItemsList.length === 0" class="text-center">
                <v-icon icon="mdi-check-circle" color="success" size="large"></v-icon>
                <p class="mt-2">Tidak ada barang yang stoknya menipis.</p>
              </v-card-text>
              
              <template v-else>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>Nama Barang</th>
                      <th>Kode</th>
                      <th>Stok Saat Ini</th>
                      <th>Stok Minimal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Sesudah -->
                    <tr v-for="(item, index) in reportData.lowStockItemsList.value" :key="item?.id || index">
                      <td>{{ item?.nama || 'N/A' }}</td>
                      <td>{{ item?.kode || '-' }}</td>
                      <td>{{ item?.stokSaatIni || 0 }}</td>
                      <td>{{ item?.stokMinimal || 0 }}</td>
                      <td>
                        <v-chip
                          size="x-small"
                          :color="getStockStatusColor(item?.stokSaatIni || 0, item?.stokMinimal || 0)"
                          label
                        >
                          {{ getStockStatusText(item?.stokSaatIni || 0, item?.stokMinimal || 0) }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
            </report-card>
          </v-col>
        </v-row>
      </v-window-item>
      
      <!-- Finance Tab -->
      <v-window-item value="finance">
        <v-row>
          <!-- Revenue Summary -->
          <v-col cols="12" md="6">
            <report-card
              title="Ringkasan Pendapatan"
              icon="mdi-cash-multiple"
              icon-color="success"
              :loading="reportData.loading.value"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>Total Pendapatan (Servis Selesai):</div>
                  <div class="font-weight-bold">{{ formatCurrency(reportData.totalRevenueCompleted.value) }}</div>
                </div>
                
                <v-divider class="my-3"></v-divider>
                
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>Total Invoice:</div>
                  <div class="font-weight-bold">{{ reportData.invoiceStats.value.total }}</div>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>Invoice Dibayar:</div>
                  <v-chip size="small" color="success" label>
                    {{ reportData.invoiceStats.value.paid }}
                  </v-chip>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>Invoice Belum Dibayar:</div>
                  <v-chip size="small" color="warning" label>
                    {{ reportData.invoiceStats.value.unpaid }}
                  </v-chip>
                </div>
                
                <v-divider class="my-3"></v-divider>
                
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>Total Nilai Invoice:</div>
                  <div class="font-weight-bold">{{ formatCurrency(reportData.invoiceStats.value.totalAmount) }}</div>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>Nilai Invoice Dibayar:</div>
                  <div class="text-success font-weight-bold">{{ formatCurrency(reportData.invoiceStats.value.paidAmount) }}</div>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <div>Nilai Invoice Belum Dibayar:</div>
                  <div class="text-warning font-weight-bold">{{ formatCurrency(reportData.invoiceStats.value.unpaidAmount) }}</div>
                </div>
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Daily Revenue Chart -->
          <v-col cols="12" md="6">
            <report-card
              title="Pendapatan Harian"
              icon="mdi-chart-line"
              icon-color="primary"
              :loading="reportData.loading.value"
            >
              <v-card-text v-if="reportData.dailyRevenueData.length === 0" class="text-center">
                <v-icon icon="mdi-information" color="info" size="large"></v-icon>
                <p class="mt-2">Belum ada pendapatan dalam periode yang dipilih.</p>
              </v-card-text>
              
              <v-card-text v-else>
                <revenue-bar-chart
                  :data="safeRevenueData"
                  label-key="date"
                  value-key="revenue"
                  :format-label-fn="formatDate"
                  :format-value-fn="formatCurrency"
                  bar-color="rgb(var(--v-theme-primary))"
                  :limit="7"
                />
              </v-card-text>
            </report-card>
          </v-col>
          
          <!-- Revenue by Service Type -->
          <v-col cols="12">
            <report-card
              title="Pendapatan per Hari"
              subtitle="Detail pendapatan harian dalam periode yang dipilih"
              icon="mdi-calendar-text"
              icon-color="primary"
              :loading="reportData.loading.value"
            >
              <v-card-text v-if="reportData.dailyRevenueData.length === 0" class="text-center">
                <v-icon icon="mdi-information" color="info" size="large"></v-icon>
                <p class="mt-2">Belum ada pendapatan dalam periode yang dipilih.</p>
              </v-card-text>
              
              <template v-else>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th class="text-right">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in reportData.dailyRevenueData.value || []" :key="item?.date || index">
                      <td>{{ formatDate(item?.date) }}</td>
                      <td class="text-right">{{ formatCurrency(item?.revenue) }}</td>
                    </tr>
                    <tr class="bg-grey-lighten-4">
                      <td class="font-weight-bold">Total</td>
                      <td class="text-right font-weight-bold">{{ formatCurrency(reportData.totalRevenueCompleted.value) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
            </report-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useReportData } from '../composables/useReportData.js';
import StatusDistributionChart from '../components/reports/StatusDistributionChart.vue';
import RevenueBarChart from '../components/reports/RevenueBarChart.vue';
import DateRangeSelector from '../components/reports/DateRangeSelector.vue';
import ExportButton from '../components/reports/ExportButton.vue';
import ReportCard from '../components/reports/ReportCard.vue';

// Active tab
const activeTab = ref('overview');

// Date range
const dateRange = ref({
  start: null,
  end: null
});

// Initialize report data with composable
const reportData = useReportData(dateRange.value);

// Update date range
function updateDateRange(range) {
  dateRange.value = range;
  reportData.updateDateRange(range);
}

// Helper function for currency formatting
// Helper function for currency formatting
function formatCurrency(value) {
  const numberValue = Number(value || 0);
  if (isNaN(numberValue)) {
    return 'Rp0';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
}

// Helper function for date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
}

// Helper function for stock status color
function getStockStatusColor(current, minimum) {
  if (current === 0) return 'error';
  if (current <= minimum / 2) return 'error';
  if (current <= minimum) return 'warning';
  return 'success';
}

// Helper function for stock status text
function getStockStatusText(current, minimum) {
  if (current === 0) return 'Habis';
  if (current <= minimum / 2) return 'Kritis';
  if (current <= minimum) return 'Menipis';
  return 'Cukup';
}

const simplifiedStatusCounts = computed(() => {
  // Buat objek baru yang tidak reaktif
  const result = {};
  for (const [status, count] of Object.entries(reportData.serviceStatusCounts.value)) {
    result[status] = count;
  }
  return result;
});
const safeRevenueData = computed(() => {
  const data = reportData.dailyRevenueData.value;
  return Array.isArray(data) ? data : [];
});

const safePartsUsageData = computed(() => {
  const data = reportData.partsUsageData.value;
  return Array.isArray(data) ? data : [];
});
</script>

<style scoped>
/* Add any additional styles here */
@media (max-width: 600px) {
  /* .v-card-title {
    font-size: 1rem !important;
  } */
  
  .v-card-subtitle {
    font-size: 0.75rem !important;
  }
  
  .text-h3 {
    font-size: 1.5rem !important;
  }
  
  .v-table {
    font-size: 0.75rem !important;
  }
  
  .v-card-text {
    padding: 8px !important;
  }
  
  .v-card-item {
    padding: 12px !important;
  }
}
</style>