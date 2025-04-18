<template>
  <v-container class="add-service-container">
    <!-- Header with Breadcrumb -->
    <!-- <div class="page-header mb-2">
      <div class="d-flex align-center mb-2">
        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0"></v-breadcrumbs>
      </div>
      <div class="d-flex align-center">
        <v-icon icon="mdi-wrench-outline" color="primary" size="large" class="me-2"></v-icon>
        <h1 class="text-h5 font-weight-bold">Tambah Servis Baru</h1>
      </div>
    </div> -->

    <v-app-bar>
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack"></v-btn>
      <v-app-bar-title class="text-subtitle-1">Tambah Servis</v-app-bar-title>
    </v-app-bar>

    <v-form ref="form">
      <!-- Accordion untuk kendaraan dan jenis servis -->
      <v-expansion-panels class="mb-4">
        <!-- Panel Kendaraan -->
        <v-expansion-panel :value="0">
          <v-expansion-panel-title class="py-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-car" color="primary" class="me-2"></v-icon>
              <span>Kendaraan</span>
              <v-chip v-if="serviceData.selectedVehicleInfo" size="small" color="success" class="ms-2">
                {{ serviceData.selectedVehicleInfo.nomorPolisi }}
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
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
              density="compact"
            ></v-text-field>

            <!-- Loading Indicator -->
            <div v-if="isSearching" class="d-flex justify-center my-2">
              <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
            </div>

            <!-- Display Selected Vehicle -->
            <v-card v-if="serviceData.selectedVehicleInfo" color="success" variant="tonal" class="selected-vehicle-card mb-2">
              <v-card-text class="pa-2">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-body-1 font-weight-medium">{{ serviceData.selectedVehicleInfo.nomorPolisi }}</div>
                    <div class="text-caption text-grey">
                      {{ serviceData.selectedVehicleInfo.customerName }} - {{ serviceData.selectedVehicleInfo.vehicleInfo }}
                    </div>
                  </div>
                  <v-btn icon="mdi-close-circle" variant="text" size="small" @click="clearSelectedVehicle"></v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Search Results / Add New Button (only show if no vehicle selected) -->
            <div v-if="!serviceData.selectedVehicleInfo" class="mt-2">
              <!-- Search Result Found -->
              <v-card v-if="searchResult" variant="tonal" color="info" class="mb-3 search-result-card">
                <v-card-text class="pa-2" @click="selectVehicle">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-1 font-weight-medium">{{ searchResult.nomorPolisi }}</div>
                      <div class="text-caption text-grey">
                        {{ searchResult.customerName }} - {{ searchResult.merkTipe }}
                      </div>
                    </div>
                    <v-icon
                      :icon="serviceData?.kendaraanId === searchResult.id ? 'mdi-check-circle' : 'mdi-chevron-right'"
                      :color="serviceData?.kendaraanId === searchResult.id ? 'success' : 'grey'"
                      size="small"
                    ></v-icon>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Not Found -->
              <div v-else-if="!vehicleFound && serviceData.nomorPolisi.length > 3">
                <v-alert type="info" variant="tonal" class="mb-3" density="compact">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-car-off" class="me-2"></v-icon>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">Kendaraan Tidak Ditemukan</div>
                      <div class="text-caption">Nomor polisi <strong>{{ serviceData.nomorPolisi }}</strong> belum terdaftar</div>
                    </div>
                  </div>
                </v-alert>
                <div class="d-flex justify-center">
                  <v-btn
                    color="primary"
                    variant="flat"
                    @click="showAddCustomer = true"
                    prepend-icon="mdi-account-plus"
                    size="small"
                  >
                    Tambah Pelanggan & Kendaraan Baru
                  </v-btn>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel Jenis Servis -->
        <v-expansion-panel class="">
          <v-expansion-panel-title class="py-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-wrench" color="primary" class="me-2"></v-icon>
              <span>Keluhan / Jenis Servis*</span>
              <v-chip v-if="serviceData.jenisServis.length > 0" size="small" color="primary" class="ms-2">
                {{ serviceData.jenisServis.length }} dipilih
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="service-type-grid mb-0">
              <v-chip-group v-model="serviceData.jenisServis" multiple>
                <v-chip
                  filter
                  variant="flat"
                  color="primary"
                  class="service-type-chip dark--text"
                  text-color="primary"
                  prepend-icon="mdi-oil"
                  density="compact"
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
                  density="compact"
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
                  density="compact"
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
                  density="compact"
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
                  density="compact"
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
                  density="compact"
                >
                  Lainnya...
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Selected Service Types Summary -->
            <v-card v-if="serviceData.jenisServis.length > 0" variant="tonal" class="my-2 pa-2">
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="(index, i) in serviceData.jenisServis"
                  :key="i"
                  size="x-small"
                  class="ma-1 "
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
              rows="2"
              class="mt-2"
              :required="isLainnyaSelected"
              counter
              density="compact"
              hide-details
            ></v-textarea>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Jasa dan Spare Parts (Gabungan) -->
      <v-card variant="flat" class="mb-4">
        <!-- Tab untuk Jasa dan Spare Part -->
        <v-tabs v-model="itemInputTab" density="normal" class="" grow>
          <v-tab value="jasa" class="text-body-1">
            <v-icon icon="mdi-wrench-outline" class="me-2"></v-icon>
            Jasa
          </v-tab>
          <v-tab value="part" class="text-body-1">
            <v-icon icon="mdi-package-variant" class="me-2"></v-icon>
            Spare Part
          </v-tab>
        </v-tabs>

        <v-window v-model="itemInputTab" class="px-2 pb-2">
          <!-- Jasa Tab -->
          <v-window-item value="jasa">
            <v-tabs v-model="jasaInputTab" color="secondary" align-tabs="center">
              <v-tab value="predefined">
                <v-icon icon="mdi-format-list-bulleted" class="me-1" size="small"></v-icon>
                Tersedia
              </v-tab>
              <v-tab value="custom">
                <v-icon icon="mdi-pencil" class="me-1" size="small"></v-icon>
                Kustom
              </v-tab>
            </v-tabs>

            <v-window v-model="jasaInputTab">
              <!-- Predefined Services Tab -->
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
                <div class="predefined-jasa-grid mb-2">
                  <v-card
                    v-for="jasa in filteredPredefinedJasa"
                    :key="jasa.id"
                    variant="tonal"
                    class="jasa-card"
                    :class="{ 'selected-jasa': isJasaSelected(jasa) }"
                  >
                    <v-card-text class="pa-2">
                      <div class="d-flex justify-space-between">
                        <div class="text-caption text-truncate">{{ jasa.deskripsi }}</div>
                      </div>
                      <div class="text-subtitle-2 primary--text">{{ formatCurrency(jasa.biaya) }}</div>
                      <div class="d-flex justify-space-between align-center mt-1">
                        <v-btn
                          icon="mdi-minus"
                          variant="text"
                          density="compact"
                          size="x-small"
                          color="error"
                          @click="removeJasaFromSelection(jasa)"
                          :disabled="!isJasaSelected(jasa)"
                        ></v-btn>
                        <v-badge
                          v-if="isJasaSelected(jasa)"
                          :content="1"
                          color="primary"
                          inline
                        ></v-badge>
                        <v-btn
                          icon="mdi-plus"
                          variant="text"
                          density="compact"
                          size="x-small"
                          color="success"
                          @click="addJasaToSelection(jasa)"
                          :disabled="isJasaSelected(jasa)"
                        ></v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>

                <!-- No Results Message -->
                <div v-if="filteredPredefinedJasa.length === 0" class="text-center pa-2">
                  <v-icon icon="mdi-alert-circle-outline" color="grey" size="small" class="mb-1"></v-icon>
                  <div class="text-caption">Tidak ada jasa yang sesuai</div>
                  <div class="text-caption text-grey">Coba ubah kata kunci atau buat jasa kustom</div>
                </div>
              </v-window-item>

              <!-- Custom Service Tab -->
              <v-window-item value="custom">
                <v-form ref="jasaForm">
                  <v-text-field
                    v-model="newJasa.deskripsi"
                    label="Deskripsi Jasa*"
                    variant="outlined"
                    density="compact"
                    placeholder="Contoh: Ganti Oli Mesin"
                    :rules="[v => !!v || 'Deskripsi jasa wajib diisi']"
                    class="mb-2"
                  ></v-text-field>
                  <v-text-field
                    v-model.number="newJasa.biaya"
                    label="Biaya Jasa*"
                    variant="outlined"
                    density="compact"
                    type="number"
                    prefix="Rp"
                    placeholder="25000"
                    :rules="[
                      v => !!v || 'Biaya jasa wajib diisi',
                      v => v > 0 || 'Biaya harus lebih dari 0'
                    ]"
                  ></v-text-field>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    block
                    @click="addCustomJasaToSelection"
                    :disabled="!newJasa.deskripsi || !newJasa.biaya || newJasa.biaya <= 0"
                    class="mt-2"
                  >
                    Tambah Jasa Kustom
                  </v-btn>
                </v-form>
              </v-window-item>
            </v-window>
          </v-window-item>

          <!-- Spare Part Tab -->
          <v-window-item value="part">
            <!-- Search and Filter -->
            <div :class="$vuetify.display.xs ? 'search-filter-mobile' : 'd-flex gap-2 mb-3'" class="mt-2">
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
                variant="tonal"
                class="part-card"
                :class="{ 'selected-part': isPartSelected(part) }"
              >
                <v-card-text :class="$vuetify.display.xs ? 'pa-2' : 'pa-3'">
                  <div class="d-flex justify-space-between">
                    <div class="text-caption text-truncate">{{ part.nama }}</div>
                    <v-chip size="x-small" :color="getStockColor(part.stokSaatIni)" class="ml-1">{{ part.stokSaatIni }}</v-chip>
                  </div>
                  <div class="text-subtitle-2 primary--text">{{ formatCurrency(part.hargaJual) }}</div>
                  <div class="d-flex justify-space-between align-center mt-1">
                    <v-btn
                      icon="mdi-minus"
                      variant="text"
                      density="compact"
                      size="x-small"
                      color="error"
                      @click="decreasePartQuantity(part)"
                      :disabled="!isPartSelected(part)"
                    ></v-btn>
                    <v-badge
                      v-if="isPartSelected(part)"
                      :content="getPartQuantity(part)"
                      color="primary"
                      inline
                    ></v-badge>
                    <v-btn
                      icon="mdi-plus"
                      variant="text"
                      density="compact"
                      size="x-small"
                      color="success"
                      @click="increasePartQuantity(part)"
                      :disabled="getPartQuantity(part) >= part.stokSaatIni"
                    ></v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- No Results Message -->
            <div v-if="!loadingItems && filteredParts.length === 0" class="text-center pa-2">
              <v-icon icon="mdi-package-variant" color="grey" size="small" class="mb-1"></v-icon>
              <div class="text-caption">Tidak ada part yang sesuai</div>
              <div class="text-caption text-grey">Coba ubah kata kunci atau filter</div>
            </div>
          </v-window-item>
        </v-window>


      </v-card>



      <!-- Tombol Aksi -->
      <div class="d-flex gap-2">
        <v-btn
          v-if="hasItems"
          color="primary"
          class="flex-grow-1 me-2"
          @click="showBottomSheet = true"
        >
          <v-icon>mdi-cart-outline</v-icon>
          <v-badge
            :content="totalItems"
            color="secondary"
            location="bottom"
            offset-x="10"
            offset-y="10"
            class="badge-elevated"
          ></v-badge>
        </v-btn>
        <v-btn
          color="primary"
          @click="hasItems ? showBottomSheet = true : confirmSave()"
          :loading="isSaving"
          prepend-icon="mdi-content-save"
          class="flex-grow-1 me-2"
          variant="flat"
        >
          Simpan Servis
        </v-btn>
        <v-btn
          variant="tonal"
          @click="goBack"
          prepend-icon="mdi-arrow-left"
        >
          Kembali
        </v-btn>
      </div>

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
            <div v-else class="mt-2">
              <div class="text-subtitle-2">Pelanggan:</div>
              <div>{{ serviceData.walkInCustomerName }} (Walk-in)</div>
            </div>
            <div class="mt-2">
              <div class="text-subtitle-2">Keluhan:</div>
              <div>{{ serviceData.keterangan || "Cek kerusakan" }}</div>
            </div>
            <div class="mt-3">
              <div class="text-subtitle-2">Total Biaya:</div>
              <div class="text-h6 primary--text">{{ formatCurrency(totalBiayaKeseluruhan) }}</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="showConfirmDialog = false">Batal</v-btn>
            <v-btn color="primary" variant="flat" @click="saveService" :loading="isSaving">Ya, Simpan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>




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

      <!-- Bottom Sheet untuk Selected Items Summary -->
      <v-bottom-sheet v-model="showBottomSheet" persistent scrollable>
        <v-card>
          <v-toolbar density="compact" color="primary">
            <v-toolbar-title class="text-white">Item Terpilih</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="showBottomSheet = false">
              <v-icon color="white">mdi-chevron-down</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text class="pa-2">
            <div v-if="hasItems" class="mb-3">
              <v-list density="compact" class="pa-0 mb-2">
                <!-- Jasa Items -->
                <v-list-item
                  v-for="(jasa, index) in serviceData.jasa"
                  :key="`jasa-${index}`"
                  :subtitle="formatCurrency(jasa.biaya)"
                  class="px-1 py-1 mb-1 rounded"
                  density="compact"
                  variant="flat"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-wrench-outline" size="small" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>{{ jasa.deskripsi }}</v-list-item-title>
                  <template v-slot:append>
                    <div class="d-flex align-center">
                      <span class="text-caption me-2">{{ formatCurrency(jasa.biaya) }}</span>
                      <v-btn icon="mdi-delete-outline" variant="text" color="error" size="x-small" density="compact"
                        @click="removeJasa(index)"></v-btn>
                    </div>
                  </template>
                </v-list-item>

                <!-- Parts Items -->
                <v-list-item
                  v-for="(part, index) in serviceData.parts"
                  :key="`part-${index}`"
                  :subtitle="`${part.jumlah} ${part.satuan} × ${formatCurrency(part.hargaJual)}`"
                  class="px-1 py-1 mb-1 rounded"
                  density="compact"
                  variant="flat"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-package-variant" size="small" color="secondary"></v-icon>
                  </template>
                  <v-list-item-title>{{ part.nama }}</v-list-item-title>
                  <template v-slot:append>
                    <div class="d-flex align-center">
                      <span class="text-caption me-2">{{ formatCurrency(part.jumlah * part.hargaJual) }}</span>
                      <v-btn icon="mdi-delete-outline" variant="text" color="error" size="x-small" density="compact"
                        @click="removePart(index)"></v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <!-- Summary -->
              <v-card color="primary" variant="tonal" class="pa-2">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption">Total Jasa</span>
                  <span class="text-body-2">{{ formatCurrency(totalBiayaJasa) }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption">Total Spare Part</span>
                  <span class="text-body-2">{{ formatCurrency(totalBiayaParts) }}</span>
                </div>
                <v-divider class="my-1"></v-divider>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-subtitle-2">Total</span>
                  <span class="text-subtitle-1 font-weight-bold">{{ formatCurrency(totalBiayaKeseluruhan) }}</span>
                </div>
              </v-card>

              <!-- Tombol Simpan di Bottom Sheet -->
              <v-btn
                color="primary"
                variant="flat"
                block
                class="mt-4"
                size="large"
                @click="confirmSave"
                :loading="isSaving"
                prepend-icon="mdi-content-save"
              >
                Simpan Servis
              </v-btn>
            </div>
            <v-alert v-else type="info" variant="tonal" class="ma-0 pa-2" density="compact">
              Belum ada jasa atau spare part yang ditambahkan. Pilih jasa atau spare part di atas untuk menambahkan.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-bottom-sheet>

      <!-- Snackbar for Notifications -->
      <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" location="top right">
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn color="white" variant="text" @click="snackbar = false">
            Tutup
          </v-btn>
        </template>
      </v-snackbar>
    </v-form>
  </v-container>
</template>
<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
// Import Local Storage functions
import {
  findVehicleByNomorPolisi,
  addCustomer,
  addVehicle,
  addService as saveServiceToStorage, // Rename to avoid conflict
  getAllItems,
  updateItemStock,
} from "../stores/localStorage.js";
import { useAppStatus } from "../composables/useAppStatus.js"; // Import for notifications

const router = useRouter();
const form = ref(null); // For form validation if needed later
const customerForm = ref(null); // For customer form validation

// Get updateNotifications function from useAppStatus
const { updateNotifications } = useAppStatus();
const jasaForm = ref(null); // For jasa form validation
const searchResult = ref(null); // Stores found vehicle info before selection
const vehicleFound = ref(false); // Flag if search yielded a result
const showAddCustomer = ref(false); // Controls the dialog visibility
const showConfirmDialog = ref(false); // Controls the confirmation dialog
const isSearching = ref(false); // Loading indicator for search
const isSaving = ref(false); // Loading indicator for save
const isCustomerFormValid = ref(false); // For customer form validation

// Tab State
const itemInputTab = ref('jasa');

// Jasa Tab State
const jasaInputTab = ref('predefined');
const jasaSearchQuery = ref('');

// Part Tab State
const partSearchQuery = ref(''); // For searching parts
const partCategoryFilter = ref('semua'); // For filtering parts by category
const availableStockItems = ref([]);
const loadingItems = ref(false);

// Part categories
const partCategories = [
  { title: 'Semua Kategori', value: 'semua' },
  { title: 'Oli', value: 'oli' },
  { title: 'Filter', value: 'filter' },
  { title: 'Busi', value: 'busi' },
  { title: 'Rem', value: 'rem' },
  { title: 'Lainnya', value: 'lainnya' },
];

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

// Bottom Sheet State
const showBottomSheet = ref(false);

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

// Data for the new jasa form
const newJasa = reactive({
  deskripsi: "",
  biaya: null,
});

// Predefined jasa list
const predefinedJasa = [
  { id: 1, deskripsi: "Ganti Oli Mesin", biaya: 25000 },
  { id: 2, deskripsi: "Ganti Oli Gardan", biaya: 20000 },
  { id: 3, deskripsi: "Servis Ringan", biaya: 50000 },
  { id: 4, deskripsi: "Servis Besar", biaya: 150000 },
  { id: 5, deskripsi: "Ganti Filter Udara", biaya: 15000 },
  { id: 6, deskripsi: "Ganti Filter Oli", biaya: 15000 },
  { id: 7, deskripsi: "Ganti Busi", biaya: 20000 },
  { id: 8, deskripsi: "Ganti Kampas Rem Depan", biaya: 35000 },
  { id: 9, deskripsi: "Ganti Kampas Rem Belakang", biaya: 35000 },
  { id: 10, deskripsi: "Tambal Ban", biaya: 15000 },
  { id: 11, deskripsi: "Ganti Ban Dalam", biaya: 20000 },
  { id: 12, deskripsi: "Tune Up", biaya: 75000 },
];

const serviceData = reactive({
  nomorPolisi: "",
  pelangganId: null,
  kendaraanId: null,
  jenisServis: [5],
  keterangan: "Cek kerusakan", // Default keluhan
  selectedVehicleInfo: null, // To store selected/newly added vehicle info { nomorPolisi, customerName, vehicleInfo }
  jasa: [], // Array of jasa objects { deskripsi, biaya }
  parts: [], // Array of part objects { id, nama, jumlah, satuan, hargaJual }
  isWalkIn: true, // Flag untuk menandai customer walk-in
  walkInCustomerName: "Walk-in Customer" // Nama default untuk walk-in customer
});

// --- Lifecycle Hooks ---
onMounted(() => {
  loadAvailableItems();
});

// --- Computed Properties ---
// Check if there are any items (jasa or parts)
const hasItems = computed(() => {
  return (serviceData.jasa && serviceData.jasa.length > 0) ||
         (serviceData.parts && serviceData.parts.length > 0);
});

// Basic check if 'Lainnya...' chip is selected
const isLainnyaSelected = computed(() => {
  // In a real app, the value of the chip might be different
  return serviceData.jenisServis.includes(5); // Assuming 'Lainnya...' is the 6th chip (index 5)
});

// Filter predefined jasa based on search query
const filteredPredefinedJasa = computed(() => {
  if (!jasaSearchQuery.value) return predefinedJasa;
  const query = jasaSearchQuery.value.toLowerCase();
  return predefinedJasa.filter(jasa =>
    jasa.deskripsi.toLowerCase().includes(query) ||
    jasa.biaya.toString().includes(query)
  );
});

// Filter parts based on search query and category
const filteredParts = computed(() => {
  if (!availableStockItems.value.length) return [];

  let filtered = availableStockItems.value;

  // Apply search filter
  if (partSearchQuery.value) {
    const query = partSearchQuery.value.toLowerCase();
    filtered = filtered.filter(item =>
      (item.nama && item.nama.toLowerCase().includes(query)) ||
      (item.kode && item.kode.toLowerCase().includes(query))
    );
  }

  // Apply category filter
  if (partCategoryFilter.value !== 'semua') {
    // This is a simplified category filter - in a real app, you'd have proper category data
    filtered = filtered.filter(item => {
      const name = item.nama.toLowerCase();
      switch (partCategoryFilter.value) {
        case 'oli': return name.includes('oli');
        case 'filter': return name.includes('filter');
        case 'busi': return name.includes('busi');
        case 'rem': return name.includes('rem');
        case 'lainnya':
          return !name.includes('oli') &&
                 !name.includes('filter') &&
                 !name.includes('busi') &&
                 !name.includes('rem');
        default: return true;
      }
    });
  }

  // Only show items with stock
  return filtered.filter(item => item.stokSaatIni > 0);
});

// Calculate total biaya jasa
const totalBiayaJasa = computed(() => {
  return serviceData.jasa.reduce((sum, j) => sum + (Number(j.biaya) || 0), 0);
});

// Calculate total biaya parts
const totalBiayaParts = computed(() => {
  return serviceData.parts.reduce((sum, p) => sum + (Number(p.jumlah) || 0) * (Number(p.hargaJual) || 0), 0);
});

// Calculate total biaya keseluruhan
const totalBiayaKeseluruhan = computed(() => {
  return totalBiayaJasa.value + totalBiayaParts.value;
});

// Calculate total items (jasa + parts)
const totalItems = computed(() => {
  return serviceData.jasa.length + serviceData.parts.length;
});



// --- Watchers ---
// Watch for the dialog opening to pre-fill nomorPolisi
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

// Reset form when changing tabs
watch(itemInputTab, (newValue) => {
  if (newValue === 'jasa') {
    partSearchQuery.value = '';
    partCategoryFilter.value = 'semua';
  } else {
    jasaSearchQuery.value = '';
    newJasa.deskripsi = "";
    newJasa.biaya = null;
  }
});

// Watch for changes in jasa and parts to hide bottom sheet when all items are removed
watch([() => serviceData.jasa.length, () => serviceData.parts.length], ([newJasaLength, newPartsLength]) => {
  // Hide bottom sheet when all items are removed
  if (newJasaLength === 0 && newPartsLength === 0) {
    showBottomSheet.value = false;
  }
}, { deep: true });

// --- Helper Functions ---
// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

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

// Get stock color based on stock level
function getStockColor(stock) {
  if (stock <= 0) return 'error';
  if (stock <= 5) return 'warning';
  return 'success';
}

// --- Vehicle Search Functions ---
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

// --- Customer Functions ---
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



// --- Jasa Functions ---
function isJasaSelected(jasa) {
  return serviceData.jasa.some(j => j.deskripsi === jasa.deskripsi);
}

function addJasaToSelection(jasa) {
  // Check if this jasa already exists
  const existingIndex = serviceData.jasa.findIndex(j => j.deskripsi === jasa.deskripsi);
  if (existingIndex >= 0) {
    showSnackbar(`Jasa "${jasa.deskripsi}" sudah ada dalam daftar.`, "warning");
    return;
  }

  // Add to the list
  serviceData.jasa.push({
    deskripsi: jasa.deskripsi,
    biaya: jasa.biaya
  });
  showSnackbar(`Jasa "${jasa.deskripsi}" berhasil ditambahkan.`, "success");
}

function removeJasaFromSelection(jasa) {
  const existingIndex = serviceData.jasa.findIndex(j => j.deskripsi === jasa.deskripsi);
  if (existingIndex >= 0) {
    const removedJasa = serviceData.jasa[existingIndex];
    serviceData.jasa.splice(existingIndex, 1);
    showSnackbar(`Jasa "${removedJasa.deskripsi}" dihapus dari daftar.`, "info");
  }
}

function addCustomJasaToSelection() {
  if (!newJasa.deskripsi || !newJasa.biaya || newJasa.biaya <= 0) {
    showSnackbar("Harap isi data jasa dengan benar.", "warning");
    return;
  }

  // Check if this jasa already exists
  const existingIndex = serviceData.jasa.findIndex(j => j.deskripsi === newJasa.deskripsi);
  if (existingIndex >= 0) {
    showSnackbar(`Jasa "${newJasa.deskripsi}" sudah ada dalam daftar.`, "warning");
    return;
  }

  // Add to the list
  serviceData.jasa.push({
    deskripsi: newJasa.deskripsi,
    biaya: Number(newJasa.biaya)
  });
  showSnackbar(`Jasa "${newJasa.deskripsi}" berhasil ditambahkan.`, "success");

  // Reset form
  newJasa.deskripsi = "";
  newJasa.biaya = null;
}

function removeJasa(index) {
  if (index >= 0 && index < serviceData.jasa.length) {
    const removedJasa = serviceData.jasa[index];
    serviceData.jasa.splice(index, 1);
    showSnackbar(`Jasa "${removedJasa.deskripsi}" dihapus dari daftar.`, "info");
  }
}

// --- Part Functions ---
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
    showSnackbar("Gagal memuat data stok barang.", "error");
  } finally {
    loadingItems.value = false;
  }
}

