<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>Tambah Pelanggan Baru</h1>
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack"></v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveCustomer">
          <v-text-field
            v-model="customer.nama"
            label="Nama Pelanggan*"
            :rules="requiredRule"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="customer.noHp"
            label="Nomor HP*"
            :rules="phoneRule"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            type="tel"
          ></v-text-field>

          <v-divider class="my-4"></v-divider>
          
          <h3 class="text-h6 mb-3">Kendaraan (Opsional)</h3>
          <p class="text-caption mb-3">Anda dapat menambahkan kendaraan sekarang atau nanti.</p>

          <v-text-field
            v-model="vehicle.nomorPolisi"
            label="Nomor Polisi"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            placeholder="Contoh: B 1234 ABC"
          ></v-text-field>

          <v-text-field
            v-model="vehicle.merkTipe"
            label="Merk / Tipe Kendaraan"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            placeholder="Contoh: Honda Vario 125 2020"
          ></v-text-field>

          <v-card-actions class="px-0">
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit" :loading="isSaving">Simpan</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>

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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { addCustomer, addVehicle } from '../stores/localStorage.js';

const router = useRouter();
const form = ref(null);
const isFormValid = ref(false);
const isSaving = ref(false);

// Form data
const customer = reactive({
  nama: '',
  noHp: ''
});

const vehicle = reactive({
  nomorPolisi: '',
  merkTipe: ''
});

// Validation rules
const requiredRule = [v => !!v || 'Field ini wajib diisi'];
const phoneRule = [
  v => !!v || 'Nomor HP wajib diisi',
  v => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(v) || 'Format Nomor HP tidak valid',
  v => (v && v.length >= 8 && v.length <= 15) || 'Nomor HP harus antara 8-15 digit'
];

// Snackbar state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');

function showSnackbar(text, color = 'info') {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

async function saveCustomer() {
  if (!isFormValid.value) {
    form.value.validate();
    return;
  }

  isSaving.value = true;

  try {
    // Add customer
    const newCustomer = addCustomer({
      nama: customer.nama,
      noHp: customer.noHp
    });

    // Add vehicle if provided
    if (vehicle.nomorPolisi && vehicle.merkTipe) {
      addVehicle({
        customerId: newCustomer.id,
        nomorPolisi: vehicle.nomorPolisi,
        merkTipe: vehicle.merkTipe
      });
    }

    showSnackbar('Pelanggan berhasil ditambahkan', 'success');
    
    // Navigate to customer detail page
    setTimeout(() => {
      router.push(`/pelanggan/${newCustomer.id}`);
    }, 1000);
  } catch (error) {
    console.error('Error saving customer:', error);
    showSnackbar('Gagal menyimpan data pelanggan', 'error');
  } finally {
    isSaving.value = false;
  }
}

function goBack() {
  router.push('/pelanggan');
}
</script>
