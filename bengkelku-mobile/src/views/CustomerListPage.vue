<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>Daftar Pelanggan</h1>
      <!-- Optional: Add button if direct customer addition is desired -->
      <!-- <v-btn color="primary" prepend-icon="mdi-account-plus-outline" @click="goToAddCustomer">Tambah Pelanggan</v-btn> -->
    </div>

    <v-text-field v-model="searchQuery" label="Cari Pelanggan (Nama/No. HP/No. Pol)" prepend-inner-icon="mdi-magnify"
      variant="outlined" density="compact" clearable class="mb-4"></v-text-field>

    <!-- Customer List Cards -->
    <v-row dense>
      <!-- Loading Indicator -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p>Memuat data pelanggan...</p>
      </v-col>

      <!-- Customer Cards -->
      <v-col v-else-if="filteredCustomers.length > 0" v-for="customer in filteredCustomers" :key="customer.id"
        cols="12">
        <v-card class="mb-3">
          <!-- Make card content clickable for detail view (if implemented) -->
          <div @click="goToCustomerDetail(customer.id)" style="cursor: pointer;">
            <v-card-title>{{ customer.nama }}</v-card-title>
            <v-card-subtitle>{{ customer.noHp }}</v-card-subtitle>
            <v-card-text>
              <div v-if="customer.kendaraanTerakhir">
                <strong>Kendaraan Terakhir:</strong> {{ customer.kendaraanTerakhir.merk }}
                ({{ customer.kendaraanTerakhir.noPol }})
              </div>
              <div v-else>
                <em>Belum ada data kendaraan</em>
              </div>
            </v-card-text>
          </div>
          <!-- Action Buttons -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-pencil-outline" color="info" variant="text" size="small"
              @click="openEditDialog(customer)"></v-btn>
            <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small"
              @click="openDeleteDialog(customer)"></v-btn>
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
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getAllCustomers,
  getVehiclesByCustomerId,
  updateCustomer,
  deleteCustomer,
} from "../stores/localStorage.js"; // Import functions

const router = useRouter();
const searchQuery = ref('');
const customers = ref([]); // Initialize as empty array
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
    const fetchedCustomers = getAllCustomers();
    customers.value = fetchedCustomers.map(cust => {
      const vehicles = getVehiclesByCustomerId(cust.id);
      const lastVehicle = vehicles.sort((a, b) => b.id - a.id)[0];
      return {
        ...cust,
        kendaraanTerakhir: lastVehicle ? { noPol: lastVehicle.nomorPolisi, merk: lastVehicle.merkTipe } : null,
        allVehicles: vehicles
      };
    }).sort((a, b) => a.nama.localeCompare(b.nama));
  } catch (error) {
    console.error("Error loading customers:", error);
  } finally {
    loading.value = false;
  }
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
