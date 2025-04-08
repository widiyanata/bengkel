// src/plugins/vuetify.js
import "vuetify/styles"; // Global CSS has to be imported
import { createVuetify } from "vuetify";
import { md3 } from 'vuetify/blueprints' // Import MD3 blueprint
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader

// Define custom theme
const myCustomLightTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF', // Default light background
    surface: '#FFFFFF',    // Default light surface
    primary: '#37474F',    // Sleek Grey/Charcoal
    secondary: '#00695C',  // Blue accent
    error: '#B00020',      // Default error
    info: '#2196F3',       // Default info
    success: '#4CAF50',    // Default success
    warning: '#FB8C00',    // Default warning
  },
};

const vuetify = createVuetify({
  blueprint: md3, // Apply MD3 blueprint
  components,
  directives,
  icons: {
    defaultSet: "mdi", // This is already the default value - only for display purposes
  },
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
      // Optionally define myCustomDarkTheme here later
    },
  },
});

export default vuetify;
