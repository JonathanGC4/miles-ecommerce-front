<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-4xl mx-auto px-6 py-8">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">🛒 Mi Carrito</h2>

            <!-- Loading -->
            <div v-if="cartStore.loading" class="text-center py-16 text-gray-400">
                Cargando carrito...
            </div>

            <!-- Carrito vacío -->
            <div v-else-if="!cartStore.cart?.items?.length" class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p class="text-5xl mb-4">🛒</p>
                <p class="text-gray-500 dark:text-gray-400 text-lg">Tu carrito está vacío</p>
                <router-link to="/shop"
                    class="inline-block mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition hover:from-yellow-500 hover:to-amber-600">
                    Ir a la tienda
                </router-link>
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- Items del carrito -->
                <div class="lg:col-span-2 space-y-3">
                    <div v-for="item in cartStore.cart.items" :key="item.id"
                        class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">


                        <div class="w-14 h-14 bg-amber-50 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                            <img v-if="item.product?.image_url"
                                :src="item.product.image_url"
                                :alt="item.product?.name"
                                class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center text-2xl">
                                {{ getProductEmoji(item.product?.name) }}
                            </div>
                        </div>

                        <div class="flex items-center gap-3 flex-shrink-0">
                            <p class="font-bold text-gray-800 dark:text-white">
                                ${{ (item.product?.price * item.quantity).toFixed(2) }}
                            </p>
                            <button @click="handleRemove(item.id)"
                                class="text-gray-300 hover:text-red-500 transition p-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Vaciar carrito -->
                    <button @click="handleClear"
                        class="text-sm text-red-400 hover:text-red-600 transition">
                        🗑️ Vaciar carrito
                    </button>
                </div>

                <!-- Resumen -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-4">Resumen</h3>

                        <div class="space-y-3 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
                                <span class="text-gray-800 dark:text-white font-medium">
                                    ${{ cartStore.cart.subtotal }}
                                </span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500 dark:text-gray-400">Millas a ganar</span>
                                <span class="text-amber-500 font-bold">
                                    +{{ cartStore.cart.estimated_miles?.toLocaleString() }} 🏆
                                </span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500 dark:text-gray-400">Multiplicador</span>
                                <span class="text-gray-700 dark:text-gray-300">
                                    {{ cartStore.cart.multiplier }}x ({{ cartStore.cart.tier }})
                                </span>
                            </div>
                        </div>

                        <div class="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6">
                            <div class="flex justify-between">
                                <span class="font-bold text-gray-800 dark:text-white">Total</span>
                                <span class="font-bold text-xl text-gray-800 dark:text-white">
                                    ${{ cartStore.cart.subtotal }}
                                </span>
                            </div>
                        </div>

                        <router-link to="/checkout"
                            class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl transition shadow-md text-lg text-center block">
                            ⚡ Ir al checkout
                        </router-link>

                        <router-link to="/redeem"
                            class="w-full border border-amber-300 text-amber-600 dark:text-amber-400 font-medium py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700 transition text-center block mt-3 text-sm">
                            🏆 Canjear producto con millas
                        </router-link>

                        <p class="text-xs text-center text-gray-400 mt-3">
                            Ganarás {{ cartStore.cart.estimated_miles?.toLocaleString() }} millas con esta compra
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal éxito checkout -->
        <div v-if="orderSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    ¡Compra exitosa!
                </h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6">
                    Has ganado
                    <strong class="text-amber-500 text-xl">
                        {{ orderResult?.miles_earned?.toLocaleString() }} millas
                    </strong>
                </p>

                <!-- Nuevo tier si subió -->
                <div v-if="tierUpgrade"
                    class="bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl p-4 mb-6">
                    <p class="font-bold text-lg">🏆 ¡Subiste de tier!</p>
                    <p>Ahora eres <strong>{{ orderResult?.tier }}</strong></p>
                </div>

                <div class="space-y-3">
                    <button @click="orderSuccess = false; router.push('/orders')"
                        class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold py-3 rounded-xl transition">
                        Ver mis órdenes
                    </button>
                    <button @click="orderSuccess = false; router.push('/shop')"
                        class="w-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Seguir comprando
                    </button>
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