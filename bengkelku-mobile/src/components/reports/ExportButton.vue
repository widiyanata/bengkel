// src/components/reports/ExportButton.vue
<template>
  <v-btn
    :color="color"
    :variant="variant"
    :loading="loading"
    @click="exportData"
  >
    <v-icon :icon="icon" class="mr-2"></v-icon>
    {{ label }}
  </v-btn>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  filename: {
    type: String,
    default: 'report'
  },
  label: {
    type: String,
    default: 'Export'
  },
  icon: {
    type: String,
    default: 'mdi-download'
  },
  color: {
    type: String,
    default: 'primary'
  },
  variant: {
    type: String,
    default: 'tonal'
  }
});

const loading = ref(false);

function exportData() {
  loading.value = true;
  
  try {
    // Buat objek baru yang tidak reaktif
    const plainData = JSON.parse(JSON.stringify({
      // Hanya ambil properti yang dibutuhkan
      date: new Date().toISOString(),
      // Tambahkan properti lain yang diperlukan
      ...props.data
    }));
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(plainData, null, 2);
    
    // Create a blob with the data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.filename}-${new Date().toISOString().split('T')[0]}.json`;
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Click the link to trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    loading.value = false;
  }
}
</script>