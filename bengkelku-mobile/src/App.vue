<template>
  <!-- The router will inject the appropriate layout and view here -->
  <router-view />
</template>

<script setup>
// No script needed here for now, App.vue acts as the entry point for the router
</script>

<style>
/* Global styles to enhance contrast and readability */
:root {
  --app-background: #F5F5F5;
  --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Enhance card contrast */
.v-card {
  box-shadow: var(--card-shadow) !important;
}

/* Improve text readability */
.v-card-title {
  font-weight: 600 !important;
}

/* Ensure proper spacing in lists */
.v-list-item {
  border-radius: 4px !important;
  margin: 2px 0 !important;
}

/* Improve form field contrast */
.v-field {
  background-color: white !important;
}
</style>
