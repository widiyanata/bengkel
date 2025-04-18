<template>
  <v-card :color="color" class="dashboard-card">
    <div class="d-flex align-center pa-3">
      <v-icon :icon="icon" size="medium" class="me-3"></v-icon>
      <div class="flex-grow-1">
        <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
        <div class="text-caption text-medium-emphasis">{{ subtitle }}</div>
      </div>
      <div class="text-h5 font-weight-bold">{{ value }}</div>
    </div>
  </v-card>
</template>

<style scoped>
.dashboard-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .dashboard-card {
    min-height: 80px;
  }
}
</style>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: 'mdi-information-outline'
  },
  color: {
    type: String,
    default: 'primary'
  }
});
</script>
