<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>Daftar Invoice</h1>
      <div>
        <v-btn color="success" prepend-icon="mdi-account-cash" @click="createWalkInInvoice" class="mr-2">
          Invoice Langsung
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadInvoices" :loading="isLoading">
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="d-flex justify-center my-5">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="invoices.length === 0" class="text-center pa-5">
      <v-icon icon="mdi-file-document-outline" size="64" color="grey-lighten-1" class="mb-2"></v-icon>
      <h3 class="text-h6 mb-2">Belum Ada Invoice</h3>
      <p class="text-body-2 mb-4">Anda belum membuat invoice apapun.</p>
      <v-btn color="primary" to="/servis">Lihat Daftar Servis</v-btn>
    </v-card>

    <!-- Invoice List -->
    <div v-else>
      <!-- Filter Controls -->
      <v-card class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="search"
                label="Cari"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="mb-2"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="statusFilter"
                label="Status"
                density="compact"
                variant="outlined"
                :items="['Semua', 'Belum Dibayar', 'Dibayar']"
                hide-details
                class="mb-2"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="sortBy"
                label="Urutkan"
                density="compact"
                variant="outlined"
                :items="[
                  { title: 'Terbaru', value: 'newest' },
                  { title: 'Terlama', value: 'oldest' },
                  { title: 'Nominal Tertinggi', value: 'highest' },
                  { title: 'Nominal Terendah', value: 'lowest' },
                ]"
                item-title="title"
                item-value="value"
                hide-details
                class="mb-2"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Invoice Cards -->
      <v-row>
        <v-col v-for="invoice in filteredInvoices" :key="invoice.id" cols="12" md="6">
          <v-card :class="{ 'border-success': invoice.status === 'Dibayar' }">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon :icon="invoice.status === 'Dibayar' ? 'mdi-check-circle' : 'mdi-clock-outline'"
                  :color="invoice.status === 'Dibayar' ? 'success' : 'warning'" size="large"></v-icon>
              </template>
              <v-card-title>{{ invoice.id }}</v-card-title>
              <v-card-subtitle>{{ formatDate(invoice.tanggalInvoice) }}</v-card-subtitle>

              <template v-slot:append>
                <div class="d-flex flex-column align-end">
                  <v-chip
                    :color="invoice.status === 'Dibayar' ? 'success' : 'warning'"
                    size="small"
                    class="mb-1"
                  >
                    {{ invoice.status }}
                  </v-chip>
                  <v-chip
                    v-if="invoice.isWalkIn"
                    color="info"
                    size="x-small"
                  >
                    Pelanggan Langsung
                  </v-chip>
                </div>
              </template>
            </v-card-item>

            <v-card-text>
              <div class="d-flex justify-space-between mb-2">
                <div class="text-subtitle-2">Pelanggan:</div>
                <div>{{ invoice.pelangganNama }}</div>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <div class="text-subtitle-2">Kendaraan:</div>
                <div>{{ invoice.nomorPolisi }}</div>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <div class="text-subtitle-2">Total:</div>
                <div class="text-h6">{{ formatCurrency(invoice.totalAmount) }}</div>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-btn variant="text" prepend-icon="mdi-eye" @click="viewInvoice(invoice.id)">
                Lihat
              </v-btn>
              <v-btn variant="text" prepend-icon="mdi-printer" @click="printInvoice(invoice)">
                Cetak
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                v-if="invoice.status === 'Belum Dibayar'"
                color="success"
                variant="tonal"
                @click="markAsPaid(invoice)"
              >
                Tandai Dibayar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllInvoices, updateInvoice } from '../stores/localStorage.js';
import { formatCurrency, formatDate, printInvoice as printInvoiceUtil } from '../utils/invoiceGenerator.js';

const router = useRouter();
const invoices = ref([]);
const isLoading = ref(true);

// Filter and sort state
const search = ref('');
const statusFilter = ref('Semua');
const sortBy = ref('newest');

// Snackbar state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');

// Computed properties
const filteredInvoices = computed(() => {
  let result = [...invoices.value];

  // Apply search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(invoice =>
      invoice.id.toLowerCase().includes(searchLower) ||
      invoice.pelangganNama.toLowerCase().includes(searchLower) ||
      invoice.nomorPolisi.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (statusFilter.value !== 'Semua') {
    result = result.filter(invoice => invoice.status === statusFilter.value);
  }

  // Apply sorting
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.tanggalInvoice) - new Date(a.tanggalInvoice));
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.tanggalInvoice) - new Date(b.tanggalInvoice));
      break;
    case 'highest':
      result.sort((a, b) => b.totalAmount - a.totalAmount);
      break;
    case 'lowest':
      result.sort((a, b) => a.totalAmount - b.totalAmount);
      break;
  }

  return result;
});

// Methods
function loadInvoices() {
  isLoading.value = true;
  try {
    invoices.value = getAllInvoices();
  } catch (error) {
    console.error('Error loading invoices:', error);
    showSnackbar('Gagal memuat daftar invoice', 'error');
  } finally {
    isLoading.value = false;
  }
}

function viewInvoice(id) {
  router.push(`/invoice/${id}`);
}

function printInvoice(invoice) {
  try {
    printInvoiceUtil(invoice);
    showSnackbar('Mencetak invoice...', 'info');
  } catch (error) {
    console.error('Error printing invoice:', error);
    showSnackbar('Gagal mencetak invoice', 'error');
  }
}

function markAsPaid(invoice) {
  try {
    updateInvoice(invoice.id, { status: 'Dibayar', tanggalPembayaran: new Date().toISOString() });
    showSnackbar('Invoice berhasil ditandai sebagai dibayar', 'success');
    loadInvoices(); // Reload invoices to reflect the change
  } catch (error) {
    console.error('Error updating invoice status:', error);
    showSnackbar('Gagal mengubah status invoice', 'error');
  }
}

function showSnackbar(text, color = 'info') {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

function createWalkInInvoice() {
  router.push('/invoice/walk-in');
}

// Lifecycle hooks
onMounted(() => {
  loadInvoices();
});
</script>

<style scoped>
.border-success {
  border-left: 4px solid rgb(var(--v-theme-success));
}
</style>
