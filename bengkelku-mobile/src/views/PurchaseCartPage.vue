<template>
  <v-container>
    <!-- Modern Header -->
    <v-card class="mb-4" variant="flat">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon size="large" icon="mdi-cart" color="primary" class="me-3"></v-icon>
        </template>
        <v-card-title class="text-h5">Keranjang Pembelian</v-card-title>
        <v-card-subtitle>Kelola pembelian stok barang</v-card-subtitle>

        <template v-slot:append>
          <v-btn variant="text" @click="goBackToStock" prepend-icon="mdi-arrow-left">
            Kembali
          </v-btn>
        </template>
      </v-card-item>
    </v-card>

    <!-- Cart Items -->
    <v-card variant="flat" class="mb-4">
      <v-list v-if="cartItems.length > 0" density="compact">
        <v-list-item v-for="item in cartItems" :key="item.itemId" class="mb-1">
          <template v-slot:prepend>
            <v-icon icon="mdi-package-variant" color="primary"></v-icon>
          </template>

          <v-list-item-title class="font-weight-medium">{{ item.nama }}</v-list-item-title>

          <v-list-item-subtitle>
            <v-row dense align="center" class="mt-1">
              <v-col cols="4">
                <v-text-field
                  v-model.number="item.jumlahBeli"
                  label="Jumlah"
                  type="number"
                  min="1"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @change="updateCartItemQuantity(item.itemId, $event.target.value)"
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="text-center">{{ item.satuan }}</v-col>
              <v-col cols="5">
                <v-text-field
                  v-model.number="item.hargaBeli"
                  label="Harga"
                  type="number"
                  min="0"
                  prefix="Rp"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @change="updateCartItemPrice(item.itemId, $event.target.value)"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="text-right">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  density="compact"
                  @click="removeItemFromCart(item.itemId)"
                ></v-btn>
              </v-col>
            </v-row>
          </v-list-item-subtitle>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item class="justify-end">
          <div class="text-h6">Total: {{ formatCurrency(cartSubtotal) }}</div>
        </v-list-item>
      </v-list>

      <v-alert v-else type="info" variant="tonal" density="compact">
        Keranjang pembelian kosong.
      </v-alert>
    </v-card>

    <!-- Purchase Details -->
    <v-card v-if="cartItems.length > 0" variant="flat" class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="purchaseDetails.tanggal"
              label="Tanggal Pembelian*"
              type="date"
              required
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="purchaseDetails.supplier"
              label="Supplier"
              variant="outlined"
              density="compact"
              placeholder="Opsional"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="purchaseDetails.noNota"
              label="Nomor Nota/Invoice"
              variant="outlined"
              density="compact"
              placeholder="Opsional"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Action Buttons -->
    <v-card variant="flat" class="pa-2">
      <v-row dense>
        <v-col cols="12">
          <v-btn
            color="primary"
            block
            @click="finalizePurchase"
            :disabled="cartItems.length === 0"
            :loading="isSaving"
            prepend-icon="mdi-content-save"
          >
            Simpan Pembelian
          </v-btn>
        </v-col>
        <v-col cols="12">
          <v-btn
            color="error"
            variant="text"
            block
            @click="confirmClearCart"
            :disabled="cartItems.length === 0"
            prepend-icon="mdi-delete-sweep"
          >
            Kosongkan Keranjang
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Clear Cart Dialog -->
    <v-dialog v-model="showClearCartConfirmDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h6">Konfirmasi Kosongkan</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus semua item dari keranjang pembelian?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showClearCartConfirmDialog = false">Batal</v-btn>
          <v-btn color="error" @click="executeClearCart">Ya, Kosongkan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getPurchaseCart,
  savePurchaseCart,
  updateCartItem,
  removeCartItem,
  clearPurchaseCart,
  recordPurchase, // Import recordPurchase to finalize
} from "../stores/localStorage.js";
import { useCartState } from '../composables/useCartState'
import { useAppStatus } from '../composables/useAppStatus'

const router = useRouter();
const cartItems = ref([]);
const loading = ref(false); // Might not be needed if cart loads instantly
const isSaving = ref(false);
const showClearCartConfirmDialog = ref(false);