function searchParts() {
  // The actual filtering is done in the computed property
  // This function is just a placeholder for any additional logic
  console.log("Searching parts with query:", partSearchQuery.value, "and category:", partCategoryFilter.value);
}

function isPartSelected(part) {
  return serviceData.parts.some(p => p.id === part.id);
}

function getPartQuantity(part) {
  const existingPart = serviceData.parts.find(p => p.id === part.id);
  return existingPart ? existingPart.jumlah : 0;
}

function increasePartQuantity(part) {
  // Check if this part already exists in the list
  const existingIndex = serviceData.parts.findIndex(p => p.id === part.id);
  if (existingIndex >= 0) {
    // Update quantity
    const newQuantity = serviceData.parts[existingIndex].jumlah + 1;

    // Check if the new total quantity exceeds available stock
    if (newQuantity > part.stokSaatIni) {
      showSnackbar(`Total jumlah melebihi stok tersedia (${part.stokSaatIni}).`, "warning");
      return;
    }

    serviceData.parts[existingIndex].jumlah = newQuantity;
    showSnackbar(`Jumlah "${part.nama}" diperbarui menjadi ${newQuantity}.`, "success");
  } else {
    // Add new part to the list
    serviceData.parts.push({
      id: part.id,
      nama: part.nama,
      jumlah: 1,
      satuan: part.satuan,
      hargaJual: part.hargaJual
    });
    showSnackbar(`"${part.nama}" berhasil ditambahkan.`, "success");
  }
}

