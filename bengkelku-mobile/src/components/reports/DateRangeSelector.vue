<template>
  <div class="date-range-selector pa-2">
    <!-- Tambahkan tabs untuk pilihan cepat di mobile -->
    <v-tabs
      v-model="activeTab"
      density="comfortable"
      color="primary"
      align-tabs="center"
      class="mb-2 d-md-none"
      hide-slider
    >
      <v-tab value="custom">Kustom</v-tab>
      <v-tab value="quick">Cepat</v-tab>
    </v-tabs>
    
    <v-window v-model="activeTab" class="d-md-none">
      <v-window-item value="custom">
        <!-- Form tanggal kustom untuk mobile -->
        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="startDate"
              label="Mulai"
              type="date"
              density="compact"
              variant="flat"
              hide-details
              @update:model-value="updateRange"
            ></v-text-field>
          </v-col>
          
          <v-col cols="6">
            <v-text-field
              v-model="endDate"
              label="Akhir"
              type="date"
              density="compact"
              variant="flat"
              hide-details
              @update:model-value="updateRange"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-window-item>
      
      <v-window-item value="quick">
        <!-- Pilihan cepat untuk mobile -->
        <v-row dense>
          <v-col cols="4">
            <v-btn
              color="primary"
              variant="tonal"
              block
              @click="setRange('today')"
              size="small"
            >
              Hari Ini
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn
              color="primary"
              variant="tonal"
              block
              @click="setRange('week')"
              size="small"
            >
              Minggu Ini
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn
              color="primary"
              variant="tonal"
              block
              @click="setRange('month')"
              size="small"
            >
              Bulan Ini
            </v-btn>
          </v-col>
        </v-row>
        
        <v-row dense class="mt-2">
          <v-col cols="6">
            <v-btn
              color="primary"
              variant="tonal"
              block
              @click="setRange('last_month')"
              size="small"
            >
              Bulan Lalu
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn
              color="error"
              variant="text"
              block
              @click="resetRange"
              size="small"
            >
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
    
    <!-- Tampilan desktop tetap sama tapi dengan layout yang lebih baik -->
    <div class="d-none d-md-block">
      <v-row dense>
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="startDate"
            label="Tanggal Mulai"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="updateRange"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="endDate"
            label="Tanggal Akhir"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="updateRange"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" sm="2">
          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="resetRange"
          >
            Reset
          </v-btn>
        </v-col>
      </v-row>
      
      <v-row class="mt-2" dense>
        <v-col cols="3">
          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="setRange('today')"
            density="compact"
          >
            Hari Ini
          </v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="setRange('week')"
            density="compact"
          >
            Minggu Ini
          </v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="setRange('month')"
            density="compact"
          >
            Bulan Ini
          </v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="setRange('last_month')"
            density="compact"
          >
            Bulan Lalu
          </v-btn>
        </v-col>
      </v-row>
    </div>
    
    <!-- Tampilkan rentang tanggal yang dipilih -->
    <v-chip
      v-if="startDate || endDate"
      class="mt-2"
      color="primary"
      size="small"
      closable
      @click:close="resetRange"
    >
      {{ getDateRangeText() }}
    </v-chip>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  initialRange: {
    type: Object,
    default: () => ({ start: null, end: null })
  }
});

const emit = defineEmits(['update:range']);

const startDate = ref(props.initialRange.start || '');
const endDate = ref(props.initialRange.end || '');
const activeTab = ref('quick'); // Default tab untuk mobile

// Watch for prop changes
watch(() => props.initialRange, (newRange) => {
  startDate.value = newRange.start || '';
  endDate.value = newRange.end || '';
}, { deep: true });

function updateRange() {
  if (startDate.value && endDate.value) {
    // Validate that end date is not before start date
    if (new Date(endDate.value) < new Date(startDate.value)) {
      endDate.value = startDate.value;
    }
  }
  
  emit('update:range', {
    start: startDate.value || null,
    end: endDate.value || null
  });
}

function resetRange() {
  startDate.value = '';
  endDate.value = '';
  updateRange();
}

function setRange(period) {
  const today = new Date();
  const todayStr = formatDate(today);
  
  switch (period) {
    case 'today':
      startDate.value = todayStr;
      endDate.value = todayStr;
      break;
    case 'week':
      // Get first day of current week (Sunday)
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      startDate.value = formatDate(firstDayOfWeek);
      endDate.value = todayStr;
      break;
    case 'month':
      // Get first day of current month
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.value = formatDate(firstDayOfMonth);
      endDate.value = todayStr;
      break;
    case 'last_month':
      // Get first day of last month
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      startDate.value = formatDate(firstDayOfLastMonth);
      endDate.value = formatDate(lastDayOfLastMonth);
      break;
  }
  
  updateRange();
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDateRangeText() {
  if (startDate.value && endDate.value) {
    if (startDate.value === endDate.value) {
      return `Tanggal: ${formatDisplayDate(startDate.value)}`;
    } else {
      return `${formatDisplayDate(startDate.value)} - ${formatDisplayDate(endDate.value)}`;
    }
  } else if (startDate.value) {
    return `Dari: ${formatDisplayDate(startDate.value)}`;
  } else if (endDate.value) {
    return `Sampai: ${formatDisplayDate(endDate.value)}`;
  }
  return '';
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
</script>

<style scoped>
.date-range-selector {
  margin-bottom: 16px;
}
</style>