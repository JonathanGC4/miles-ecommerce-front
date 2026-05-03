<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-4xl mx-auto px-6 py-8">
            <div class="flex items-center gap-4 mb-6">
                <router-link to="/cart" class="text-gray-400 hover:text-amber-500 transition text-sm">
                    ← Volver al carrito
                </router-link>
                <span class="text-gray-300">|</span>
                <h2 class="text-xl font-bold text-gray-800 dark:text-white">🏆 Canjear producto con millas</h2>
            </div>

            <!-- Saldo -->
            <div class="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-5 text-white mb-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-yellow-100 text-sm">Tu saldo de millas</p>
                        <p class="text-3xl font-bold">{{ milesStore.account?.balance?.toLocaleString() }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-yellow-100 text-sm">Tier actual</p>
                        <p class="text-xl font-bold">{{ tierIcon }} {{ milesStore.account?.tier?.name }}</p>
                        <p class="text-yellow-100 text-xs">100 millas = $1 de valor</p>
                    </div>
                </div>
            </div>

            <!-- Productos canjeables -->
            <div v-if="productsStore.loading" class="text-center py-16 text-gray-400">
                Cargando productos...
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <div v-for="product in productsStore.products" :key="product.id"
                    :class="[
                        'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden transition group',
                        canAfford(product)
                            ? 'border-gray-100 dark:border-gray-700 hover:shadow-md cursor-pointer'
                            : 'border-gray-100 dark:border-gray-700 opacity-60'
                    ]"
                    @click="canAfford(product) && selectProduct(product)">

                    <div :class="[
                        'h-28 flex items-center justify-center text-4xl transition',
                        selectedProduct?.id === product.id
                            ? 'bg-amber-100 dark:bg-amber-900'
                            : 'bg-amber-50 dark:bg-gray-700'
                    ]">
                        {{ getProductEmoji(product.name) }}
                        <div v-if="selectedProduct?.id === product.id"
                            class="absolute top-2 right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            ✓
                        </div>
                    </div>

                    <div class="p-3">
                        <p class="font-semibold text-gray-800 dark:text-white text-xs leading-tight">{{ product.name }}</p>
                        <p class="text-gray-400 text-xs mt-1">${{ product.price }}</p>
                        <div class="mt-2 flex items-center justify-between">
                            <span :class="[
                                'text-xs font-bold px-2 py-1 rounded-full',
                                canAfford(product)
                                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300'
                                    : 'bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300'
                            ]">
                                {{ getMilesCost(product).toLocaleString() }} mi.
                            </span>
                            <span v-if="!canAfford(product)" class="text-xs text-red-400">
                                Faltan {{ (getMilesCost(product) - (milesStore.account?.balance || 0)).toLocaleString() }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Formulario dirección (si hay producto seleccionado) -->
            <div v-if="selectedProduct"
                class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-amber-200 dark:border-amber-800">
                <div class="flex items-center gap-3 mb-5">
                    <span class="text-2xl">{{ getProductEmoji(selectedProduct.name) }}</span>
                    <div>
                        <p class="font-bold text-gray-800 dark:text-white">{{ selectedProduct.name }}</p>
                        <p class="text-amber-500 text-sm">Costo: {{ getMilesCost(selectedProduct).toLocaleString() }} millas</p>
                    </div>
                </div>

                <h3 class="font-bold text-gray-700 dark:text-gray-300 mb-4 text-sm">📍 Dirección de entrega</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="label">Nombre completo</label>
                        <input v-model="shipping.name" type="text" placeholder="Juan Pérez" class="input" />
                    </div>
                    <div class="col-span-2">
                        <label class="label">Dirección</label>
                        <input v-model="shipping.address" type="text" placeholder="Calle, número" class="input" />
                    </div>
                    <div>
                        <label class="label">Ciudad</label>
                        <input v-model="shipping.city" type="text" placeholder="San Salvador" class="input" />
                    </div>
                    <div>
                        <label class="label">País</label>
                        <input v-model="shipping.country" type="text" placeholder="El Salvador" class="input" />
                    </div>
                    <div class="col-span-2">
                        <label class="label">Teléfono</label>
                        <input v-model="shipping.phone" type="tel" placeholder="7777-7777" class="input" />
                    </div>
                </div>

                <button @click="handleRedeem" :disabled="redeeming"
                    class="w-full mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition shadow-md">
                    {{ redeeming ? 'Canjeando...' : `🏆 Canjear por ${getMilesCost(selectedProduct).toLocaleString()} millas` }}
                </button>
            </div>
        </div>

        <!-- Modal éxito -->
        <div v-if="redeemSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                <div class="text-6xl mb-4">🎁</div>
                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Canje exitoso!</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">
                    <strong>{{ redeemResult?.product }}</strong> está en camino
                </p>
                <div class="bg-amber-50 dark:bg-amber-900 rounded-xl p-4 mb-6">
                    <p class="text-amber-600 dark:text-amber-300 text-sm">
                        Millas usadas: <strong>{{ redeemResult?.miles_used?.toLocaleString() }}</strong>
                    </p>
                    <p class="text-amber-600 dark:text-amber-300 text-sm">
                        Saldo restante: <strong>{{ redeemResult?.balance?.toLocaleString() }}</strong>
                    </p>
                </div>
                <div class="space-y-3">
                    <button @click="router.push('/orders')"
                        class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold py-3 rounded-xl">
                        Ver mis órdenes
                    </button>
                    <button @click="router.push('/shop')"
                        class="w-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Seguir comprando
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter }        from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useMilesStore }    from '../stores/miles'
import { useCartStore }     from '../stores/cart'
import { useToastStore }    from '../stores/toast'
import AppNavbar from '../components/AppNavbar.vue'

