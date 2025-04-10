import { reactive } from "vue";

// Define keys for local storage
const CUSTOMERS_KEY = "bengkelku_customers";
const VEHICLES_KEY = "bengkelku_vehicles";
const SERVICES_KEY = "bengkelku_services";
const ITEMS_KEY = "bengkelku_items"; // For stock
const PURCHASES_KEY = "bengkelku_purchases"; // For stock purchases
const PURCHASE_CART_KEY = "bengkelku_purchase_cart"; // Key for the cart
const WORKSHOP_INFO_KEY = "bengkelku_workshop_info"; // Key for workshop details
const USER_PROFILE_KEY = "bengkelku_user_profile"; // Key for user profile
const INVOICES_KEY = "bengkelku_invoices"; // Key for invoices

let idCounter = Date.now();
function getNextId() {
  return idCounter++;
}

// Helper function to get data from Local Storage
function getData(key, defaultValue = []) { // Allow default value override
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

// Helper function to save data to Local Storage
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

// --- Reactive State (optional but can be useful for reactivity across components) ---
// We can expose reactive versions of the data if needed later,
// but for now, we'll focus on direct CRUD functions.

// --- Customer Management ---
export function getAllCustomers() {
  return getData(CUSTOMERS_KEY);
}

export function addCustomer(customerData) {
  const customers = getAllCustomers();
  const newCustomer = {
    id: getNextId(), // Simple unique ID generation
    ...customerData,
  };
  customers.push(newCustomer);
  saveData(CUSTOMERS_KEY, customers);
  return newCustomer; // Return the newly created customer with ID
}

export function getCustomerById(id) {
  const customers = getAllCustomers();
  return customers.find((c) => c.id === id);
}

export function updateCustomer(id, updatedData) {
  const customers = getAllCustomers();
  const customerIdNumber = Number(id);
  const customerIndex = customers.findIndex((c) => c.id === customerIdNumber);

  if (customerIndex === -1) {
    console.error(`Customer with ID ${id} not found for update.`);
    return null;
  }

  // Update the customer data
  customers[customerIndex] = {
    ...customers[customerIndex],
    ...updatedData,
  };

  saveData(CUSTOMERS_KEY, customers);
  return customers[customerIndex];
}

export function deleteCustomer(id) {
  let customers = getAllCustomers();
  const customerIdNumber = Number(id);
  const initialLength = customers.length;
  customers = customers.filter((c) => c.id !== customerIdNumber);

  if (customers.length < initialLength) {
    saveData(CUSTOMERS_KEY, customers);
    console.log(`Customer with ID ${id} deleted.`);
    // TODO: Consider deleting associated vehicles/services? Or handle orphaned data?
    // For now, just delete the customer record.
    return true;
  } else {
    console.warn(`Customer with ID ${id} not found for deletion.`);
    return false;
  }
}

// --- Vehicle Management ---
export function getAllVehicles() {
  return getData(VEHICLES_KEY);
}

export function addVehicle(vehicleData) {
  // Expects vehicleData to include customerId
  if (!vehicleData.customerId) {
    console.error("Cannot add vehicle without customerId");
    return null;
  }
  const vehicles = getAllVehicles();
  const newVehicle = {
    id: getNextId() + 1, // Simple unique ID generation (slightly offset)
    ...vehicleData,
  };
  vehicles.push(newVehicle);
  saveData(VEHICLES_KEY, vehicles);
  return newVehicle;
}

export function getVehiclesByCustomerId(customerId) {
  const vehicles = getAllVehicles();
  return vehicles.filter((v) => v.customerId === customerId);
}

export function getVehicleById(id) {
  const vehicles = getAllVehicles();
  const vehicleIdNumber = Number(id);
  return vehicles.find((v) => v.id === vehicleIdNumber);
}

export function findVehicleByNomorPolisi(nomorPolisi) {
  if (!nomorPolisi) return null;
  const normalizedNomor = nomorPolisi.trim().toUpperCase();
  const vehicles = getAllVehicles();

  // Use flexible search (LIKE) instead of exact match
  const matchingVehicles = vehicles.filter((v) => {
    const vehicleNomor = v.nomorPolisi.trim().toUpperCase();
    return vehicleNomor.includes(normalizedNomor) || normalizedNomor.includes(vehicleNomor);
  });

  // If we have matches, return the first one
  if (matchingVehicles.length > 0) {
    const foundVehicle = matchingVehicles[0]; // Get the first match
    const customer = getCustomerById(foundVehicle.customerId);
    return {
      ...foundVehicle,
      customerName: customer ? customer.nama : "Unknown Customer", // Add customer name for convenience
      // Add a flag to indicate if there are multiple matches
      multipleMatches: matchingVehicles.length > 1,
      matchCount: matchingVehicles.length
    };
  }
  return null;
}

export function updateVehicle(id, updatedData) {
  const vehicles = getAllVehicles();
  const vehicleIdNumber = Number(id);
  const vehicleIndex = vehicles.findIndex((v) => v.id === vehicleIdNumber);

  if (vehicleIndex === -1) {
    console.error(`Vehicle with ID ${id} not found for update.`);
    return null;
  }

  // Update vehicle data
  vehicles[vehicleIndex] = {
    ...vehicles[vehicleIndex],
    ...updatedData, // Apply updates (e.g., nomorPolisi, merkTipe)
  };

  saveData(VEHICLES_KEY, vehicles);
  return vehicles[vehicleIndex];
}

export function deleteVehicle(id) {
  let vehicles = getAllVehicles();
  const vehicleIdNumber = Number(id);
  const initialLength = vehicles.length;
  vehicles = vehicles.filter((v) => v.id !== vehicleIdNumber);

  if (vehicles.length < initialLength) {
    saveData(VEHICLES_KEY, vehicles);
    console.log(`Vehicle with ID ${id} deleted.`);
    // TODO: Consider impact on associated services? Mark as deleted?
    return true;
  } else {
    console.warn(`Vehicle with ID ${id} not found for deletion.`);
    return false;
  }
}

// --- Service Management (Initial Structure) ---
export function getAllServices() {
  return getData(SERVICES_KEY);
}

export function addService(serviceData) {
  // Expects serviceData to include customerId, vehicleId etc.
  const services = getAllServices();
  const newService = {
    id: getNextId() + 2, // Simple unique ID
    timestamp: new Date().toISOString(),
    status: "Baru", // Default status
    ...serviceData,
  };
  services.push(newService);
  saveData(SERVICES_KEY, services);
  return newService;
}

export function getServiceById(id) {
  const services = getAllServices();
  // Ensure id is compared as the same type (e.g., number)
  const serviceIdNumber = Number(id);
  return services.find((s) => s.id === serviceIdNumber);
}

export function updateService(id, updatedData) {
  const services = getAllServices();
  const serviceIdNumber = Number(id);
  const serviceIndex = services.findIndex((s) => s.id === serviceIdNumber);

  if (serviceIndex === -1) {
    console.error(`Service with ID ${id} not found for update.`);
    return null; // Or throw an error
  }

  // Create the updated service object, ensuring arrays are handled correctly
  const updatedService = {
    ...services[serviceIndex], // Copy existing data
    ...updatedData, // Apply updates (status, jasa, parts, totalBiaya)
    jasa: updatedData.jasa || services[serviceIndex].jasa || [], // Ensure jasa is an array
    parts: updatedData.parts || services[serviceIndex].parts || [], // Ensure parts is an array
  };

  // Special handling: Update timestamp if status changes to 'Selesai'
  if (
    updatedData.status &&
    updatedData.status === "Selesai" &&
    services[serviceIndex].status !== "Selesai"
  ) {
    updatedService.timestamp = new Date().toISOString(); // Update timestamp to now
  }

  // Replace the old service with the updated one
  services[serviceIndex] = updatedService;

  // Save the entire array back
  saveData(SERVICES_KEY, services);

  return updatedService; // Return the updated service
}

export function deleteService(id) {
  let services = getAllServices();
  const serviceIdNumber = Number(id);
  const serviceIndex = services.findIndex((s) => s.id === serviceIdNumber); // Find index first

  if (serviceIndex === -1) {
    console.warn(`Service with ID ${id} not found for deletion.`);
    return false; // Indicate failure (not found)
  }

  const serviceToDelete = services[serviceIndex]; // Get the service object

  // --- Stock Reversal Logic ---
  if (serviceToDelete && Array.isArray(serviceToDelete.parts) && serviceToDelete.parts.length > 0) {
    console.log(`Reverting stock for deleted service ID ${id}...`);
    serviceToDelete.parts.forEach((part) => {
      if (part.itemId && part.quantity) {
        console.log(`  - Reverting item ID ${part.itemId}, quantity: ${part.quantity}`);
        // Add the quantity back to stock
        updateItemStock(part.itemId, part.quantity);
      }
    });
  }
  // --- End Stock Reversal Logic ---

  // Now remove the service from the array
  services.splice(serviceIndex, 1);

  // Save the updated services array
  saveData(SERVICES_KEY, services);
  console.log(`Service with ID ${id} deleted and stock reverted (if applicable).`);
  return true; // Indicate success
}

// --- Stock Item Management ---
export function getAllItems() {
  return getData(ITEMS_KEY);
}

export function addItem(itemData) {
  // Expects itemData: { nama: string, kode?: string, satuan: string, stokAwal: number, hargaBeli?: number, hargaJual: number }
  const items = getAllItems();
  const newItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Combines timestamp with a random string
    ...itemData,
    stokSaatIni: Number(itemData.stokAwal) || 0, // Initialize current stock
    hargaBeli: Number(itemData.hargaBeli) || 0,
    hargaJual: Number(itemData.hargaJual) || 0,
    stokMinimal: Number(itemData.stokMinimal) || 0, // Add stokMinimal, default to 0
  };
  items.push(newItem);
  saveData(ITEMS_KEY, items);
  return newItem;
}

