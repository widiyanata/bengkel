import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  getAllServices,
  getAllItems,
  getPurchaseCart
} from '../stores/localStorage.js';

export function useAppStatus() {
  // Reactive data
  const services = ref([]);
  const items = ref([]);
  const isLoading = ref(true);
  const route = useRoute();
  const cartItemCount = ref(0);
  const searchQuery = ref('');
  const isSearchActive = ref(false);
  const lastScrollPosition = ref(0);
  const hideBottomNav = ref(false);
  const hideFab = ref(false);
  const isAtBottom = ref(false);

  // Load all data
  function loadData() {
    isLoading.value = true;
    services.value = getAllServices();
    items.value = getAllItems();
    updateCartCount();
    isLoading.value = false;
  }

  // Get active services (not completed or cancelled)
  const activeServices = computed(() => {
    return services.value.filter(service =>
      service.status !== 'Selesai' && service.status !== 'Dibatalkan'
    );
  });

  // Get low stock items
  const lowStockItems = computed(() => {
    return items.value.filter(item =>
      item.stokSaatIni <= item.stokMinimal && item.stokMinimal > 0
    );
  });

  // Notification counts
  const pendingServicesCount = computed(() => activeServices.value.length);
  const lowStockCount = computed(() => lowStockItems.value.length);
  const totalNotificationCount = computed(() => pendingServicesCount.value + lowStockCount.value);

  // Current page title
  const pageTitle = computed(() => {
    const path = route.path;
    if (path === '/') return 'Beranda';
    if (path.includes('/servis')) return 'Servis';
    if (path.includes('/stok')) return 'Stok';
    if (path.includes('/pelanggan')) return 'Pelanggan';
    if (path.includes('/invoice')) return 'Invoice';
    if (path.includes('/laporan')) return 'Laporan';
    if (path.includes('/pengaturan')) return 'Pengaturan';
    return 'Bengkelku';
  });

  // Dynamic FAB based on active route
  const fabIcon = computed(() => {
    const path = route.path;
    if (path.includes('/servis')) return 'mdi-plus-circle-outline';
    if (path.includes('/stok')) return 'mdi-package-variant-plus';
    if (path.includes('/pelanggan')) return 'mdi-account-plus';
    if (path.includes('/invoice')) return 'mdi-receipt-text-plus';
    return 'mdi-plus';
  });

  const fabDestination = computed(() => {
    const path = route.path;
    if (path.includes('/servis')) return '/servis/baru';
    if (path.includes('/stok')) return '/stok/barang-baru';
    if (path.includes('/pelanggan')) return '/pelanggan/baru';
    if (path.includes('/invoice')) return '/invoice/walk-in';
    return '/servis/baru';
  });

  const showFab = computed(() => {
    const path = route.path;
    // Don't show FAB on detail pages or form pages
    return !path.includes('/baru') &&
           !path.includes('/edit') &&
           !path.includes('/keranjang-pembelian') &&
           !path.match(/\/servis\/\d+/) &&
           !path.match(/\/pelanggan\/\d+/) &&
           !path.match(/\/invoice\/\d+/);
  });

  // Update cart count
  function updateCartCount() {
    try {
      const cart = getPurchaseCart();
      cartItemCount.value = cart.length;
    } catch (e) {
      console.error("Error getting cart count:", e);
      cartItemCount.value = 0;
    }
  }

  // Handle scroll to hide/show bottom nav and FAB
  function handleScroll() {
    const currentScrollPosition = window.pageYOffset;
    if (currentScrollPosition < 0) return;

    // Calculate if we're at the bottom of the page
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;

    // Check if the page is scrollable
    const isScrollable = documentHeight > windowHeight;

    // If page is not scrollable, always show FAB
    if (!isScrollable) {
      isAtBottom.value = false;
      hideFab.value = false;
      hideBottomNav.value = false;
      return;
    }

    // Check if we're at the bottom (with a larger threshold for smoother transition)
    isAtBottom.value = (windowHeight + scrollPosition) >= (documentHeight - 150);

    // Hide bottom nav when scrolling down, show when scrolling up
    if (currentScrollPosition > lastScrollPosition.value + 30) {
      hideBottomNav.value = true;
    } else if (currentScrollPosition < lastScrollPosition.value - 30) {
      hideBottomNav.value = false;
    }

    // Hide FAB when at the bottom, show otherwise
    hideFab.value = isAtBottom.value;

    lastScrollPosition.value = currentScrollPosition;
  }

  // Toggle search
  function toggleSearch() {
    isSearchActive.value = !isSearchActive.value;
    if (!isSearchActive.value) {
      searchQuery.value = '';
    }
  }

  // Perform search
  function performSearch() {
    if (!searchQuery.value.trim()) return;

    // Implement search logic here
    console.log('Searching for:', searchQuery.value);

    // Reset search after search is performed
    // isSearchActive.value = false;
    // searchQuery.value = '';
  }

  // Watch for route changes to update data
  watch(() => route.path, () => {
    updateCartCount();
    // Reset FAB state when changing routes
    hideFab.value = false;
    // Check scroll state after route change and DOM update
    setTimeout(checkInitialScrollState, 1000);
  });

  // Check initial scroll state
  function checkInitialScrollState() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if the page is scrollable
    const isScrollable = documentHeight > windowHeight;

    // If page is not scrollable, always show FAB
    if (!isScrollable) {
      isAtBottom.value = false;
      hideFab.value = false;
      hideBottomNav.value = false;
    } else {
      // Check if we're already at the bottom (for pages that load at the bottom)
      const scrollPosition = window.scrollY;
      isAtBottom.value = (windowHeight + scrollPosition) >= (documentHeight - 150);
      hideFab.value = isAtBottom.value;
    }
  }

  // Setup on mount
  onMounted(() => {
    loadData();
    window.addEventListener('scroll', handleScroll);

    // Initial check after a short delay to ensure DOM is fully rendered
    setTimeout(checkInitialScrollState, 300);

    // Also check when window is resized
    window.addEventListener('resize', checkInitialScrollState);
  });

  // Cleanup on unmount
  function cleanup() {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', checkInitialScrollState);
  }

  return {
    isLoading,
    activeServices,
    lowStockItems,
    pendingServicesCount,
    lowStockCount,
    totalNotificationCount,
    cartItemCount,
    pageTitle,
    fabIcon,
    fabDestination,
    showFab,
    hideFab,
    searchQuery,
    isSearchActive,
    hideBottomNav,
    toggleSearch,
    performSearch,
    loadData,
    cleanup
  };
}
