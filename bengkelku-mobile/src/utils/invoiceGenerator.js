import {
  getServiceById,
  getCustomerById,
  getVehicleById,
  getWorkshopInfo,
  createInvoice,
  getInvoicesByServiceId,
  WALK_IN_CUSTOMER_ID,
  isWalkInCustomer
} from '../stores/localStorage.js';

/**
 * Generate a formatted invoice number
 * @returns {string} Formatted invoice number (e.g., INV-20250409-001)
 */
export function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Add a random suffix for uniqueness
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `INV-${dateStr}-${randomSuffix}`;
}

/**
 * Generate an invoice from a service
 * @param {number} serviceId - The ID of the service
 * @returns {Object|null} The created invoice or null if service not found
 */
export function generateInvoiceFromService(serviceId) {
  // Check if invoice already exists for this service
  const existingInvoices = getInvoicesByServiceId(serviceId);
  if (existingInvoices.length > 0) {
    console.log(`Invoice already exists for service ${serviceId}`);
    return existingInvoices[0]; // Return the first invoice
  }

  // Get service data
  const service = getServiceById(serviceId);
  if (!service) {
    console.error(`Service with ID ${serviceId} not found`);
    return null;
  }

  // Get customer data
  let customer = getCustomerById(service.pelangganId);
  const isWalkIn = !service.pelangganId || isWalkInCustomer(service.pelangganId);

  // Handle walk-in customer
  if (!customer && isWalkIn) {
    // Create a default customer object for walk-in
    customer = {
      id: WALK_IN_CUSTOMER_ID,
      nama: 'Pelanggan Langsung',
      noHp: ''
    };
  } else if (!customer) {
    console.error(`Customer with ID ${service.pelangganId} not found`);
    return { error: 'Tidak dapat membuat invoice: Pelanggan tidak ditemukan' };
  }

  // Get vehicle data
  const vehicle = getVehicleById(service.vehicleId);

  // Get workshop info
  const workshopInfo = getWorkshopInfo();

  // Ensure all parts have subtotal calculated
  if (service.parts && service.parts.length > 0) {
    service.parts.forEach(part => {
      if (!part.subtotal) {
        part.subtotal = part.jumlah * part.hargaJual;
      }
    });
  }

  // Calculate totals
  const jasaTotal = (service.jasa || []).reduce((sum, item) => sum + (item.biaya || 0), 0);
  const partsTotal = (service.parts || []).reduce((sum, item) => {
    // If subtotal exists, use it, otherwise calculate from jumlah and hargaJual
    const itemSubtotal = item.subtotal || (item.jumlah * item.hargaJual);
    return sum + itemSubtotal;
  }, 0);
  const totalAmount = jasaTotal + partsTotal;

  // Validate service has items and total amount is not zero
  const hasJasa = (service.jasa || []).length > 0;
  const hasParts = (service.parts || []).length > 0;

  // Validate service exists
  if (!service) {
    console.error('Cannot create invoice: Service not found');
    return { error: 'Tidak dapat membuat invoice: Servis tidak ditemukan' };
  }

  // Validate service has items
  if (!hasJasa && !hasParts) {
    console.error('Cannot create invoice: No service or parts added');
    return { error: 'Tidak dapat membuat invoice: Tidak ada jasa atau sparepart yang ditambahkan' };
  }

  // Validate total amount
  if (totalAmount <= 0) {
    console.error('Cannot create invoice: Total amount is zero');
    return { error: 'Tidak dapat membuat invoice: Total biaya adalah 0' };
  }

  // Customer validation is already handled above

  // Create invoice data
  const invoiceData = {
    id: generateInvoiceNumber(),
    serviceId: serviceId,
    pelangganId: service.pelangganId || WALK_IN_CUSTOMER_ID,
    pelangganNama: customer.nama,
    pelangganNoHp: customer.noHp,
    nomorPolisi: service.nomorPolisi,
    merkTipe: vehicle ? vehicle.merkTipe : 'Tidak Diketahui',
    tanggalServis: service.timestamp,
    status: 'Belum Dibayar',
    items: [
      // Jasa items
      ...(service.jasa || []).map(item => ({
        type: 'jasa',
        deskripsi: item.deskripsi,
        biaya: item.biaya,
        jumlah: 1,
        subtotal: item.biaya
      })),
      // Parts items
      ...(service.parts || []).map(item => ({
        type: 'part',
        deskripsi: item.nama,
        biaya: item.hargaJual,
        jumlah: item.jumlah,
        subtotal: item.subtotal
      }))
    ],
    jasaTotal,
    partsTotal,
    totalAmount,
    workshopInfo: {
      nama: workshopInfo.nama || 'BengkelKu',
      alamat: workshopInfo.alamat || '',
      telepon: workshopInfo.telepon || '',
    },
    catatan: service.keterangan || '',
    tanggalInvoice: new Date().toISOString(),
  };

  // Save invoice to localStorage
  return createInvoice(invoiceData);
}

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Generate HTML for printing an invoice
 * @param {Object} invoice - The invoice object
 * @returns {string} HTML string for printing
 */
