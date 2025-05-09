﻿<template>
  <v-container>
    <div v-if="customer && !loading">
      <!-- Enhanced Header with Card -->
      <v-card class="mb-4 header-card" variant="flat">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="primary-lighten-4" size="large">
              <v-icon size="large" icon="mdi-account" color="primary"></v-icon>
            </v-avatar>
          </template>
          <v-card-title class="text-h5">{{ customer.nama }}</v-card-title>
          <v-card-subtitle>
            <v-icon size="x-small" icon="mdi-phone" class="me-1"></v-icon>
            {{ customer.noHp || 'Tidak ada nomor' }}
          </v-card-subtitle>

          <template v-slot:append>
            <!-- Desktop buttons -->
            <div class="d-none d-sm-flex gap-2">
              <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="me-2"></v-btn>
              <v-btn color="info" prepend-icon="mdi-pencil" @click="openEditDialog(customer)">
                Edit
              </v-btn>
              <v-btn color="error" prepend-icon="mdi-delete" @click="openDeleteDialog(customer)">
                Hapus
              </v-btn>
            </div>
            
            <!-- Mobile buttons -->
            <div class="d-flex d-sm-none">
              <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="goBack"></v-btn>
              <v-btn icon="mdi-pencil" color="info" variant="text" size="small" @click="openEditDialog(customer)" class="ms-2"></v-btn>
              <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="openDeleteDialog(customer)" class="ms-2"></v-btn>
            </div>
          </template>
        </v-card-item>
      </v-card>

      <!-- Customer Stats Card -->
      <v-row class="mb-4">
        <v-col cols="6" sm="4">
          <v-card variant="flat" class="stat-card">
            <v-card-text class="d-flex align-center">
              <v-avatar color="info-lighten-4" size="large" class="me-3">
                <v-icon color="info" icon="mdi-car-multiple"></v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Kendaraan</div>
                <div class="text-h6">{{ vehicles.length }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4">
          <v-card variant="flat" class="stat-card">
            <v-card-text class="d-flex align-center">
              <v-avatar color="success-lighten-4" size="large" class="me-3">
                <v-icon color="success" icon="mdi-wrench"></v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Total Servis</div>
                <div class="text-h6">{{ serviceHistory.length }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="flat" class="stat-card">
            <v-card-text class="d-flex align-center">
              <v-avatar color="warning-lighten-4" size="large" class="me-3">
                <v-icon color="warning" icon="mdi-calendar-clock"></v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Terakhir Servis</div>
                <div class="text-subtitle-2">{{ serviceHistory.length > 0 ? formatTimestamp(serviceHistory[0].timestamp) : 'Belum ada' }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Enhanced Vehicle List Card -->
      <v-card variant="flat" class="mb-4 vehicle-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="info-lighten-4" size="large">
              <v-icon icon="mdi-car-multiple" color="info"></v-icon>
            </v-avatar>
          </template>
          <v-card-title>Kendaraan Terdaftar</v-card-title>
          
          <template v-slot:append>
            <v-btn color="info" prepend-icon="mdi-plus" @click="openAddVehicleDialog">
              Tambah Kendaraan
            </v-btn>
          </template>
        </v-card-item>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-0">
          <v-list lines="one" v-if="vehicles.length > 0">
            <v-list-item v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-item">
              <template v-slot:prepend>
                <v-avatar color="info-lighten-5" size="small">
                  <v-icon icon="mdi-car" color="info" size="small"></v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-medium">{{ vehicle.merkTipe }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-icon size="x-small" icon="mdi-car-info" class="me-1"></v-icon>
                {{ vehicle.nomorPolisi }}
              </v-list-item-subtitle>
              
              <!-- Vehicle Actions -->
              <template v-slot:append>
                <div class="d-flex">
                  <v-btn icon="mdi-pencil" color="info" variant="text" size="x-small" @click="openEditVehicleDialog(vehicle)" class="me-1"></v-btn>
                  <v-btn icon="mdi-delete" color="error" variant="text" size="x-small" @click="openDeleteVehicleDialog(vehicle)"></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal" density="compact" class="mt-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-information-outline" class="me-2"></v-icon>
              <span>Belum ada kendaraan terdaftar untuk pelanggan ini.</span>
            </div>
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Enhanced Service History Card -->
      <v-card variant="flat" class="mb-4 service-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="success-lighten-4" size="large">
              <v-icon icon="mdi-wrench" color="success"></v-icon>
            </v-avatar>
          </template>
          <v-card-title>Riwayat Servis</v-card-title>
        </v-card-item>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-0">
          <v-list lines="two" v-if="serviceHistory.length > 0">
            <v-list-item 
              v-for="service in serviceHistory" 
              :key="service.id" 
              @click="goToServiceDetail(service.id)"
              class="service-item"
              :class="{'completed-service': service.status === 'Selesai'}"
            >
              <template v-slot:prepend>
                <v-avatar :color="getServiceStatusColor(service.status)" size="small">
                  <v-icon :icon="getServiceStatusIcon(service.status)" :color="getServiceIconColor(service.status)" size="small"></v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-medium">
                {{ service.nomorPolisi }} - {{ formatTimestamp(service.timestamp) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="x-small" :color="getStatusChipColor(service.status)" class="me-1">
                  {{ service.status }}
                </v-chip>
                {{ service.jenisServisNames?.join(', ') || 'N/A' }}
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <v-btn icon="mdi-chevron-right" variant="text" size="small"></v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal" density="compact" class="mt-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-information-outline" class="me-2"></v-icon>
              <span>Belum ada riwayat servis untuk pelanggan ini.</span>
            </div>
          </v-alert>
        </v-card-text>
      </v-card>

      <v-btn variant="text" block class="mt-2" @click="goBack">Kembali ke Daftar Pelanggan</v-btn>

    </div>
    <!-- Loading / Not Found States -->
    <div v-else-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p>Memuat data pelanggan...</p>
    </div>
    <div v-else>
      <v-alert type="warning" variant="tonal">
        Data pelanggan dengan ID <strong>{{ props.id }}</strong> tidak ditemukan.
      </v-alert>
      <v-btn variant="text" block class="mt-2" @click="goBack">Kembali ke Daftar Pelanggan</v-btn>
    </div>

    <!-- Edit Customer Dialog -->
    <v-dialog v-model="showEditDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>Edit Pelanggan</v-card-title>
        <v-card-text>
          <v-text-field v-model="editableCustomer.nama" label="Nama Pelanggan*" :rules="requiredRule" required variant="flat"
            density="compact" class="mb-3"></v-text-field>
          <v-text-field v-model="editableCustomer.noHp" label="Nomor HP*" :rules="phoneRule" required variant="flat" density="compact"
            type="tel"></v-text-field> <!-- Apply rules -->
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
          Tindakan ini tidak dapat dibatalkan. Data kendaraan dan servis terkait mungkin menjadi yatim piatu.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelDelete">Batal</v-btn>
          <v-btn color="error" variant="flat" @click="executeDelete" :loading="isDeleting">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Vehicle Dialog -->
    <v-dialog v-model="showVehicleDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>{{ isEditingVehicle ? 'Edit' : 'Tambah' }} Kendaraan</v-card-title>
        <v-form ref="editVehicleForm">
          <v-card-text>
            <v-text-field v-model="editableVehicle.nomorPolisi" label="Nomor Polisi*" required variant="flat"
              density="compact" class="mb-3"></v-text-field>
            <v-text-field v-model="editableVehicle.merkTipe" label="Merk / Tipe Kendaraan*" required variant="flat"
              density="compact" placeholder="Contoh: Honda Vario 125 2020"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" variant="text" @click="cancelVehicleEdit">Batal</v-btn>
            <v-btn color="info" variant="flat" @click="saveVehicle" :loading="isSavingVehicle">Simpan</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Vehicle Confirmation Dialog -->
    <v-dialog v-model="showDeleteVehicleDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5 error--text">Konfirmasi Hapus Kendaraan</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus kendaraan <strong>{{ vehicleToDelete?.nomorPolisi }}</strong>
          ({{ vehicleToDelete?.merkTipe }})?
          <br><br>
          Tindakan ini tidak dapat dibatalkan. Riwayat servis terkait mungkin menjadi yatim piatu.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="cancelDeleteVehicle">Batal</v-btn>
          <v-btn color="error" variant="flat" @click="executeDeleteVehicle" :loading="isDeletingVehicle">Hapus</v-btn>
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
  getCustomerById,
  getVehiclesByCustomerId,
  getAllServices,
  updateCustomer,
  deleteCustomer,
  addVehicle,
  updateVehicle,
  deleteVehicle, // Import vehicle functions
} from "../stores/localStorage.js";

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const editVehicleForm = ref(null); // Add missing ref for the form
const customer = ref(null);
const vehicles = ref([]);
const serviceHistory = ref([]);
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

// State for Edit Customer Dialog
const showEditDialog = ref(false);
const editableCustomer = reactive({ id: null, nama: '', noHp: '' });
const isUpdating = ref(false);

// State for Delete Customer Dialog
const showDeleteDialog = ref(false);
const customerToDelete = ref(null);
const isDeleting = ref(false);

// State for Add/Edit Vehicle Dialog
const showVehicleDialog = ref(false);
const editableVehicle = reactive({ id: null, customerId: null, nomorPolisi: '', merkTipe: '' });
const isEditingVehicle = ref(false);
const isSavingVehicle = ref(false);

// State for Delete Vehicle Dialog
const showDeleteVehicleDialog = ref(false);
const vehicleToDelete = ref(null);
const isDeletingVehicle = ref(false);

// Mapping for service types (consistent with other pages)
const serviceTypeMap = [
  "Ganti Oli",
  "Servis Rutin",
  "Cek Rem",
  "Ban Bocor",
  "Aki",
  "Lainnya...",
];

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

onMounted(() => {
  loadCustomerData();
});

function loadCustomerData() {
  loading.value = true;
  customer.value = null;
  vehicles.value = [];
  serviceHistory.value = [];
  try {
    const customerIdNumber = Number(props.id);
    const fetchedCustomer = getCustomerById(customerIdNumber);

    if (fetchedCustomer) {
      customer.value = fetchedCustomer;
      vehicles.value = getVehiclesByCustomerId(customerIdNumber).sort((a, b) => b.id - a.id);

      const allServices = getAllServices();
      serviceHistory.value = allServices
        .filter(s => s.pelangganId === customerIdNumber)
        .map(service => {
          const serviceIndices = Array.isArray(service.jenisServis) ? service.jenisServis : [];
          const serviceNames = serviceIndices.map(index => serviceTypeMap[index] || 'Unknown');
          return { ...service, jenisServisNames: serviceNames };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    } else {
      console.error(`Customer with ID ${props.id} not found.`);
    }
  } catch (error) {
    console.error("Error loading customer data:", error);
  } finally {
    loading.value = false;
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

function goBack() {
  router.push('/pelanggan');
}

function goToServiceDetail(serviceId) {
  router.push(`/servis/${serviceId}`);
}

// --- Edit Customer Logic ---
function openEditDialog(cust) {
  editableCustomer.id = cust.id;
  editableCustomer.nama = cust.nama;
  editableCustomer.noHp = cust.noHp;
  showEditDialog.value = true;
}

function cancelEdit() {
  showEditDialog.value = false;
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
      loadCustomerData();
      cancelEdit();
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

// --- Delete Customer Logic ---
function openDeleteDialog(cust) {
  customerToDelete.value = cust;
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
      router.push('/pelanggan'); // Go back to list after deletion
    } else {
      showSnackbar("Gagal menghapus pelanggan: Data tidak ditemukan.", 'error');
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
    showSnackbar("Terjadi kesalahan saat menghapus pelanggan.", 'error');
  } finally {
    isDeleting.value = false;
    showDeleteDialog.value = false;
    customerToDelete.value = null;
  }
}

// --- Add/Edit Vehicle Logic ---
function openAddVehicleDialog() {
  isEditingVehicle.value = false;
  Object.assign(editableVehicle, { id: null, customerId: customer.value.id, nomorPolisi: '', merkTipe: '' });
  showVehicleDialog.value = true;
}

function openEditVehicleDialog(vehicle) {
  isEditingVehicle.value = true;
  Object.assign(editableVehicle, { ...vehicle }); // Copy existing vehicle data
  showVehicleDialog.value = true;
}

function cancelVehicleEdit() {
  showVehicleDialog.value = false;
  if (editVehicleForm.value) {
    editVehicleForm.value.resetValidation(); // Reset validation on cancel
  }
}

async function saveVehicle() { // Make async for validation
  // Trigger validation
  const { valid } = await editVehicleForm.value.validate();
   if (!valid) {
     showSnackbar("Harap perbaiki error pada form.", 'warning');
     return;
  }
  // Basic check (covered by rules)
  // if (!editableVehicle.nomorPolisi || !editableVehicle.merkTipe) {
  //   showSnackbar("Nomor Polisi dan Merk/Tipe Kendaraan wajib diisi.", 'warning');
  //   return;
  // }
  isSavingVehicle.value = true;
  try {
    let savedVehicle;
    const vehicleData = {
      nomorPolisi: editableVehicle.nomorPolisi,
      merkTipe: editableVehicle.merkTipe,
      customerId: editableVehicle.customerId // Ensure customerId is included
    };

    if (isEditingVehicle.value) {
      savedVehicle = updateVehicle(editableVehicle.id, vehicleData);
    } else {
      savedVehicle = addVehicle(vehicleData);
    }

    if (savedVehicle) {
      showSnackbar(`Kendaraan ${isEditingVehicle.value ? 'diperbarui' : 'ditambahkan'}.`, 'success');
      loadCustomerData(); // Refresh vehicle list
      cancelVehicleEdit();
    } else {
      showSnackbar(`Gagal ${isEditingVehicle.value ? 'memperbarui' : 'menambahkan'} kendaraan.`, 'error');
    }
  } catch (error) {
    console.error("Error saving vehicle:", error);
    showSnackbar("Terjadi kesalahan saat menyimpan kendaraan.", 'error');
  } finally {
    isSavingVehicle.value = false;
  }
}

// --- Delete Vehicle Logic ---
function openDeleteVehicleDialog(vehicle) {
  vehicleToDelete.value = vehicle;
  showDeleteVehicleDialog.value = true;
}

function cancelDeleteVehicle() {
  showDeleteVehicleDialog.value = false;
  vehicleToDelete.value = null;
}

function executeDeleteVehicle() {
  if (!vehicleToDelete.value) return;
  isDeletingVehicle.value = true;
  try {
    const success = deleteVehicle(vehicleToDelete.value.id);
    if (success) {
      showSnackbar(`Kendaraan ${vehicleToDelete.value.nomorPolisi} berhasil dihapus.`, 'success');
      loadCustomerData(); // Refresh vehicle list
      cancelDeleteVehicle();
    } else {
      showSnackbar("Gagal menghapus kendaraan: Data tidak ditemukan.", 'error');
    }
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    showSnackbar("Terjadi kesalahan saat menghapus kendaraan.", 'error');
  } finally {
    isDeletingVehicle.value = false;
    showDeleteVehicleDialog.value = false;
    vehicleToDelete.value = null;
  }
}

// Helper functions for service status
function getServiceStatusColor(status) {
  switch (status) {
    case 'Selesai': return 'success-lighten-4';
    case 'Dalam Pengerjaan': return 'warning-lighten-4';
    case 'Menunggu': return 'grey-lighten-3';
    default: return 'grey-lighten-3';
  }
}

function getServiceStatusIcon(status) {
  switch (status) {
    case 'Selesai': return 'mdi-check-circle';
    case 'Dalam Pengerjaan': return 'mdi-progress-wrench';
    case 'Menunggu': return 'mdi-clock-outline';
    default: return 'mdi-help-circle';
  }
}

function getServiceIconColor(status) {
  switch (status) {
    case 'Selesai': return 'success';
    case 'Dalam Pengerjaan': return 'warning';
    case 'Menunggu': return 'grey';
    default: return 'grey';
  }
}

function getStatusChipColor(status) {
  switch (status) {
    case 'Selesai': return 'success';
    case 'Dalam Pengerjaan': return 'warning';
    case 'Menunggu': return 'grey';
    default: return 'grey';
  }
}


</script>

<style scoped>
/* Header card styles */
.header-card {
  background-color: rgba(var(--v-theme-surface-variant), 0.7);
  transition: all 0.3s ease;
}

/* Stat card styles */
.stat-card {
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Vehicle card styles */
.vehicle-card {
  border-top: 2px solid rgb(var(--v-theme-info)) !important;
  transition: all 0.3s ease;
}

.vehicle-item {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.vehicle-item:hover {
  background-color: rgba(rgb(var(--v-theme-info)), 0.05);
}

/* Service card styles */
.service-card {
  border-top: 2px solid rgb(var(--v-theme-success)) !important;
  transition: all 0.3s ease;
}

.service-item {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.service-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}

.completed-service {
  border-left: 3px solid rgb(var(--v-theme-success));
}

/* Dialog styles */
.dialog-card {
  border-radius: 16px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  /* .v-card-title {
    font-size: 1rem !important;
  } */
  
  .v-card-subtitle {
    font-size: 0.8rem !important;
  }
  
  .text-h6 {
    font-size: 1rem !important;
  }
  
  .v-btn {
    padding: 0 8px !important;
  }
}
</style>
<!-- Fixed editVehicleForm ref issue -->
