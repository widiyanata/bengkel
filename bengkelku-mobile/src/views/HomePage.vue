<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center">
    <h1>Beranda</h1>
    <p class="mb-4">Selamat datang di BengkelKu Mobile!</p>

    <!-- Tombol Aksi Cepat -->
    <v-btn color="primary" size="large" prepend-icon="mdi-plus-circle-outline" @click="goToAddService" class="mt-6">
      Tambah Servis Baru
    </v-btn>

    <!-- Other dashboard elements can be added here later -->

  </v-container>
</template>
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToAddService() {
  // We will define the '/servis/baru' route next
  router.push('/servis/baru');
}
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 56px - 48px);
  /* Adjust based on bottom nav and container padding */
}
</style>