export function generateInvoiceHTML(invoice) {
  if (!invoice) return '';

  const workshopName = invoice.workshopInfo.nama || 'BengkelKu';
  const workshopAddress = invoice.workshopInfo.alamat || '';
  const workshopPhone = invoice.workshopInfo.telepon || '';

  // Generate items HTML
  const itemsHTML = invoice.items.map(item => `
    <tr>
      <td>${item.deskripsi}</td>
      <td class="text-center">${item.jumlah}</td>
      <td class="text-right">${formatCurrency(item.biaya)}</td>
      <td class="text-right">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-number {
          font-size: 16px;
          margin-bottom: 5px;
        }
        .invoice-date {
          font-size: 14px;
          color: #666;
        }
        .customer-info, .vehicle-info {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
          text-align: left;
        }
        .text-center {
          text-align: center;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 5px;
        }
        .total-label {
          width: 150px;
          text-align: right;
          margin-right: 20px;
        }
        .total-value {
          width: 120px;
          text-align: right;
        }
        .grand-total {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #333;
          padding-top: 5px;
        }
        .notes {
          margin-top: 30px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <div class="invoice-title">${workshopName}</div>
          <div>${workshopAddress}</div>
          <div>${workshopPhone}</div>
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">${invoice.id}</div>
          <div class="invoice-date">Tanggal: ${formatDate(invoice.tanggalInvoice)}</div>
        </div>
      </div>

      <div class="customer-info">
        <div class="section-title">Informasi Pelanggan</div>
        <div><strong>Nama:</strong> ${invoice.pelangganNama}</div>
        <div><strong>No. HP:</strong> ${invoice.pelangganNoHp}</div>
      </div>

      <div class="vehicle-info">
        <div class="section-title">Informasi Kendaraan</div>
        <div><strong>Nomor Polisi:</strong> ${invoice.nomorPolisi}</div>
        <div><strong>Merk/Tipe:</strong> ${invoice.merkTipe}</div>
        <div><strong>Tanggal Servis:</strong> ${formatDate(invoice.tanggalServis)}</div>
      </div>

      <div class="section-title">Detail Servis</div>
      <table>
        <thead>
          <tr>
            <th>Deskripsi</th>
            <th class="text-center">Jumlah</th>
            <th class="text-right">Harga</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <div class="total-label">Total Jasa:</div>
          <div class="total-value">${formatCurrency(invoice.jasaTotal)}</div>
        </div>
        <div class="total-row">
          <div class="total-label">Total Sparepart:</div>
          <div class="total-value">${formatCurrency(invoice.partsTotal)}</div>
        </div>
        <div class="total-row grand-total">
          <div class="total-label">TOTAL:</div>
          <div class="total-value">${formatCurrency(invoice.totalAmount)}</div>
        </div>
      </div>

      ${invoice.catatan ? `
      <div class="notes">
        <div class="section-title">Catatan</div>
        <div>${invoice.catatan}</div>
      </div>
      ` : ''}

      <div class="footer">
        Terima kasih atas kepercayaan Anda menggunakan jasa ${workshopName}.
      </div>
    </body>
    </html>
  `;
}

/**
 * Convert HTML to a Blob for downloading
 * @param {string} html - The HTML content
 * @returns {Blob} Blob object for downloading
 */
export function htmlToBlob(html) {
  return new Blob([html], { type: 'text/html' });
}

/**
 * Create a download URL for a Blob
 * @param {Blob} blob - The Blob to create a URL for
 * @returns {string} URL for downloading
 */
export function createDownloadURL(blob) {
  return URL.createObjectURL(blob);
}

/**
 * Trigger download of an invoice as HTML
 * @param {Object} invoice - The invoice object
 */
export function downloadInvoice(invoice) {
  const html = generateInvoiceHTML(invoice);
  const blob = htmlToBlob(html);
  const url = createDownloadURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoice.id}.html`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Print an invoice
 * @param {Object} invoice - The invoice object
 */
export function printInvoice(invoice) {
  const html = generateInvoiceHTML(invoice);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for resources to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
