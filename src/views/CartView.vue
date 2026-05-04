<template>
<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <AppNavbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">
            🛒 Mi Carrito
        </h2>

        <!-- Loading -->
        <div v-if="cartStore.loading" class="text-center py-16 text-gray-400">
            Cargando carrito...
        </div>

        <!-- Vacío -->
        <div v-else-if="!cartStore.cart?.items?.length"
            class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">

            <p class="text-5xl mb-4">🛒</p>
            <p class="text-gray-500 text-lg">Tu carrito está vacío</p>

            <router-link to="/shop"
                class="inline-block mt-4 bg-amber-500 text-white px-6 py-3 rounded-xl">
                Ir a la tienda
            </router-link>
        </div>

        <!-- Layout -->
        <div v-else class="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">

            <!-- Items -->
            <div class="lg:col-span-2 order-2 lg:order-1 space-y-3">

                <div v-for="item in cartStore.cart.items" :key="item.id"
                    class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border flex items-center gap-3 sm:gap-4">

                    <!-- Imagen -->
                    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <img v-if="item.product?.image_url"
                            :src="item.product.image_url"
                            class="w-full h-full object-cover" />
                        <div v-else class="flex items-center justify-center h-full text-xl">
                            📦
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-sm sm:text-base truncate">
                            {{ item.product?.name }}
                        </p>

                        <p class="text-xs sm:text-sm text-gray-400">
                            ${{ item.product?.price }} x {{ item.quantity }}
                        </p>
                    </div>

                    <!-- Precio + eliminar -->
                    <div class="flex flex-col items-end gap-2">
                        <p class="font-bold text-sm sm:text-base">
                            ${{ (item.product?.price * item.quantity).toFixed(2) }}
                        </p>

                        <button @click="handleRemove(item.id)"
                            class="text-gray-400 hover:text-red-500 text-xs">
                            Eliminar
                        </button>
                    </div>
                </div>

                <!-- Vaciar -->
                <button @click="handleClear"
                    class="text-sm text-red-400 hover:text-red-600">
                    🗑️ Vaciar carrito
                </button>
            </div>

            <!-- Resumen -->
            <div class="lg:col-span-1 order-1 lg:order-2">

                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border lg:sticky lg:top-24">

                    <h3 class="font-bold mb-4">Resumen</h3>

                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Subtotal</span>
                            <span>${{ cartStore.cart.subtotal }}</span>
                        </div>

                        <div class="flex justify-between text-amber-500 font-bold">
                            <span>Millas</span>
                            <span>+{{ cartStore.cart.estimated_miles }}</span>
                        </div>
                    </div>

                    <div class="border-t mt-4 pt-4 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${{ cartStore.cart.subtotal }}</span>
                    </div>

                    <router-link to="/checkout"
                        class="block mt-4 bg-amber-500 text-white text-center py-3 rounded-xl">
                        ⚡ Checkout
                    </router-link>

                </div>
            </div>

        </div>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter }      from 'vue-router'
import { useCartStore }   from '../stores/cart'
import { useMilesStore }  from '../stores/miles'
import { useToastStore }  from '../stores/toast'
import AppNavbar from '../components/AppNavbar.vue'

const router     = useRouter()
const cartStore  = useCartStore()
const milesStore = useMilesStore()
const toast      = useToastStore()

const checkingOut  = ref(false)
const orderSuccess = ref(false)
const orderResult  = ref(null)
const tierUpgrade  = ref(false)

function getProductEmoji(name = '') {
    const n = name.toLowerCase()
    if (n.includes('audífonos') || n.includes('audio'))  return '🎧'
    if (n.includes('smartwatch') || n.includes('reloj')) return '⌚'
    if (n.includes('cargador'))                          return '🔋'
    if (n.includes('teclado'))                           return '⌨️'
    if (n.includes('mouse'))                             return '🖱️'
    if (n.includes('camiseta') || n.includes('ropa'))    return '👕'
    if (n.includes('zapatillas'))                        return '👟'
    if (n.includes('mochila'))                           return '🎒'
    if (n.includes('cafetera'))                          return '☕'
    if (n.includes('lámpara'))                           return '💡'
    if (n.includes('botella'))                           return '💧'
    return '📦'
}

function calculateMiles(item) {
    const multiplier = cartStore.cart?.multiplier || 1
    return Math.round(item.product?.price * item.product?.miles_per_dollar * multiplier * item.quantity)
}

async function handleRemove(cartItemId) {
    try {
        await cartStore.removeFromCart(cartItemId)
        toast.success('Producto eliminado del carrito.')
    } catch (e) {
        toast.error('Error al eliminar el producto.')
    }
}

async function handleClear() {
    if (confirm('¿Vaciar el carrito?')) {
        await cartStore.clearCart()
        toast.info('Carrito vaciado.')
    }
}

async function handleCheckout() {
    checkingOut.value = true
    try {
        const prevTier = milesStore.account?.tier?.name
        const result   = await cartStore.checkout()
        orderResult.value = result.data
        tierUpgrade.value = result.data.tier !== prevTier
        orderSuccess.value = true
        await milesStore.fetchBalance()
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al procesar la compra.')
    } finally {
        checkingOut.value = false
    }
}

onMounted(async () => {
    await cartStore.fetchCart()
    await milesStore.fetchBalance()
})
</script>