export function getItemById(id) {
  const items = getAllItems();
  // const itemIdNumber = Number(id); // No longer needed, id is a string
  return items.find((i) => i.id === id); // Compare directly
}

export function updateItem(id, updatedData) {
  const items = getAllItems();
  // const itemIdNumber = Number(id); // No longer needed, id is a string
  const itemIndex = items.findIndex((i) => i.id === id); // Compare directly

  if (itemIndex === -1) {
    console.error(`Item with ID ${id} not found for update.`);
    return null;
  }

  // Update item data - retain existing stokSaatIni unless explicitly provided
  items[itemIndex] = {
    ...items[itemIndex],
    ...updatedData,
    // Ensure numeric fields are numbers
    hargaBeli: Number(updatedData.hargaBeli) ?? items[itemIndex].hargaBeli,
    hargaJual: Number(updatedData.hargaJual) ?? items[itemIndex].hargaJual,
    stokMinimal: Number(updatedData.stokMinimal) ?? items[itemIndex].stokMinimal ?? 0, // Update stokMinimal, default 0
  };

  saveData(ITEMS_KEY, items);
  return items[itemIndex];
}

export function deleteItem(id) {
  let items = getAllItems();
  // const itemIdNumber = Number(id); // No longer needed, id is a string
  const initialLength = items.length;
  items = items.filter((i) => i.id !== id); // Compare directly

  if (items.length < initialLength) {
    saveData(ITEMS_KEY, items);
    console.log(`Item with ID ${id} deleted.`);
    // TODO: Check if item is used in any service history? Prevent deletion?
    return true;
  } else {
    console.warn(`Item with ID ${id} not found for deletion.`);
    return false; // Indicate failure (not found)
  }
}

