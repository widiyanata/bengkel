<template>
  <v-card class="mb-3 low-stock-card" color="warning" v-if="lowStockItems.length > 0">
    <v-card-title class="d-flex align-center py-2">
      <v-icon icon="mdi-alert-circle-outline" size="small" class="me-1"></v-icon>
      <span class="text-subtitle-1 font-weight-medium">Stok Menipis</span>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        density="compact"
        size="small"
        to="/stok"
        color="white"
      >
        Lihat Semua
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-list density="compact" bg-color="warning-lighten-1" class="pa-0">
      <v-list-item
        v-for="item in lowStockItems.slice(0, maxItems)"
        :key="item.id"
        density="compact"
        class="low-stock-item"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-package-variant-closed-alert" size="small" class="me-1"></v-icon>
        </template>
        <template v-slot:title>
          <span class="text-body-2">{{ item.nama }}</span>
        </template>
        <template v-slot:subtitle>
          <span class="text-caption">Stok: {{ item.stokSaatIni }} {{ item.satuan }} (Min: {{ item.stokMinimal }})</span>
        </template>
      </v-list-item>
      <v-list-item v-if="lowStockItems.length > maxItems" density="compact">
        <div class="text-center text-caption">
          Dan {{ lowStockItems.length - maxItems }} item lainnya...
        </div>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style scoped>
.low-stock-card {
  border-radius: 8px;
}

.low-stock-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.low-stock-item:last-child {
  border-bottom: none;
}
</style>

<script setup>
import { defineProps } from 'vue';

defineProps({
  lowStockItems: {
    type: Array,
    required: true
  },
  maxItems: {
    type: Number,
    default: 3
  }
});
</script>