function decreasePartQuantity(part) {
  const existingIndex = serviceData.parts.findIndex(p => p.id === part.id);
  if (existingIndex >= 0) {
    const currentQuantity = serviceData.parts[existingIndex].jumlah;
    if (currentQuantity > 1) {
      // Decrease quantity
      serviceData.parts[existingIndex].jumlah = currentQuantity - 1;
      showSnackbar(`Jumlah "${part.nama}" diperbarui menjadi ${currentQuantity - 1}.`, "success");
    } else {
      // Remove part if quantity becomes 0
      const removedPart = serviceData.parts[existingIndex];
      serviceData.parts.splice(existingIndex, 1);
      showSnackbar(`"${removedPart.nama}" dihapus dari daftar.`, "info");
    }
  }
}

function removePart(index) {
  if (index >= 0 && index < serviceData.parts.length) {
    const removedPart = serviceData.parts[index];
    serviceData.parts.splice(index, 1);
    showSnackbar(`"${removedPart.nama}" dihapus dari daftar.`, "info");
  }
}

// --- Service Functions ---
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
      nomorPolisi: serviceData.selectedVehicleInfo ? serviceData.selectedVehicleInfo.nomorPolisi : serviceData.nomorPolisi || "WALK-IN",
      jenisServis: serviceData.jenisServis,
      keterangan: serviceData.keterangan || "Cek kerusakan", // Gunakan default jika kosong
      // Add jasa and parts data
      jasa: serviceData.jasa,
      parts: serviceData.parts,
      // Add total biaya
      totalBiaya: totalBiayaKeseluruhan.value,
      // Add walk-in customer info if no customer selected
      customerName: serviceData.selectedVehicleInfo ? serviceData.selectedVehicleInfo.customerName : serviceData.walkInCustomerName,
      isWalkIn: !serviceData.selectedVehicleInfo,
      // timestamp and status will be added by addService function
    };

    // Jika tidak ada kendaraan yang dipilih, gunakan default walk-in
    if (!serviceData.selectedVehicleInfo && !serviceData.nomorPolisi) {
      console.log("Saving service for walk-in customer");
    }

    const savedService = saveServiceToStorage(dataToSave); // Use the imported function
    console.log("Service saved:", savedService);

    // Update stock for parts
    if (serviceData.parts && serviceData.parts.length > 0) {
      serviceData.parts.forEach(part => {
        // Reduce stock by the quantity used
        updateItemStock(part.id, -part.jumlah);
      });
      // Update notification badges for low stock
      updateNotifications();
    }

    const message = "Servis berhasil disimpan!";
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
.item-dialog {
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;
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

/* Parts Grid */
.parts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.part-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.part-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-part {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Predefined Jasa Grid */
.predefined-jasa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.jasa-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.jasa-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-jasa {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Predefined Jasa List */
.predefined-jasa-list {
  max-height: 400px;
  overflow-y: auto;
}

.predefined-jasa-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Search and Filter on Mobile */
.search-filter-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.part-category-filter {
  min-width: 150px;
}

/* Floating Action Button */
.fab-cart {
  position: fixed;
  bottom: 120px;
  right: 16px;
  z-index: 5;
}

/* Tab Styling */
.v-tab {
  min-height: 48px;
  font-weight: 500;
  letter-spacing: 0.0125em;
}

.v-tab--selected {
  font-weight: 700;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .service-type-chip {
    margin: 2px;
  }

  .parts-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .predefined-jasa-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
