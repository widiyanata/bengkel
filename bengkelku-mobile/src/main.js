import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify"; // Import Vuetify plugin
import router from "./router"; // Import router

createApp(App)
  .use(vuetify) // Use Vuetify
  .use(router) // Use router
  .mount("#app");
