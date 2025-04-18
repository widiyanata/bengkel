import { ref, computed } from 'vue';
import {
  getAllServices,
  getAllItems,
  getAllCustomers
} from '../stores/localStorage.js';

export function useDashboardStats() {
  // Reactive data
  const services = ref([]);
  const items = ref([]);
  const customers = ref([]);
  const isLoading = ref(true);

  // Load all data
  function loadData() {
    isLoading.value = true;
    services.value = getAllServices();
    items.value = getAllItems();
    customers.value = getAllCustomers();
    isLoading.value = false;
  }

  // Get active services (not completed or cancelled)
  const activeServices = computed(() => {
    return services.value.filter(service =>
      service.status !== 'Selesai' && service.status !== 'Dibatalkan'
    ).sort((a, b) => {
      // Sort by timestamp, newest first
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  });

  // Get low stock items
  const lowStockItems = computed(() => {
    return items.value.filter(item =>
      item.stokSaatIni <= item.stokMinimal && item.stokMinimal > 0
    );
  });

  // Get weekly stats
  const weeklyStats = computed(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Filter services from the last 7 days
    const weekServices = services.value.filter(service => {
      const serviceDate = new Date(service.timestamp);
      return serviceDate >= oneWeekAgo;
    });

    // Count completed services
    const completedServices = weekServices.filter(service =>
      service.status === 'Selesai'
    ).length;

    // Calculate estimated revenue (sum of totalBiaya for all services this week)
    const estimatedRevenue = weekServices.reduce((total, service) =>
      total + (service.totalBiaya || 0), 0
    );

    // Count new customers in the last 7 days
    const newCustomers = customers.value.filter(customer => {
      // Assuming customer.id is a timestamp or contains creation date info
      const customerDate = new Date(customer.id); // This works if id is a timestamp
      return customerDate >= oneWeekAgo;
    }).length;

    return {
      totalServices: weekServices.length,
      completedServices,
      estimatedRevenue,
      newCustomers
    };
  });

  // Get today's services (reusable function)
  const getTodayServices = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter services from today
    return services.value.filter(service => {
      const serviceDate = new Date(service.timestamp);
      serviceDate.setHours(0, 0, 0, 0);
      return serviceDate.getTime() === today.getTime();
    });
  };

  // Get today's stats
  const todayStats = computed(() => {
    const todayServices = getTodayServices();

    // Count by status
    const byStatus = {
      Baru: 0,
      Proses: 0,
      'Menunggu Sparepart': 0,
      Selesai: 0,
      Dibatalkan: 0
    };

    todayServices.forEach(service => {
      const status = service.status || 'Baru';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return {
      total: todayServices.length,
      byStatus
    };
  });

  // Get today's gross income
  const todayGrossIncome = computed(() => {
    const todayServices = getTodayServices();

    // Calculate total income from all services today
    const totalIncome = todayServices.reduce((total, service) => {
      return total + (service.totalBiaya || 0);
    }, 0);

    // Calculate income from completed services only
    const completedIncome = todayServices
      .filter(service => service.status === 'Selesai')
      .reduce((total, service) => {
        return total + (service.totalBiaya || 0);
      }, 0);

    return {
      total: totalIncome,
      completed: completedIncome,
      // Add count of services with income
      servicesWithIncome: todayServices.filter(service => (service.totalBiaya || 0) > 0).length
    };
  });

  return {
    loadData,
    isLoading,
    activeServices,
    lowStockItems,
    weeklyStats,
    todayStats,
    todayGrossIncome
  };
}
