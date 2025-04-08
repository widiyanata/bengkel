<template>
  <v-container>
    <h1 class="mb-4">Tambah Servis Baru</h1>

    <v-form ref="form">
      <!-- Identifikasi Kendaraan -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>Kendaraan</v-card-title>
        <v-card-text>
          <v-text-field v-model="serviceData.nomorPolisi" label="Nomor Polisi*" required variant="outlined"
            @input="searchVehicle" class="mb-2" :readonly="!!serviceData.selectedVehicleInfo"
            :disabled="!!serviceData.selectedVehicleInfo" :clearable="!serviceData.selectedVehicleInfo"
            @click:clear="clearSelectedVehicle"></v-text-field>

          <!-- Display Selected Vehicle -->
          <v-alert v-if="serviceData.selectedVehicleInfo" type="success" variant="tonal" density="compact" class="mb-2">
            <strong>Terpilih:</strong> {{ serviceData.selectedVehicleInfo.customerName }} -
            {{ serviceData.selectedVehicleInfo.vehicleInfo }} ({{ serviceData.selectedVehicleInfo.nomorPolisi }})
            <v-btn icon="mdi-close-circle-outline" variant="text" size="x-small" @click="clearSelectedVehicle"
              class="ml-2"></v-btn>
          </v-alert>

          <!-- Search Results / Add New Button (only show if no vehicle selected) -->
          <div v-if="!serviceData.selectedVehicleInfo">
            <div v-if="searchResult">
              {{ searchResult.customerName }} - {{ searchResult.vehicleInfo }}
              <v-btn size="small" color="success" @click="selectVehicle">Pilih</v-btn>
            </div>
            <div v-else-if="!vehicleFound && serviceData.nomorPolisi.length > 3">
              <v-alert type="info" density="compact" class="mb-2">
                Kendaraan tidak ditemukan.
              </v-alert>
              <v-btn size="small" color="primary" @click="showAddCustomer = true">
                + Tambah Pelanggan Baru
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Keluhan/Jenis Servis -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>Keluhan / Jenis Servis*</v-card-title>
        <v-card-text>
          <v-chip-group v-model="serviceData.jenisServis" column multiple>
            <v-chip filter variant="outlined">Ganti Oli</v-chip>
            <v-chip filter variant="outlined">Servis Rutin</v-chip>
            <v-chip filter variant="outlined">Cek Rem</v-chip>
            <v-chip filter variant="outlined">Ban Bocor</v-chip>
            <v-chip filter variant="outlined">Aki</v-chip>
            <v-chip filter variant="outlined">Lainnya...</v-chip>
          </v-chip-group>
          <v-textarea v-model="serviceData.keterangan" label="Keterangan Tambahan"
            placeholder="Jelaskan keluhan lebih detail jika perlu..." variant="outlined" rows="3" class="mt-2"
            :required="isLainnyaSelected"></v-textarea>
        </v-card-text>
      </v-card>

      <!-- Tombol Aksi -->
      <v-btn color="primary" size="large" block @click="saveService" :loading="isSaving">
        Simpan Servis
      </v-btn>
    </v-form>

    <!-- Dialog Tambah Pelanggan Baru -->
    <v-dialog v-model="showAddCustomer" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Tambah Pelanggan Baru</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="newCustomer.nama" label="Nama Pelanggan*" required variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="newCustomer.noHp" label="Nomor HP*" required :rules="phoneRule" variant="outlined" density="compact"
                  type="tel"></v-text-field> <!-- Apply phoneRule -->
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="newCustomer.kendaraan" label="Merk / Tipe Kendaraan*" required variant="outlined"
                  density="compact" placeholder="Contoh: Honda Vario 125 2020"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="newCustomer.nomorPolisi" label="Nomor Polisi" variant="outlined"
                  density="compact" readonly disabled></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>*Wajib diisi</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="cancelAddCustomer">
            Batal
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveNewCustomer" :loading="isSaving">
            Simpan Pelanggan
          </v-btn>
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
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
// Import Local Storage functions
import {
  findVehicleByNomorPolisi,
  addCustomer,
  addVehicle,
  addService as saveServiceToStorage, // Rename to avoid conflict
} from "../stores/localStorage.js";

const router = useRouter();
const form = ref(null); // For form validation if needed later
const searchResult = ref(null); // Stores found vehicle info before selection
const vehicleFound = ref(false); // Flag if search yielded a result
const showAddCustomer = ref(false); // Controls the dialog visibility
const isSearching = ref(false); // Loading indicator for search
const isSaving = ref(false); // Loading indicator for save

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

// Data for the new customer form
const newCustomer = reactive({
  nama: "",
  noHp: "",
  kendaraan: "",
  nomorPolisi: "", // Will be pre-filled
});

const serviceData = reactive({
  nomorPolisi: "",
  pelangganId: null,
  kendaraanId: null,
  jenisServis: [],
  keterangan: "",
  selectedVehicleInfo: null, // To store selected/newly added vehicle info { nomorPolisi, customerName, vehicleInfo }
});

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Watch for the dialog opening to pre-fill nomorPolisi
watch(showAddCustomer, (newValue) => {
  if (newValue) {
    newCustomer.nomorPolisi = serviceData.nomorPolisi;
    // Reset other fields
    newCustomer.nama = "";
    newCustomer.noHp = "";
    newCustomer.kendaraan = "";
  }
});

