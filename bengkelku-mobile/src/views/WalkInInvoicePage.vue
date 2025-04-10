<template>
  <v-container>
    <!-- Enhanced Header with Card -->
    <v-card class="mb-4 header-card" variant="flat">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-receipt" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">Invoice Pelanggan Langsung</v-card-title>
        <v-card-subtitle>Buat invoice untuk pelanggan tanpa registrasi</v-card-subtitle>
        
        <template v-slot:append>
          <v-btn icon="mdi-arrow-left" variant="text" @click="goBack"></v-btn>
        </template>
      </v-card-item>
    </v-card>

    <v-form ref="form" v-model="isFormValid" @submit.prevent="saveInvoice">
      <v-row>
        <!-- Customer Info -->
        <v-col cols="12" md="6">
          <v-card class="mb-4 h-100" variant="outlined">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="primary-lighten-4" size="small">
                  <v-icon icon="mdi-account" color="primary" size="small"></v-icon>
                </v-avatar>
              </template>
              <v-card-title>Informasi Pelanggan</v-card-title>
            </v-card-item>
            
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="customer.nama"
                    label="Nama Pelanggan"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                    placeholder="Pelanggan Langsung"
                    prepend-inner-icon="mdi-account"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="customer.noHp"
                    label="Nomor HP"
                    variant="outlined"
                    density="comfortable"
                    type="tel"
                    prepend-inner-icon="mdi-phone"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Vehicle Info -->
        <v-col cols="12" md="6">
          <v-card class="mb-4 h-100" variant="outlined">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="info-lighten-4" size="small">
                  <v-icon icon="mdi-car" color="info" size="small"></v-icon>
                </v-avatar>
              </template>
              <v-card-title>Informasi Kendaraan</v-card-title>
            </v-card-item>
            
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="vehicle.nomorPolisi"
                    label="Nomor Polisi"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                    placeholder="B 1234 ABC"
                    prepend-inner-icon="mdi-car-info"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="vehicle.merkTipe"
                    label="Merk / Tipe Kendaraan"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Honda Vario 125 2020"
                    prepend-inner-icon="mdi-car-side"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <!-- Invoice Items -->
          <v-card class="mb-4" variant="outlined">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="success-lighten-4" size="small">
                  <v-icon icon="mdi-cart" color="success" size="small"></v-icon>
                </v-avatar>
              </template>
              <v-card-title>Item Invoice</v-card-title>
              
              <template v-slot:append>
                <v-btn color="success" size="small" @click="showAddItemDialog = true" prepend-icon="mdi-plus">
                  Tambah Item
                </v-btn>
              </template>
            </v-card-item>
            
            <v-divider></v-divider>
            
            <v-card-text>
              <v-alert v-if="invoiceItems.length === 0" type="warning" variant="tonal" density="compact" class="mb-0">
                <div class="d-flex align-center">
                  <span>Belum ada item. Tambahkan item untuk membuat invoice.</span>
                </div>
              </v-alert>
              
              <v-list v-else lines="two" class="invoice-items-list pa-0">
                <v-list-item v-for="(item, index) in invoiceItems" :key="index" class="invoice-item">
                  <template v-slot:prepend>
                    <v-avatar size="small" :color="item.type === 'jasa' ? 'warning-lighten-4' : 'info-lighten-4'" class="me-2">
                      <v-icon :icon="item.type === 'jasa' ? 'mdi-wrench' : 'mdi-cog'" size="small" 
                        :color="item.type === 'jasa' ? 'warning' : 'info'"></v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="font-weight-medium">{{ item.deskripsi }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.jumlah }} x {{ formatCurrency(item.biaya) }}
                  </v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <div class="d-flex flex-column align-end">
                      <div class="font-weight-medium">{{ formatCurrency(item.subtotal) }}</div>
                      <div class="d-flex mt-1">
                        <v-btn icon="mdi-pencil" size="x-small" variant="text" color="info" @click="editItem(index)" class="mr-1"></v-btn>
                        <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="removeItem(index)"></v-btn>
                      </div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
    
              <!-- Total -->
              <v-divider v-if="invoiceItems.length > 0" class="my-3"></v-divider>
              
              <div v-if="invoiceItems.length > 0" class="d-flex flex-column">
                <div class="d-flex justify-space-between">
                  <span class="text-body-2">Subtotal Jasa:</span>
                  <span class="text-body-2">{{ formatCurrency(jasaTotal) }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2">Subtotal Sparepart:</span>
                  <span class="text-body-2">{{ formatCurrency(partsTotal) }}</span>
                </div>
                <div class="d-flex justify-space-between mt-2 text-subtitle-1 font-weight-bold">
                  <span>Total:</span>
                  <span>{{ formatCurrency(totalAmount) }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
    
          <!-- Notes -->
          <v-card class="mb-4" variant="outlined">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-4" size="small">
                  <v-icon icon="mdi-note-text" color="grey-darken-1" size="small"></v-icon>
                </v-avatar>
              </template>
              <v-card-title>Catatan</v-card-title>
            </v-card-item>
            
            <v-divider></v-divider>
            
            <v-card-text>
              <v-textarea
                v-model="notes"
                label="Catatan Invoice"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="Tambahkan catatan untuk invoice ini (opsional)"
                hide-details
              ></v-textarea>
            </v-card-text>
          </v-card>
    
          <!-- Submit Button -->
          <v-card variant="flat" class="mb-4 pa-0">
            <v-card-actions class="pa-0">
              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="isSaving"
                :disabled="!isFormValid || invoiceItems.length === 0 || totalAmount <= 0"
                prepend-icon="mdi-content-save"
              >
                Buat Invoice
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

    </v-form>

    <!-- Add/Edit Item Dialog -->
    <v-dialog v-model="showAddItemDialog" max-width="500" :fullscreen="$vuetify.display.xs">
      <v-card>
        <v-toolbar v-if="$vuetify.display.xs" color="primary" density="compact">
          <v-btn icon @click="cancelAddItem">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ editingItemIndex === -1 ? 'Tambah Item' : 'Edit Item' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="saveItem"
            :disabled="!newItem.deskripsi || !newItem.jumlah || !newItem.biaya || newItem.jumlah <= 0 || newItem.biaya <= 0"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-toolbar>
        
        <v-card-title v-else>{{ editingItemIndex === -1 ? 'Tambah Item' : 'Edit Item' }}</v-card-title>
        
        <v-card-text>
          <v-chip-group v-model="newItem.type" mandatory class="mb-3">
            <v-chip value="jasa" label color="warning" variant="flat">
              <v-icon start icon="mdi-wrench"></v-icon>
              Jasa
            </v-chip>
            <v-chip value="part" label color="info" variant="flat">
              <v-icon start icon="mdi-cog"></v-icon>
              Sparepart
            </v-chip>
          </v-chip-group>

          <v-text-field
            v-model="newItem.deskripsi"
            label="Deskripsi*"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[v => !!v || 'Deskripsi wajib diisi']"
            placeholder="Contoh: Ganti Oli, Kampas Rem, dll."
          ></v-text-field>

          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.jumlah"
                label="Jumlah*"
                type="number"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[
                  v => !!v || 'Jumlah wajib diisi',
                  v => v > 0 || 'Jumlah harus lebih dari 0'
                ]"
                min="1"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.biaya"
                label="Harga Satuan*"
                type="number"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[
                  v => !!v || 'Harga wajib diisi',
                  v => v > 0 || 'Harga harus lebih dari 0'
                ]"
                min="0"
                prefix="Rp"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-card variant="outlined" class="pa-3 mb-0">
            <div class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1">Subtotal:</span>
              <span class="text-h6 font-weight-bold">{{ formatCurrency(newItemSubtotal) }}</span>
            </div>
          </v-card>
        </v-card-text>
        
        <v-card-actions v-if="!$vuetify.display.xs">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelAddItem">Batal</v-btn>
          <v-btn
            color="primary"
            @click="saveItem"
            :disabled="!newItem.deskripsi || !newItem.jumlah || !newItem.biaya || newItem.jumlah <= 0 || newItem.biaya <= 0"
          >
            Simpan
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  createDirectInvoice,
  WALK_IN_CUSTOMER_ID,
  getWorkshopInfo
} from '../stores/localStorage.js';

const router = useRouter();
const form = ref(null);
const isFormValid = ref(true);
const isSaving = ref(false);

// Customer and vehicle info
const customer = reactive({
  nama: 'Pelanggan Langsung',
  noHp: ''
});

const vehicle = reactive({
  nomorPolisi: '',
  merkTipe: ''
});

// Invoice items
const invoiceItems = ref([]);
const notes = ref('');

// Add/edit item dialog
const showAddItemDialog = ref(false);
const editingItemIndex = ref(-1);
const newItem = reactive({
  type: 'jasa',
  deskripsi: '',
  jumlah: 1,
  biaya: 0
});

// Snackbar state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');

// Computed properties
const totalAmount = computed(() => {
  return invoiceItems.value.reduce((sum, item) => sum + item.subtotal, 0);
});

const jasaTotal = computed(() => {
  return invoiceItems.value
    .filter(item => item.type === 'jasa')
    .reduce((sum, item) => sum + item.subtotal, 0);
});

const partsTotal = computed(() => {
  return invoiceItems.value
    .filter(item => item.type === 'part')
    .reduce((sum, item) => sum + item.subtotal, 0);
});

const newItemSubtotal = computed(() => {
  return (newItem.jumlah || 0) * (newItem.biaya || 0);
});

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function goBack() {
  router.push('/invoice');
}

function showAddItem() {
  editingItemIndex.value = -1;
  resetNewItem();
  showAddItemDialog.value = true;
}

function editItem(index) {
  const item = invoiceItems.value[index];
  editingItemIndex.value = index;

  // Copy item data to the form
  newItem.type = item.type;
  newItem.deskripsi = item.deskripsi;
  newItem.jumlah = item.jumlah;
  newItem.biaya = item.biaya;

  showAddItemDialog.value = true;
}

function removeItem(index) {
  invoiceItems.value.splice(index, 1);
}

function resetNewItem() {
  newItem.type = 'jasa';
  newItem.deskripsi = '';
  newItem.jumlah = 1;
  newItem.biaya = 0;
}

function saveItem() {
  const item = {
    type: newItem.type,
    deskripsi: newItem.deskripsi,
    jumlah: Number(newItem.jumlah),
    biaya: Number(newItem.biaya),
    subtotal: Number(newItem.jumlah) * Number(newItem.biaya)
  };

  if (editingItemIndex.value === -1) {
    // Add new item
    invoiceItems.value.push(item);
  } else {
    // Update existing item
    invoiceItems.value[editingItemIndex.value] = item;
  }

  showAddItemDialog.value = false;
  resetNewItem();
}

function cancelAddItem() {
  showAddItemDialog.value = false;
  resetNewItem();
}

async function saveInvoice() {
  // Validate items
  if (invoiceItems.value.length === 0) {
    showSnackbar('Tidak dapat membuat invoice: Tidak ada item yang ditambahkan', 'warning');
    return;
  }

  // Validate total amount
  if (totalAmount.value <= 0) {
    showSnackbar('Tidak dapat membuat invoice: Total biaya adalah 0', 'warning');
    return;
  }

  // Validate customer name
  if (!customer.nama || customer.nama.trim() === '') {
    customer.nama = 'Pelanggan Langsung'; // Set default name if empty
  }

  // Validate phone number format if provided
  if (customer.noHp && customer.noHp.trim() !== '') {
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
    if (!phoneRegex.test(customer.noHp)) {
      showSnackbar('Format nomor telepon tidak valid', 'warning');
      return;
    }
  }

  // Validate license plate format if provided
  if (vehicle.nomorPolisi && vehicle.nomorPolisi.trim() !== '') {
    // Simple validation for Indonesian license plate format
    const plateRegex = /^[A-Z0-9 ]{1,12}$/i;
    if (!plateRegex.test(vehicle.nomorPolisi)) {
      showSnackbar('Format nomor polisi tidak valid', 'warning');
      return;
    }
  }

  isSaving.value = true;

  try {
    // Get workshop info
    const workshopInfo = getWorkshopInfo();

    // Create invoice data
    const invoiceData = {
      pelangganId: WALK_IN_CUSTOMER_ID,
      pelangganNama: customer.nama || 'Pelanggan Langsung',
      pelangganNoHp: customer.noHp || '',
      nomorPolisi: vehicle.nomorPolisi || '',
      merkTipe: vehicle.merkTipe || '',
      items: invoiceItems.value,
      jasaTotal: jasaTotal.value,
      partsTotal: partsTotal.value,
      totalAmount: totalAmount.value,
      workshopInfo: {
        nama: workshopInfo.nama || 'BengkelKu',
        alamat: workshopInfo.alamat || '',
        telepon: workshopInfo.telepon || '',
      },
      catatan: notes.value || '',
      tanggalInvoice: new Date().toISOString(),
    };

    // Create the invoice
    const invoice = createDirectInvoice(invoiceData);

    showSnackbar('Invoice berhasil dibuat', 'success');

    // Navigate to the invoice detail page
    setTimeout(() => {
      router.push(`/invoice/${invoice.id}`);
    }, 1000);
  } catch (error) {
    console.error('Error creating invoice:', error);
    showSnackbar('Terjadi kesalahan saat membuat invoice', 'error');
  } finally {
    isSaving.value = false;
  }
}

function showSnackbar(text, color = 'info') {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}
</script>

<style scoped>
.header-card {
  border-radius: 8px;
}

.invoice-items-list {
  border-radius: 8px;
  overflow: hidden;
}

.invoice-item {
  transition: background-color 0.2s;
}

.invoice-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .v-card-title {
    font-size: 1rem !important;
  }
  
  .v-card-subtitle {
    font-size: 0.75rem !important;
  }
  
  .v-list-item-title {
    font-size: 0.875rem !important;
  }
  
  .v-list-item-subtitle {
    font-size: 0.75rem !important;
  }
}
</style>