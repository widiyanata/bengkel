<template>
  <v-card class="mb-3 service-list-card">
    <v-card-title class="d-flex align-center py-2">
      <v-icon icon="mdi-wrench" size="small" class="me-1"></v-icon>
      <span class="text-subtitle-1 font-weight-medium">Servis Aktif</span>
      <v-spacer></v-spacer>
      <v-btn
        v-if="services.length > 0"
        variant="text"
        density="compact"
        size="small"
        to="/servis"
        color="primary"
      >
        Lihat Semua
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-list v-if="services.length > 0" density="compact" class="pa-0">
      <v-list-item
        v-for="service in services"
        :key="service.id"
        :to="`/servis/${service.id}`"
        :subtitle="formatDate(service.timestamp)"
        density="compact"
        class="service-item"
      >
        <template v-slot:prepend>
          <v-icon :icon="getStatusIcon(service.status)" size="small" :color="getStatusColor(service.status)" class="me-1"></v-icon>
        </template>
        <template v-slot:title>
          <div class="d-flex align-center">
            <span class="text-body-2">{{ service.nomorPolisi }}</span>
            <v-chip
              size="x-small"
              class="ms-2"
              :color="getStatusColor(service.status)"
              density="compact"
            >
              {{ service.status }}
            </v-chip>
          </div>
        </template>
        <template v-slot:append>
          <v-icon icon="mdi-chevron-right" size="x-small"></v-icon>
        </template>
      </v-list-item>
    </v-list>

    <v-card-text v-else class="text-center pa-3">
      <v-icon icon="mdi-check-circle-outline" size="medium" color="success" class="mb-1"></v-icon>
      <div class="text-caption">Tidak ada servis aktif saat ini</div>
      <v-btn color="primary" size="small" density="comfortable" class="mt-2" to="/servis/baru">
        Tambah Servis Baru
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.service-list-card {
  border-radius: 8px;
}

.service-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.service-item:last-child {
  border-bottom: none;
}
</style>

<script setup>
import { defineProps } from 'vue';

defineProps({
  services: {
    type: Array,
    required: true
  }
});

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getStatusColor(status) {
  switch (status) {
    case 'Baru':
      return 'info';
    case 'Proses':
      return 'warning';
    case 'Menunggu Sparepart':
      return 'orange';
    case 'Selesai':
      return 'success';
    case 'Dibatalkan':
      return 'error';
    default:
      return 'grey';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'Baru':
      return 'mdi-file-document-outline';
    case 'Proses':
      return 'mdi-progress-wrench';
    case 'Menunggu Sparepart':
      return 'mdi-timer-sand';
    case 'Selesai':
      return 'mdi-check-circle-outline';
    case 'Dibatalkan':
      return 'mdi-cancel';
    default:
      return 'mdi-help-circle-outline';
  }
}
</script>
