# Google Analytics Setup for Bengkelku Mobile

This document explains how to set up Google Analytics for tracking user interactions in the Bengkelku Mobile application.

## Prerequisites

1. A Google Analytics account
2. A Google Analytics 4 property

## Setup Instructions

### 1. Create a Google Analytics 4 Property

If you don't already have a Google Analytics 4 property:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property
3. Select "Web" as the platform
4. Follow the setup wizard to create your property

### 2. Get Your Measurement ID

1. In Google Analytics, go to Admin > Data Streams
2. Select your web data stream
3. Copy the Measurement ID (it starts with "G-")

### 3. Configure the Application

1. Open the `.env` file in the root of the project
2. Replace the placeholder value for `VITE_GA_MEASUREMENT_ID` with your actual Measurement ID:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID (e.g., `G-ABC123DEF4`).

### 4. Build and Deploy

After setting up the Measurement ID, build and deploy your application:

```bash
npm run build
```

## Tracking Implementation

The application is set up to track the following events:

### Automatic Tracking

- **Page Views**: Tracked automatically when users navigate between pages
- **Navigation Events**: Back button clicks and other navigation actions

### Custom Events

- **Search Events**: When users search for services, customers, or parts
- **Service Actions**: When services are created, updated, or completed
- **Invoice Actions**: When invoices are created or viewed
- **PWA Installation**: When users install or dismiss the PWA installation prompt

## Verifying the Implementation

To verify that Google Analytics is working correctly:

1. Open the application in a browser
2. Open the browser's developer tools
3. Look for network requests to `www.googletagmanager.com`
4. In Google Analytics, go to Reports > Realtime to see active users

## Customizing Tracking

To add additional tracking, you can use the utility functions in `src/utils/analytics.js`:

- `trackEvent(eventName, eventParams)`: Track a custom event
- `trackPageView(pagePath, pageTitle)`: Track a page view
- `trackServiceAction(action, service)`: Track a service-related action
- `trackInventoryAction(action, item)`: Track an inventory-related action
- `trackCustomerAction(action, customer)`: Track a customer-related action
- `trackInvoiceAction(action, invoice)`: Track an invoice-related action

## Troubleshooting

If tracking is not working:

1. Check that the Measurement ID is correctly set in the `.env` file
2. Verify that the application has internet access
3. Check for any console errors related to Google Analytics
4. Ensure that ad blockers or privacy extensions are not blocking the tracking
