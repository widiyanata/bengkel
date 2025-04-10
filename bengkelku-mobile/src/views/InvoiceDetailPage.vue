<template>
  <v-container>
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="d-flex justify-center my-5">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="!invoice" type="error" class="my-5">
      Invoice tidak ditemukan atau telah dihapus.
      <div class="mt-4">
        <v-btn color="primary" to="/invoice">Kembali ke Daftar Invoice</v-btn>
      </div>
    </v-alert>

    <!-- Invoice Detail -->
    <div v-else>
      <!-- Enhanced Header with Card -->
      <v-card class="mb-4 header-card" variant="flat">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon size="large" :icon="isEditMode ? 'mdi-file-edit-outline' : 'mdi-file-document-outline'" color="primary" class="me-3"></v-icon>
          </template>
          <v-card-title class="text-h5">{{ isEditMode ? 'Edit Invoice' : 'Detail Invoice' }}</v-card-title>
          <v-card-subtitle>{{ invoice.id }}</v-card-subtitle>

          <template v-slot:append>
            <!-- Desktop buttons -->
            <div class="d-none d-sm-flex gap-2">
              <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="me-2"></v-btn>
              <template v-if="!isEditMode">
                <v-btn color="primary" prepend-icon="mdi-printer" @click="printInvoice">
                  Cetak
                </v-btn>
                <v-btn color="info" prepend-icon="mdi-download" @click="downloadInvoice" class="ms-2">
                  Download
                </v-btn>
                <v-btn
                  v-if="invoice.status !== 'Dibayar'"
                  color="warning"
                  prepend-icon="mdi-pencil"
                  @click="startEdit"
                  class="ms-2"
                >
                  Edit
                </v-btn>
              </template>
              <template v-else>
                <v-btn color="success" prepend-icon="mdi-content-save" @click="saveChanges" :loading="isSaving">
                  Simpan
                </v-btn>
                <v-btn color="error" prepend-icon="mdi-close" @click="cancelEdit" class="ms-2">
                  Batal
                </v-btn>
              </template>
            </div>

            <!-- Mobile buttons -->
            <div class="d-flex d-sm-none gap-1">
              <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="goBack"></v-btn>
              <template v-if="!isEditMode">
                <v-btn color="primary" icon="mdi-printer" size="small" @click="printInvoice"></v-btn>
                <v-btn color="info" icon="mdi-download" size="small" @click="downloadInvoice"></v-btn>
                <v-btn
                  v-if="invoice.status !== 'Dibayar'"
                  color="warning"
                  icon="mdi-pencil"
                  size="small"
                  @click="startEdit"
                ></v-btn>
              </template>
              <template v-else>
                <v-btn color="success" icon="mdi-content-save" size="small" @click="saveChanges" :loading="isSaving"></v-btn>
                <v-btn color="error" icon="mdi-close" size="small" @click="cancelEdit"></v-btn>
              </template>
            </div>
          </template>
        </v-card-item>
      </v-card>

      <!-- Enhanced Invoice Status Card -->
      <v-card
        class="mb-4 status-card"
        :class="invoice.status === 'Dibayar' ? 'paid-card' : 'unpaid-card'"
        variant="flat"
      >
        <div class="status-indicator"></div>
        <v-card-item>
          <v-row>
            <v-col cols="12" sm="4" class="d-flex align-center">
              <v-avatar
                :color="invoice.status === 'Dibayar' ? 'success-lighten-4' : 'warning-lighten-4'"
                class="me-4"
                size="large"
              >
                <v-icon
                  :icon="invoice.status === 'Dibayar' ? 'mdi-check-circle' : 'mdi-clock-outline'"
                  :color="invoice.status === 'Dibayar' ? 'success' : 'warning'"
                  size="large"
                ></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-medium">Status</div>
                <div class="d-flex align-center">
                  <v-chip
                    :color="invoice.status === 'Dibayar' ? 'success' : 'warning'"
                    size="small"
                    class="font-weight-medium"
                  >
                    {{ invoice.status }}
                  </v-chip>
                  <v-chip
                    v-if="invoice.isWalkIn"
                    color="info"
                    size="x-small"
                    class="ms-2"
                  >
                    Pelanggan Langsung
                  </v-chip>
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="4" class="d-flex align-center">
              <v-avatar color="primary-lighten-4" class="me-4" size="large">
                <v-icon icon="mdi-calendar" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-medium">Tanggal</div>
                <div>{{ formatDate(invoice.tanggalInvoice) }}</div>
              </div>
            </v-col>

            <v-col cols="12" sm="4" class="d-flex align-center">
              <v-avatar color="success-lighten-4" class="me-4" size="large">
                <v-icon icon="mdi-cash-multiple" color="success"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-medium">Total</div>
                <div class="text-h6 font-weight-bold">{{ formatCurrency(invoice.totalAmount) }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-item>

        <!-- Mark as Paid Button (if not paid) -->
        <v-card-actions v-if="invoice.status !== 'Dibayar' && !isEditMode">
          <v-spacer></v-spacer>
          <v-btn color="success" prepend-icon="mdi-cash-check" @click="markAsPaid">
            Tandai Sudah Dibayar
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Enhanced Info Cards -->
      <v-row class="mb-4">
        <!-- Workshop Info -->
        <v-col cols="12" md="4">
          <v-card height="100%" variant="flat" class="info-card workshop-card">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="primary-lighten-4" size="large">
                  <v-icon icon="mdi-store" color="primary"></v-icon>
                </v-avatar>
              </template>
              <v-card-title>Informasi Bengkel</v-card-title>
            </v-card-item>
            <v-card-text>
              <div class="text-h6 mb-2">{{ invoice.workshopInfo.nama }}</div>
              <div class="d-flex align-center mb-1" v-if="invoice.workshopInfo.alamat">
                <v-icon size="small" color="grey" class="me-2">mdi-map-marker</v-icon>
                <div>{{ invoice.workshopInfo.alamat }}</div>
              </div>
              <div class="d-flex align-center" v-if="invoice.workshopInfo.telepon">
                <v-icon size="small" color="grey" class="me-2">mdi-phone</v-icon>
                <div>{{ invoice.workshopInfo.telepon }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Customer Info -->
        <v-col cols="12" md="4">
          <v-card height="100%" variant="flat" class="info-card customer-card">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="info-lighten-4" size="large">
                  <v-icon icon="mdi-account" color="info"></v-icon>
                </v-avatar>
              </template>
              <v-card-title>Informasi Pelanggan</v-card-title>

              <template v-if="isEditMode && invoice.isWalkIn" v-slot:append>
                <v-btn icon="mdi-pencil" size="small" color="info" variant="text" @click="showCustomerEdit = true"></v-btn>
              </template>
            </v-card-item>

            <v-card-text>
              <div v-if="!isEditMode || !invoice.isWalkIn || !showCustomerEdit">
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" color="grey" class="me-2">mdi-account-outline</v-icon>
                  <div>{{ invoice.pelangganNama }}</div>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="small" color="grey" class="me-2">mdi-phone-outline</v-icon>
                  <div>{{ invoice.pelangganNoHp || 'Tidak ada' }}</div>
                </div>
              </div>
              <div v-else>
                <v-text-field
                  v-model="invoice.pelangganNama"
                  label="Nama Pelanggan"
                  variant="flat"
                  density="compact"
                  class="mb-2"
                  prepend-inner-icon="mdi-account-outline"
                ></v-text-field>
                <v-text-field
                  v-model="invoice.pelangganNoHp"
                  label="No. HP"
                  variant="flat"
                  density="compact"
                  prepend-inner-icon="mdi-phone-outline"
                ></v-text-field>
                <div class="d-flex justify-end mt-2">
                  <v-btn size="small" color="info" @click="showCustomerEdit = false">Selesai</v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Vehicle Info -->
        <v-col cols="12" md="4">
          <v-card height="100%" variant="flat" class="info-card vehicle-card">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="secondary-lighten-4" size="large">
                  <v-icon icon="mdi-car" color="secondary"></v-icon>
                </v-avatar>
              </template>
              <v-card-title>Informasi Kendaraan</v-card-title>

              <template v-if="isEditMode && invoice.isWalkIn" v-slot:append>
                <v-btn icon="mdi-pencil" size="small" color="secondary" variant="text" @click="showVehicleEdit = true"></v-btn>
              </template>
            </v-card-item>

            <v-card-text>
              <div v-if="!isEditMode || !invoice.isWalkIn || !showVehicleEdit">
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" color="grey" class="me-2">mdi-car-info</v-icon>
                  <div>{{ invoice.nomorPolisi || 'Tidak ada' }}</div>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" color="grey" class="me-2">mdi-car-cog</v-icon>
                  <div>{{ invoice.merkTipe || 'Tidak ada' }}</div>
                </div>
                <div class="d-flex align-center" v-if="invoice.tanggalServis">
                  <v-icon size="small" color="grey" class="me-2">mdi-calendar-check</v-icon>
                  <div>{{ formatDate(invoice.tanggalServis) }}</div>
                </div>
              </div>
              <div v-else>
                <v-text-field
                  v-model="invoice.nomorPolisi"
                  label="Nomor Polisi"
                  variant="flat"
                  density="compact"
                  class="mb-2"
                  prepend-inner-icon="mdi-car-info"
                ></v-text-field>
                <v-text-field
                  v-model="invoice.merkTipe"
                  label="Merk/Tipe"
                  variant="flat"
                  density="compact"
                  prepend-inner-icon="mdi-car-cog"
                ></v-text-field>
                <div class="d-flex justify-end mt-2">
                  <v-btn size="small" color="secondary" @click="showVehicleEdit = false">Selesai</v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Enhanced Invoice Items -->
      <v-card class="mb-4" variant="flat">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="primary-lighten-4" size="large">
              <v-icon icon="mdi-format-list-checks" color="primary"></v-icon>
            </v-avatar>
          </template>
          <v-card-title>Detail Item & Jasa</v-card-title>

          <template v-slot:append>
            <v-btn
              v-if="isEditMode"
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
              @click="openAddItemDialog"
            >
              Tambah Item
            </v-btn>
          </template>
        </v-card-item>

        <v-divider></v-divider>

        <!-- Mobile View: Cards for each item -->
        <div class="d-block d-md-none">
          <v-card-text v-if="invoice.items.length === 0" class="text-center pa-4">
            <v-icon icon="mdi-package-variant-closed" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
            <div class="text-body-1">Belum ada item</div>
          </v-card-text>

          <v-list v-else>
            <v-list-item
              v-for="(item, index) in invoice.items"
              :key="index"
              :class="{'item-card': true, 'jasa-item': item.type === 'jasa', 'part-item': item.type === 'part'}"
            >
              <template v-slot:prepend>
                <v-avatar :color="item.type === 'jasa' ? 'info-lighten-4' : 'success-lighten-4'" size="small">
                  <v-icon
                    :icon="item.type === 'jasa' ? 'mdi-wrench' : 'mdi-car-cog'"
                    :color="item.type === 'jasa' ? 'info' : 'success'"
                    size="small"
                  ></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="d-flex justify-space-between align-center">
                <span>{{ item.deskripsi }}</span>
                <v-chip size="x-small" :color="item.type === 'jasa' ? 'info' : 'success'" class="ms-2">
                  {{ item.type === 'jasa' ? 'Jasa' : 'Part' }}
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle class="d-flex justify-space-between mt-2">
                <span>{{ item.jumlah }} x {{ formatCurrency(item.biaya) }}</span>
                <strong>{{ formatCurrency(item.subtotal) }}</strong>
              </v-list-item-subtitle>

              <template v-if="isEditMode" v-slot:append>
                <div class="d-flex">
                  <v-btn icon="mdi-pencil" size="x-small" color="warning" variant="text" @click="openEditItemDialog(index)" class="me-1"></v-btn>
                  <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="removeItem(index)"></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <!-- Desktop View: Table for items -->
        <div class="d-none d-md-block">
          <v-card-text v-if="invoice.items.length === 0" class="text-center pa-4">
            <v-icon icon="mdi-package-variant-closed" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
            <div class="text-body-1">Belum ada item</div>
          </v-card-text>

          <v-table v-else>
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th class="text-center">Jumlah</th>
                <th class="text-right">Harga</th>
                <th class="text-right">Subtotal</th>
                <th v-if="isEditMode" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in invoice.items" :key="index" :class="{'jasa-row': item.type === 'jasa', 'part-row': item.type === 'part'}">
                <td>
                  <div class="d-flex align-center">
                    <v-avatar :color="item.type === 'jasa' ? 'info-lighten-4' : 'success-lighten-4'" size="small" class="me-2">
                      <v-icon
                        :icon="item.type === 'jasa' ? 'mdi-wrench' : 'mdi-car-cog'"
                        :color="item.type === 'jasa' ? 'info' : 'success'"
                        size="x-small"
                      ></v-icon>
                    </v-avatar>
                    {{ item.deskripsi }}
                    <v-chip size="x-small" :color="item.type === 'jasa' ? 'info' : 'success'" class="ms-2">
                      {{ item.type === 'jasa' ? 'Jasa' : 'Part' }}
                    </v-chip>
                  </div>
                </td>
                <td class="text-center">{{ item.jumlah }}</td>
                <td class="text-right">{{ formatCurrency(item.biaya) }}</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(item.subtotal) }}</td>
                <td v-if="isEditMode" class="text-center">
                  <v-btn icon="mdi-pencil" size="x-small" color="warning" variant="text" @click="openEditItemDialog(index)" class="me-1"></v-btn>
                  <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="removeItem(index)"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>

      <!-- Enhanced Totals Card -->
      <v-card class="mb-4 total-card" variant="flat">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="success-lighten-4" size="large">
              <v-icon icon="mdi-cash-multiple" color="success"></v-icon>
            </v-avatar>
          </template>
          <v-card-title>Ringkasan Biaya</v-card-title>
        </v-card-item>

        <v-divider></v-divider>

        <v-card-text>
          <v-row>
            <!-- Left side: Summary details -->
            <v-col cols="12" md="8">
              <div class="d-flex justify-space-between align-center py-2">
                <div class="text-subtitle-1 d-flex align-center">
                  <v-icon size="small" color="info" class="me-2">mdi-wrench</v-icon>
                  Total Jasa:
                </div>
                <div class="text-subtitle-1">{{ formatCurrency(jasaTotal) }}</div>
              </div>

              <div class="d-flex justify-space-between align-center py-2">
                <div class="text-subtitle-1 d-flex align-center">
                  <v-icon size="small" color="success" class="me-2">mdi-car-cog</v-icon>
                  Total Sparepart:
                </div>
                <div class="text-subtitle-1">{{ formatCurrency(partsTotal) }}</div>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="d-flex justify-space-between align-center py-2">
                <div class="text-h6 font-weight-bold">TOTAL:</div>
                <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(totalAmount) }}</div>
              </div>
            </v-col>

            <!-- Right side: Payment status -->
            <v-col cols="12" md="4" class="d-flex align-center justify-center">
              <v-card
                :color="invoice.status === 'Dibayar' ? 'success-lighten-5' : 'warning-lighten-5'"
                class="payment-status-card text-center pa-4 w-100"
                variant="flat"
                rounded="lg"
              >
                <v-icon
                  :icon="invoice.status === 'Dibayar' ? 'mdi-check-circle' : 'mdi-clock-outline'"
                  :color="invoice.status === 'Dibayar' ? 'success' : 'warning'"
                  size="x-large"
                  class="mb-2"
                ></v-icon>
                <div class="text-subtitle-1 font-weight-medium">Status Pembayaran</div>
                <v-chip
                  :color="invoice.status === 'Dibayar' ? 'success' : 'warning'"
                  size="small"
                  class="mt-2"
                >
                  {{ invoice.status }}
                </v-chip>
                <div v-if="invoice.status === 'Dibayar'" class="mt-2 text-caption">
                  <v-icon size="x-small" icon="mdi-calendar-check" class="me-1"></v-icon>
                  {{ formatDate(invoice.tanggalPembayaran) }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Enhanced Notes Card -->
      <v-card class="mb-4 notes-card" variant="flat">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-3" size="large">
              <v-icon icon="mdi-note-text" color="grey-darken-2"></v-icon>
            </v-avatar>
          </template>
          <v-card-title>Catatan</v-card-title>

          <template v-if="isEditMode" v-slot:append>
            <v-btn icon="mdi-pencil" size="small" color="grey" variant="text" @click="showNotesEdit = !showNotesEdit"></v-btn>
          </template>
        </v-card-item>

        <v-divider></v-divider>

        <v-card-text>
          <div v-if="!isEditMode || !showNotesEdit" class="pa-2">
            <div v-if="invoice.catatan" class="notes-content">
              <v-icon size="small" color="grey" class="me-2 float-left">mdi-format-quote-open</v-icon>
              {{ invoice.catatan }}
              <v-icon size="small" color="grey" class="ms-2 float-right">mdi-format-quote-close</v-icon>
            </div>
            <div v-else class="text-center text-grey pa-4">
              <v-icon icon="mdi-note-off" size="large" color="grey-lighten-2" class="mb-2"></v-icon>
              <div>Tidak ada catatan</div>
            </div>
          </div>
          <div v-else>
            <v-textarea
              v-model="invoice.catatan"
              label="Catatan"
              variant="flat"
              rows="3"
              counter
              maxlength="500"
              placeholder="Tambahkan catatan tentang invoice ini..."
              prepend-inner-icon="mdi-pencil"
              hide-details="auto"
            ></v-textarea>
            <div class="d-flex justify-end mt-2">
              <v-btn size="small" color="grey" @click="showNotesEdit = false">Selesai</v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>



      <!-- Enhanced Actions Card -->
      <v-card class="mb-4 actions-card" variant="flat">
        <v-card-item>
          <template v-slot:prepend>
            <v-avatar color="primary-lighten-4" size="large">
              <v-icon icon="mdi-cog" color="primary"></v-icon>
            </v-avatar>
          </template>
          <v-card-title>Tindakan</v-card-title>
        </v-card-item>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="6" class="d-flex justify-center mb-4 mb-sm-0">
              <v-btn
                color="primary"
                prepend-icon="mdi-printer"
                size="large"
                block
                @click="printInvoice"
                class="action-button"
              >
                Cetak Invoice
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex justify-center">
              <v-btn
                color="info"
                prepend-icon="mdi-download"
                size="large"
                block
                @click="downloadInvoice"
                class="action-button"
              >
                Download PDF
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Add/Edit Item Dialog -->
    <v-dialog v-model="showAddItemDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingItemIndex === -1 ? 'Tambah Item' : 'Edit Item' }}</v-card-title>
        <v-card-text>
          <v-radio-group v-model="newItem.type" inline class="mb-3">
            <v-radio value="jasa" label="Jasa"></v-radio>
            <v-radio value="part" label="Sparepart"></v-radio>
          </v-radio-group>

          <!-- Jasa Selection -->
          <div v-if="newItem.type === 'jasa'">
            <v-autocomplete
              v-model="selectedJasa"
              :items="predefinedJasaItems"
              item-title="title"
              item-value="deskripsi"
              label="Pilih Jasa (Opsional)"
              return-object
              clearable
              variant="flat"
              class="mb-3"
              @update:model-value="onJasaSelectionChange"
            ></v-autocomplete>

            <v-text-field
              v-model="newItem.deskripsi"
              label="Deskripsi Jasa*"
              variant="flat"
              density="comfortable"
              class="mb-3"
              :rules="[v => !!v || 'Deskripsi wajib diisi']"
            ></v-text-field>

            <!-- Quick Price Buttons for Jasa -->
            <div class="d-flex flex-wrap mb-3">
              <v-btn size="small" variant="flat" class="mr-2 mb-2" @click="newItem.biaya = 10000">10rb</v-btn>
              <v-btn size="small" variant="flat" class="mr-2 mb-2" @click="newItem.biaya = 15000">15rb</v-btn>
              <v-btn size="small" variant="flat" class="mr-2 mb-2" @click="newItem.biaya = 20000">20rb</v-btn>
              <v-btn size="small" variant="flat" class="mr-2 mb-2" @click="newItem.biaya = 25000">25rb</v-btn>
              <v-btn size="small" variant="flat" class="mr-2 mb-2" @click="newItem.biaya = 50000">50rb</v-btn>
            </div>
          </div>

          <!-- Part Selection -->
          <div v-else>
            <v-autocomplete
              v-model="selectedItem"
              :items="availableItems"
              item-title="title"
              label="Pilih Sparepart*"
              return-object
              variant="flat"
              class="mb-3"
              :loading="isLoadingItems"
              :rules="[v => !!v || 'Sparepart wajib dipilih']"
              @update:model-value="onItemSelectionChange"
            ></v-autocomplete>

            <div v-if="selectedItem" class="mb-3 text-caption">
              Stok tersedia: {{ selectedItem.stokSaatIni }} {{ selectedItem.satuan }}
            </div>
          </div>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.jumlah"
                label="Jumlah*"
                variant="flat"
                density="comfortable"
                type="number"
                min="1"
                :rules="[
                  v => v > 0 || 'Jumlah harus lebih dari 0',
                  v => newItem.type !== 'part' || !selectedItem || v <= selectedItem.stokSaatIni || `Stok hanya ${selectedItem.stokSaatIni}`
                ]"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.biaya"
                label="Harga Satuan*"
                variant="flat"
                density="comfortable"
                type="number"
                min="0"
                :rules="[v => v >= 0 || 'Harga tidak boleh negatif']"
              ></v-text-field>
            </v-col>
          </v-row>

          <div class="text-subtitle-1 mb-2">Subtotal: {{ formatCurrency(newItemSubtotal) }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="showAddItemDialog = false">Batal</v-btn>
          <v-btn
            color="primary"
            @click="saveItem"
            :disabled="!isItemValid"
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getInvoiceById, updateInvoice, getAllItems } from '../stores/localStorage.js';
import {
  formatCurrency,
  formatDate,
  printInvoice as printInvoiceUtil,
  downloadInvoice as downloadInvoiceUtil
} from '../utils/invoiceGenerator.js';

