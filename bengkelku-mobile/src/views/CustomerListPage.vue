<template>
  <v-container>
    <!-- Enhanced Header with Card -->
    <v-card class="mb-4 header-card" variant="outlined">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-account-group" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">Manajemen Pelanggan</v-card-title>
        <v-card-subtitle>Kelola data pelanggan dan kendaraan</v-card-subtitle>

        <template v-slot:append>
          <!-- Desktop buttons -->
          <div class="d-none d-sm-flex gap-2">
            <v-btn color="primary" prepend-icon="mdi-account-plus" @click="goToAddCustomer">
              Tambah Pelanggan
            </v-btn>
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-refresh" @click="loadCustomers" :loading="loading">
              Refresh
            </v-btn>
          </div>

          <!-- Mobile buttons -->
          <div class="d-flex d-sm-none">
            <v-btn color="primary" icon="mdi-account-plus" size="small" @click="goToAddCustomer"></v-btn>
            <v-btn color="primary" icon="mdi-refresh" size="small" class="ms-2" @click="loadCustomers" :loading="loading"></v-btn>
          </div>
        </template>
      </v-card-item>
    </v-card>

    <!-- Enhanced Search and Filter -->
    <v-card class="mb-4" variant="outlined">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon icon="mdi-filter-variant" color="primary"></v-icon>
        </template>
        <v-card-title>Filter & Pencarian</v-card-title>

        <!-- Mobile toggle button -->
        <template v-slot:append>
          <v-btn
            v-if="$vuetify.display.xs"
            icon="mdi-chevron-down"
            variant="text"
            :class="{'rotate-icon': showFilterOptions}"
            @click="showFilterOptions = !showFilterOptions"
          ></v-btn>
        </template>
      </v-card-item>

      <!-- Filter Options (Responsive) -->
      <v-card-text :class="{'d-none': !showFilterOptions && $vuetify.display.xs}">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              label="Cari Pelanggan"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              placeholder="Nama, No. HP, atau No. Polisi"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="sortBy"
              label="Urutkan"
              density="compact"
              variant="outlined"
              :items="[
                { title: 'Nama (A-Z)', value: 'name-asc', icon: 'mdi-sort-alphabetical-ascending' },
                { title: 'Nama (Z-A)', value: 'name-desc', icon: 'mdi-sort-alphabetical-descending' },
                { title: 'Terbanyak Kendaraan', value: 'vehicles-desc', icon: 'mdi-sort-numeric-descending' },
                { title: 'Terbanyak Servis', value: 'services-desc', icon: 'mdi-sort-numeric-descending' }
              ]"
              item-title="title"
              item-value="value"
              hide-details
              :menu-props="{ maxHeight: 300 }"
              prepend-inner-icon="mdi-sort"
            >
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon :icon="item.raw.icon"></v-icon>
                  </template>
                  <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Customer Stats Summary -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card variant="outlined" class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-avatar color="primary-lighten-4" size="large" class="me-3">
              <v-icon color="primary" icon="mdi-account-multiple"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Pelanggan</div>
              <div class="text-h6">{{ customers.length }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card variant="outlined" class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-avatar color="info-lighten-4" size="large" class="me-3">
              <v-icon color="info" icon="mdi-car-multiple"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Kendaraan</div>
              <div class="text-h6">{{ totalVehicles }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card variant="outlined" class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-avatar color="success-lighten-4" size="large" class="me-3">
              <v-icon color="success" icon="mdi-wrench"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Servis</div>
              <div class="text-h6">{{ totalServices }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card variant="outlined" class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-avatar color="warning-lighten-4" size="large" class="me-3">
              <v-icon color="warning" icon="mdi-calendar-clock"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Servis Bulan Ini</div>
              <div class="text-h6">{{ servicesThisMonth }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Customer List Cards -->
    <v-row dense>
      <!-- Loading Indicator -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p>Memuat data pelanggan...</p>
      </v-col>

      <!-- Enhanced Customer Cards -->
      <v-col v-else-if="filteredCustomers.length > 0" v-for="customer in filteredCustomers" :key="customer.id"
        cols="12" sm="6" lg="4">
        <v-card
          class="mb-3 customer-card"
          variant="outlined"
          elevation="2"
          @click="goToCustomerDetail(customer.id)"
        >
          <!-- Customer Badge -->
          <div class="customer-badge">
            <v-icon size="small" icon="mdi-account-check"></v-icon>
            {{ getCustomerStatus(customer) }}
          </div>

          <v-card-item>
            <template v-slot:prepend>
              <v-avatar :color="getCustomerAvatarColor(customer)" class="customer-avatar">
                <v-icon
                  icon="mdi-account"
                  :color="getCustomerIconColor(customer)"
                ></v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-truncate">{{ customer.nama }}</v-card-title>
            <v-card-subtitle>
              <v-icon size="x-small" icon="mdi-phone" class="me-1"></v-icon>
              {{ customer.noHp || 'Tidak ada nomor' }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <!-- Vehicles -->
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="me-2">mdi-car</v-icon>
              <div class="text-truncate">
                <span v-if="customer.allVehicles && customer.allVehicles.length > 0">
                  {{ customer.allVehicles.length }} Kendaraan
                </span>
                <span v-else class="text-caption text-grey">Belum ada kendaraan</span>
              </div>
            </div>

            <!-- Last Vehicle -->
            <div class="d-flex align-center mb-2" v-if="customer.kendaraanTerakhir">
              <v-icon size="small" color="grey" class="me-2">mdi-car-info</v-icon>
              <div class="text-truncate">
                {{ customer.kendaraanTerakhir.merk }} ({{ customer.kendaraanTerakhir.noPol }})
              </div>
            </div>

            <!-- Service Count -->
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="grey" class="me-2">mdi-wrench</v-icon>
              <div class="text-truncate">
                <span v-if="getCustomerServiceCount(customer) > 0">
                  {{ getCustomerServiceCount(customer) }} Servis
                </span>
                <span v-else class="text-caption text-grey">Belum ada servis</span>
              </div>
            </div>

            <!-- Last Service -->
            <div class="d-flex align-center" v-if="getLastServiceDate(customer)">
              <v-icon size="small" color="grey" class="me-2">mdi-calendar-check</v-icon>
              <div class="text-truncate">
                Terakhir servis: {{ getLastServiceDate(customer) }}
              </div>
            </div>
          </v-card-text>

          <!-- Action Buttons -->
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn variant="text" density="comfortable" prepend-icon="mdi-eye" @click.stop="goToCustomerDetail(customer.id)">
              Detail
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-pencil" size="small" color="info" variant="text" @click.stop="openEditDialog(customer)"></v-btn>
            <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click.stop="openDeleteDialog(customer)"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- No Data Message -->
      <v-col v-else cols="12">
        <v-alert type="info" variant="tonal">Tidak ada data pelanggan atau pelanggan tidak ditemukan.</v-alert>
      </v-col>
    </v-row>

    <!-- Edit Customer Dialog -->
    <v-dialog v-model="showEditDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>Edit Pelanggan</v-card-title>
        <v-card-text>
          <v-text-field v-model="editableCustomer.nama" label="Nama Pelanggan*" :rules="requiredRule" required variant="outlined"
            density="compact" class="mb-3"></v-text-field>
          <v-text-field v-model="editableCustomer.noHp" label="Nomor HP*" :rules="phoneRule" required variant="outlined" density="compact"
            type="tel"></v-text-field> <!-- Apply phoneRule -->
          <!-- Note: Editing vehicles associated with customer is more complex and not included here -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelEdit">Batal</v-btn>
          <v-btn color="info" variant="flat" @click="executeUpdate" :loading="isUpdating">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Customer Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5 error--text">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus pelanggan <strong>{{ customerToDelete?.nama }}</strong>?
          <br><br>
          Tindakan ini tidak dapat dibatalkan. Data kendaraan dan servis terkait mungkin menjadi yatim piatu (tidak
          terhapus otomatis).
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelDelete">Batal</v-btn>
          <v-btn color="error" variant="flat" @click="executeDelete" :loading="isDeleting">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for Notifications -->
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" location="top right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  getAllCustomers,
  getVehiclesByCustomerId,
  updateCustomer,
  deleteCustomer,
  getAllServices,
} from "../stores/localStorage.js"; // Import functions

const router = useRouter();
const searchQuery = ref('');
const customers = ref([]); // Initialize as empty array
const sortBy = ref('name-asc');
const showFilterOptions = ref(true);
const services = ref([]);

// Stats computed properties
const totalVehicles = computed(() => {
  return customers.value.reduce((total, customer) => {
    return total + (customer.allVehicles?.length || 0);
  }, 0);
});

const totalServices = computed(() => {
  return services.value.length;
});

const servicesThisMonth = computed(() => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  return services.value.filter(service => {
    const serviceDate = new Date(service.timestamp);
    return serviceDate.getMonth() === thisMonth && serviceDate.getFullYear() === thisYear;
  }).length;
});
const loading = ref(true);

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info"); // Default color

// Validation Rules
const requiredRule = [v => !!v || 'Field ini wajib diisi'];
const phoneRule = [
  v => !!v || 'Nomor HP wajib diisi',
  v => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(v) || 'Format Nomor HP tidak valid',
  v => (v && v.length >= 8 && v.length <= 15) || 'Nomor HP harus antara 8-15 digit'
];

// State for Edit Dialog
const showEditDialog = ref(false);
const editableCustomer = reactive({ id: null, nama: '', noHp: '' });
const isUpdating = ref(false);

// State for Delete Dialog
const showDeleteDialog = ref(false);
const customerToDelete = ref(null); // Store the customer object to be deleted
const isDeleting = ref(false);

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Fetch data when component is mounted
onMounted(() => {
  loadCustomers();
});

function loadCustomers() {
  loading.value = true;
  try {
    // Load customers with vehicles
    const fetchedCustomers = getAllCustomers();
    customers.value = fetchedCustomers.map(cust => {
      const vehicles = getVehiclesByCustomerId(cust.id);
      const lastVehicle = vehicles.sort((a, b) => b.id - a.id)[0];
      return {
        ...cust,
        kendaraanTerakhir: lastVehicle ? { noPol: lastVehicle.nomorPolisi, merk: lastVehicle.merkTipe } : null,
        allVehicles: vehicles
      };
    });

    // Load services
    services.value = getAllServices();

    // Add service counts to customers
    customers.value = customers.value.map(customer => {
      const customerServices = services.value.filter(service => service.pelangganId === customer.id);
      return {
        ...customer,
        serviceCount: customerServices.length,
        lastService: customerServices.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      };
    });

    // Sort customers based on current sort option
    sortCustomers();
  } catch (error) {
    console.error("Error loading customers:", error);
  } finally {
    loading.value = false;
  }
}

// Function to sort customers based on selected option
function sortCustomers() {
  switch (sortBy.value) {
    case 'name-asc':
      customers.value.sort((a, b) => a.nama.localeCompare(b.nama));
      break;
    case 'name-desc':
      customers.value.sort((a, b) => b.nama.localeCompare(a.nama));
      break;
    case 'vehicles-desc':
      customers.value.sort((a, b) => (b.allVehicles?.length || 0) - (a.allVehicles?.length || 0));
      break;
    case 'services-desc':
      customers.value.sort((a, b) => (b.serviceCount || 0) - (a.serviceCount || 0));
      break;
    default:
      customers.value.sort((a, b) => a.nama.localeCompare(b.nama));
  }
}

// Watch for sort option changes
watch(sortBy, () => {
  sortCustomers();
});

// Customer card helper functions
function getCustomerStatus(customer) {
  if (customer.serviceCount > 5) return 'Pelanggan Setia';
  if (customer.serviceCount > 0) return 'Pelanggan Aktif';
  return 'Pelanggan Baru';
}

function getCustomerAvatarColor(customer) {
  if (customer.serviceCount > 5) return 'success-lighten-4';
  if (customer.serviceCount > 0) return 'info-lighten-4';
  return 'grey-lighten-3';
}

function getCustomerIconColor(customer) {
  if (customer.serviceCount > 5) return 'success';
  if (customer.serviceCount > 0) return 'info';
  return 'grey-darken-1';
}

function getCustomerServiceCount(customer) {
  return customer.serviceCount || 0;
}

function getLastServiceDate(customer) {
  if (!customer.lastService) return null;
  return formatDate(customer.lastService.timestamp);
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}


const filteredCustomers = computed(() => {
  const custList = customers.value;
  if (!searchQuery.value) {
    return custList;
  }
  const lowerQuery = searchQuery.value.toLowerCase().trim();
  if (!lowerQuery) return custList;

  return custList.filter(cust => {
    if (cust.nama.toLowerCase().includes(lowerQuery)) return true;
    if (cust.noHp.includes(lowerQuery)) return true;
    if (cust.allVehicles && cust.allVehicles.some(v => v.nomorPolisi.toLowerCase().replace(/\s+/g, '').includes(lowerQuery.replace(/\s+/g, '')))) return true;
    return false;
  });
});

function goToCustomerDetail(customerId) {
  console.log('Navigating to detail for customer ID:', customerId);
  router.push(`/pelanggan/${customerId}`);
}

// --- Edit Logic ---
function openEditDialog(customer) {
  editableCustomer.id = customer.id;
  editableCustomer.nama = customer.nama;
  editableCustomer.noHp = customer.noHp;
  showEditDialog.value = true;
}

function cancelEdit() {
  showEditDialog.value = false;
  // Reset editableCustomer if needed, though not strictly necessary as it's repopulated on open
}

function executeUpdate() {
  if (!editableCustomer.id || !editableCustomer.nama || !editableCustomer.noHp) {
    showSnackbar("Nama dan Nomor HP tidak boleh kosong.", 'warning');
    return;
  }
  isUpdating.value = true;
  try {
    const updated = updateCustomer(editableCustomer.id, {
      nama: editableCustomer.nama,
      noHp: editableCustomer.noHp,
    });
    if (updated) {
      showSnackbar("Data pelanggan berhasil diperbarui.", 'success');
      loadCustomers(); // Refresh the list
      cancelEdit(); // Close dialog
    } else {
      showSnackbar("Gagal memperbarui data: Pelanggan tidak ditemukan.", 'error');
    }
  } catch (error) {
    console.error("Error updating customer:", error);
    showSnackbar("Terjadi kesalahan saat memperbarui data.", 'error');
  } finally {
    isUpdating.value = false;
  }
}

// --- Delete Logic ---
function openDeleteDialog(customer) {
  customerToDelete.value = customer; // Store the whole customer object
  showDeleteDialog.value = true;
}

function cancelDelete() {
  showDeleteDialog.value = false;
  customerToDelete.value = null;
}

function executeDelete() {
  if (!customerToDelete.value) return;
  isDeleting.value = true;
  try {
    const success = deleteCustomer(customerToDelete.value.id);
    if (success) {
      showSnackbar(`Pelanggan "${customerToDelete.value.nama}" berhasil dihapus.`, 'success');
      loadCustomers(); // Refresh the list
      cancelDelete(); // Close dialog
    } else {
      showSnackbar("Gagal menghapus pelanggan: Data tidak ditemukan.", 'error');
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
    showSnackbar("Terjadi kesalahan saat menghapus pelanggan.", 'error');
  } finally {
    isDeleting.value = false;
  }
}


</script>

<style scoped>
/* Add specific styles if needed */
</style>
