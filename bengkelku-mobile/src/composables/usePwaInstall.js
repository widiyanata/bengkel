import { ref, onMounted, onBeforeUnmount } from 'vue';

// Reactive ref to hold the install prompt event. Accessible across components using this composable.
const installPrompt = ref(null);

// Flag to ensure listener is added only once
let listenerAdded = false;

export function usePwaInstall() {

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault(); // Prevent mini-infobar
    console.log("usePwaInstall: beforeinstallprompt event captured.");
    installPrompt.value = e; // Store the event
  };

  async function triggerInstallPrompt() {
    if (!installPrompt.value) {
      console.log("usePwaInstall: Prompt not available.");
      // Optionally show a snackbar or message here if needed globally
      return { outcome: 'dismissed' }; // Indicate failure or unavailability
    }
    try {
      console.log("usePwaInstall: Triggering install prompt.");
      installPrompt.value.prompt();
      const { outcome } = await installPrompt.value.userChoice;
      console.log(`usePwaInstall: User choice: ${outcome}`);
      // Clear the prompt after use
      installPrompt.value = null;
      return { outcome }; // Return the outcome
    } catch (error) {
      console.error("usePwaInstall: Error triggering install prompt:", error);
      // Clear the prompt on error too
      installPrompt.value = null;
      return { outcome: 'dismissed', error }; // Indicate error
    }
    // No finally block needed as prompt is cleared on success/error
  }

  // Add/remove listener logic - designed to run once when the composable is first used
  // in a component that persists (like MainLayout)
  if (!listenerAdded) {
    console.log("usePwaInstall: Adding beforeinstallprompt listener (should happen once).");
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    listenerAdded = true; // Mark as added

    // Note: This simple approach assumes the component using this first
    // (e.g., MainLayout) doesn't get unmounted frequently.
    // A more robust solution might involve a global plugin or Pinia store
    // if listener management becomes complex.
    // We don't add onBeforeUnmount here as the listener should persist globally.
  }

  return {
    installPrompt, // Expose the reactive ref (read-only recommended outside)
    triggerInstallPrompt // Expose the function to trigger it
  };
}