const props = defineProps({
  id: { type: String, required: true }
});

const router = useRouter();
const invoice = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isEditMode = ref(false);

// UI state for enhanced editing
const showCustomerEdit = ref(false);
const showVehicleEdit = ref(false);
const showNotesEdit = ref(false);

// Backup of original invoice data for canceling edits
const originalInvoice = ref(null);

// Snackbar state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');

// Add/edit item dialog
const showAddItemDialog = ref(false);
const editingItemIndex = ref(-1);
const newItem = reactive({
  type: 'jasa',
  deskripsi: '',
  jumlah: 1,
  biaya: 0
});

// Available items data
const availableItems = ref([]);
const selectedItem = ref(null);
const selectedJasa = ref(null);
const isLoadingItems = ref(false);

// Predefined jasa items
const predefinedJasaItems = ref([
  { title: 'Jasa Ganti Oli Mesin', deskripsi: 'Jasa Ganti Oli Mesin', biaya: 25000 },
  { title: 'Jasa Servis Ringan', deskripsi: 'Jasa Servis Ringan (Cek + Setel)', biaya: 50000 },
  { title: 'Jasa Ganti Busi', deskripsi: 'Jasa Ganti Busi', biaya: 15000 },
  { title: 'Jasa Tambal Ban Tubeless', deskripsi: 'Jasa Tambal Ban Tubeless', biaya: 20000 },
  { title: 'Jasa Ganti Kampas Rem Depan', deskripsi: 'Jasa Ganti Kampas Rem Depan', biaya: 20000 },
  { title: 'Jasa Ganti Kampas Rem Belakang', deskripsi: 'Jasa Ganti Kampas Rem Belakang', biaya: 25000 },
  { title: 'Jasa Ganti Oli Gardan', deskripsi: 'Jasa Ganti Oli Gardan', biaya: 10000 },
]);

