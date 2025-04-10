// src/components/reports/StatusDistributionChart.vue
<template>
  <div class="status-chart-container">
    <div class="status-chart">
      <div 
        v-for="(count, status) in statusCounts" 
        :key="status"
        class="status-bar"
        :class="`status-${getStatusClass(status)}`"
        :style="{ width: getPercentage(count) + '%' }"
        :title="`${String(status)}: ${Number(count)} (${Math.round(getPercentage(Number(count)))}%)`"
      >
        <span v-if="getPercentage(count) > 10" class="status-label">
          {{ status }} ({{ count }})
        </span>
      </div>
    </div>
    <div class="status-legend">
      <div v-for="(count, status) in statusCounts" :key="status" class="legend-item">
        <div class="legend-color" :class="`status-${getStatusClass(status)}`"></div>
        <span>{{ status }}: {{ count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  statusCounts: {
    type: Object,
    required: true
  }
});

const total = computed(() => {
  return Object.values(props.statusCounts).reduce((sum, count) => sum + count, 0);
});

function getPercentage(count) {
  if (total.value === 0) return 0;
  return (count / total.value) * 100;
}

function getStatusClass(status) {
  switch (status) {
    case 'Dikerjakan': return 'in-progress';
    case 'Selesai': return 'completed';
    case 'Antri': return 'queued';
    case 'Tunggu Part': return 'waiting';
    case 'Baru': return 'new';
    default: return 'unknown';
  }
}
</script>

<style scoped>
.status-chart-container {
  margin: 16px 0;
}

.status-chart {
  height: 30px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  width: 100%;
}

.status-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  transition: width 0.5s ease;
  min-width: 4px;
}

.status-new {
  background-color: #2196F3; /* info */
}

.status-queued {
  background-color: #1E88E5; /* blue */
}

.status-in-progress {
  background-color: #FF9800; /* orange */
}

.status-waiting {
  background-color: #9C27B0; /* purple */
}

.status-completed {
  background-color: #4CAF50; /* green */
}

.status-unknown {
  background-color: #9E9E9E; /* grey */
}

.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 4px;
}

.status-label {
  white-space: nowrap;
  padding: 0 8px;
}

@media (max-width: 600px) {
  .status-legend {
    flex-direction: column;
    gap: 4px;
  }
  
  .status-chart {
    height: 24px;
    border-radius: 12px;
  }
  
  .legend-item {
    font-size: 0.7rem;
  }
  
  .legend-color {
    width: 10px;
    height: 10px;
  }
  
  .status-label {
    font-size: 0.65rem;
  }
}
</style>