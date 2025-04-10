<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>Invoice Pelanggan Langsung</h1>
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack"></v-btn>
    </div>

    <v-form ref="form" v-model="isFormValid" @submit.prevent="saveInvoice">
      <!-- Customer Info -->
      <v-card class="mb-4">
        <v-card-title>Informasi Pelanggan</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="customer.nama"
                label="Nama Pelanggan"
                variant="flat"
                density="comfortable"
                class="mb-3"
                placeholder="Pelanggan Langsung"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="customer.noHp"
                label="Nomor HP"
                variant="flat"
                density="comfortable"
                class="mb-3"
                type="tel"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Vehicle Info -->
      <v-card class="mb-4">
        <v-card-title>Informasi Kendaraan</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="vehicle.nomorPolisi"
                label="Nomor Polisi"
                variant="flat"
                density="comfortable"
                class="mb-3"
                placeholder="B 1234 ABC"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="vehicle.merkTipe"
                label="Merk / Tipe Kendaraan"
                variant="flat"
                density="comfortable"
                class="mb-3"
                placeholder="Honda Vario 125 2020"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Invoice Items -->
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Item Invoice</span>
          <v-btn color="primary" size="small" @click="showAddItemDialog = true" prepend-icon="mdi-plus-box-outline">
            Tambah Item
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="invoiceItems.length === 0" type="info" variant="tonal" density="compact">
            Belum ada item. Tambahkan item untuk membuat invoice.
          </v-alert>
          <v-list v-else lines="two">
            <v-list-item v-for="(item, index) in invoiceItems" :key="index">
              <v-list-item-title>{{ item.deskripsi }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.jumlah }} x {{ formatCurrency(item.biaya) }} = {{ formatCurrency(item.subtotal) }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn icon="mdi-pencil" size="small" variant="text" @click="editItem(index)" class="mr-1"></v-btn>
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeItem(index)"></v-btn>
              </template>
            </v-list-item>
          </v-list>

          <!-- Total -->
          <div v-if="invoiceItems.length > 0" class="d-flex justify-space-between mt-4 text-subtitle-1 font-weight-bold">
            <span>Total:</span>
            <span>{{ formatCurrency(totalAmount) }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Notes -->
      <v-card class="mb-4">
        <v-card-title>Catatan</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="notes"
            label="Catatan Invoice"
            variant="flat"
            density="comfortable"
            rows="3"
          ></v-textarea>
        </v-card-text>
      </v-card>

      <!-- Submit Button -->
      <v-btn
        type="submit"
        color="primary"
        block
        size="large"
        :loading="isSaving"
        :disabled="!isFormValid || invoiceItems.length === 0 || totalAmount <= 0"
      >
        Buat Invoice
      </v-btn>
    </v-form>

    <!-- Add/Edit Item Dialog -->
    <v-dialog v-model="showAddItemDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingItemIndex === -1 ? 'Tambah Item' : 'Edit Item' }}</v-card-title>
        <v-card-text>
          <v-radio-group v-model="newItem.type" inline class="mb-3">
            <v-radio value="jasa" label="Jasa"></v-radio>
            <v-radio value="part" label="Sparepart"></v-radio>
          </v-radio-group>

          <v-text-field
            v-model="newItem.deskripsi"
            label="Deskripsi*"
            variant="flat"
            density="comfortable"
            class="mb-3"
            :rules="[v => !!v || 'Deskripsi wajib diisi']"
          ></v-text-field>

          <v-text-field
            v-model.number="newItem.jumlah"
            label="Jumlah*"
            type="number"
            variant="flat"
            density="comfortable"
            class="mb-3"
            :rules="[
              v => !!v || 'Jumlah wajib diisi',
              v => v > 0 || 'Jumlah harus lebih dari 0'
            ]"
            min="1"
          ></v-text-field>

          <v-text-field
            v-model.number="newItem.biaya"
            label="Harga Satuan*"
            type="number"
            variant="flat"
            density="comfortable"
            class="mb-3"
            :rules="[
              v => !!v || 'Harga wajib diisi',
              v => v > 0 || 'Harga harus lebih dari 0'
            ]"
            min="0"
            prefix="Rp"
          ></v-text-field>

          <div class="d-flex justify-space-between align-center">
            <span class="text-subtitle-1">Subtotal:</span>
            <span class="text-h6">{{ formatCurrency(newItemSubtotal) }}</span>
          </div>
        </v-card-text>
        <v-card-actions>
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
      jasaTotal: invoiceItems.value
        .filter(item => item.type === 'jasa')
        .reduce((sum, item) => sum + item.subtotal, 0),
      partsTotal: invoiceItems.value
        .filter(item => item.type === 'part')
        .reduce((sum, item) => sum + item.subtotal, 0),
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
