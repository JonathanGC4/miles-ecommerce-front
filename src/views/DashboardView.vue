<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

            <div class="mb-6">
                <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                    ¡Hola, {{ auth.user?.name?.split(' ')[0] }}! 👋
                </h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">{{ roleMessage }}</p>
            </div>

            <!-- Dashboard Admin -->
            <template v-if="auth.isAdmin">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <router-link to="/admin/products"
                        class="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
                        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📦</div>
                        <h3 class="font-bold text-gray-800 dark:text-white text-base sm:text-lg">Gestión de Productos</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Crear, editar y administrar el catálogo</p>
                    </router-link>
                    <router-link to="/admin/earn"
                        class="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
                        <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">💰</div>
                        <h3 class="font-bold text-gray-800 dark:text-white text-base sm:text-lg">Acreditar Millas</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Asignar millas a clientes manualmente</p>
                    </router-link>
                </div>

                <div class="mt-5 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="font-bold text-gray-800 dark:text-white mb-4 text-sm sm:text-base">Sistema de Tiers</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div v-for="tier in tiers" :key="tier.name"
                            class="text-center p-3 sm:p-4 rounded-xl"
                            :style="{ backgroundColor: tier.bg }">
                            <div class="text-xl sm:text-2xl mb-1">{{ tier.icon }}</div>
                            <p class="font-bold text-xs sm:text-sm" :style="{ color: tier.color }">{{ tier.name }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ tier.multiplier }}x</p>
                            <p class="text-xs text-gray-400">+{{ tier.min.toLocaleString() }}</p>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Dashboard Seller -->
            <template v-else-if="auth.isSeller">
                <router-link to="/admin/earn"
                    class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group flex items-center gap-4">
                    <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition flex-shrink-0">💰</div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-gray-800 dark:text-white">Acreditar Millas</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Busca un cliente y acredita sus millas</p>
                    </div>
                    <span class="text-gray-300 flex-shrink-0">→</span>
                </router-link>
            </template>

            <!-- Dashboard Client -->
            <template v-else-if="auth.isClient">
                <div v-if="milesStore.loading" class="text-center py-8 text-gray-400 text-sm">
                    Cargando tu cuenta...
                </div>

                <template v-else-if="milesStore.account">
                    <!-- Card millas -->
                    <div class="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-5 sm:p-6 text-white shadow-lg mb-5">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-yellow-100 text-xs sm:text-sm font-medium">Saldo de millas</p>
                                <p class="text-4xl sm:text-5xl font-bold mt-1">
                                    {{ milesStore.account.balance.toLocaleString() }}
                                </p>
                                <p class="text-yellow-100 text-xs mt-2">
                                    {{ milesStore.account.lifetime_miles.toLocaleString() }} acumuladas en total
                                </p>
                            </div>
                            <div class="text-right flex-shrink-0 ml-3">
                                <div class="text-3xl sm:text-4xl mb-1">{{ tierIcon }}</div>
                                <p class="font-bold text-sm sm:text-lg">{{ milesStore.account.tier.name }}</p>
                                <p class="text-yellow-100 text-xs">{{ milesStore.account.tier.multiplier }}x millas</p>
                            </div>
                        </div>

                        <!-- Barra progreso -->
                        <div v-if="milesStore.account.tier.next_tier" class="mt-4">
                            <div class="flex justify-between text-xs text-yellow-100 mb-1">
                                <span>Progreso a {{ milesStore.account.tier.next_tier.name }}</span>
                                <span>{{ milesStore.account.tier.next_tier.missing.toLocaleString() }} restantes</span>
                            </div>
                            <div class="w-full bg-yellow-300 bg-opacity-40 rounded-full h-2">
                                <div class="bg-white rounded-full h-2 transition-all duration-500"
                                    :style="{ width: progressPercentage + '%' }"></div>
                            </div>
                        </div>
                        <div v-else class="mt-4 text-yellow-100 text-sm font-medium">
                            🎉 ¡Has alcanzado el tier máximo!
                        </div>
                    </div>

                    <!-- Accesos rápidos -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <router-link to="/shop"
                            class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition text-center group">
                            <div class="text-2xl mb-1 group-hover:scale-110 transition">🛍️</div>
                            <p class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Tienda</p>
                        </router-link>
                        <router-link to="/cart"
                            class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition text-center group relative">
                            <div class="text-2xl mb-1 group-hover:scale-110 transition">🛒</div>
                            <p class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Carrito</p>
                            <span v-if="cartStore.itemCount > 0"
                                class="absolute top-2 right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {{ cartStore.itemCount }}
                            </span>
                        </router-link>
                        <router-link to="/orders"
                            class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition text-center group">
                            <div class="text-2xl mb-1 group-hover:scale-110 transition">📦</div>
                            <p class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Órdenes</p>
                        </router-link>
                        <router-link to="/transactions"
                            class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition text-center group">
                            <div class="text-2xl mb-1 group-hover:scale-110 transition">💰</div>
                            <p class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Historial</p>
                        </router-link>
                    </div>

                    <!-- Beneficios -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-3 text-sm sm:text-base">
                            {{ tierIcon }} Beneficios {{ milesStore.account.tier.name }}
                        </h3>
                        <ul class="space-y-2">
                            <li v-for="benefit in milesStore.account.tier.benefits" :key="benefit"
                                class="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <span class="text-amber-500 flex-shrink-0">✓</span>
                                {{ benefit }}
                            </li>
                        </ul>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore }  from '../stores/auth'
import { useMilesStore } from '../stores/miles'
import { useCartStore }  from '../stores/cart'
import AppNavbar from '../components/AppNavbar.vue'

const auth       = useAuthStore()
const milesStore = useMilesStore()
const cartStore  = useCartStore()

const roleMessage = computed(() => {
    if (auth.isAdmin)  return 'Panel de administración del sistema de millas.'
    if (auth.isSeller) return 'Acredita millas a tus clientes.'
    return 'Bienvenido a tu programa de lealtad.'
})

const tierIcon = computed(() => {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }
    return icons[milesStore.account?.tier?.name] || '🏆'
})

const progressPercentage = computed(() => {
    if (!milesStore.account?.tier?.next_tier) return 100
    const current  = milesStore.account.lifetime_miles
    const nextTier = milesStore.account.tier.next_tier
    const needed   = nextTier.min_miles ?? (current + nextTier.missing)
    const prev     = needed - nextTier.missing
    return Math.min(Math.round(((current - prev) / (needed - prev)) * 100), 100)
})

const tiers = [
    { name: 'Bronze',   icon: '🥉', multiplier: '1.0', min: 0,      bg: '#fef3c7', color: '#92400e' },
    { name: 'Silver',   icon: '🥈', multiplier: '1.5', min: 5000,   bg: '#f1f5f9', color: '#475569' },
    { name: 'Gold',     icon: '🥇', multiplier: '2.0', min: 15000,  bg: '#fef9c3', color: '#854d0e' },
    { name: 'Platinum', icon: '💎', multiplier: '3.0', min: 50000,  bg: '#ede9fe', color: '#5b21b6' },
]

onMounted(async () => {
    if (auth.isClient) {
        await milesStore.fetchBalance()
        await cartStore.fetchCart()
    }
})
</script>