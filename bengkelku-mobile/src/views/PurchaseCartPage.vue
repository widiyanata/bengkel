<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>Keranjang Pembelian</h1>
      <v-btn variant="text" @click="goBackToStock">Kembali ke Stok</v-btn>
    </div>

    <v-card variant="outlined" class="mb-4" density="compact"> <!-- Added density -->
      <v-card-title>Item di Keranjang</v-card-title>
      <v-card-text>
        <v-list lines="two" v-if="cartItems.length > 0" density="compact"> <!-- Added density -->
          <!-- Removed unused 'index' from v-for -->
          <v-list-item v-for="item in cartItems" :key="item.itemId">
            <v-list-item-title class="font-weight-bold text-subtitle-1 mb-1">{{ item.nama }}</v-list-item-title>
            <v-list-item-subtitle class="mt-1">
              <v-row dense align="center">
                <v-col cols="4" sm="3">
                  <v-text-field v-model.number="item.jumlahBeli" label="Jumlah" type="number" min="1" density="compact"
                    variant="outlined" hide-details
                    @change="updateCartItemQuantity(item.itemId, $event.target.value)"></v-text-field>
                </v-col>
                <v-col cols="1" class="text-center">{{ item.satuan }}</v-col>
                <v-col cols="5" sm="4">
                  <v-text-field v-model.number="item.hargaBeli" label="Harga Beli" type="number" min="0" prefix="Rp"
                    density="compact" variant="outlined" hide-details
                    @change="updateCartItemPrice(item.itemId, $event.target.value)"></v-text-field>
                </v-col>
                <v-col cols="2" sm="1" class="text-right">
                  <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small"
                    @click="removeItemFromCart(item.itemId)"></v-btn>
                </v-col>
              </v-row>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" variant="tonal">Keranjang pembelian kosong.</v-alert>
      </v-card-text>
      <v-divider v-if="cartItems.length > 0"></v-divider>
      <v-card-text v-if="cartItems.length > 0" class="text-right">
        <strong>Subtotal: {{ formatCurrency(cartSubtotal) }}</strong>
      </v-card-text>
    </v-card>

    <!-- Purchase Details Form (Supplier, Nota, Date) -->
    <v-card variant=""  class="mb-4" v-if="cartItems.length > 0" density="compact"> <!-- Added density -->
      <v-card-title>Detail Pembelian Final</v-card-title>
      <v-card-text>
        <v-text-field v-model="purchaseDetails.tanggal" label="Tanggal Pembelian*" type="date" required
          variant="outlined" density="compact" class="mb-1"></v-text-field> <!-- Added density -->
        <v-text-field v-model="purchaseDetails.supplier" label="Supplier (Opsional)" variant="outlined"
          density="compact" class="mb-1"></v-text-field> <!-- Added density -->
        <v-text-field v-model="purchaseDetails.noNota" label="Nomor Nota/Invoice (Opsional)" variant="outlined"
          density="compact" class="mb-1"></v-text-field> <!-- Added density -->
        <div class="text-h6 mt-3"><strong>Total Pembelian: {{ formatCurrency(cartSubtotal) }}</strong></div>
      </v-card-text>
    </v-card>

    <!-- Action Buttons -->
    <v-btn color="primary" size="large" block @click="finalizePurchase" :disabled="cartItems.length === 0"
      :loading="isSaving">
      Simpan Pembelian & Update Stok
    </v-btn>
    <v-btn color="error" variant="outlined" block class="mt-4" @click="confirmClearCart"
      :disabled="cartItems.length === 0">
      Kosongkan Keranjang
    </v-btn>

    <!-- Clear Cart Confirmation Dialog -->
    <v-dialog v-model="showClearCartConfirmDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5 warning--text">Konfirmasi Kosongkan</v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus semua item dari keranjang pembelian?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" variant="text" @click="showClearCartConfirmDialog = false">Batal</v-btn>
          <v-btn color="warning" variant="flat" @click="executeClearCart">Ya, Kosongkan</v-btn>
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

const router = useRouter();
const cartItems = ref([]);
const loading = ref(false); // Might not be needed if cart loads instantly
const isSaving = ref(false);
const showClearCartConfirmDialog = ref(false);

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
  }
}

function confirmClearCart() {
  showClearCartConfirmDialog.value = true;
}

function executeClearCart() {
  clearPurchaseCart();
  loadCart();
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
/* Add specific styles if needed */
</style>
