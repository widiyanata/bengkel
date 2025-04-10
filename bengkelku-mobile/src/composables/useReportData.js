// src/composables/useReportData.js
import { ref, computed, onMounted } from 'vue';
import {
  getAllServices,
  getAllItems,
  getCustomerById,
  getVehicleById,
  getAllInvoices
} from '../stores/localStorage.js';

export function useReportData(dateRange = null) {
  const loading = ref(true);
  const services = ref([]);
  const stockItems = ref([]);
  const invoices = ref([]);
  const filterDateRange = ref(dateRange);

  // Filter services by date range if provided
  const filteredServices = computed(() => {
    if (!filterDateRange.value || !filterDateRange.value.start || !filterDateRange.value.end) {
      return services.value;
    }

    const startDate = new Date(filterDateRange.value.start);
    const endDate = new Date(filterDateRange.value.end);
    endDate.setHours(23, 59, 59, 999); // Include the entire end day

    return services.value.filter(service => {
      const serviceDate = new Date(service.timestamp);
      return serviceDate >= startDate && serviceDate <= endDate;
    });
  });

  // Service statistics
  const totalServices = computed(() => filteredServices.value.length);

  const serviceStatusCounts = computed(() => {
    const counts = {};
    filteredServices.value.forEach(service => {
      const status = service.status || 'Tidak Diketahui';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  });

  const totalRevenueCompleted = computed(() => {
    return filteredServices.value
      .filter(service => service.status === 'Selesai')
      .reduce((sum, service) => sum + (Number(service.totalBiaya) || 0), 0);
  });

  // Stock statistics
  const totalStockItems = computed(() => stockItems.value.length);

  const lowStockItemsList = computed(() => {
    return stockItems.value.filter(item =>
      item.stokMinimal > 0 && (Number(item.stokSaatIni) || 0) <= Number(item.stokMinimal)
    ).sort((a, b) => (a.stokSaatIni / a.stokMinimal) - (b.stokSaatIni / b.stokMinimal));
  });

  const lowStockItemsCount = computed(() => lowStockItemsList.value.length);

  // Revenue data
const dailyRevenueData = computed(() => {
  console.log('filteredServices.value:', filteredServices.value);
  const revenueByDate = {};
  filteredServices.value
    .filter(service => service.status === 'Selesai')
    .forEach(service => {
      try {
        // Periksa apakah tanggalSelesai ada, jika tidak gunakan timestamp
        const dateString = service.tanggalSelesai || service.timestamp;
        if (!dateString) {
          console.warn(`No date found for service ${service.id}`);
          return; // Skip this service if no date is found
        }
        
        // Extract date part (YYYY-MM-DD) from the date string
        const date = typeof dateString === 'string' 
          ? dateString.substring(0, 10) 
          : new Date(dateString).toISOString().substring(0, 10);
        
        revenueByDate[date] = (revenueByDate[date] || 0) + (Number(service.totalBiaya) || 0);
      } catch (e) {
        console.warn(`Could not parse date for service ${service.id}:`, e);
      }
    });

  return Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

  // Parts usage data
  const partsUsageData = computed(() => {
    const usageMap = new Map();

    filteredServices.value
      .filter(service => service.status === 'Selesai' && service.parts && service.parts.length > 0)
      .forEach(service => {
        service.parts.forEach(part => {
          const itemId = part.itemId;
          const quantity = Number(part.jumlah) || 0;
          if (quantity > 0) {
            if (usageMap.has(itemId)) {
              usageMap.get(itemId).totalQuantity += quantity;
            } else {
              const itemDetails = stockItems.value.find(stockItem => stockItem.id === itemId);
              usageMap.set(itemId, {
                itemId: itemId,
                namaItem: itemDetails?.nama || `Part ID: ${itemId}`,
                kodeItem: itemDetails?.kode,
                totalQuantity: quantity,
              });
            }
          }
        });
      });

    return Array.from(usageMap.values())
      .filter(item => item.totalQuantity > 0)
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  });

  // Completed services list
  const completedServicesList = computed(() => {
    return filteredServices.value
      .filter(service => service.status === 'Selesai')
      .sort((a, b) => {
        const dateA = a.tanggalSelesai || a.timestamp || '0';
        const dateB = b.tanggalSelesai || b.timestamp || '0';
        return String(dateB).localeCompare(String(dateA));
      });
  });

  // Invoice statistics
  const invoiceStats = computed(() => {
    console.log("Computing invoice stats with invoices:", invoices.value);
    
    // Pastikan invoices.value adalah array
    if (!Array.isArray(invoices.value)) {
      console.warn("invoices.value is not an array:", invoices.value);
      return {
        total: 0,
        paid: 0,
        unpaid: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0
      };
    }
    
    const filteredInvoices = invoices.value.filter(invoice => {
      if (!invoice) return false;
      
      if (!filterDateRange.value || !filterDateRange.value.start || !filterDateRange.value.end) {
        return true;
      }
      
      // Pastikan invoice memiliki tanggal
      if (!invoice.tanggalInvoice) {
        console.warn("Invoice without date:", invoice);
        return false;
      }
      
      try {
        const invoiceDate = new Date(invoice.tanggalInvoice);
        const startDate = new Date(filterDateRange.value.start);
        const endDate = new Date(filterDateRange.value.end);
        endDate.setHours(23, 59, 59, 999);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      } catch (e) {
        console.error("Error filtering invoice by date:", e, invoice);
        return false;
      }
    });
    
    console.log("Filtered invoices:", filteredInvoices);
    
    const total = filteredInvoices.length;
    const paid = filteredInvoices.filter(inv => inv.status === 'Dibayar').length;
    const unpaid = total - paid;
    
    const totalAmount = filteredInvoices.reduce((sum, inv) => {
      const amount = Number(inv.totalAmount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const paidAmount = filteredInvoices
      .filter(inv => inv.status === 'Dibayar')
      .reduce((sum, inv) => {
        const amount = Number(inv.totalAmount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
    const unpaidAmount = totalAmount - paidAmount;
    
    return {
      total,
      paid,
      unpaid,
      totalAmount,
      paidAmount,
      unpaidAmount
    };
  });

  // Load all data
  function loadReportData() {
    loading.value = true;
    try {
      const rawServices = getAllServices();
      const rawItems = getAllItems();
      const rawInvoices = getAllInvoices();
      
      stockItems.value = rawItems;
      invoices.value = rawInvoices;

      // Enrich services with customer and vehicle data
      const enrichedServices = rawServices.map(service => {
        const customer = service.pelangganId ? getCustomerById(service.pelangganId) : null;
        const vehicle = service.vehicleId ? getVehicleById(service.vehicleId) : null;
        return {
          ...service,
          customer,
          vehicle,
        };
      });

      services.value = enrichedServices;
    } catch (error) {
      console.error("Error loading or processing report data:", error);
    } finally {
      loading.value = false;
    }
  }

  // Update date range filter
  function updateDateRange(range) {
    filterDateRange.value = range;
  }

  // Generate report data for export
  function generateReportData() {
    return {
      dateRange: filterDateRange.value,
      serviceStats: {
        total: totalServices.value,
        byStatus: serviceStatusCounts.value,
        revenue: totalRevenueCompleted.value
      },
      stockStats: {
        total: totalStockItems.value,
        lowStock: {
          count: lowStockItemsCount.value,
          items: lowStockItemsList.value
        }
      },
      revenueData: dailyRevenueData.value,
      partsUsage: partsUsageData.value,
      completedServices: completedServicesList.value,
      invoiceStats: invoiceStats.value
    };
  }

  // Load data on mount
  onMounted(() => {
    loadReportData();
  });

  return {
    loading,
    services: filteredServices,
    stockItems,
    invoices,
    totalServices,
    serviceStatusCounts,
    totalRevenueCompleted,
    totalStockItems,
    lowStockItemsList,
    lowStockItemsCount,
    dailyRevenueData,
    partsUsageData,
    completedServicesList,
    invoiceStats,
    updateDateRange,
    loadReportData,
    generateReportData
  };
}