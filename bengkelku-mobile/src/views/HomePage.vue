<template>
  <v-container class="pa-2">
    <!-- Nama Bengkel dan Tanggal -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div>
        <h1 class="text-h6">{{ workshopName }}</h1>
        <p class="text-caption text-grey">{{ currentDate }}</p>
      </div>
      <v-btn color="primary" density="comfortable" prepend-icon="mdi-plus-circle-outline" @click="goToAddService" size="small">
        Servis Baru
      </v-btn>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 200px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else>
      <!-- Ringkasan Hari Ini -->
      <div class="mb-3">
        <div class="d-flex align-center mb-2">
          <v-icon icon="mdi-calendar-today" size="small" class="me-1"></v-icon>
          <h2 class="text-subtitle-1 font-weight-medium">Ringkasan Hari Ini</h2>
        </div>
        <v-row dense>
          <v-col cols="6" sm="3">
            <dashboard-summary-card
              title="Total Servis"
              subtitle="Hari Ini"
              :value="todayStats.total"
              icon="mdi-wrench"
              color="primary"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <dashboard-summary-card
              title="Servis Baru"
              subtitle="Menunggu"
              :value="todayStats.byStatus.Baru"
              icon="mdi-file-document-outline"
              color="info"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <dashboard-summary-card
              title="Dalam Proses"
              subtitle="Dikerjakan"
              :value="todayStats.byStatus.Proses"
              icon="mdi-progress-wrench"
              color="warning"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <dashboard-summary-card
              title="Selesai"
              subtitle="Hari Ini"
              :value="todayStats.byStatus.Selesai"
              icon="mdi-check-circle-outline"
              color="success"
            />
          </v-col>
        </v-row>
      </div>

      <v-row dense>
        <!-- Kolom Utama (Full Width di Mobile) -->
        <v-col cols="12">
          <!-- Aksi Cepat -->
          <quick-actions />
        </v-col>

        <!-- Daftar Servis Aktif -->
        <v-col cols="12" md="8">
          <active-services-list :services="activeServices" />
        </v-col>

        <!-- Kolom Kanan -->
        <v-col cols="12" md="4">
          <!-- Peringatan Stok Menipis -->
          <low-stock-alert :low-stock-items="lowStockItems" />

          <!-- Statistik Mingguan -->
          <weekly-stats :stats="weeklyStats" />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getWorkshopInfo } from '../stores/localStorage.js';
import { useDashboardStats } from '../composables/useDashboardStats.js';

// Import komponen dashboard
import DashboardSummaryCard from '../components/dashboard/DashboardSummaryCard.vue';
import ActiveServicesList from '../components/dashboard/ActiveServicesList.vue';
import LowStockAlert from '../components/dashboard/LowStockAlert.vue';
import WeeklyStats from '../components/dashboard/WeeklyStats.vue';
import QuickActions from '../components/dashboard/QuickActions.vue';

const router = useRouter();
const workshopInfo = ref({});

// Gunakan composable untuk statistik dashboard
const {
  loadData,
  isLoading,
  activeServices,
  lowStockItems,
  weeklyStats,
  todayStats
} = useDashboardStats();

// Computed properties
const workshopName = computed(() => {
  return workshopInfo.value.nama || 'BengkelKu';
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Methods
function goToAddService() {
  router.push('/servis/baru');
}

// Lifecycle hooks
onMounted(() => {
  workshopInfo.value = getWorkshopInfo();
  loadData();
});
</script>
