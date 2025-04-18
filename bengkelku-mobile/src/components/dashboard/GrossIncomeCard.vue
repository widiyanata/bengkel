<template>
  <v-card class="mb-4 gross-income-card" variant="flat">
    <v-card-text>
      <div class="d-flex align-center mb-3">
        <v-icon icon="mdi-cash-register" size="large" color="success" class="me-3"></v-icon>
        <div>
          <div class="text-subtitle-1 text-medium-emphasis">Perkiraan Pendapatan Kotor</div>
          <div class="text-h4 font-weight-bold">{{ formatCurrency(grossIncome.total) }}</div>
        </div>
      </div>
      
      <v-divider class="mb-3"></v-divider>
      
      <div class="d-flex justify-space-between">
        <div>
          <div class="text-caption text-medium-emphasis">Dari Servis Selesai</div>
          <div class="text-subtitle-1 font-weight-medium">{{ formatCurrency(grossIncome.completed) }}</div>
        </div>
        <div>
          <div class="text-caption text-medium-emphasis">Jumlah Servis</div>
          <div class="text-subtitle-1 font-weight-medium">{{ grossIncome.servicesWithIncome }} servis</div>
        </div>
        <div>
          <div class="text-caption text-medium-emphasis">Rata-rata</div>
          <div class="text-subtitle-1 font-weight-medium">{{ formatCurrency(averageIncome) }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  grossIncome: {
    type: Object,
    required: true,
    default: () => ({
      total: 0,
      completed: 0,
      servicesWithIncome: 0
    })
  }
});

// Calculate average income per service
const averageIncome = computed(() => {
  if (props.grossIncome.servicesWithIncome === 0) return 0;
  return props.grossIncome.total / props.grossIncome.servicesWithIncome;
});

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}
</script>

<style scoped>
.gross-income-card {
  background: linear-gradient(to right, rgba(var(--v-theme-success), 0.05), rgba(var(--v-theme-success), 0.1));
  border-left: 4px solid rgb(var(--v-theme-success));
  border-radius: 8px;
}
</style>
