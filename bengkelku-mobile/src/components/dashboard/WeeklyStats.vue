<template>
  <v-card class="mb-3 weekly-stats-card">
    <v-card-title class="d-flex align-center py-2">
      <v-icon icon="mdi-chart-timeline-variant" size="small" class="me-1"></v-icon>
      <span class="text-subtitle-1 font-weight-medium">Statistik Minggu Ini</span>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-3">
      <div class="d-flex justify-space-between align-center mb-2 stat-row">
        <div class="text-body-2">Total Servis:</div>
        <div class="text-body-2 font-weight-bold">{{ stats.totalServices }}</div>
      </div>
      <div class="d-flex justify-space-between align-center mb-2 stat-row">
        <div class="text-body-2">Servis Selesai:</div>
        <div class="text-body-2 font-weight-bold">{{ stats.completedServices }}</div>
      </div>
      <div class="d-flex justify-space-between align-center mb-2 stat-row">
        <div class="text-body-2">Pelanggan Baru:</div>
        <div class="text-body-2 font-weight-bold">{{ stats.newCustomers }}</div>
      </div>
      <div class="d-flex justify-space-between align-center stat-row revenue-row">
        <div class="text-body-2">Estimasi Pendapatan:</div>
        <div class="text-body-2 font-weight-bold">{{ formatCurrency(stats.estimatedRevenue) }}</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.weekly-stats-card {
  border-radius: 8px;
}

.stat-row {
  padding: 4px 0;
}

.revenue-row {
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}
</style>

<script setup>
import { defineProps } from 'vue';

defineProps({
  stats: {
    type: Object,
    required: true
  }
});

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}
</script>