// Computed properties
const newItemSubtotal = computed(() => {
  return (newItem.jumlah || 0) * (newItem.biaya || 0);
});

const totalAmount = computed(() => {
  if (!invoice.value || !invoice.value.items) return 0;
  return invoice.value.items.reduce((sum, item) => sum + item.subtotal, 0);
});

const jasaTotal = computed(() => {
  if (!invoice.value || !invoice.value.items) return 0;
  return invoice.value.items
    .filter(item => item.type === 'jasa')
    .reduce((sum, item) => sum + item.subtotal, 0);
});

const partsTotal = computed(() => {
  if (!invoice.value || !invoice.value.items) return 0;
  return invoice.value.items
    .filter(item => item.type === 'part')
    .reduce((sum, item) => sum + item.subtotal, 0);
});

// Computed property to validate item form
const isItemValid = computed(() => {
  if (!newItem.deskripsi || newItem.jumlah <= 0 || newItem.biaya < 0) {
    return false;
  }

  // For parts, we need to validate the selected item and stock
  if (newItem.type === 'part') {
    if (!selectedItem.value) return false;
    if (newItem.jumlah > selectedItem.value.stokSaatIni) return false;
  }

  return true;
});

// Methods
function loadInvoice() {
  isLoading.value = true;
  try {
    invoice.value = getInvoiceById(props.id);
    if (!invoice.value) {
      showSnackbar('Invoice tidak ditemukan', 'error');
    }
  } catch (error) {
    console.error('Error loading invoice:', error);
    showSnackbar('Gagal memuat detail invoice', 'error');
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.push('/invoice');
}

function printInvoice() {
  try {
    printInvoiceUtil(invoice.value);
    showSnackbar('Mencetak invoice...', 'info');
  } catch (error) {
    console.error('Error printing invoice:', error);
    showSnackbar('Gagal mencetak invoice', 'error');
  }
}

function downloadInvoice() {
  try {
    downloadInvoiceUtil(invoice.value);
    showSnackbar('Mengunduh invoice...', 'info');
  } catch (error) {
    console.error('Error downloading invoice:', error);
    showSnackbar('Gagal mengunduh invoice', 'error');
  }
}

function markAsPaid() {
  try {
    updateInvoice(invoice.value.id, {
      status: 'Dibayar',
      tanggalPembayaran: new Date().toISOString()
    });
    showSnackbar('Invoice berhasil ditandai sebagai dibayar', 'success');
    loadInvoice(); // Reload invoice to reflect the change
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

// Edit mode functions
function startEdit() {
  if (invoice.value.status === 'Dibayar') {
    showSnackbar('Invoice yang sudah dibayar tidak dapat diedit', 'error');
    return;
  }

  // Create a deep copy of the invoice for backup
  originalInvoice.value = JSON.parse(JSON.stringify(invoice.value));
  isEditMode.value = true;
}

function cancelEdit() {
  // Restore original invoice data
  if (originalInvoice.value) {
    invoice.value = JSON.parse(JSON.stringify(originalInvoice.value));
  }
  isEditMode.value = false;
  originalInvoice.value = null;
}

function saveChanges() {
  isSaving.value = true;

  try {
    // Update totals before saving
    invoice.value.jasaTotal = jasaTotal.value;
    invoice.value.partsTotal = partsTotal.value;
    invoice.value.totalAmount = totalAmount.value;

    // Save changes to localStorage
    updateInvoice(invoice.value.id, invoice.value);

    showSnackbar('Invoice berhasil diperbarui', 'success');
    isEditMode.value = false;
    originalInvoice.value = null;
  } catch (error) {
    console.error('Error saving invoice:', error);
    showSnackbar('Gagal menyimpan perubahan', 'error');
  } finally {
    isSaving.value = false;
  }
}

// Item management functions
function openAddItemDialog() {
  resetNewItem();
  editingItemIndex.value = -1;
  showAddItemDialog.value = true;
}

function openEditItemDialog(index) {
  const item = invoice.value.items[index];
  newItem.type = item.type;
  newItem.deskripsi = item.deskripsi;
  newItem.jumlah = item.jumlah;
  newItem.biaya = item.biaya;

  // Reset selection
  selectedItem.value = null;
  selectedJasa.value = null;

  // If it's a part, try to find the matching part in availableItems
  if (item.type === 'part') {
    const matchingPart = availableItems.value.find(part => part.nama === item.deskripsi);
    if (matchingPart) {
      selectedItem.value = matchingPart;
    }
  }

  editingItemIndex.value = index;
  showAddItemDialog.value = true;
}

function removeItem(index) {
  invoice.value.items.splice(index, 1);
}

function resetNewItem() {
  newItem.type = 'jasa';
  newItem.deskripsi = '';
  newItem.jumlah = 1;
  newItem.biaya = 0;
  selectedItem.value = null;
  selectedJasa.value = null;
}

function saveItem() {
  // Validate form
  if (!isItemValid.value) {
    return;
  }

  // For parts, ensure we have a selected item
  if (newItem.type === 'part' && !selectedItem.value) {
    showSnackbar('Pilih sparepart terlebih dahulu', 'warning');
    return;
  }

  // Create the item object
  const item = {
    type: newItem.type,
    deskripsi: newItem.deskripsi,
    jumlah: Number(newItem.jumlah),
    biaya: Number(newItem.biaya),
    subtotal: Number(newItem.jumlah) * Number(newItem.biaya)
  };

  // For parts, add additional information
  if (newItem.type === 'part' && selectedItem.value) {
    item.partId = selectedItem.value.id;
    item.kode = selectedItem.value.kode;
    item.satuan = selectedItem.value.satuan;
  }

  if (editingItemIndex.value === -1) {
    // Add new item
    invoice.value.items.push(item);
  } else {
    // Update existing item
    invoice.value.items[editingItemIndex.value] = item;
  }

  showAddItemDialog.value = false;
  resetNewItem();
}

// Load available items
function loadAvailableItems() {
  isLoadingItems.value = true;
  try {
    availableItems.value = getAllItems().map(item => ({
      id: item.id,
      nama: item.nama,
      satuan: item.satuan,
      kode: item.kode,
      stokSaatIni: item.stokSaatIni,
      hargaJual: item.hargaJual,
      title: `${item.nama} (${item.kode || 'N/A'})` // For display in autocomplete
    })).sort((a, b) => a.nama.localeCompare(b.nama));
  } catch (error) {
    console.error('Error loading available items:', error);
    showSnackbar('Gagal memuat daftar barang', 'error');
  } finally {
    isLoadingItems.value = false;
  }
}

// Handle item selection
function onItemSelectionChange() {
  if (selectedItem.value) {
    newItem.deskripsi = selectedItem.value.nama;
    newItem.biaya = selectedItem.value.hargaJual;
    newItem.jumlah = 1;
  }
}

// Handle jasa selection
function onJasaSelectionChange(selected) {
  if (selected) {
    newItem.deskripsi = selected.deskripsi;
    newItem.biaya = selected.biaya;
  }
}

// Watch for item type changes to reset form
watch(() => newItem.type, () => {
  // Reset selection and fields when switching between jasa and part
  selectedItem.value = null;
  selectedJasa.value = null;
  newItem.deskripsi = '';
  newItem.biaya = 0;
  newItem.jumlah = 1;
});

// Lifecycle hooks
onMounted(() => {
  loadInvoice();
  loadAvailableItems();
});
</script>

<style scoped>
/* Header card styles */
.header-card {
  background-color: rgba(var(--v-theme-surface-variant), 0.7);
  transition: all 0.3s ease;
}

/* Status card styles */
.status-card {
  position: relative;
  overflow: hidden;
}

.status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.paid-card .status-indicator {
  background-color: var(--v-theme-success);
}

.unpaid-card .status-indicator {
  background-color: var(--v-theme-warning);
}

/* Info card styles */
.info-card {
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.workshop-card {
  border-top: 2px solid rgb(var(--v-theme-primary)) !important;
}

.customer-card {
  border-top: 2px solid rgb(var(--v-theme-info)) !important;
}

.vehicle-card {
  border-top: 2px solid rgb(var(--v-theme-secondary)) !important;
}

/* Item styles */
.item-card {
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.jasa-item {
  border-left-color: rgb(var(--v-theme-info)) !important;
}

.part-item {
  border-left-color: var(--v-theme-success) !important;
}

.jasa-row {
  background-color: rgba(rgb(var(--v-theme-info)), 0.05);
}

.part-row {
  background-color: rgba(var(--v-theme-success), 0.05);
}

/* Notes styles */
.notes-content {
  padding: 16px;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  position: relative;
}

/* Action button styles */
.action-button {
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
}

/* Payment status card */
.payment-status-card {
  border-radius: 12px;
  transition: all 0.3s ease;
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

  .text-h5 {
    font-size: 1.1rem !important;
  }

  .v-btn {
    padding: 0 8px !important;
  }
}
</style>
