import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../plugins/axios'

export const useCartStore = defineStore('cart', () => {
    const cart    = ref(null)
    const loading = ref(false)

    const itemCount = computed(() =>
        cart.value?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    )

    async function fetchCart() {
        loading.value = true
        try {
            const { data } = await api.get('/cart')
            cart.value = data.data
        } finally {
            loading.value = false
        }
    }

    async function addToCart(product_id, quantity = 1) {
        await api.post('/cart', { product_id, quantity })
        await fetchCart()
    }

    async function removeFromCart(cartItemId) {
        await api.delete(`/cart/${cartItemId}`)
        await fetchCart()
    }

    async function clearCart() {
        await api.delete('/cart')
        cart.value = null
    }

    async function checkout(payload) {
        const { data } = await api.post('/checkout', payload)
        cart.value = null
        return data
    }

    async function previewCheckout(discountMiles = 0) {
        const { data } = await api.get('/checkout/preview', {
            params: { discount_miles: discountMiles }
        })
        return data.data
    }

    async function redeemProduct(payload) {
        const { data } = await api.post('/miles/redeem-product', payload)
        return data
    }

    return {
        cart, loading, itemCount,
        fetchCart, addToCart, removeFromCart,
        clearCart, checkout, previewCheckout, redeemProduct
    }
})