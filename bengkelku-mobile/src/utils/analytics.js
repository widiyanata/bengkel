/**
 * Google Analytics utility functions
 * This file contains functions for initializing and using Google Analytics
 */

// Google Analytics Measurement ID from environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

/**
 * Initialize Google Analytics
 * This function should be called once when the app starts
 */
export function initAnalytics() {
  // Check if analytics is already initialized
  if (window.gtag) {
    console.log('Google Analytics already initialized');
    return;
  }

  // Create script tag for Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Initialize gtag with the config command
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // We'll handle page views manually with router
  });

  console.log('Google Analytics initialized');
}

/**
 * Track a page view
 * @param {string} pagePath - The path of the page (e.g., '/servis')
 * @param {string} pageTitle - The title of the page (e.g., 'Servis')
 */
export function trackPageView(pagePath, pageTitle) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized');
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    send_to: GA_MEASUREMENT_ID
  });

  console.log(`Tracked page view: ${pageTitle} (${pagePath})`);
}

/**
 * Track a custom event
 * @param {string} eventName - Name of the event (e.g., 'add_service')
 * @param {Object} eventParams - Additional parameters for the event
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!window.gtag) {
    console.warn('Google Analytics not initialized');
    return;
  }

  window.gtag('event', eventName, eventParams);
  console.log(`Tracked event: ${eventName}`, eventParams);
}

/**
 * Track a service action
 * @param {string} action - The action performed (e.g., 'create', 'update', 'complete')
 * @param {Object} service - The service object
 */
export function trackServiceAction(action, service) {
  trackEvent('service_action', {
    action: action,
    service_id: service.id,
    service_status: service.status
  });
}

/**
 * Track an inventory action
 * @param {string} action - The action performed (e.g., 'add_item', 'update_stock')
 * @param {Object} item - The inventory item
 */
export function trackInventoryAction(action, item) {
  trackEvent('inventory_action', {
    action: action,
    item_id: item.id,
    item_name: item.nama
  });
}

/**
 * Track a customer action
 * @param {string} action - The action performed (e.g., 'add_customer', 'update_customer')
 * @param {Object} customer - The customer object
 */
export function trackCustomerAction(action, customer) {
  trackEvent('customer_action', {
    action: action,
    customer_id: customer.id
  });
}

/**
 * Track an invoice action
 * @param {string} action - The action performed (e.g., 'create_invoice', 'print_invoice')
 * @param {Object} invoice - The invoice object
 */
export function trackInvoiceAction(action, invoice) {
  trackEvent('invoice_action', {
    action: action,
    invoice_id: invoice.id,
    invoice_amount: invoice.totalAmount
  });
}