// Helper function to check if an item code already exists (excluding a specific item ID during updates)
export function doesItemCodeExist(code, excludeItemId = null) {
  if (!code) return false; // Empty code is allowed (optional field)
  const items = getAllItems();
  const normalizedCode = code.trim().toUpperCase();
  return items.some(item =>
    item.kode && // Check if item has a code
    item.kode.trim().toUpperCase() === normalizedCode &&
    item.id !== excludeItemId // Exclude the item being edited
  );
}

// Function to update stock for a specific item
// Used internally by recordPurchase or when items are used in services
export function updateItemStock(itemId, quantityChange) {
  const items = getAllItems();
  // const itemIdNumber = Number(itemId); // No longer needed, itemId is a string
  const itemIndex = items.findIndex((i) => i.id === itemId); // Compare directly

  if (itemIndex === -1) {
    console.error(`Item with ID ${itemId} not found for stock update.`);
    return null;
  }

  const currentStock = Number(items[itemIndex].stokSaatIni) || 0;
  const change = Number(quantityChange) || 0;

  // Update the stock
  items[itemIndex].stokSaatIni = currentStock + change;

  // Save the updated items array
  saveData(ITEMS_KEY, items);

  return items[itemIndex]; // Return the updated item
}

// --- Purchase Record Management ---
export function getAllPurchases() {
  return getData(PURCHASES_KEY);
}

