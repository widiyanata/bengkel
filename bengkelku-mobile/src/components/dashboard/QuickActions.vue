<template>
  <v-card class="mb-3 quick-actions-card">
    <v-card-title class="d-flex align-center py-2">
      <v-icon icon="mdi-lightning-bolt" size="small" class="me-1"></v-icon>
      <span class="text-subtitle-1 font-weight-medium">Aksi Cepat</span>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-2">
      <div class="d-flex flex-wrap justify-space-around">
        <div
          v-for="action in actions"
          :key="action.title"
          class="action-container ma-1"
        >
          <v-btn
            :color="action.color"
            :to="action.route"
            :icon="action.icon"
            size="small"
            class="action-button"
            variant="tonal"
          >
            <v-icon :icon="action.icon"></v-icon>
          </v-btn>
          <div class="action-label text-center mt-1">{{ action.title }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.quick-actions-card {
  border-radius: 8px;
}

.action-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 75px;
  margin-bottom: 8px;
}

.action-button {
  width: 50px;
  height: 50px;
  border-radius: 12px;
}

.action-label {
  font-size: 0.75rem;
  line-height: 1.1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 360px) {
  .action-container {
    width: 65px;
  }

  .action-button {
    width: 45px;
    height: 45px;
  }

  .action-label {
    font-size: 0.7rem;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  actions: {
    type: Array,
    default: () => [
      {
        title: 'Servis Baru',
        icon: 'mdi-plus-circle-outline',
        route: '/servis/baru',
        color: 'primary'
      },
      {
        title: 'Invoice',
        icon: 'mdi-receipt',
        route: '/invoice',
        color: 'info'
      },
      {
        title: 'Stok',
        icon: 'mdi-package-variant',
        route: '/stok',
        color: 'success'
      },
      {
        title: 'Laporan',
        icon: 'mdi-chart-bar',
        route: '/laporan',
        color: 'warning'
      }
    ]
  }
});

// Responsive actions based on screen width
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 600);

// Update window width on resize
function handleResize() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// Clean up event listener on component unmount
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

</script>
