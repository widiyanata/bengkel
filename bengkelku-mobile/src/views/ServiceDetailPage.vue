<template>
  <v-container>
    <div v-if="service && !loading">
      <!-- Breadcrumb Navigation -->
      <div class="d-flex align-center mb-3">
        <v-btn variant="text" density="compact" icon="mdi-arrow-left" @click="goBack" class="me-2"></v-btn>
        <div class="text-grey">Daftar Servis</div>
        <v-icon size="small" class="mx-1">mdi-chevron-right</v-icon>
        <div class="font-weight-medium">Detail Servis</div>
      </div>

      <!-- Enhanced Header -->
      <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-4 gap-2">
        <div>
          <h1 class="text-h4 mb-1">{{ service.nomorPolisi }}</h1>
          <div class="text-subtitle-1 text-medium-emphasis">{{ service.customerName || 'Pelanggan Tidak Diketahui' }}</div>
        </div>
        <div class="d-flex align-center">
          <v-chip
            :color="getStatusColor(service.status)"
            :prepend-icon="getStatusIcon(service.status)"
            size="large"
            label
            class="status-chip"
          >
            {{ service.status }}
          </v-chip>
        </div>
      </div>

      <!-- Customer & Vehicle Info -->
      <v-card variant="outlined" class="mb-4 info-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-car-info" color="primary" class="me-2"></v-icon>
          </template>
          <v-card-title>Informasi Kendaraan & Pelanggan</v-card-title>
        </v-card-item>
        <v-card-text class="pt-0">
          <v-row dense>
            <v-col cols="12" sm="6">
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="grey" class="me-2">mdi-car</v-icon>
                <div><strong>Kendaraan:</strong> {{ service.vehicleInfo || 'Tidak Ditemukan' }}</div>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="grey" class="me-2">mdi-card-account-details-outline</v-icon>
                <div><strong>No. Polisi:</strong> {{ service.nomorPolisi }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="grey" class="me-2">mdi-account</v-icon>
                <div><strong>Pelanggan:</strong> {{ service.customerName || 'Tidak Ditemukan' }}</div>
              </div>
              <div v-if="service.customerPhone" class="d-flex align-center mb-2">
                <v-icon size="small" color="grey" class="me-2">mdi-phone</v-icon>
                <div><strong>No. HP:</strong> {{ service.customerPhone }}</div>
              </div>
            </v-col>
          </v-row>
          <div class="d-flex align-center mt-2 text-caption text-grey">
            <v-icon size="x-small" class="me-1">mdi-calendar-clock</v-icon>
            <span>Tanggal Masuk: {{ formatTimestamp(service.timestamp) }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Initial Complaint -->
      <v-card variant="outlined" class="mb-4 info-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-wrench" color="primary" class="me-2"></v-icon>
          </template>
          <v-card-title>Keluhan Awal & Jenis Servis</v-card-title>
        </v-card-item>
        <v-card-text class="pt-0">
          <div class="d-flex align-start mb-3">
            <v-icon size="small" color="grey" class="me-2 mt-1">mdi-tools</v-icon>
            <div>
              <div class="font-weight-medium mb-1">Jenis Servis Diminta:</div>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="(type, index) in service.jenisServisNames"
                  :key="index"
                  size="small"
                  variant="outlined"
                  density="comfortable"
                  class="service-type-chip"
                >
                  {{ type }}
                </v-chip>
                <span v-if="!service.jenisServisNames || service.jenisServisNames.length === 0" class="text-grey">Tidak ada</span>
              </div>
            </div>
          </div>
          <div v-if="service.keterangan" class="d-flex align-start">
            <v-icon size="small" color="grey" class="me-2 mt-1">mdi-comment-text-outline</v-icon>
            <div>
              <div class="font-weight-medium mb-1">Keluhan Awal:</div>
              <div class="complaint-text">{{ service.keterangan }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Jasa / Service Fees -->
      <v-card variant="outlined" class="mb-4 info-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-cash-register" color="primary" class="me-2"></v-icon>
          </template>
          <v-card-title>Jasa / Biaya Servis</v-card-title>
          <template v-slot:append>
            <v-btn
              color="secondary"
              size="small"
              @click="openAddJasaDialog"
              prepend-icon="mdi-plus-circle-outline"
              :disabled="invoicePaid"
              variant="tonal"
              rounded
            >
              Tambah Jasa
            </v-btn>
          </template>
        </v-card-item>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <div v-if="service.jasa && service.jasa.length > 0" class="service-fees-table">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Deskripsi Jasa</th>
                  <th class="text-right">Biaya</th>
                  <th v-if="!invoicePaid" class="text-center" width="50">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(j, index) in service.jasa" :key="`jasa-${index}`">
                  <td>{{ j.deskripsi }}</td>
                  <td class="text-right font-weight-medium">{{ formatCurrency(j.biaya) }}</td>
                  <td v-if="!invoicePaid" class="text-center">
                    <v-btn icon="mdi-delete-outline" variant="text" color="error" size="x-small" density="comfortable"
                      @click="removeJasa(index)" :disabled="invoicePaid"></v-btn>
                  </td>
                </tr>
                <tr class="total-row">
                  <td class="text-subtitle-2">Total Jasa</td>
                  <td class="text-right text-subtitle-2 font-weight-bold">{{ formatCurrency(totalBiayaJasa) }}</td>
                  <td v-if="!invoicePaid"></td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <v-alert v-else type="info" variant="tonal" class="ma-3">Belum ada jasa yang ditambahkan.</v-alert>
        </v-card-text>
      </v-card>

      <!-- Spare Parts Used -->
      <v-card variant="outlined" class="mb-4 info-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-cog-outline" color="primary" class="me-2"></v-icon>
          </template>
          <v-card-title>Spare Part Digunakan</v-card-title>
          <template v-slot:append>
            <v-btn
              color="secondary"
              size="small"
              @click="showAddPartDialog = true"
              prepend-icon="mdi-plus-circle-outline"
              :disabled="invoicePaid"
              variant="tonal"
              rounded
            >
              Tambah Part
            </v-btn>
          </template>
        </v-card-item>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <div v-if="service.parts && service.parts.length > 0" class="parts-table">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Nama Part</th>
                  <th class="text-center">Jumlah</th>
                  <th class="text-right">Harga</th>
                  <th class="text-right">Subtotal</th>
                  <th v-if="!invoicePaid" class="text-center" width="50">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, index) in service.parts" :key="`part-${p.itemId}`">
                  <td>
                    <div>{{ p.nama }}</div>
                    <div class="text-caption text-grey">{{ p.kode || 'Kode: N/A' }}</div>
                  </td>
                  <td class="text-center">{{ p.jumlah }} {{ p.satuan }}</td>
                  <td class="text-right">{{ formatCurrency(p.hargaJual) }}</td>
                  <td class="text-right font-weight-medium">{{ formatCurrency(p.jumlah * p.hargaJual) }}</td>
                  <td v-if="!invoicePaid" class="text-center">
                    <v-btn icon="mdi-delete-outline" variant="text" color="error" size="x-small" density="comfortable"
                      @click="removePart(index)" :disabled="invoicePaid"></v-btn>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="text-subtitle-2">Total Spare Part</td>
                  <td class="text-right text-subtitle-2 font-weight-bold">{{ formatCurrency(totalBiayaParts) }}</td>
                  <td v-if="!invoicePaid"></td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <v-alert v-else type="info" variant="tonal" class="ma-3">Belum ada spare part yang ditambahkan.</v-alert>
        </v-card-text>
      </v-card>

      <!-- Cost Summary & Status -->
      <v-card variant="outlined" class="mb-4 info-card">
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-currency-usd" color="primary" class="me-2"></v-icon>
          </template>
          <v-card-title>Biaya & Status</v-card-title>
        </v-card-item>
        <v-divider></v-divider>
        <v-card-text>
          <!-- Cost Summary with Visual Representation -->
          <v-row class="mt-2">
            <v-col cols="12" sm="6">
              <div class="cost-summary-card pa-3 rounded">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-2">Total Jasa</div>
                  <div class="text-subtitle-1 font-weight-medium">{{ formatCurrency(totalBiayaJasa) }}</div>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-2">Total Spare Part</div>
                  <div class="text-subtitle-1 font-weight-medium">{{ formatCurrency(totalBiayaParts) }}</div>
                </div>
                <v-divider class="my-2"></v-divider>
                <div class="d-flex justify-space-between align-center">
                  <div class="text-subtitle-1 font-weight-bold">Total Keseluruhan</div>
                  <div class="text-h6 font-weight-bold">{{ formatCurrency(totalBiayaKeseluruhan) }}</div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <!-- Cost Breakdown Chart -->
              <div class="cost-chart-container pa-3 rounded d-flex flex-column align-center justify-center">
                <div class="text-subtitle-2 mb-2">Perbandingan Biaya</div>

                <!-- Legend -->
                <div class="cost-legend">
                  <div class="legend-item">
                    <div class="legend-color jasa-color"></div>
                    <span>Jasa</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color parts-color"></div>
                    <span>Spare Part</span>
                  </div>
                </div>

                <!-- Chart -->
                <div class="cost-chart">
                  <div
                    class="cost-bar jasa-bar"
                    :style="{ width: adjustedJasaPercentage + '%' }"
                    v-if="adjustedJasaPercentage > 0"
                  >
                    <span class="cost-label" v-if="adjustedJasaPercentage >= 20">{{ jasaPercentage }}%</span>
                  </div>
                  <div
                    class="cost-bar parts-bar"
                    :style="{ width: adjustedPartsPercentage + '%' }"
                    v-if="adjustedPartsPercentage > 0"
                  >
                    <span class="cost-label" v-if="adjustedPartsPercentage >= 20">{{ partsPercentage }}%</span>
                  </div>
                </div>

                <!-- Percentage labels for small segments -->
                <div class="d-flex justify-space-between w-100 mt-1" v-if="totalBiayaKeseluruhan > 0">
                  <div class="text-caption" v-if="adjustedJasaPercentage > 0 && adjustedJasaPercentage < 20">
                    Jasa: {{ jasaPercentage }}%
                  </div>
                  <div></div>
                  <div class="text-caption" v-if="adjustedPartsPercentage > 0 && adjustedPartsPercentage < 20">
                    Part: {{ partsPercentage }}%
                  </div>
                </div>

                <!-- Actual values -->
                <div class="d-flex justify-space-between w-100 mt-2" v-if="totalBiayaKeseluruhan > 0">
                  <div class="text-caption text-primary" v-if="totalBiayaJasa > 0">
                    {{ formatCurrency(totalBiayaJasa) }}
                  </div>
                  <div></div>
                  <div class="text-caption text-warning" v-if="totalBiayaParts > 0">
                    {{ formatCurrency(totalBiayaParts) }}
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="totalBiayaKeseluruhan === 0" class="text-caption text-grey mt-2">
                  Belum ada biaya yang ditambahkan
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Status Update -->
          <div class="mt-4">
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-clipboard-check-outline" color="primary" class="me-2"></v-icon>
              <div class="text-subtitle-1 font-weight-medium">Update Status Servis</div>
            </div>
            <v-chip-group v-model="editableStatus" mandatory :disabled="invoicePaid" class="status-chips">
              <v-chip
                filter
                value="Antri"
                color="blue"
                :prepend-icon="getStatusIcon('Antri')"
                class="status-chip"
              >
                Antri
              </v-chip>
              <v-chip
                filter
                value="Dikerjakan"
                color="orange"
                :prepend-icon="getStatusIcon('Dikerjakan')"
                class="status-chip"
              >
                Dikerjakan
              </v-chip>
              <v-chip
                filter
                value="Tunggu Part"
                color="purple"
                :prepend-icon="getStatusIcon('Tunggu Part')"
                class="status-chip"
              >
                Tunggu Part
              </v-chip>
              <v-chip
                filter
                value="Selesai"
                color="green"
                :prepend-icon="getStatusIcon('Selesai')"
                class="status-chip"
              >
                Selesai
              </v-chip>
            </v-chip-group>
          </div>
        </v-card-text>
      </v-card>

      <!-- Invoice Paid Warning -->
      <v-alert v-if="invoicePaid" type="warning" variant="tonal" class="mb-4" icon="mdi-alert-circle">
        <div class="d-flex align-center">
          <div>
            <strong>Perhatian:</strong> Servis ini tidak dapat diedit karena invoice sudah dibayar.
          </div>
        </div>
      </v-alert>

      <!-- Action Buttons Container -->
      <v-card variant="outlined" class="mb-4 action-buttons-card">
        <v-card-text>
          <!-- Primary Actions -->
          <v-row>
            <v-col cols="12" sm="6">
              <!-- Save Button -->
              <v-btn
                color="success"
                block
                size="large"
                @click="saveChanges"
                :loading="isSaving"
                :disabled="isSaving || invoicePaid"
                prepend-icon="mdi-content-save-outline"
                class="action-button"
              >
                Simpan Perubahan
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <!-- Invoice Button -->
              <v-btn
                :color="hasInvoice ? 'primary' : 'secondary'"
                :variant="hasInvoice ? 'flat' : 'outlined'"
                block
                size="large"
                @click="createInvoice"
                prepend-icon="mdi-file-document-outline"
                :disabled="!canCreateInvoice || !service.status || service.status === 'Dibatalkan'"
                :title="invoiceButtonTooltip"
                class="action-button"
              >
                {{ hasInvoice ? 'Lihat Invoice' : 'Buat Invoice' }}
              </v-btn>

              <!-- Invoice Validation Warning -->
              <div v-if="!hasInvoice && !canCreateInvoice" class="text-caption text-warning text-center mt-1">
                {{ invoiceValidationMessage }}
              </div>
            </v-col>
          </v-row>

          <!-- Secondary Actions -->
          <v-divider class="my-4"></v-divider>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <!-- Delete Button -->
            <v-btn
              color="error"
              variant="outlined"
              @click="showDeleteConfirmDialog = true"
              prepend-icon="mdi-delete-outline"
              :disabled="invoicePaid"
              class="secondary-action"
            >
              Hapus Servis
            </v-btn>
            <!-- Back Button -->
            <v-btn
              variant="text"
              prepend-icon="mdi-arrow-left"
              @click="goBack"
              class="secondary-action"
            >
              Kembali ke Daftar
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

    </div>
    <!-- Loading / Not Found States -->
    <div v-else-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p>Memuat data servis...</p>
    </div>
    <div v-else>
      <v-alert type="warning" variant="tonal">
        Data servis dengan ID <strong>{{ props.id }}</strong> tidak ditemukan.
      </v-alert>
      <v-btn variant="text" block class="mt-2" @click="goBack">Kembali ke Daftar</v-btn>
    </div>

    <!-- Dialog Add Jasa -->
    <v-dialog v-model="showAddJasaDialog" persistent :max-width="$vuetify.display.xs ? '100%' : '500px'" :fullscreen="$vuetify.display.xs">
      <v-card class="jasa-dialog">
        <v-toolbar density="compact" color="primary" class="mobile-toolbar" v-if="$vuetify.display.xs">
          <v-btn icon @click="cancelAddJasa">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Tambah Jasa</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="addJasaToList"
            :disabled="(jasaInputTab === 'predefined' && !selectedPredefinedJasa) ||
                      (jasaInputTab === 'custom' && (!newJasa.deskripsi || newJasa.biaya === null || newJasa.biaya <= 0))"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-toolbar>

        <template v-if="!$vuetify.display.xs">
          <v-card-title class="d-flex align-center py-2">
            <v-icon icon="mdi-cash-register" color="primary" class="me-2"></v-icon>
            Tambah Jasa
          </v-card-title>
        </template>

        <v-tabs v-model="jasaInputTab" density="compact">
          <v-tab value="predefined" prepend-icon="mdi-format-list-bulleted">Tersedia</v-tab>
          <v-tab value="custom" prepend-icon="mdi-pencil">Kustom</v-tab>
        </v-tabs>

        <v-card-text :class="$vuetify.display.xs ? 'pa-2' : 'pt-3'">
          <!-- Predefined Services Tab -->
          <v-window v-model="jasaInputTab">
            <v-window-item value="predefined">
              <!-- Search for predefined services -->
              <v-text-field
                v-model="jasaSearchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Cari jasa..."
                variant="outlined"
                density="compact"
                hide-details
                class="mb-2"
                clearable
              ></v-text-field>

              <!-- Predefined Services Grid -->
              <div class="predefined-services-grid">
                <v-card
                  v-for="(jasa, index) in filteredPredefinedJasa"
                  :key="index"
                  variant="outlined"
                  class="service-card"
                  @click="selectPredefinedJasa(jasa)"
                  :class="{ 'selected-service': selectedPredefinedJasa && selectedPredefinedJasa.deskripsi === jasa.deskripsi }"
                >
                  <v-card-text :class="$vuetify.display.xs ? 'pa-2' : 'pa-3'">
                    <div class="text-caption text-truncate mb-1">{{ jasa.deskripsi }}</div>
                    <div class="text-subtitle-2 primary--text">{{ formatCurrency(jasa.biaya) }}</div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- No results message -->
              <div v-if="filteredPredefinedJasa.length === 0" class="text-center pa-2">
                <v-icon icon="mdi-alert-circle-outline" color="grey" size="small" class="mb-1"></v-icon>
                <div class="text-caption">Tidak ada jasa yang sesuai</div>
              </div>

              <!-- Selected Service Preview -->
              <v-card v-if="selectedPredefinedJasa" variant="tonal" class="mt-2 pa-2">
                <div class="d-flex justify-space-between align-center">
                  <div class="text-truncate me-2">
                    <div class="text-caption">Jasa Dipilih:</div>
                    <div class="text-body-2 text-truncate">{{ selectedPredefinedJasa.deskripsi }}</div>
                  </div>
                  <div class="text-subtitle-1 font-weight-bold primary--text">{{ formatCurrency(selectedPredefinedJasa.biaya) }}</div>
                </div>
              </v-card>
            </v-window-item>

            <!-- Custom Service Tab -->
            <v-window-item value="custom">
              <v-text-field
                v-model="newJasa.deskripsi"
                label="Deskripsi Jasa*"
                required
                variant="outlined"
                density="compact"
                class="mb-2"
                hide-details
              ></v-text-field>

              <v-text-field
                v-model.number="newJasa.biaya"
                label="Biaya Jasa*"
                type="number"
                prefix="Rp"
                required
                variant="outlined"
                density="compact"
                class="mb-2"
                hide-details
              ></v-text-field>

              <!-- Quick Price Buttons -->
              <div class="quick-price-buttons mb-2">
                <div class="text-caption mb-1">Input Cepat:</div>
                <div class="price-buttons-grid">
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(5000)">5rb</v-btn>
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(10000)">10rb</v-btn>
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(15000)">15rb</v-btn>
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(20000)">20rb</v-btn>
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(25000)">25rb</v-btn>
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(50000)">50rb</v-btn>
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(75000)">75rb</v-btn>
                  <v-btn size="x-small" variant="tonal" density="compact" @click="setJasaBiaya(100000)">100rb</v-btn>
                </div>
              </div>

              <!-- Custom Service Preview -->
              <v-card v-if="newJasa.deskripsi && newJasa.biaya > 0" variant="tonal" class="mt-2 pa-2">
                <div class="d-flex justify-space-between align-center">
                  <div class="text-truncate me-2">
                    <div class="text-caption">Jasa Kustom:</div>
                    <div class="text-body-2 text-truncate">{{ newJasa.deskripsi }}</div>
                  </div>
                  <div class="text-subtitle-1 font-weight-bold primary--text">{{ formatCurrency(newJasa.biaya) }}</div>
                </div>
              </v-card>
            </v-window-item>
          </v-window>
        </v-card-text>

        <template v-if="!$vuetify.display.xs">
          <v-divider></v-divider>

          <v-card-actions>
            <v-btn color="grey" variant="text" @click="cancelAddJasa" density="compact">
              <v-icon icon="mdi-close" class="me-1" size="small"></v-icon>
              Batal
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="flat"
              @click="addJasaToList"
              density="compact"
              :disabled="(jasaInputTab === 'predefined' && !selectedPredefinedJasa) ||
                        (jasaInputTab === 'custom' && (!newJasa.deskripsi || newJasa.biaya === null || newJasa.biaya <= 0))"
            >
              <v-icon icon="mdi-plus" class="me-1" size="small"></v-icon>
              Tambah
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-dialog>

    <!-- Dialog Add Spare Part -->
    <v-dialog v-model="showAddPartDialog" persistent :max-width="$vuetify.display.xs ? '100%' : '600px'" :fullscreen="$vuetify.display.xs">
      <v-card class="part-dialog">
        <v-toolbar density="compact" color="primary" class="mobile-toolbar" v-if="$vuetify.display.xs">
          <v-btn icon @click="cancelAddPart">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Tambah Spare Part</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="addPartToList"
            :disabled="!selectedPart || !newPart.jumlah || newPart.jumlah <= 0 || newPart.jumlah > (selectedPart?.stokSaatIni || 0)"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-toolbar>

        <template v-if="!$vuetify.display.xs">
          <v-card-title class="d-flex align-center py-2">
            <v-icon icon="mdi-cog-outline" color="primary" class="me-2"></v-icon>
            Tambah Spare Part
          </v-card-title>
        </template>

        <v-card-text :class="$vuetify.display.xs ? 'pa-2' : 'pt-3'">
          <!-- Search and Filter -->
          <div :class="$vuetify.display.xs ? 'search-filter-mobile' : 'd-flex gap-2 mb-3'">
            <!-- Search Field -->
            <v-text-field
              v-model="partSearchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Cari nama atau kode part..."
              variant="outlined"
              density="compact"
              hide-details
              class="flex-grow-1"
              clearable
              @update:model-value="searchParts"
            ></v-text-field>

            <!-- Category Filter -->
            <v-select
              v-model="partCategoryFilter"
              :items="partCategories"
              label="Kategori"
              variant="outlined"
              density="compact"
              hide-details
              class="part-category-filter"
              @update:model-value="searchParts"
            ></v-select>
          </div>

          <!-- Loading Indicator -->
          <div v-if="loadingItems" class="d-flex justify-center my-2">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          </div>

          <!-- Parts Grid -->
          <div v-else class="parts-grid mb-2">
            <v-card
              v-for="part in filteredParts"
              :key="part.id"
              variant="outlined"
              class="part-card"
              @click="selectPart(part)"
              :class="{ 'selected-part': selectedPart && selectedPart.id === part.id }"
            >
              <v-card-text :class="$vuetify.display.xs ? 'pa-2' : 'pa-3'">
                <div class="d-flex justify-space-between">
                  <div class="text-caption text-truncate">{{ part.nama }}</div>
                  <v-chip size="x-small" :color="getStockColor(part.stokSaatIni)" class="ml-1">{{ part.stokSaatIni }}</v-chip>
                </div>
                <div class="text-caption text-grey text-truncate">{{ part.kode || 'Kode: -' }}</div>
                <div class="text-subtitle-2 primary--text">{{ formatCurrency(part.hargaJual) }}</div>
              </v-card-text>
            </v-card>
          </div>

          <!-- No Results Message -->
          <div v-if="!loadingItems && filteredParts.length === 0" class="text-center pa-2">
            <v-icon icon="mdi-package-variant" color="grey" size="small" class="mb-1"></v-icon>
            <div class="text-caption">Tidak ada part yang sesuai</div>
            <div class="text-caption text-grey">Coba ubah kata kunci atau filter</div>
          </div>

          <!-- Selected Part Details -->
          <v-card v-if="selectedPart" variant="tonal" class="mt-2 pa-2">
            <div class="d-flex justify-space-between align-center mb-1">
              <div class="text-truncate me-2">
                <div class="text-caption">Part Dipilih:</div>
                <div class="text-body-2 text-truncate">{{ selectedPart.nama }}</div>
                <div class="text-caption text-truncate">{{ selectedPart.kode || 'Kode: -' }} | Stok: {{ selectedPart.stokSaatIni }} {{ selectedPart.satuan }}</div>
              </div>
              <div class="text-subtitle-1 font-weight-bold primary--text">{{ formatCurrency(selectedPart.hargaJual) }}</div>
            </div>

            <!-- Quantity Selector -->
            <div class="d-flex align-center quantity-selector">
              <div class="text-caption me-2">Jumlah:</div>
              <v-btn icon="mdi-minus" size="x-small" variant="tonal" density="compact"
                @click="decrementPartQuantity"
                :disabled="newPart.jumlah <= 1"
              ></v-btn>
              <v-text-field
                v-model.number="newPart.jumlah"
                type="number"
                min="1"
                :max="selectedPart.stokSaatIni || 0"
                variant="outlined"
                density="compact"
                hide-details
                class="quantity-input mx-1"
                :error-messages="partJumlahError"
              ></v-text-field>
              <v-btn icon="mdi-plus" size="x-small" variant="tonal" density="compact"
                @click="incrementPartQuantity"
                :disabled="newPart.jumlah >= selectedPart.stokSaatIni"
              ></v-btn>
              <div class="text-caption ms-1">{{ selectedPart.satuan }}</div>
              <v-spacer></v-spacer>
              <div class="text-subtitle-1 font-weight-bold primary--text">{{ formatCurrency(selectedPart.hargaJual * newPart.jumlah) }}</div>
            </div>
          </v-card>
        </v-card-text>

        <template v-if="!$vuetify.display.xs">
          <v-divider></v-divider>

          <v-card-actions>
            <v-btn color="grey" variant="text" @click="cancelAddPart" density="compact">
              <v-icon icon="mdi-close" class="me-1" size="small"></v-icon>
              Batal
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="flat"
              @click="addPartToList"
              density="compact"
              :disabled="!selectedPart || !newPart.jumlah || newPart.jumlah <= 0 || newPart.jumlah > (selectedPart?.stokSaatIni || 0)"
            >
              <v-icon icon="mdi-plus" class="me-1" size="small"></v-icon>
              Tambah
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-dialog>

    <!-- Dialog Confirm Delete -->
    <v-dialog v-model="showDeleteConfirmDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5 error--text">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus data servis untuk <strong>{{ service?.nomorPolisi }}</strong>?
          <br>
          Tindakan ini tidak dapat dibatalkan. Stok part yang digunakan TIDAK akan dikembalikan secara otomatis.
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
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  getServiceById,
  getCustomerById,
  getVehicleById,
  updateService,
  getAllItems,
  updateItemStock,
  getItemById,
  deleteService,
  getInvoicesByServiceId,
} from "../stores/localStorage.js";

import { generateInvoiceFromService } from "../utils/invoiceGenerator.js";

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const service = ref(null); // Holds the enhanced service details including jasa and parts arrays
const editableStatus = ref('');
const loading = ref(true);
const isSaving = ref(false);
const hasInvoice = ref(false);
const invoicePaid = ref(false); // Track if related invoice is paid

// Computed properties for invoice validation
const canCreateInvoice = computed(() => {
  if (!service.value) return false;

  const hasJasa = (service.value.jasa || []).length > 0;
  const hasParts = (service.value.parts || []).length > 0;
  const totalAmount = service.value.totalBiaya || 0;
  const isServiceCompleted = service.value.status === 'Selesai';

  return (hasJasa || hasParts) && totalAmount > 0 && isServiceCompleted;
});

// Computed properties for cost breakdown chart
const jasaPercentage = computed(() => {
  if (totalBiayaKeseluruhan.value === 0) return 0;
  return Math.round((totalBiayaJasa.value / totalBiayaKeseluruhan.value) * 100);
});

const partsPercentage = computed(() => {
  if (totalBiayaKeseluruhan.value === 0) return 0;
  return Math.round((totalBiayaParts.value / totalBiayaKeseluruhan.value) * 100);
});

// Ensure percentages add up to 100% (handle rounding errors)
const adjustedJasaPercentage = computed(() => {
  const total = jasaPercentage.value + partsPercentage.value;
  if (total === 0) return 0;
  if (total !== 100 && totalBiayaKeseluruhan.value > 0) {
    // If jasa is the larger component, adjust it
    if (jasaPercentage.value >= partsPercentage.value) {
      return 100 - partsPercentage.value;
    }
  }
  return jasaPercentage.value;
});

const adjustedPartsPercentage = computed(() => {
  const total = jasaPercentage.value + partsPercentage.value;
  if (total === 0) return 0;
  if (total !== 100 && totalBiayaKeseluruhan.value > 0) {
    // If parts is the larger component, adjust it
    if (partsPercentage.value > jasaPercentage.value) {
      return 100 - jasaPercentage.value;
    }
  }
  return partsPercentage.value;
});

const invoiceValidationMessage = computed(() => {
  if (!service.value) return '';

  const hasJasa = (service.value.jasa || []).length > 0;
  const hasParts = (service.value.parts || []).length > 0;
  const totalAmount = service.value.totalBiaya || 0;
  const isServiceCompleted = service.value.status === 'Selesai';

  if (!isServiceCompleted) {
    return 'Tidak dapat membuat invoice: Status servis harus Selesai';
  }

  if (!hasJasa && !hasParts) {
    return 'Tidak dapat membuat invoice: Tidak ada jasa atau sparepart yang ditambahkan';
  }

  if (totalAmount <= 0) {
    return 'Tidak dapat membuat invoice: Total biaya adalah 0';
  }

  return '';
});

const invoiceButtonTooltip = computed(() => {
  if (hasInvoice.value) {
    return 'Lihat invoice yang sudah dibuat';
  }

  if (!canCreateInvoice.value) {
    return invoiceValidationMessage.value;
  }

  return 'Buat invoice baru';
});
const isDeleting = ref(false); // State for delete loading

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info"); // Default color

// --- Jasa Management State ---
const showAddJasaDialog = ref(false);
const jasaInputTab = ref('predefined'); // Tab for jasa input (predefined or custom)
const jasaSearchQuery = ref(''); // For searching predefined jasa
const newJasa = reactive({ deskripsi: '', biaya: null });
const selectedPredefinedJasa = ref(null); // For the selected predefined jasa

// Define predefined Jasa items
const predefinedJasaItems = ref([
  { deskripsi: 'Jasa Ganti Oli Mesin', biaya: 25000 },
  { deskripsi: 'Jasa Servis Ringan (Cek + Setel)', biaya: 50000 },
  { deskripsi: 'Jasa Ganti Busi', biaya: 15000 },
  { deskripsi: 'Jasa Tambal Ban Tubeless', biaya: 20000 },
  { deskripsi: 'Jasa Ganti Kampas Rem Depan', biaya: 20000 },
  { deskripsi: 'Jasa Ganti Kampas Rem Belakang', biaya: 25000 },
  { deskripsi: 'Jasa Ganti Oli Gardan', biaya: 10000 },
  { deskripsi: 'Jasa Kuras Air Radiator', biaya: 30000 },
  { deskripsi: 'Jasa Ganti Timing Belt', biaya: 150000 },
  { deskripsi: 'Jasa Ganti Radiator', biaya: 100000 },
  { deskripsi: 'Jasa Ganti Shock Absorber', biaya: 75000 },
  { deskripsi: 'Jasa Spooring', biaya: 200000 },
  { deskripsi: 'Jasa Balancing', biaya: 100000 },
  { deskripsi: 'Jasa Ganti Aki', biaya: 20000 },
  { deskripsi: 'Jasa Tambah Freon AC', biaya: 150000 },
]);

// Computed property for filtered predefined jasa
const filteredPredefinedJasa = computed(() => {
  if (!jasaSearchQuery.value) return predefinedJasaItems.value;
  const query = jasaSearchQuery.value.toLowerCase();
  return predefinedJasaItems.value.filter(jasa =>
    jasa.deskripsi.toLowerCase().includes(query)
  );
});

// --- Part Management State ---
const showAddPartDialog = ref(false);
const partSearchQuery = ref(''); // For searching parts
const partCategoryFilter = ref('semua'); // For filtering parts by category
const availableStockItems = ref([]);
const loadingItems = ref(false);
const selectedPart = ref(null); // Holds the selected item object { id, nama, satuan, stokSaatIni, hargaJual }
const newPart = reactive({ jumlah: 1 });
const partJumlahError = ref('');

// Part categories
const partCategories = ref([
  { title: 'Semua Kategori', value: 'semua' },
  { title: 'Oli', value: 'oli' },
  { title: 'Filter', value: 'filter' },
  { title: 'Busi', value: 'busi' },
  { title: 'Rem', value: 'rem' },
  { title: 'Lainnya', value: 'lainnya' },
]);

// Computed property for filtered parts
const filteredParts = computed(() => {
  if (loadingItems.value) return [];

  let filtered = availableStockItems.value;

  // Apply category filter
  if (partCategoryFilter.value !== 'semua') {
    filtered = filtered.filter(part => {
      const category = part.kategori?.toLowerCase() || 'lainnya';
      return category === partCategoryFilter.value;
    });
  }

  // Apply search filter
  if (partSearchQuery.value) {
    const query = partSearchQuery.value.toLowerCase();
    filtered = filtered.filter(part =>
      part.nama.toLowerCase().includes(query) ||
      (part.kode && part.kode.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// State for Delete Confirmation Dialog
const showDeleteConfirmDialog = ref(false);

// Mapping for service types
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

// --- Lifecycle & Data Loading ---
onMounted(() => {
  loadServiceDetails();
  loadAvailableItems(); // Load items for the parts dialog
});

function loadServiceDetails() {
  loading.value = true;
  service.value = null;
  try {
    const fetchedService = getServiceById(props.id);
    if (fetchedService) {
      const customer = getCustomerById(fetchedService.pelangganId);
      const vehicle = getVehicleById(fetchedService.kendaraanId);
      const serviceIndices = Array.isArray(fetchedService.jenisServis) ? fetchedService.jenisServis : [];
      const serviceNames = serviceIndices.map(index => serviceTypeMap[index] || 'Unknown');

      service.value = {
        ...fetchedService,
        customerName: customer ? customer.nama : 'N/A',
        customerPhone: customer ? customer.noHp : null,
        vehicleInfo: vehicle ? vehicle.merkTipe : 'N/A',
        jenisServisNames: serviceNames,
        totalBiaya: fetchedService.totalBiaya || 0,
        // Initialize jasa and parts arrays if they don't exist
        jasa: fetchedService.jasa || [],
        parts: fetchedService.parts || [],
      };
      editableStatus.value = service.value.status;

      // Check if invoice exists for this service
      const invoices = getInvoicesByServiceId(props.id);
      hasInvoice.value = invoices.length > 0;

      // Check if any related invoice is paid
      if (hasInvoice.value) {
        invoicePaid.value = invoices.some(invoice => invoice.status === 'Dibayar');
      }
    } else {
      console.error(`Service with ID ${props.id} not found.`);
    }
  } catch (error) {
    console.error("Error loading service details:", error);
  } finally {
    loading.value = false;
  }
}

function loadAvailableItems() {
  loadingItems.value = true;
  try {
    availableStockItems.value = getAllItems().map(item => ({
      id: item.id,
      nama: item.nama,
      satuan: item.satuan,
      kode: item.kode,
      stokSaatIni: item.stokSaatIni,
      hargaJual: item.hargaJual,
    })).sort((a, b) => a.nama.localeCompare(b.nama));
  } catch (error) {
    console.error("Error loading available stock items:", error);
  } finally {
    loadingItems.value = false;
  }
}

// --- Computed Properties for Totals ---
const totalBiayaJasa = computed(() => {
  return service.value?.jasa?.reduce((sum, j) => sum + (Number(j.biaya) || 0), 0) || 0;
});

const totalBiayaParts = computed(() => {
  return service.value?.parts?.reduce((sum, p) => sum + (Number(p.jumlah) || 0) * (Number(p.hargaJual) || 0), 0) || 0;
});

const totalBiayaKeseluruhan = computed(() => {
  return totalBiayaJasa.value + totalBiayaParts.value;
});


// --- Jasa Management ---
// Function to select a predefined jasa
function selectPredefinedJasa(jasa) {
  selectedPredefinedJasa.value = jasa;
  newJasa.deskripsi = jasa.deskripsi;
  newJasa.biaya = jasa.biaya;
}

function addJasaToList() {
  // Prevent adding jasa if invoice is paid
  if (invoicePaid.value) {
    showSnackbar('Tidak dapat menambahkan jasa: Invoice sudah dibayar', 'error');
    return;
  }

  // Validate based on active tab
  if (jasaInputTab.value === 'predefined') {
    // For predefined tab, we need a selected jasa
    if (!selectedPredefinedJasa.value) {
      showSnackbar("Silakan pilih jasa terlebih dahulu", 'warning');
      return;
    }
  } else {
    // For custom tab, validate description and cost
    if (!newJasa.deskripsi || newJasa.deskripsi.trim() === '') {
      showSnackbar("Deskripsi jasa tidak boleh kosong", 'warning');
      return;
    }

    // Validate cost
    if (newJasa.biaya === null || newJasa.biaya === undefined) {
      showSnackbar("Biaya jasa harus diisi", 'warning');
      return;
    }

    if (isNaN(Number(newJasa.biaya))) {
      showSnackbar("Biaya jasa harus berupa angka", 'warning');
      return;
    }

    if (Number(newJasa.biaya) <= 0) {
      showSnackbar("Biaya jasa harus lebih dari 0", 'warning');
      return;
    }
  }

  // All validations passed, add the service
  if (!service.value.jasa) service.value.jasa = []; // Ensure array exists

  service.value.jasa.push({
    deskripsi: newJasa.deskripsi.trim(),
    biaya: Number(newJasa.biaya)
  });

  // Show success message
  showSnackbar(`Jasa ${newJasa.deskripsi} berhasil ditambahkan`, 'success');

  // Close dialog
  cancelAddJasa();
}

function removeJasa(index) {
  // Prevent removing jasa if invoice is paid
  if (invoicePaid.value) {
    showSnackbar('Tidak dapat menghapus jasa: Invoice sudah dibayar', 'error');
    return;
  }

  if (service.value?.jasa) {
    const removedJasa = service.value.jasa[index];
    service.value.jasa.splice(index, 1);
    showSnackbar(`Jasa ${removedJasa.deskripsi} berhasil dihapus`, 'info');
  }
}

function openAddJasaDialog() {
  // Reset dialog state before opening
  jasaInputTab.value = 'predefined'; // Default to predefined tab
  jasaSearchQuery.value = ''; // Clear search
  selectedPredefinedJasa.value = null;
  newJasa.deskripsi = '';
  newJasa.biaya = null;
  showAddJasaDialog.value = true;
}

function cancelAddJasa() {
  showAddJasaDialog.value = false;
  // Reset is handled by openAddJasaDialog next time
}

// Function to set Jasa cost from quick buttons
function setJasaBiaya(amount) {
  newJasa.biaya = amount;
}

// --- Part Management ---
// Function to select a part
function selectPart(part) {
  selectedPart.value = part;
  newPart.jumlah = 1; // Reset quantity to 1
  partJumlahError.value = ''; // Clear any previous errors
}

// Function to increment part quantity
function incrementPartQuantity() {
  if (!selectedPart.value) return;

  const maxStock = selectedPart.value.stokSaatIni || 0;
  if (newPart.jumlah < maxStock) {
    newPart.jumlah++;
  }
}

// Function to decrement part quantity
function decrementPartQuantity() {
  if (newPart.jumlah > 1) {
    newPart.jumlah--;
  }
}

// Function to get stock color based on quantity
function getStockColor(stock) {
  if (stock <= 0) return 'error';
  if (stock <= 5) return 'warning';
  return 'success';
}

// Function to search parts
function searchParts() {
  // Filtering is handled by the filteredParts computed property
  // This function is just a placeholder for future enhancements
}

watch(() => newPart.jumlah, (newVal) => {
  const maxStock = selectedPart.value?.stokSaatIni || 0;
  if (newVal > maxStock) {
    partJumlahError.value = `Stok hanya ${maxStock}`;
  } else {
    partJumlahError.value = '';
  }
});

function addPartToList() {
  // Prevent adding part if invoice is paid
  if (invoicePaid.value) {
    showSnackbar('Tidak dapat menambahkan part: Invoice sudah dibayar', 'error');
    return;
  }

  // Validate part selection
  if (!selectedPart.value) {
    showSnackbar("Pilih spare part terlebih dahulu", 'warning');
    return;
  }

  // Validate quantity
  if (!newPart.jumlah) {
    showSnackbar("Jumlah harus diisi", 'warning');
    return;
  }

  const qty = Number(newPart.jumlah);
  if (isNaN(qty)) {
    showSnackbar("Jumlah harus berupa angka", 'warning');
    return;
  }

  if (qty <= 0) {
    showSnackbar("Jumlah harus lebih dari 0", 'warning');
    return;
  }

  if (!Number.isInteger(qty)) {
    showSnackbar("Jumlah harus berupa bilangan bulat", 'warning');
    return;
  }

  // Validate stock availability
  const maxStock = selectedPart.value?.stokSaatIni || 0;
  if (qty > maxStock) {
    showSnackbar(`Jumlah melebihi stok yang tersedia (${maxStock})`, 'warning');
    return;
  }

  // Validate price
  if (selectedPart.value.hargaJual === undefined || selectedPart.value.hargaJual === null) {
    showSnackbar("Harga jual part tidak valid", 'warning');
    return;
  }

  // Check if part already added
  const existingPartIndex = service.value?.parts?.findIndex(p => p.itemId === selectedPart.value.id);
  if (existingPartIndex > -1) {
    showSnackbar(`Part "${selectedPart.value.nama}" sudah ditambahkan. Hapus terlebih dahulu jika ingin mengubah jumlah.`, 'info');
    return;
  }

  if (!service.value.parts) service.value.parts = []; // Ensure array exists
  const hargaJual = selectedPart.value.hargaJual || 0;
  const subtotal = qty * hargaJual;

  service.value.parts.push({
    itemId: selectedPart.value.id,
    nama: selectedPart.value.nama,
    kode: selectedPart.value.kode,
    satuan: selectedPart.value.satuan,
    jumlah: qty,
    hargaJual: hargaJual, // Use item's sale price
    subtotal: subtotal, // Calculate and store subtotal
  });

  // Show success message
  showSnackbar(`Part ${selectedPart.value.nama} berhasil ditambahkan`, 'success');

  // Close dialog
  cancelAddPart();
}

function removePart(index) {
  // Prevent removing part if invoice is paid
  if (invoicePaid.value) {
    showSnackbar('Tidak dapat menghapus part: Invoice sudah dibayar', 'error');
    return;
  }

  if (service.value?.parts) {
    const removedPart = service.value.parts[index];
    service.value.parts.splice(index, 1);
    showSnackbar(`Part ${removedPart.nama} berhasil dihapus`, 'info');
  }
}

function cancelAddPart() {
  showAddPartDialog.value = false;
  selectedPart.value = null;
  newPart.jumlah = 1;
  partJumlahError.value = '';
  partSearchQuery.value = '';
  partCategoryFilter.value = 'semua';
}


// --- General Functions ---
function getStatusColor(status) {
  switch (status) {
    case 'Dikerjakan': return 'orange';
    case 'Selesai': return 'green';
    case 'Antri': return 'blue';
    case 'Tunggu Part': return 'purple';
    case 'Baru': return 'info';
    default: return 'grey';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'Dikerjakan': return 'mdi-wrench';
    case 'Selesai': return 'mdi-check-circle';
    case 'Antri': return 'mdi-clock-outline';
    case 'Tunggu Part': return 'mdi-package-variant-closed';
    case 'Baru': return 'mdi-car';
    default: return 'mdi-help-circle';
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
}

function goBack() {
  router.push('/servis');
}

// --- Invoice Management ---
function createInvoice() {
  if (hasInvoice.value) {
    // If invoice already exists, navigate to it regardless of payment status
    const invoices = getInvoicesByServiceId(props.id);
    if (invoices.length > 0) {
      router.push(`/invoice/${invoices[0].id}`);
    }
  } else {
    // If invoice is already paid, show warning and don't allow creating new invoice
    if (invoicePaid.value) {
      showSnackbar('Invoice sudah dibayar, tidak dapat membuat invoice baru', 'error');
      return;
    }
    // Create new invoice
    try {
      const result = generateInvoiceFromService(props.id);

      // Check if result contains an error message
      if (result && result.error) {
        showSnackbar(result.error, 'warning');
        return;
      }

      // If we have a valid invoice
      if (result) {
        showSnackbar('Invoice berhasil dibuat', 'success');
        hasInvoice.value = true;
        // Navigate to the invoice
        setTimeout(() => {
          router.push(`/invoice/${result.id}`);
        }, 1000);
      } else {
        showSnackbar('Gagal membuat invoice', 'error');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showSnackbar('Terjadi kesalahan saat membuat invoice', 'error');
    }
  }
}

// --- Save Changes ---
function saveChanges() {
  if (!service.value) return;

  // Prevent saving if invoice is paid
  if (invoicePaid.value) {
    showSnackbar('Tidak dapat menyimpan perubahan: Invoice sudah dibayar', 'error');
    return;
  }

  isSaving.value = true;
  console.log(`Saving changes for service ${service.value.id}`);

  // Recalculate subtotals for all parts to ensure they're correct
  if (service.value.parts && service.value.parts.length > 0) {
    service.value.parts.forEach(part => {
      part.subtotal = part.jumlah * part.hargaJual;
    });
  }

  // Prepare data to save
  const dataToUpdate = {
    status: editableStatus.value,
    jasa: service.value.jasa || [],
    parts: service.value.parts || [],
    totalBiaya: totalBiayaKeseluruhan.value, // Save the calculated total cost
    // Add other fields if they become editable
  };

  // --- Implement Stock Deduction and Service Update ---
  let stockDeductionSuccess = true;
  const partsToDeduct = service.value.parts || [];
  const stockErrors = [];

  // 1. Verify stock availability again and deduct stock
  for (const part of partsToDeduct) {
    try {
      // Re-check current stock before deducting
      const currentItemState = getItemById(part.itemId);
      if (!currentItemState || currentItemState.stokSaatIni < part.jumlah) {
        stockErrors.push(`Stok ${part.nama} tidak mencukupi (tersisa ${currentItemState?.stokSaatIni || 0}, butuh ${part.jumlah}).`);
        stockDeductionSuccess = false;
        continue; // Skip deduction for this item
      }
      // Deduct stock (negative quantity)
      updateItemStock(part.itemId, -part.jumlah);
      console.log(`Deducted ${part.jumlah} from stock for item ID ${part.itemId}`);
    } catch (stockError) {
      console.error(`Error deducting stock for item ID ${part.itemId}:`, stockError);
      stockErrors.push(`Gagal mengurangi stok ${part.nama}.`);
      stockDeductionSuccess = false;
      // Decide if we need to revert previous deductions - complex, maybe just abort
    }
  }

  // 2. If stock deduction failed for any item, abort the service update
  if (!stockDeductionSuccess) {
    showSnackbar(`Gagal menyimpan: Masalah stok.\n- ${stockErrors.join('\n- ')}\n\nHarap periksa kembali spare part yang digunakan dan stok saat ini.`, 'error');
    // TODO: Consider reverting any successful stock deductions if partial failure occurred (more complex)
    isSaving.value = false;
    return;
  }

  // 3. Proceed with saving the service details if stock deduction was successful
  try {
    const updated = updateService(service.value.id, dataToUpdate);
    if (updated) {
      loadServiceDetails(); // Reload to reflect saved state
      showSnackbar('Perubahan berhasil disimpan!', 'success');
    } else {
      showSnackbar('Gagal menyimpan perubahan: Servis tidak ditemukan.', 'error');
      // TODO: Revert stock deductions if service save fails? (Needs careful implementation)
    }
  } catch (error) {
    console.error("Error saving service changes:", error);
    showSnackbar('Terjadi kesalahan saat menyimpan perubahan servis.', 'error');
    // TODO: Revert stock deductions if service save fails?
  } finally {
    isSaving.value = false;
  }
}

// --- Delete Service ---
function cancelDelete() {
  showDeleteConfirmDialog.value = false;
}

function executeDelete() {
  if (!service.value) return;

  // Prevent deletion if invoice is paid
  if (invoicePaid.value) {
    showSnackbar('Tidak dapat menghapus servis: Invoice sudah dibayar', 'error');
    showDeleteConfirmDialog.value = false;
    return;
  }

  isDeleting.value = true;
  try {
    const success = deleteService(service.value.id);
    if (success) {
      // Show snackbar *before* navigating away
      showSnackbar(`Servis untuk ${service.value.nomorPolisi} berhasil dihapus.`, 'success');
      router.push('/servis'); // Go back to list after deletion
    } else {
      showSnackbar('Gagal menghapus servis: Data tidak ditemukan.', 'error');
    }
  } catch (error) {
    console.error("Error deleting service:", error);
    showSnackbar('Terjadi kesalahan saat menghapus servis.', 'error');
  } finally {
    isDeleting.value = false;
    showDeleteConfirmDialog.value = false;
  }
}

</script>

<style scoped>
/* Card Styling */
.info-card {
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.info-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Status Chip Styling */
.status-chip {
  font-weight: 500;
  padding: 0 12px;
}

/* Service Type Chips */
.service-type-chip {
  margin-right: 4px;
  margin-bottom: 4px;
  background-color: rgba(0, 0, 0, 0.03);
}

/* Complaint Text */
.complaint-text {
  white-space: pre-line;
  line-height: 1.5;
}

/* Table Styling */
.service-fees-table, .parts-table {
  width: 100%;
  overflow-x: auto;
}

.total-row {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Cost Summary Card */
.cost-summary-card {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* Cost Chart */
.cost-chart-container {
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 120px;
  border-radius: 8px;
}

.cost-chart {
  width: 100%;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  margin-top: 8px;
}

.cost-bar {
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  position: relative;
}

.jasa-bar {
  background-color: #1976d2; /* Explicit blue color for jasa */
  border-radius: 15px 0 0 15px;
}

.parts-bar {
  background-color: #ff9800; /* Explicit orange color for parts */
  border-radius: 0 15px 15px 0;
}

/* Legend for cost chart */
.cost-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 4px;
}

.jasa-color {
  background-color: #1976d2;
}

.parts-color {
  background-color: #ff9800;
}

.cost-label {
  white-space: nowrap;
  padding: 0 8px;
}

/* Action Buttons */
.action-buttons-card {
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.action-button {
  height: 48px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.secondary-action {
  flex: 1;
}

/* Dialog Styling */
.jasa-dialog, .part-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.mobile-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Jasa Dialog Styling */
.predefined-services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 2px;
}

.service-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--v-theme-primary);
}

.selected-service {
  border: 2px solid var(--v-theme-primary);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.quick-price-buttons {
  display: flex;
  flex-direction: column;
}

.price-buttons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

/* Parts Dialog Styling */
.search-filter-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.parts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 2px;
}

.part-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.part-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--v-theme-primary);
}

.selected-part {
  border: 2px solid var(--v-theme-primary);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.part-category-filter {
  width: 120px;
}

.quantity-selector {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  padding: 4px 8px;
  margin-top: 8px;
}

.quantity-input {
  width: 50px;
}

/* Mobile Specific Styles */
@media (max-width: 600px) {
  .predefined-services-grid, .parts-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    max-height: 200px;
  }

  .part-category-filter {
    width: 100%;
  }

  .quantity-input {
    width: 40px;
  }
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .status-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .status-chip {
    margin-bottom: 8px;
  }
}
</style>