const { updateCartCount } = useCartState()
const { updateNotifications } = useAppStatus()

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info"); // Default color

const purchaseDetails = reactive({
  tanggal: new Date().toISOString().substring(0, 10), // Default to today
  supplier: '',
  noNota: '',
});

onMounted(() => {
  loadCart();
});

// --- Snackbar Helper ---
function showSnackbar(text, color = "info") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

function loadCart() {
  loading.value = true;
  try {
    cartItems.value = getPurchaseCart();
  } catch (error) {
    console.error("Error loading purchase cart:", error);
  } finally {
    loading.value = false;
  }
}

const cartSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = Number(item.hargaBeli) || 0;
    const quantity = Number(item.jumlahBeli) || 0;
    return sum + (quantity * price);
  }, 0);
});

function updateCartItemQuantity(itemId, newQuantity) {
  const qty = Number(newQuantity);
  if (!isNaN(qty) && qty > 0) {
    updateCartItem(itemId, { jumlahBeli: qty });
    // No need to reload cartItems ref manually if updateCartItem modifies the source array and saves
  } else {
    // Optionally revert or show error if input is invalid
    showSnackbar("Jumlah harus angka positif.", 'warning');
    // Force re-render might be needed if the input doesn't auto-revert
    const item = cartItems.value.find(i => i.itemId === itemId);
    if (item) item.jumlahBeli = Number(item.jumlahBeli); // Force reactivity update
  }
}

function updateCartItemPrice(itemId, newPrice) {
  const price = Number(newPrice);
  if (!isNaN(price) && price >= 0) {
    updateCartItem(itemId, { hargaBeli: price });
  } else {
    showSnackbar("Harga beli tidak valid.", 'warning');
    const item = cartItems.value.find(i => i.itemId === itemId);
    if (item) item.hargaBeli = Number(item.hargaBeli); // Force reactivity update
  }
}


function removeItemFromCart(itemId) {
  if (confirm(`Hapus ${cartItems.value.find(i => i.itemId === itemId)?.nama} dari keranjang?`)) {
    removeCartItem(itemId);
    loadCart(); // Reload cart after removal
    updateCartCount() // Update cart count
  }
}

function confirmClearCart() {
  showClearCartConfirmDialog.value = true;
}

function executeClearCart() {
  clearPurchaseCart();
  loadCart();
  updateCartCount() // Update cart count
  showClearCartConfirmDialog.value = false;
}

function finalizePurchase() {
  if (cartItems.value.length === 0) {
    showSnackbar("Keranjang kosong, tidak ada yang bisa disimpan.", 'warning');
    return;
  }
  if (!purchaseDetails.tanggal) {
    showSnackbar('Tanggal pembelian wajib diisi.', 'warning');
    return;
  }

  isSaving.value = true;
  try {
    const dataToSave = {
      tanggal: purchaseDetails.tanggal,
      supplier: purchaseDetails.supplier || '',
      noNota: purchaseDetails.noNota || '',
      items: cartItems.value.map(item => ({
        itemId: item.itemId,
        quantity: item.jumlahBeli,
        purchasePrice: item.hargaBeli,
      })),
      totalCost: cartSubtotal.value,
    };

    const savedPurchase = recordPurchase(dataToSave); // This function also updates stock
    console.log('Purchase recorded from cart:', savedPurchase);
    clearPurchaseCart(); // Clear the cart after successful save
    updateCartCount(); // Update cart count badge
    updateNotifications(); // Update notification badges for low stock
    showSnackbar('Pembelian berhasil dicatat dan stok diperbarui!', 'success');
    router.push('/stok'); // Go back to stock list
  } catch (error) {
    console.error("Error finalizing purchase:", error);
    showSnackbar('Gagal mencatat pembelian. Silakan coba lagi.', 'error');
  } finally {
    isSaving.value = false;
  }
}


function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numberValue);
}

function goBackToStock() {
  router.push('/stok');
}

</script>

<style scoped>
.v-list-item {
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}

.v-text-field :deep(.v-field__input) {
  min-height: 36px !important;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .v-card-title {
    font-size: 1.25rem !important;
  }

  .v-card-subtitle {
    font-size: 0.875rem !important;
  }
}
</style>
