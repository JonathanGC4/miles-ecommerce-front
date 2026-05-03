<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-4xl mx-auto px-6 py-8">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">📦 Mis Órdenes</h2>

            <div v-if="ordersStore.loading" class="text-center py-16 text-gray-400">
                Cargando órdenes...
            </div>

            <div v-else-if="ordersStore.orders.length === 0" class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p class="text-5xl mb-4">📦</p>
                <p class="text-gray-500 dark:text-gray-400">No tienes órdenes aún</p>
                <router-link to="/shop"
                    class="inline-block mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition">
                    Ir a comprar
                </router-link>
            </div>

            <div v-else class="space-y-4">
                <div v-for="order in ordersStore.orders" :key="order.id"
                    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                    <!-- Header orden -->
                    <div class="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                        <div>
                            <p class="font-bold text-gray-800 dark:text-white">
                                Orden #{{ order.id }}
                            </p>
                            <p class="text-gray-400 text-xs mt-0.5">
                                {{ formatDate(order.created_at) }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-gray-800 dark:text-white">${{ order.total }}</p>
                            <p class="text-amber-500 text-sm font-medium">
                                +{{ order.miles_earned?.toLocaleString() }} millas 🏆
                            </p>
                        </div>
                    </div>

                    <!-- Items -->
                    <div class="p-5">
                        <div class="space-y-2">
                            <div v-for="item in order.items" :key="item.id"
                                class="flex items-center gap-3 text-sm">
                                <span class="text-xl">{{ getProductEmoji(item.product?.name) }}</span>
                                <span class="flex-1 text-gray-700 dark:text-gray-300 truncate">
                                    {{ item.product?.name }}
                                </span>
                                <span class="text-gray-400">x{{ item.quantity }}</span>
                                <span class="font-medium text-gray-700 dark:text-gray-300">
                                    ${{ (item.price * item.quantity).toFixed(2) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Paginación -->
            <div v-if="ordersStore.pagination.lastPage > 1"
                class="flex justify-center gap-2 mt-8">
                <button v-for="page in ordersStore.pagination.lastPage" :key="page"
                    @click="ordersStore.fetchOrders({ page })"
                    :class="[
                        'w-9 h-9 rounded-lg text-sm font-medium transition',
                        page === ordersStore.pagination.currentPage
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    ]">
                    {{ page }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOrdersStore } from '../stores/orders'
import AppNavbar from '../components/AppNavbar.vue'

const ordersStore = useOrdersStore()

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

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric'
    })
}

onMounted(() => ordersStore.fetchOrders())
</script>