export function recordPurchase(purchaseData) {
  // Expects purchaseData: { supplier?: string, date: string, items: [{itemId: number, quantity: number, purchasePrice: number}], totalCost: number }
  const purchases = getAllPurchases();
  const newPurchase = {
    id: getNextId() + 4, // Simple unique ID
    ...purchaseData,
    timestamp: new Date().toISOString(), // Record when the purchase was logged
  };
  purchases.push(newPurchase);
  saveData(PURCHASES_KEY, purchases);

  // Update stock for each item in the purchase
  if (Array.isArray(purchaseData.items)) {
    purchaseData.items.forEach((itemDetail) => {
      updateItemStock(itemDetail.itemId, itemDetail.quantity);
      // Optional: Update item's hargaBeli if needed based on this purchase
      // updateItem(itemDetail.itemId, { hargaBeli: itemDetail.purchasePrice }); // Needs updateItem function
    });
  }

  return newPurchase;
}

export function deletePurchase(id) {
  let purchases = getAllPurchases();
  const purchaseIdNumber = Number(id);
  const initialLength = purchases.length;
  const purchaseToDelete = purchases.find((p) => p.id === purchaseIdNumber); // Find the purchase first

  // Filter out the purchase *after* processing items for stock reversal
  // purchases = purchases.filter((p) => p.id !== purchaseIdNumber); // Moved this down

  if (purchaseToDelete && Array.isArray(purchaseToDelete.items)) {
    // Revert stock for each item in the deleted purchase
    purchaseToDelete.items.forEach((itemDetail) => {
      if (itemDetail.itemId && itemDetail.quantity) {
        console.log(
          `Reverting stock for item ID ${itemDetail.itemId}, quantity: ${-itemDetail.quantity}`
        );
        updateItemStock(itemDetail.itemId, -itemDetail.quantity); // Subtract the quantity
      }
    });

    // Now filter out the purchase record
    purchases = purchases.filter((p) => p.id !== purchaseIdNumber);

    // Save the updated purchase list (without the deleted one)
    saveData(PURCHASES_KEY, purchases);
    console.log(`Purchase with ID ${id} deleted and stock reverted.`);
    return true; // Indicate success
  } else if (purchases.length < initialLength) {
    // Fallback if purchaseToDelete or items were somehow invalid, but the record was found and filtered
    saveData(PURCHASES_KEY, purchases);
    console.warn(
      `Purchase with ID ${id} deleted, but stock could not be reverted (invalid data?).`
    );
    return true; // Still indicate success in deleting the record
  } else {
    console.warn(`Purchase with ID ${id} not found for deletion.`);
    return false; // Indicate failure (not found)
  }
}

// --- Purchase Cart Management ---
export function getPurchaseCart() {
  return getData(PURCHASE_CART_KEY); // Returns an array of cart items
}

export function savePurchaseCart(cartItems) {
  saveData(PURCHASE_CART_KEY, cartItems);
}

export function addItemToCart(itemToAdd) {
  // Expects itemToAdd: { itemId: number, nama: string, satuan: string, jumlahBeli: number, hargaBeli: number }
  const cart = getPurchaseCart();
  const existingItemIndex = cart.findIndex((item) => item.itemId === itemToAdd.itemId);

  if (existingItemIndex > -1) {
    // Item already exists, maybe just increment quantity? Or notify user?
    // For simplicity, let's just update quantity and price for now.
    cart[existingItemIndex].jumlahBeli += itemToAdd.jumlahBeli;
    cart[existingItemIndex].hargaBeli = itemToAdd.hargaBeli; // Overwrite price with the latest one added
    console.log(`Updated quantity for ${itemToAdd.nama} in cart.`);
  } else {
    cart.push(itemToAdd);
    console.log(`Added ${itemToAdd.nama} to cart.`);
  }
  savePurchaseCart(cart);
  return cart; // Return updated cart
}

export function updateCartItem(itemId, updates) {
  // updates could be { jumlahBeli: newQty } or { hargaBeli: newPrice }
  const cart = getPurchaseCart();
  const itemIndex = cart.findIndex((item) => item.itemId === itemId);
  if (itemIndex > -1) {
    cart[itemIndex] = { ...cart[itemIndex], ...updates };
    savePurchaseCart(cart);
    return cart[itemIndex];
  }
  return null;
}

