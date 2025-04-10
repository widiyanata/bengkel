<template>
  <v-container>
    <!-- Enhanced Header with Card -->
    <v-card class="mb-4 header-card" variant="flat">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-wrench" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">Servis</v-card-title>
        <v-card-subtitle>Kelola servis kendaraan pelanggan</v-card-subtitle>
        
        <template v-slot:append>
          <v-btn color="primary" prepend-icon="mdi-plus" to="/servis/baru">
            Servis Baru
          </v-btn>
        </template>
      </v-card-item>
    </v-card>

    <!-- Search Bar -->
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      label="Cari nomor polisi atau nama pelanggan"
      variant="outlined"
      density="comfortable"
      hide-details
      class="mb-4"
      clearable
    ></v-text-field>

    <!-- Filter Chips with Count -->
    <div class="filter-container mb-4 overflow-x-auto">
      <v-chip-group v-model="selectedFilter" mandatory>
        <v-chip filter value="semua" class="filter-chip">
          Semua
          <span class="ms-1 filter-count">{{ allServices.length }}</span>
        </v-chip>
        <v-chip filter value="dikerjakan" class="filter-chip">
          Dikerjakan
          <span class="ms-1 filter-count">{{ getFilterCount('Dikerjakan') }}</span>
        </v-chip>
        <v-chip filter value="selesai_hari_ini" class="filter-chip">
          Selesai Hari Ini
          <span class="ms-1 filter-count">{{ getFilterCount('Selesai', true) }}</span>
        </v-chip>
        <v-chip filter value="antri" class="filter-chip">
          Antri
          <span class="ms-1 filter-count">{{ getFilterCount('Antri') }}</span>
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Empty State -->
    <v-card v-if="searchedServices.length === 0" class="mb-4 pa-4 text-center">
      <v-icon icon="mdi-car-search" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
      <div class="text-body-1 mb-1">Tidak ada servis yang ditemukan</div>
      <div class="text-caption text-grey">Coba ubah filter atau kata kunci pencarian</div>
    </v-card>

    <!-- Service List Cards -->
    <div v-else>
      <!-- Group by date if needed -->
      <div v-if="showDateGroups" class="mb-4">
        <!-- Today's Services -->
        <div v-if="todayServices.length > 0" class="mb-4">
          <div class="text-subtitle-1 font-weight-medium mb-2 d-flex align-center">
            <v-icon icon="mdi-calendar-today" size="small" class="me-2"></v-icon>
            Hari Ini
          </div>
          <v-row dense>
            <v-col v-for="service in todayServices" :key="service.id" cols="12" md="6">
              <v-card @click="goToServiceDetail(service.id)" class="service-card mb-3" elevation="1" variant="flat">
                <v-card-item>
                  <template v-slot:prepend>
                    <v-icon :icon="getStatusIcon(service.status)" :color="getStatusColor(service.status)" class="me-2"></v-icon>
                  </template>
                  <v-card-title class="pa-0 text-body-1 font-weight-bold d-flex align-center">
                    {{ service.nomorPolisi }}
                    <v-chip :color="getStatusColor(service.status)" size="x-small" label class="ms-2">
                      {{ service.status }}
                    </v-chip>
                  </v-card-title>
                  <v-card-subtitle class="pa-0 text-body-2">{{ service.namaPelanggan }}</v-card-subtitle>
                </v-card-item>
                <v-card-text class="pt-0 pb-1">
                  <div class="d-flex flex-wrap gap-1 service-types">
                    <v-chip v-for="(type, index) in service.jenisServisNames" :key="index" size="x-small" variant="tonal" density="comfortable" class="service-type-chip">
                      {{ type }}
                    </v-chip>
                  </div>
                  <div v-if="service.keterangan" class="text-caption text-truncate mt-1">
                    <span class="text-grey">Ket:</span> {{ service.keterangan }}
                  </div>
                </v-card-text>
                <v-card-text class="py-1 bg-surface-variant">
                  <div class="d-flex justify-space-between align-center bg">
                    <div class="text-caption text-grey">
                      <v-icon icon="mdi-clock-outline" size="x-small" class="me-1"></v-icon>
                      {{ formatTime(service.timestamp) }}
                    </div>
                    <v-btn variant="text" size="small" icon="mdi-chevron-right" density="comfortable"></v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Older Services -->
        <div v-if="olderServices.length > 0">
          <div class="text-subtitle-1 font-weight-medium mb-2 d-flex align-center">
            <v-icon icon="mdi-calendar-range" size="small" class="me-2"></v-icon>
            Sebelumnya
          </div>
          <v-row dense>
            <v-col v-for="service in olderServices" :key="service.id" cols="12">
              <v-card @click="goToServiceDetail(service.id)" class="service-card mb-3" elevation="1">
                <v-card-item>
                  <template v-slot:prepend>
                    <v-icon :icon="getStatusIcon(service.status)" :color="getStatusColor(service.status)" class="me-2"></v-icon>
                  </template>
                  <v-card-title class="pa-0 text-body-1 font-weight-bold d-flex align-center">
                    {{ service.nomorPolisi }}
                    <v-chip :color="getStatusColor(service.status)" size="x-small" label class="ms-2">
                      {{ service.status }}
                    </v-chip>
                  </v-card-title>
                  <v-card-subtitle class="pa-0 text-body-2">{{ service.namaPelanggan }}</v-card-subtitle>
                </v-card-item>
                <v-card-text class="pt-0">
                  <div class="d-flex flex-wrap gap-1 service-types">
                    <v-chip v-for="(type, index) in service.jenisServisNames" :key="index" size="x-small" variant="flat" density="comfortable" class="service-type-chip">
                      {{ type }}
                    </v-chip>
                  </div>
                  <div v-if="service.keterangan" class="text-caption text-truncate mt-1">
                    <span class="text-grey">Ket:</span> {{ service.keterangan }}
                  </div>
                  <div class="d-flex justify-space-between align-center mt-2">
                    <div class="text-caption text-grey">
                      <v-icon icon="mdi-calendar-outline" size="x-small" class="me-1"></v-icon>
                      {{ formatDate(service.timestamp) }}
                    </div>
                    <v-btn variant="text" size="small" icon="mdi-chevron-right" density="comfortable"></v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- No date grouping -->
      <v-row v-else dense>
        <v-col v-for="service in searchedServices" :key="service.id" cols="12">
          <v-card @click="goToServiceDetail(service.id)" class="service-card mb-3" elevation="1">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon :icon="getStatusIcon(service.status)" :color="getStatusColor(service.status)" class="me-2"></v-icon>
              </template>
              <v-card-title class="pa-0 text-body-1 font-weight-bold d-flex align-center">
                {{ service.nomorPolisi }}
                <v-chip :color="getStatusColor(service.status)" size="x-small" label class="ms-2">
                  {{ service.status }}
                </v-chip>
              </v-card-title>
              <v-card-subtitle class="pa-0 text-body-2">{{ service.namaPelanggan }}</v-card-subtitle>
            </v-card-item>
            <v-card-text class="pt-0">
              <div class="d-flex flex-wrap gap-1 service-types">
                <v-chip v-for="(type, index) in service.jenisServisNames" :key="index" size="x-small" variant="flat" density="comfortable" class="service-type-chip">
                  {{ type }}
                </v-chip>
              </div>
              <div v-if="service.keterangan" class="text-caption text-truncate mt-1">
                <span class="text-grey">Ket:</span> {{ service.keterangan }}
              </div>
              <div class="d-flex justify-space-between align-center mt-2">
                <div class="text-caption text-grey">
                  <v-icon icon="mdi-calendar-clock" size="x-small" class="me-1"></v-icon>
                  {{ formatTimestamp(service.timestamp) }}
                </div>
                <v-btn variant="text" size="small" icon="mdi-chevron-right" density="comfortable"></v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllServices, getCustomerById } from '../stores/localStorage.js'; // Import storage functions

