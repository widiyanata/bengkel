<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-3"> <!-- Reduced margin -->
      <h1 class="text-h6">Daftar Servis</h1> <!-- Smaller heading -->
      <v-btn color="primary" prepend-icon="mdi-plus" to="/servis/baru" size="small"> <!-- Smaller button -->
        Servis Baru
      </v-btn>
    </div>

    <!-- Filter Chips -->
    <v-chip-group v-model="selectedFilter" mandatory class="mb-3" density="compact"> <!-- Reduced margin, added density -->
      <v-chip filter value="semua" size="small">Semua</v-chip> <!-- Smaller chips -->
      <v-chip filter value="dikerjakan" size="small">Dikerjakan</v-chip> <!-- Smaller chips -->
      <v-chip filter value="selesai_hari_ini" size="small">Selesai Hari Ini</v-chip> <!-- Smaller chips -->
      <v-chip filter value="antri" size="small">Antri</v-chip> <!-- Smaller chips -->
    </v-chip-group>

    <!-- Service List Cards -->
    <v-row dense class="mt-2"> <!-- Added margin top -->
      <v-col v-for="service in filteredServices" :key="service.id" cols="12">
        <v-card @click="goToServiceDetail(service.id)" class="mb-2" density="compact" variant="tonal"> <!-- Reduced margin, added density, variant -->
          <v-card-title class="d-flex justify-space-between text-body-1" prepend-icon="mdi-car-wrench"> <!-- Smaller title, added icon -->
            <span>{{ service.nomorPolisi }}</span>
            <v-chip :color="getStatusColor(service.status)" size="x-small" label> <!-- Smaller chip -->
              {{ service.status }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle class="text-caption">{{ service.namaPelanggan }}</v-card-subtitle> <!-- Smaller subtitle -->
          <v-card-text class="py-1"> <!-- Reduced padding -->
            <!-- Use mapped service names -->
            <div class="text-caption"><strong>Jenis:</strong> {{ service.jenisServisNames.join(', ') }}</div> <!-- Smaller text -->
            <div v-if="service.keterangan" class="text-caption"><strong>Ket:</strong> {{ service.keterangan }}</div> <!-- Smaller text -->
            <div class="text-caption text-grey">{{ formatTimestamp(service.timestamp) }}</div> <!-- Already caption -->
            <!-- Display timestamp -->
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="filteredServices.length === 0" cols="12">
        <v-alert type="info" variant="tonal">Tidak ada data servis untuk filter ini.</v-alert>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllServices, getCustomerById } from '../stores/localStorage.js'; // Import storage functions

const router = useRouter();
const selectedFilter = ref('semua'); // Default filter
const allServices = ref([]); // Initialize as empty array

// Mapping for service types (indices match AddServicePage chips)
const serviceTypeMap = [
  "Ganti Oli",
  "Servis Rutin",
  "Cek Rem",
  "Ban Bocor",
  "Aki",
  "Lainnya...",
];

// Fetch data when component is mounted
onMounted(() => {
  loadServices();
});

function loadServices() {
  const servicesFromStorage = getAllServices();
  // Enhance service data with customer name and mapped service types
  allServices.value = servicesFromStorage.map(service => {
    const customer = getCustomerById(service.pelangganId);
    // Ensure jenisServis is an array before mapping
    const serviceIndices = Array.isArray(service.jenisServis) ? service.jenisServis : [];
    const serviceNames = serviceIndices.map(index => serviceTypeMap[index] || 'Unknown'); // Map indices to names
    return {
      ...service,
      namaPelanggan: customer ? customer.nama : 'Unknown Customer',
      jenisServisNames: serviceNames, // Use a different key for mapped names
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first
}

// Function to check if a date is today
function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

// Function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }); // Indonesian locale
}

const filteredServices = computed(() => {
  const services = allServices.value;
  switch (selectedFilter.value) {
    case 'dikerjakan':
      // Assuming 'Baru' also means 'Dikerjakan' for now, adjust if needed
      // Also handle potential 'Tunggu Part' status if added later
      return services.filter(s => ['Dikerjakan', 'Baru', 'Tunggu Part'].includes(s.status));
    case 'selesai_hari_ini':
      // Use the timestamp for accurate filtering
      // Need to ensure timestamp is updated when status changes to 'Selesai'
      // For now, just filter by status 'Selesai' and check if timestamp is today
      return services.filter(s => s.status === 'Selesai' && isToday(s.timestamp));
    case 'antri':
      return services.filter(s => s.status === 'Antri'); // Need a way to set this status
    case 'semua':
    default:
      return services;
  }
});

function getStatusColor(status) {
  switch (status) {
    case 'Dikerjakan': return 'orange';
    case 'Selesai': return 'green';
    case 'Antri': return 'blue';
    case 'Tunggu Part': return 'purple'; // Example for future status
    case 'Baru': return 'info'; // Status for newly added
    default: return 'grey';
  }
}

function goToServiceDetail(serviceId) {
  // Placeholder for navigation to detail page
  console.log('Navigating to detail for service ID:', serviceId);
  router.push(`/servis/${serviceId}`); // Navigate to the detail page
}
</script>

<style scoped>
/* Add specific styles if needed */
</style>
