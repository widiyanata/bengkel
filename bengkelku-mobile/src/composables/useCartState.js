import { ref, computed } from 'vue'
import { getPurchaseCart } from '../stores/localStorage'

const cartItemCount = ref(0)

export function useCartState() {
  const updateCartCount = () => {
    const cart = getPurchaseCart()
    cartItemCount.value = cart.length
  }

  const getCartCount = computed(() => cartItemCount.value)

  return {
    cartItemCount,
    updateCartCount,
    getCartCount
  }
}