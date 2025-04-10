<template>
  <v-container class="add-service-container">
    <!-- Header with Breadcrumb -->
    <div class="page-header mb-4">
      <div class="d-flex align-center mb-2">
        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0"></v-breadcrumbs>
      </div>
      <div class="d-flex align-center">
        <v-icon icon="mdi-wrench-outline" color="primary" size="large" class="me-2"></v-icon>
        <h1 class="text-h5 font-weight-bold">Tambah Servis Baru</h1>
      </div>
    </div>

    <v-form ref="form">
      <!-- Identifikasi Kendaraan -->
      <v-card variant="flat" class="mb-4 vehicle-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-car" color="primary" class="me-2"></v-icon>
          </template>
          <v-card-title>Kendaraan</v-card-title>
        </v-card-item>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="serviceData.nomorPolisi"
            label="Nomor Polisi*"
            required
            variant="outlined"
            @input="searchVehicle"
            class="mb-2"
            :readonly="!!serviceData.selectedVehicleInfo"
            :disabled="!!serviceData.selectedVehicleInfo"
            :clearable="!serviceData.selectedVehicleInfo"
            @click:clear="clearSelectedVehicle"
            prepend-inner-icon="mdi-license"
            placeholder="Contoh: B1234XYZ"
            hint="Masukkan nomor polisi untuk mencari kendaraan"
            persistent-hint
          ></v-text-field>

          <!-- Loading Indicator -->
          <div v-if="isSearching" class="d-flex justify-center my-2">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          </div>

          <!-- Display Selected Vehicle -->
          <v-card v-if="serviceData.selectedVehicleInfo" color="success" variant="tonal" class="mb-3 selected-vehicle-card">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="success" variant="tonal">
                  <v-icon icon="mdi-check-circle"></v-icon>
                </v-avatar>
              </template>
              <v-card-title class="text-subtitle-1">Kendaraan Terpilih</v-card-title>
              <template v-slot:append>
                <v-btn icon="mdi-close-circle" variant="text" size="small" @click="clearSelectedVehicle"></v-btn>
              </template>
            </v-card-item>
            <v-card-text>
              <div class="d-flex align-center mb-1">
                <v-icon icon="mdi-account" size="small" class="me-2"></v-icon>
                <span class="text-body-1">{{ serviceData.selectedVehicleInfo.customerName }}</span>
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon icon="mdi-car" size="small" class="me-2"></v-icon>
                <span class="text-body-1">{{ serviceData.selectedVehicleInfo.vehicleInfo }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon icon="mdi-license" size="small" class="me-2"></v-icon>
                <span class="text-body-1">{{ serviceData.selectedVehicleInfo.nomorPolisi }}</span>
              </div>
            </v-card-text>
          </v-card>

          <!-- Search Results / Add New Button (only show if no vehicle selected) -->
          <div v-if="!serviceData.selectedVehicleInfo" class="mt-2">
            <!-- Search Result Found -->
            <v-card v-if="searchResult" variant="flat" class="mb-3 search-result-card">
              <v-card-item>
                <template v-slot:prepend>
                  <v-avatar color="info" variant="tonal">
                    <v-icon icon="mdi-car-search"></v-icon>
                  </v-avatar>
                </template>
                <v-card-title class="text-subtitle-1">Kendaraan Ditemukan</v-card-title>
              </v-card-item>
              <v-card-text>
                <div class="d-flex align-center mb-1">
                  <v-icon icon="mdi-account" size="small" class="me-2"></v-icon>
                  <span class="text-body-1">{{ searchResult.customerName }}</span>
                </div>
                <div class="d-flex align-center mb-1">
                  <v-icon icon="mdi-car" size="small" class="me-2"></v-icon>
                  <span class="text-body-1">{{ searchResult.merkTipe }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-license" size="small" class="me-2"></v-icon>
                  <span class="text-body-1">{{ searchResult.nomorPolisi }}</span>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="tonal" @click="selectVehicle" prepend-icon="mdi-check">
                  Pilih Kendaraan Ini
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- Not Found -->
            <div v-else-if="!vehicleFound && serviceData.nomorPolisi.length > 3">
              <v-alert type="info" variant="tonal" class="mb-3">
                <div class="d-flex align-center">
                  <v-avatar color="info" variant="tonal" class="me-3">
                    <v-icon icon="mdi-car-off"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">Kendaraan Tidak Ditemukan</div>
                    <div class="text-body-2">Nomor polisi <strong>{{ serviceData.nomorPolisi }}</strong> belum terdaftar</div>
                  </div>
                </div>
              </v-alert>
              <div class="d-flex justify-center">
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="showAddCustomer = true"
                  prepend-icon="mdi-account-plus"
                  class="px-4"
                >
                  Tambah Pelanggan & Kendaraan Baru
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Keluhan/Jenis Servis -->
      <v-card variant="flat" class="mb-4 service-type-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-wrench" color="primary" class="me-2"></v-icon>
          </template>
          <v-card-title>Keluhan / Jenis Servis*</v-card-title>
        </v-card-item>
        <v-divider></v-divider>
        <v-card-text class="pt-2">
          <div class="service-type-grid mb-0">
            <v-chip-group v-model="serviceData.jenisServis" multiple>
              <v-chip
                filter
                variant="flat"
                color="primary"
                class="service-type-chip dark--text"
                text-color="primary"
                prepend-icon="mdi-oil"
              >
                Ganti Oli
              </v-chip>
              <v-chip
                filter
                variant="flat"
                color="primary"
                class="service-type-chip dark--text"
                text-color="primary"
                prepend-icon="mdi-tools"
              >
                Servis Rutin
              </v-chip>
              <v-chip
                filter
                variant="flat"
                color="primary"
                class="service-type-chip dark--text"
                text-color="primary"
                prepend-icon="mdi-car-brake-abs"
              >
                Cek Rem
              </v-chip>
              <v-chip
                filter
                variant="flat"
                color="primary"
                class="service-type-chip dark--text"
                text-color="primary"
                prepend-icon="mdi-tire"
              >
                Ban Bocor
              </v-chip>
              <v-chip
                filter
                variant="flat"
                color="primary"
                class="service-type-chip dark--text"
                text-color="primary"
                prepend-icon="mdi-car-battery"
              >
                Aki
              </v-chip>
              <v-chip
                filter
                variant="flat"
                color="primary"
                class="service-type-chip dark--text"
                text-color="primary"
                prepend-icon="mdi-dots-horizontal-circle"
              >
                Lainnya...
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Selected Service Types Summary -->
          <v-card v-if="serviceData.jenisServis.length > 0" variant="tonal" class="my-3 pa-3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-check-circle" color="success" class="me-2"></v-icon>
              <div class="text-subtitle-1">Jenis Servis Dipilih:</div>
            </div>
            <div class="d-flex flex-wrap mt-2">
              <v-chip
                v-for="(index, i) in serviceData.jenisServis"
                :key="i"
                size="small"
                class="ma-1 dark--text"
                color="primary"
                text-color="rgba(0,0,0,0.87)"
                variant="flat"
              >
                {{ getServiceTypeName(index) }}
              </v-chip>
            </div>
          </v-card>

          <v-textarea
            v-model="serviceData.keterangan"
            label="Keterangan Tambahan"
            placeholder="Jelaskan keluhan lebih detail jika perlu..."
            variant="outlined"
            rows="3"
            class="mt-2"
            :required="isLainnyaSelected"
            counter
            :hint="isLainnyaSelected ? 'Wajib diisi karena memilih Lainnya' : 'Opsional'"
            persistent-hint
            prepend-icon="mdi-comment-text-outline"
          ></v-textarea>
        </v-card-text>
      </v-card>

      <!-- Tombol Aksi -->
      <v-card variant="flat" class="mb-4 action-card">
        <v-card-text>
          <div class="d-flex flex-column flex-sm-row gap-3">
            <v-btn
              color="primary"
              @click="confirmSave"
              :loading="isSaving"
              prepend-icon="mdi-content-save"
              class="flex-grow-1 mb-2"
              dense="compact"
            >
              Simpan Servis
            </v-btn>
            <v-btn
              variant="tonal"
              @click="goBack"
              prepend-icon="mdi-arrow-left"
              class="flex-grow-1 ms-lg-2 mb-2"
            >
              Kembali
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Konfirmasi Dialog -->
      <v-dialog v-model="showConfirmDialog" max-width="400px">
        <v-card>
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon icon="mdi-help-circle"></v-icon>
              </v-avatar>
            </template>
            <v-card-title>Konfirmasi Simpan</v-card-title>
          </v-card-item>
          <v-card-text>
            <p>Apakah Anda yakin ingin menyimpan servis ini?</p>
            <div v-if="serviceData.selectedVehicleInfo" class="mt-2">
              <div class="text-subtitle-2">Detail Kendaraan:</div>
              <div>{{ serviceData.selectedVehicleInfo.customerName }} - {{ serviceData.selectedVehicleInfo.vehicleInfo }}</div>
            </div>
            <div v-else-if="serviceData.nomorPolisi" class="mt-2">
              <div class="text-subtitle-2">Nomor Polisi:</div>
              <div>{{ serviceData.nomorPolisi }}</div>
            </div>
            <div v-else class="mt-2 text-warning">
              <v-icon icon="mdi-alert" class="me-1"></v-icon>
              <span>Servis akan disimpan tanpa informasi kendaraan (walk-in customer)</span>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="showConfirmDialog = false">Batal</v-btn>
            <v-btn color="primary" variant="flat" @click="saveService" :loading="isSaving">Ya, Simpan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-form>

    <!-- Dialog Tambah Pelanggan Baru -->
    <v-dialog v-model="showAddCustomer" persistent :max-width="$vuetify.display.xs ? '100%' : '600px'" :fullscreen="$vuetify.display.xs">
      <v-card class="customer-dialog">
        <v-toolbar density="compact" color="primary" class="mobile-toolbar" v-if="$vuetify.display.xs">
          <v-btn icon @click="cancelAddCustomer">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Tambah Pelanggan Baru</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="saveNewCustomer"
            :loading="isSaving"
            :disabled="!isCustomerFormValid"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-toolbar>

        <template v-if="!$vuetify.display.xs">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon icon="mdi-account-plus"></v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h5">Tambah Pelanggan Baru</v-card-title>
          </v-card-item>
        </template>

        <v-divider></v-divider>

        <v-card-text :class="$vuetify.display.xs ? 'pa-3' : 'pa-4'">
          <v-form ref="customerForm" v-model="isCustomerFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newCustomer.nama"
                  label="Nama Pelanggan*"
                  required
                  variant="flat"
                  density="compact"
                  prepend-inner-icon="mdi-account"
                  :rules="[v => !!v || 'Nama pelanggan wajib diisi']"
                  hint="Masukkan nama lengkap pelanggan"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newCustomer.noHp"
                  label="Nomor HP*"
                  required
                  :rules="phoneRule"
                  variant="flat"
                  density="compact"
                  type="tel"
                  prepend-inner-icon="mdi-phone"
                  hint="Format: 08xxxxxxxxxx"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newCustomer.kendaraan"
                  label="Merk / Tipe Kendaraan*"
                  required
                  variant="flat"
                  density="compact"
                  placeholder="Contoh: Honda Vario 125 2020"
                  prepend-inner-icon="mdi-car"
                  :rules="[v => !!v || 'Merk/tipe kendaraan wajib diisi']"
                  hint="Masukkan merk, tipe, dan tahun kendaraan"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newCustomer.nomorPolisi"
                  label="Nomor Polisi"
                  variant="flat"
                  density="compact"
                  readonly
                  disabled
                  prepend-inner-icon="mdi-license"
                  hint="Nomor polisi dari pencarian sebelumnya"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Preview Card -->
            <v-card v-if="isCustomerFormValid" variant="tonal" color="success" class="mt-3 mb-2">
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon icon="mdi-check-circle" color="success" class="me-2"></v-icon>
                  <div class="text-subtitle-1 font-weight-medium">Preview Data Pelanggan</div>
                </div>
                <div class="d-flex flex-column gap-1">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-account" size="small" class="me-2"></v-icon>
                    <span>{{ newCustomer.nama }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-phone" size="small" class="me-2"></v-icon>
                    <span>{{ newCustomer.noHp }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-car" size="small" class="me-2"></v-icon>
                    <span>{{ newCustomer.kendaraan }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-license" size="small" class="me-2"></v-icon>
                    <span>{{ newCustomer.nomorPolisi }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <div class="text-caption text-grey mt-2">
              * Wajib diisi
            </div>
          </v-form>
        </v-card-text>

        <template v-if="!$vuetify.display.xs">
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="cancelAddCustomer">
              Batal
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="saveNewCustomer"
              :loading="isSaving"
              :disabled="!isCustomerFormValid"
            >
              <v-icon icon="mdi-content-save" class="me-1"></v-icon>
              Simpan Pelanggan
            </v-btn>
          </v-card-actions>
        </template>
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
const customerForm = ref(null); // For customer form validation
const searchResult = ref(null); // Stores found vehicle info before selection
const vehicleFound = ref(false); // Flag if search yielded a result
const showAddCustomer = ref(false); // Controls the dialog visibility
const showConfirmDialog = ref(false); // Controls the confirmation dialog
const isSearching = ref(false); // Loading indicator for search
const isSaving = ref(false); // Loading indicator for save
const isCustomerFormValid = ref(false); // For customer form validation

// Breadcrumbs
const breadcrumbs = [
  {
    title: 'Beranda',
    disabled: false,
    href: '/',
  },
  {
    title: 'Daftar Servis',
    disabled: false,
    href: '/servis',
  },
  {
    title: 'Tambah Servis',
    disabled: true,
  },
];

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info"); // Default color

// Validation Rules
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

// Function to get service type name from index
function getServiceTypeName(index) {
  const serviceTypes = [
    "Ganti Oli",
    "Servis Rutin",
    "Cek Rem",
    "Ban Bocor",
    "Aki",
    "Lainnya..."
  ];
  return serviceTypes[index] || "Tidak Diketahui";
}

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
  // Basic validation
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


function confirmSave() {
  // Validation for service type and description
  if (serviceData.jenisServis.length === 0) {
    showSnackbar("Harap pilih setidaknya satu jenis servis.", "warning");
    return;
  }
  if (isLainnyaSelected.value && !serviceData.keterangan) {
    showSnackbar("Harap isi keterangan jika memilih \"Lainnya...\"", "warning");
    return;
  }

  // Show confirmation dialog
  showConfirmDialog.value = true;
}

function goBack() {
  router.push('/servis');
}

function saveService() {
  // Close confirmation dialog
  showConfirmDialog.value = false;

  isSaving.value = true;
  try {
    // Prepare data for saving
    // Handle walk-in customer (no selected vehicle/customer)
    const dataToSave = {
      pelangganId: serviceData.selectedVehicleInfo ? serviceData.pelangganId : null,
      kendaraanId: serviceData.selectedVehicleInfo ? serviceData.kendaraanId : null,
      // Use entered nomorPolisi if no vehicle selected, otherwise use selected vehicle's plate
      nomorPolisi: serviceData.selectedVehicleInfo ? serviceData.selectedVehicleInfo.nomorPolisi : serviceData.nomorPolisi || null,
      jenisServis: serviceData.jenisServis,
      keterangan: serviceData.keterangan,
      // timestamp and status will be added by addService function
    };

    // Add a check: If no vehicle is selected AND no nomorPolisi is entered, maybe warn?
    // For now, we allow saving without any customer/vehicle info.
    if (!serviceData.selectedVehicleInfo && !serviceData.nomorPolisi) {
        console.warn("Saving service without customer/vehicle identification.");
        // Optionally show a confirmation snackbar/dialog here
    }


    const savedService = saveServiceToStorage(dataToSave); // Use the imported function
    console.log("Service saved:", savedService);
    const message = serviceData.selectedVehicleInfo || serviceData.nomorPolisi
        ? "Servis berhasil disimpan!"
        : "Servis untuk walk-in customer berhasil disimpan!";
    showSnackbar(message, "success"); // Provide feedback
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
/* Page Layout */
.add-service-container {
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 12px;
}

/* Card Styling */
.vehicle-card,
.service-type-card,
.action-card,
.customer-dialog {
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.vehicle-card:hover,
.service-type-card:hover,
.action-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Service Type Grid */
.service-type-grid {
  margin-bottom: 16px;
}

.service-type-chip {
  margin: 4px;
  transition: all 0.2s ease;
}

.service-type-chip:hover {
  transform: translateY(-2px);
}

/* Fix for chip text color */
.dark--text {
  color: rgba(0,0,0,0.87) !important;
}

.v-chip.dark--text .v-chip__content,
.v-chip.dark--text .v-chip__filter,
.v-chip.dark--text .v-chip__prepend {
  color: rgba(0,0,0,0.87) !important;
}

.v-chip.dark--text .v-icon {
  color: rgba(0,0,0,0.87) !important;
}

/* Selected chip styling */
.v-chip--selected.dark--text {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

/* Vehicle Cards */
.selected-vehicle-card,
.search-result-card {
  transition: all 0.3s ease;
}

.selected-vehicle-card:hover,
.search-result-card:hover {
  transform: translateY(-2px);
}

/* Mobile Toolbar */
.mobile-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .service-type-chip {
    margin: 2px;
  }
}
</style>