const router = useRouter();
const selectedFilter = ref('semua'); // Default filter
const allServices = ref([]); // Initialize as empty array
const searchQuery = ref(''); // For search functionality
const showDateGroups = ref(true); // Toggle for date grouping

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

// Function to format date only
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Function to format time only
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Get status icon based on status
function getStatusIcon(status) {
  switch (status) {
    case 'Dikerjakan': return 'mdi-wrench';
    case 'Selesai': return 'mdi-check-circle';
    case 'Antri': return 'mdi-clock-outline';
    case 'Tunggu Part': return 'mdi-package-variant-closed';
    case 'Baru': return 'mdi-car';
    default: return 'mdi-help-circle';
  }
}

// Get count for each filter
function getFilterCount(status, checkToday = false) {
  if (checkToday) {
    return allServices.value.filter(s => s.status === status && isToday(s.timestamp)).length;
  }
  if (status === 'Dikerjakan') {
    return allServices.value.filter(s => ['Dikerjakan', 'Baru', 'Tunggu Part'].includes(s.status)).length;
  }
  return allServices.value.filter(s => s.status === status).length;
}

// Filter services based on selected filter
const filteredServices = computed(() => {
  const services = allServices.value;
  switch (selectedFilter.value) {
    case 'dikerjakan':
      return services.filter(s => ['Dikerjakan', 'Baru', 'Tunggu Part'].includes(s.status));
    case 'selesai_hari_ini':
      return services.filter(s => s.status === 'Selesai' && isToday(s.timestamp));
    case 'antri':
      return services.filter(s => s.status === 'Antri');
    case 'semua':
    default:
      return services;
  }
});

// Apply search filter on top of selected filter
const searchedServices = computed(() => {
  if (!searchQuery.value.trim()) {
    return filteredServices.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return filteredServices.value.filter(service => {
    return service.nomorPolisi.toLowerCase().includes(query) ||
           service.namaPelanggan.toLowerCase().includes(query);
  });
});

// Group services by date
const todayServices = computed(() => {
  return searchedServices.value.filter(service => isToday(service.timestamp));
});

const olderServices = computed(() => {
  return searchedServices.value.filter(service => !isToday(service.timestamp));
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
/* Filter Styling */
.filter-container {
  white-space: nowrap;
  padding-bottom: 4px;
}

.filter-chip {
  margin-right: 8px;
  font-weight: 500;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  font-size: 0.75rem;
  padding: 0 6px;
}

/* Service Card Styling */
.service-card {
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.service-types {
  margin-top: 4px;
}

.service-type-chip {
  margin-right: 4px;
  margin-bottom: 4px;
  background-color: rgba(0, 0, 0, 0.03);
}

/* Responsive adjustments */
@media (min-width: 600px) {
  .service-card {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