// Basic check if 'Lainnya...' chip is selected
const isLainnyaSelected = computed(() => {
  // In a real app, the value of the chip might be different
  return serviceData.jenisServis.includes(5); // Assuming 'Lainnya...' is the 6th chip (index 5)
});

function searchVehicle() {
  // Use the actual Local Storage function
  if (!serviceData.nomorPolisi || serviceData.nomorPolisi.length < 3) {
    searchResult.value = null;
    vehicleFound.value = false;
    return;
  }
  isSearching.value = true;
  searchResult.value = null; // Clear previous result
  vehicleFound.value = false;

  // Simulate async operation if needed, but localStorage is sync
  try {
    const found = findVehicleByNomorPolisi(serviceData.nomorPolisi);
    if (found) {
      // Store the full found object (includes customerName, customerId, vehicleId, etc.)
      searchResult.value = found;
      vehicleFound.value = true;
    } else {
      vehicleFound.value = false;
    }
  } catch (error) {
    console.error("Error searching vehicle:", error);
    vehicleFound.value = false;
    showSnackbar("Terjadi kesalahan saat mencari kendaraan.", "error");
  } finally {
    isSearching.value = false;
  }

  // Clear selected vehicle if nomorPolisi changes and doesn't match the selected one
  if (serviceData.selectedVehicleInfo && serviceData.selectedVehicleInfo.nomorPolisi !== serviceData.nomorPolisi) {
    clearSelectedVehicle();
  }
}

function clearSelectedVehicle() {
  serviceData.selectedVehicleInfo = null;
  serviceData.pelangganId = null;
  serviceData.kendaraanId = null;
  serviceData.nomorPolisi = ""; // Optionally clear nomorPolisi too
  searchResult.value = null;
  vehicleFound.value = false;
}

function selectVehicle() {
  // Use the data from the search result found via localStorage
  if (searchResult.value) {
    serviceData.pelangganId = searchResult.value.customerId;
    serviceData.kendaraanId = searchResult.value.id; // Vehicle ID is directly on the result
    serviceData.selectedVehicleInfo = { // Store display info
      nomorPolisi: searchResult.value.nomorPolisi,
      customerName: searchResult.value.customerName, // Already added in findVehicleByNomorPolisi
      vehicleInfo: searchResult.value.merkTipe // Assuming merkTipe holds vehicle info
    };
    console.log("Vehicle selected:", serviceData.selectedVehicleInfo);
    searchResult.value = null; // Clear search result display area
  }
}

function cancelAddCustomer() {
  showAddCustomer.value = false;
}

async function saveNewCustomer() {
  // TODO: Add proper validation
  if (!newCustomer.nama || !newCustomer.noHp || !newCustomer.kendaraan) {
    showSnackbar("Harap isi semua field pelanggan yang wajib diisi.", "warning");
    return;
  }

  isSaving.value = true;
  try {
    // 1. Save the customer
    const savedCustomer = addCustomer({
      nama: newCustomer.nama,
      noHp: newCustomer.noHp,
    });

    // 2. Save the vehicle, linking to the customer
    const savedVehicle = addVehicle({
      customerId: savedCustomer.id,
      nomorPolisi: newCustomer.nomorPolisi, // Already pre-filled
      merkTipe: newCustomer.kendaraan,
    });

    // 3. Update serviceData with the new IDs and info
    serviceData.pelangganId = savedCustomer.id;
    serviceData.kendaraanId = savedVehicle.id;
    serviceData.selectedVehicleInfo = {
      nomorPolisi: savedVehicle.nomorPolisi,
      customerName: savedCustomer.nama,
      vehicleInfo: savedVehicle.merkTipe
    };

    console.log("New customer and vehicle saved:", savedCustomer, savedVehicle);
    showSnackbar("Pelanggan baru berhasil disimpan.", "success");
    showAddCustomer.value = false; // Close dialog
  } catch (error) {
    console.error("Error saving new customer/vehicle:", error);
    showSnackbar("Gagal menyimpan pelanggan baru. Silakan coba lagi.", "error");
  } finally {
    isSaving.value = false;
  }
}


function saveService() {
  // TODO: Add more robust validation (e.g., check if vehicle is selected)
  if (!serviceData.pelangganId || !serviceData.kendaraanId) {
    showSnackbar("Harap pilih atau tambahkan kendaraan terlebih dahulu.", "warning");
    return;
  }
  if (serviceData.jenisServis.length === 0) {
    showSnackbar("Harap pilih setidaknya satu jenis servis.", "warning");
    return;
  }
  if (isLainnyaSelected.value && !serviceData.keterangan) {
    showSnackbar("Harap isi keterangan jika memilih \"Lainnya...\"", "warning");
    return;
  }

  isSaving.value = true;
  try {
    // Prepare data for saving (only essential fields)
    const dataToSave = {
      pelangganId: serviceData.pelangganId,
      kendaraanId: serviceData.kendaraanId,
      nomorPolisi: serviceData.selectedVehicleInfo.nomorPolisi, // Get from selected info
      jenisServis: serviceData.jenisServis,
      keterangan: serviceData.keterangan,
      // timestamp and status will be added by addService function
    };
    const savedService = saveServiceToStorage(dataToSave); // Use the imported function
    console.log("Service saved:", savedService);
    showSnackbar("Servis berhasil disimpan!", "success"); // Provide feedback
    router.push("/servis"); // Navigate to service list after saving
  } catch (error) {
    console.error("Error saving service:", error);
    showSnackbar("Gagal menyimpan servis. Silakan coba lagi.", "error");
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
/* Add specific styles if needed */
</style>