const router        = useRouter()
const productsStore = useProductsStore()
const milesStore    = useMilesStore()
const cartStore     = useCartStore()
const toast         = useToastStore()

const selectedProduct = ref(null)
const redeeming       = ref(false)
const redeemSuccess   = ref(false)
const redeemResult    = ref(null)

const shipping = ref({
    name: '', address: '', city: '', country: '', phone: ''
})

const tierIcon = computed(() => {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }
    return icons[milesStore.account?.tier?.name] || '🏆'
})

function getProductEmoji(name = '') {
    const n = name.toLowerCase()
    if (n.includes('audífonos'))  return '🎧'
    if (n.includes('smartwatch')) return '⌚'
    if (n.includes('cargador'))   return '🔋'
    if (n.includes('teclado'))    return '⌨️'
    if (n.includes('mouse'))      return '🖱️'
    if (n.includes('camiseta'))   return '👕'
    if (n.includes('zapatillas')) return '👟'
    if (n.includes('mochila'))    return '🎒'
    if (n.includes('cafetera'))   return '☕'
    if (n.includes('lámpara'))    return '💡'
    if (n.includes('botella'))    return '💧'
    return '📦'
}

function getMilesCost(product) {
    return product.price * product.miles_per_dollar * 10
}

function canAfford(product) {
    return (milesStore.account?.balance || 0) >= getMilesCost(product)
}

function selectProduct(product) {
    selectedProduct.value = selectedProduct.value?.id === product.id ? null : product
}

async function handleRedeem() {
    if (!shipping.value.name || !shipping.value.address ||
        !shipping.value.city || !shipping.value.country || !shipping.value.phone) {
        toast.error('Completa todos los campos de dirección.')
        return
    }

    redeeming.value = true
    try {
        const result      = await cartStore.redeemProduct({
            product_id:       selectedProduct.value.id,
            shipping_address: shipping.value,
        })
        redeemResult.value  = result.data
        redeemSuccess.value = true
        await milesStore.fetchBalance()
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al canjear.')
    } finally {
        redeeming.value = false
    }
}

onMounted(async () => {
    await productsStore.fetchProducts()
    await milesStore.fetchBalance()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.name) shipping.value.name = user.name
})
</script>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
.input { @apply w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm; }
</style>