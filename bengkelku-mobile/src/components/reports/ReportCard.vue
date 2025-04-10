<template>
  <v-card :variant="variant" class="report-card">
    <v-card-item :class="{ 'py-2': $vuetify.display.smAndDown }">
      <template v-slot:prepend v-if="icon">
        <v-avatar :color="iconColor + '-lighten-4'" :size="$vuetify.display.smAndDown ? 'default' : 'large'">
          <v-icon :icon="icon" :color="iconColor" :size="$vuetify.display.smAndDown ? 'small' : 'default'"></v-icon>
        </v-avatar>
      </template>
      <v-card-title :class="{ 'text-body-3': $vuetify.display.smAndDown }">{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle" :class="{ 'text-caption': $vuetify.display.smAndDown }">{{ subtitle }}</v-card-subtitle>
    </v-card-item>
    
    <v-divider v-if="$slots.default"></v-divider>
    
    <v-card-text v-if="loading" class="text-center py-2 py-sm-4">
      <v-progress-circular indeterminate :color="iconColor" :size="$vuetify.display.smAndDown ? 24 : 32"></v-progress-circular>
      <p class="mt-2 text-caption text-sm-body-2">{{ loadingText }}</p>
    </v-card-text>
    
    <slot v-else></slot>
    
    <v-divider v-if="$slots.actions"></v-divider>
    
    <v-card-actions v-if="$slots.actions" :class="{ 'py-1 px-2': $vuetify.display.smAndDown }">
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

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
  icon: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  variant: {
    type: String,
    default: 'flat'
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Memuat data...'
  }
});
</script>

<style scoped>
.report-card {
  height: 100%;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>