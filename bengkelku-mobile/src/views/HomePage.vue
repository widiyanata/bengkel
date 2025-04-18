<template>
  <v-container class="pa-2">
    <!-- Nama Bengkel dan Tanggal -->
    <!-- Enhanced Header with Card -->
    <v-card class="mb-4 header-card" variant="flat">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-home" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">{{ workshopName }}</v-card-title>
        <v-card-subtitle>{{ currentDate }}</v-card-subtitle>

        <template v-slot:append>
          <v-btn color="primary" density="comfortable" prepend-icon="mdi-plus-circle-outline" @click="goToAddService" size="small">
            Servis Baru
          </v-btn>
        </template>
      </v-card-item>
    </v-card>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 200px">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else>
      <!-- Perkiraan Pendapatan Kotor Hari Ini -->
      <gross-income-card :gross-income="todayGrossIncome" />

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
        <!-- Kolom Kiri -->
        <v-col cols="12" md="6">
          <!-- Aksi Cepat -->
          <quick-actions />
          <!-- Daftar Servis Aktif -->
          <active-services-list :services="activeServices" />
        </v-col>

        <!-- Kolom Kanan -->
        <v-col cols="12" md="6">
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
import GrossIncomeCard from '../components/dashboard/GrossIncomeCard.vue';

const router = useRouter();
const workshopInfo = ref({});

// Gunakan composable untuk statistik dashboard
const {
  loadData,
  isLoading,
  activeServices,
  lowStockItems,
  weeklyStats,
  todayStats,
  todayGrossIncome
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
