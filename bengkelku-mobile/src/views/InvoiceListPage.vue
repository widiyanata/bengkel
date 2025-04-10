<template>
  <v-container>
    <!-- Enhanced Header with Card -->
    <v-card class="mb-4 header-card" variant="outlined">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-file-document-multiple" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">Manajemen Invoice</v-card-title>
        <v-card-subtitle>Kelola dan pantau semua invoice bengkel</v-card-subtitle>

        <template v-slot:append>
          <!-- Desktop buttons -->
          <div class="d-none d-sm-flex gap-2">
            <v-btn color="success" prepend-icon="mdi-account-cash" @click="createWalkInInvoice">
              Invoice Langsung
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadInvoices" :loading="isLoading">
              Refresh
            </v-btn>
          </div>

          <!-- Mobile buttons -->
          <div class="d-flex d-sm-none">
            <v-btn color="success" icon="mdi-account-cash" size="small" @click="createWalkInInvoice"></v-btn>
            <v-btn color="primary" icon="mdi-refresh" size="small" class="ms-2" @click="loadInvoices" :loading="isLoading"></v-btn>
          </div>
        </template>
      </v-card-item>
    </v-card>

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
      <!-- Enhanced Filter Controls -->
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
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="search"
                label="Cari Invoice"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="mb-2"
                clearable
                placeholder="Nomor invoice, nama pelanggan, plat..."
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="statusFilter"
                label="Status Pembayaran"
                density="compact"
                variant="outlined"
                :items="[
                  { title: 'Semua Status', value: 'Semua' },
                  { title: 'Belum Dibayar', value: 'Belum Dibayar' },
                  { title: 'Sudah Dibayar', value: 'Dibayar' }
                ]"
                item-title="title"
                item-value="value"
                hide-details
                class="mb-2"
                :menu-props="{ maxHeight: 300 }"
                prepend-inner-icon="mdi-cash-check"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="sortBy"
                label="Urutkan"
                density="compact"
                variant="outlined"
                :items="[
                  { title: 'Terbaru', value: 'newest', icon: 'mdi-sort-calendar-descending' },
                  { title: 'Terlama', value: 'oldest', icon: 'mdi-sort-calendar-ascending' },
                  { title: 'Nominal Tertinggi', value: 'highest', icon: 'mdi-sort-numeric-descending' },
                  { title: 'Nominal Terendah', value: 'lowest', icon: 'mdi-sort-numeric-ascending' },
                ]"
                item-title="title"
                item-value="value"
                hide-details
                class="mb-2"
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

      <!-- Enhanced Invoice Cards with Animation -->
      <v-row>
        <v-col v-for="invoice in filteredInvoices" :key="invoice.id" cols="12" sm="6" lg="4">
          <v-card
            :class="{
              'invoice-card': true,
              'paid-invoice': invoice.status === 'Dibayar',
              'unpaid-invoice': invoice.status !== 'Dibayar'
            }"
            variant="outlined"
            elevation="2"
            @click="viewInvoice(invoice.id)"
            class="position-relative transition-swing"
          >
            <!-- Status Badge -->
            <div class="status-badge" :class="invoice.status === 'Dibayar' ? 'paid-badge' : 'unpaid-badge'">
              <v-icon size="small" :icon="invoice.status === 'Dibayar' ? 'mdi-check' : 'mdi-clock-outline'"></v-icon>
              {{ invoice.status }}
            </div>

            <!-- Walk-in Badge if applicable -->
            <div v-if="invoice.isWalkIn" class="walkin-badge">
              <v-icon size="x-small" icon="mdi-account-arrow-right"></v-icon>
              Langsung
            </div>

            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-3" class="invoice-avatar">
                  <v-icon
                    :icon="invoice.status === 'Dibayar' ? 'mdi-file-check-outline' : 'mdi-file-clock-outline'"
                    :color="invoice.status === 'Dibayar' ? 'success' : 'warning'"
                  ></v-icon>
                </v-avatar>
              </template>
              <v-card-title class="text-truncate">{{ invoice.id }}</v-card-title>
              <v-card-subtitle>
                <v-icon size="x-small" icon="mdi-calendar" class="me-1"></v-icon>
                {{ formatDate(invoice.tanggalInvoice) }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="grey" class="me-2">mdi-account</v-icon>
                <div class="text-truncate">{{ invoice.pelangganNama }}</div>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="grey" class="me-2">mdi-car</v-icon>
                <div class="text-truncate">{{ invoice.nomorPolisi || 'Tidak ada' }}</div>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="grey" class="me-2">mdi-tag-multiple</v-icon>
                <div class="text-truncate">{{ invoice.items?.length || 0 }} item</div>
              </div>
              <div class="d-flex justify-space-between align-center mt-4">
                <div class="text-subtitle-2">Total:</div>
                <div class="text-h6 font-weight-bold">{{ formatCurrency(invoice.totalAmount) }}</div>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-btn variant="text" density="comfortable" prepend-icon="mdi-eye" @click.stop="viewInvoice(invoice.id)">
                Lihat
              </v-btn>
              <v-btn variant="text" density="comfortable" prepend-icon="mdi-printer" @click.stop="printInvoice(invoice)">
                Cetak
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                v-if="invoice.status === 'Belum Dibayar'"
                color="success"
                variant="tonal"
                density="comfortable"
                @click.stop="markAsPaid(invoice)"
              >
                <v-icon start>mdi-cash-check</v-icon>
                Dibayar
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
import { ref, computed, onMounted, watch } from 'vue';
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
const showFilterOptions = ref(true); // For mobile filter toggle

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
/* Header card styles */
.header-card {
  background-color: rgba(var(--v-theme-surface-variant), 0.7);
  transition: all 0.3s ease;
}

/* Filter toggle animation */
.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* Invoice card styles */
.invoice-card {
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.invoice-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

.paid-invoice {
  border-left: 4px solid var(--v-theme-success) !important;
}

.unpaid-invoice {
  border-left: 4px solid var(--v-theme-warning) !important;
}

.invoice-avatar {
  transition: all 0.3s ease;
}

.invoice-card:hover .invoice-avatar {
  transform: scale(1.1);
}

/* Status badge */
.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  font-size: 0.75rem;
  border-bottom-left-radius: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.paid-badge {
  background-color: rgba(var(--v-theme-success), 0.15);
  color: var(--v-theme-success);
}

.unpaid-badge {
  background-color: rgba(var(--v-theme-warning), 0.15);
  color: var(--v-theme-warning);
}

/* Walk-in badge */
.walkin-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 8px;
  font-size: 0.7rem;
  border-bottom-right-radius: 8px;
  background-color: rgba(var(--v-theme-info), 0.15);
  color: var(--v-theme-info);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-card-title {
    font-size: 1rem !important;
  }

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


