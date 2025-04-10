// src/components/reports/RevenueBarChart.vue
<template>
  <div class="revenue-chart-container">
    <div class="chart-header">
      <div class="chart-title">{{ title }}</div>
      <div class="chart-subtitle">{{ subtitle }}</div>
    </div>
    
    <div class="chart-body">
      <div v-if="data.length === 0" class="no-data">
        Tidak ada data untuk ditampilkan
      </div>
      <div v-else class="chart-bars">
        <div 
          v-for="(item, index) in limitedData" 
          :key="index"
          class="chart-bar-wrapper"
        >
          <div class="chart-label">{{ formatLabel(item[labelKey]) }}</div>
          <div class="chart-bar-container">
            <div 
              class="chart-bar"
              :style="{ 
                height: calculateBarHeight(item[valueKey]) + '%',
                backgroundColor: barColor
              }"
            >
              <div class="chart-value">{{ formatValue(item[valueKey]) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  title: {
    type: String,
    default: 'Chart'
  },
  subtitle: {
    type: String,
    default: ''
  },
  barColor: {
    type: String,
    default: 'rgb(var(--v-theme-primary))'
  },
  formatLabelFn: {
    type: Function,
    default: (label) => label
  },
  formatValueFn: {
    type: Function,
    default: (value) => value
  },
  limit: {
    type: Number,
    default: 7
  }
});

const limitedData = computed(() => {
  // Pastikan props.data adalah array
  if (!Array.isArray(props.data)) {
    console.warn('RevenueBarChart: props.data is not an array', props.data);
    return [];
  }
  return props.data.slice(0, props.limit);
});

const maxValue = computed(() => {
  if (props.data.length === 0) return 0;
  return Math.max(...props.data.map(item => Number(item[props.valueKey]) || 0));
});

function calculateBarHeight(value) {
  if (maxValue.value === 0) return 0;
  return (Number(value) / maxValue.value) * 100;
}

function formatLabel(label) {
  return props.formatLabelFn(label);
}

function formatValue(value) {
  return props.formatValueFn(value);
}
</script>

<style scoped>
.revenue-chart-container {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-title {
  font-weight: 500;
  font-size: 1rem;
}

.chart-subtitle {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.chart-body {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.no-data {
  width: 100%;
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  padding: 16px;
}

.chart-bars {
  display: flex;
  width: 100%;
  height: 200px;
  align-items: flex-end;
  gap: 8px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-label {
  font-size: 0.7rem;
  text-align: center;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transform: rotate(-45deg);
  transform-origin: center right;
  height: 40px;
  display: flex;
  align-items: center;
}

.chart-bar-container {
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  align-items: flex-end;
}

.chart-bar {
  width: 100%;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.5s ease;
}

.chart-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  white-space: nowrap;
}


@media (max-width: 600px) {
  .chart-bars {
    height: 120px;
  }
  
  .chart-label {
    font-size: 0.6rem;
    height: 30px;
  }
  
  .chart-value {
    font-size: 0.6rem;
    top: -16px;
  }
  
  .chart-bar-container {
    height: calc(100% - 30px);
  }
  
  .revenue-chart-container {
    padding: 8px;
  }
  
  .chart-title {
    font-size: 0.875rem;
  }
  
  .chart-subtitle {
    font-size: 0.7rem;
  }
}
</style>