export function removeCartItem(itemId) {
  let cart = getPurchaseCart();
  const initialLength = cart.length;
  cart = cart.filter((item) => item.itemId !== itemId);
  if (cart.length < initialLength) {
    savePurchaseCart(cart);
    return true;
  }
  return false;
}

export function clearPurchaseCart() {
  savePurchaseCart([]); // Save an empty array
  console.log("Purchase cart cleared.");
}

// --- Data Management ---
export function clearAllData() {
  // List all keys used by the application
  const appKeys = [
    CUSTOMERS_KEY,
    VEHICLES_KEY,
    SERVICES_KEY,
    ITEMS_KEY,
    PURCHASES_KEY,
    PURCHASE_CART_KEY,
    WORKSHOP_INFO_KEY,
    USER_PROFILE_KEY,
    INVOICES_KEY,
  ];
  try {
    appKeys.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`Removed ${key} from localStorage.`);
    });
    return true;
  } catch (e) {
    console.error("Error clearing app data from localStorage", e);
    return false;
  }
}

// --- TODO: Add functions for deleting specific data (customers, items etc.) ---

// --- Invoice Management ---
export function getAllInvoices() {
  return getData(INVOICES_KEY);
}

export function getInvoiceById(id) {
  const invoices = getAllInvoices();
  return invoices.find(invoice => invoice.id === id);
}

export function getInvoicesByServiceId(serviceId) {
  const invoices = getAllInvoices();
  return invoices.filter(invoice => invoice.serviceId === serviceId);
}

export function createInvoice(invoiceData) {
  // Expects invoiceData to include serviceId, customerId, items, etc.
  const invoices = getAllInvoices();
  const newInvoice = {
    id: `INV-${Date.now()}`, // Generate invoice number with timestamp
    timestamp: new Date().toISOString(),
    status: "Belum Dibayar", // Default status
    ...invoiceData,
  };
  invoices.push(newInvoice);
  saveData(INVOICES_KEY, invoices);
  return newInvoice;
}

// --- Walk-in Customer Management ---
// Special ID for walk-in customers
export const WALK_IN_CUSTOMER_ID = "walk-in";

// Check if a customer is a walk-in customer
export function isWalkInCustomer(customerId) {
  return customerId === WALK_IN_CUSTOMER_ID;
}

// Create a direct invoice without a service record (for walk-in customers)
export function createDirectInvoice(invoiceData) {
  // Generate a unique ID for the invoice
  const invoiceId = `INV-${Date.now()}`;

  // Create the invoice
  const newInvoice = {
    id: invoiceId,
    timestamp: new Date().toISOString(),
    status: "Belum Dibayar",
    isWalkIn: true, // Flag to indicate this is a walk-in invoice
    serviceId: null, // No associated service
    ...invoiceData,
  };

  // Save the invoice
  const invoices = getAllInvoices();
  invoices.push(newInvoice);
  saveData(INVOICES_KEY, invoices);

  return newInvoice;
}

export function updateInvoice(id, updatedData) {
  const invoices = getAllInvoices();
  const invoiceIndex = invoices.findIndex(invoice => invoice.id === id);

  if (invoiceIndex === -1) {
    console.error(`Invoice with ID ${id} not found for update.`);
    return null;
  }

  // Update the invoice
  invoices[invoiceIndex] = {
    ...invoices[invoiceIndex],
    ...updatedData,
  };

  saveData(INVOICES_KEY, invoices);
  return invoices[invoiceIndex];
}

export function deleteInvoice(id) {
  let invoices = getAllInvoices();
  const initialLength = invoices.length;
  invoices = invoices.filter(invoice => invoice.id !== id);

  if (invoices.length < initialLength) {
    saveData(INVOICES_KEY, invoices);
    console.log(`Invoice with ID ${id} deleted.`);
    return true;
  } else {
    console.warn(`Invoice with ID ${id} not found for deletion.`);
    return false;
  }
}

// --- Workshop Info Management ---
export function getWorkshopInfo() {
  // Return an object, default to empty object if not found
  return getData(WORKSHOP_INFO_KEY, {});
}

export function saveWorkshopInfo(infoData) {
  // Expects infoData: { nama: string, alamat?: string, telepon?: string }
  const currentInfo = getWorkshopInfo();
  const updatedInfo = {
    ...currentInfo,
    ...infoData,
  };
  saveData(WORKSHOP_INFO_KEY, updatedInfo);
  console.log("Workshop info saved:", updatedInfo);
  return updatedInfo;
}

// --- User Profile Management ---
export function getUserProfile() {
  // Return an object, default to empty object if not found
  return getData(USER_PROFILE_KEY, {});
}

export function saveUserProfile(profileData) {
  // Expects profileData: { namaTampilan: string } - add more as needed (e.g., username)
  // Avoid storing passwords directly in local storage in a real app!
  const currentProfile = getUserProfile();
  const updatedProfile = {
    ...currentProfile,
    ...profileData,
  };
  saveData(USER_PROFILE_KEY, updatedProfile);
  console.log("User profile saved:", updatedProfile);
  return updatedProfile;
}


// --- Initialization (Optional: Add some dummy data if needed for testing) ---
function initializeDummyData() {
  // Check if *any* key data is missing to initialize everything
  if (
    getAllCustomers().length === 0 &&
    getAllVehicles().length === 0 &&
    getAllItems().length === 0 &&
    getAllServices().length === 0
  ) {
    console.log("Initializing dummy data...");

    // Customers & Vehicles
    const customer1 = addCustomer({ nama: "Andi Wijaya", noHp: "081234567890" });
    addVehicle({
      customerId: customer1.id,
      nomorPolisi: "B 1234 ABC",
      merkTipe: "Honda Vario 150 2021",
    });

    const customer2 = addCustomer({ nama: "Citra Lestari", noHp: "085678901234" });
    addVehicle({
      customerId: customer2.id,
      nomorPolisi: "F 5678 XYZ",
      merkTipe: "Yamaha NMAX 2022",
    });
    addVehicle({
      customerId: customer2.id,
      nomorPolisi: "D 9999 KJL",
      merkTipe: "Toyota Avanza 2018",
    });

    addService({
      customerId: customer1.id,
      vehicleId: getVehiclesByCustomerId(customer1.id)[0].id,
      nomorPolisi: "B 1234 ABC",
      jenisServis: [0], // Ganti Oli
      keterangan: "Oli bawa sendiri",
      status: "Selesai",
      // Add default Jasa items to this service
      jasa: [
        { deskripsi: "Jasa Ganti Oli Mesin", biaya: 25000 },
        { deskripsi: "Pembersihan Filter Udara", biaya: 15000 },
      ],
      // Calculate initial totalBiaya based on default Jasa
      totalBiaya: 40000, // 25000 + 15000
    });

    // Stock Items
    addItem({
      nama: "Oli Mesin MPX 1 0.8L",
      kode: "OLI-MPX1-08",
      satuan: "Pcs",
      stokAwal: 15,
      hargaBeli: 45000,
      hargaJual: 55000,
      stokMinimal: 5,
    });
    addItem({
      nama: "Busi NGK CPR6EA",
      kode: "BUSI-NGK-CPR6",
      satuan: "Pcs",
      stokAwal: 25,
      hargaBeli: 15000,
      hargaJual: 20000,
      stokMinimal: 10,
    });
    addItem({
      nama: "Kampas Rem Depan Vario",
      kode: "KAMPAS-VAR-DPN",
      satuan: "Set",
      stokAwal: 8,
      hargaBeli: 35000,
      hargaJual: 45000,
      stokMinimal: 5,
    });
    addItem({
      nama: "Filter Udara Beat FI",
      kode: "FILTER-BEATFI",
      satuan: "Pcs",
      stokAwal: 12,
      hargaBeli: 28000,
      hargaJual: 35000,
      stokMinimal: 8,
    });
    addItem({
      nama: "Oli Gardan AHM",
      kode: "OLI-GRDN-AHM",
      satuan: "Pcs",
      stokAwal: 20,
      hargaBeli: 12000,
      hargaJual: 18000,
      stokMinimal: 10,
    });
    addItem({
      nama: "Ban Luar FDR 80/90-14",
      kode: "BAN-FDR-809014",
      satuan: "Pcs",
      stokAwal: 5,
      hargaBeli: 150000,
      hargaJual: 180000,
      stokMinimal: 3,
    });

    console.log("Dummy data initialized.");
  }
}

// Uncomment to initialize with dummy data on first load (useful for development)
initializeDummyData(); // Now uncommented
