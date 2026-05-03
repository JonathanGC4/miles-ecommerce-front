<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-3xl mx-auto px-6 py-8">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-white">💰 Historial de Millas</h2>

                <!-- Filtros -->
                <div class="flex gap-2">
                    <button v-for="f in filters" :key="f.value"
                        @click="applyFilter(f.value)"
                        :class="[
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition',
                            activeFilter === f.value
                                ? 'bg-amber-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                        ]">
                        {{ f.label }}
                    </button>
                </div>
            </div>

            <!-- Resumen rápido -->
            <div v-if="milesStore.account" class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <p class="text-gray-400 text-xs">Saldo actual</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">
                        {{ milesStore.account.balance.toLocaleString() }}
                    </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <p class="text-gray-400 text-xs">Tier actual</p>
                    <p class="text-2xl font-bold text-amber-500">{{ tierIcon }}</p>
                    <p class="text-xs text-gray-500">{{ milesStore.account.tier.name }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <p class="text-gray-400 text-xs">Lifetime miles</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">
                        {{ milesStore.account.lifetime_miles.toLocaleString() }}
                    </p>
                </div>
            </div>

            <!-- Lista de transacciones -->
            <div v-if="milesStore.transactions.length === 0"
                class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p class="text-4xl mb-3">📋</p>
                <p class="text-gray-400">No hay transacciones aún</p>
            </div>

            <div v-else class="space-y-3">
                <div v-for="tx in milesStore.transactions" :key="tx.id"
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">

                    <!-- Ícono tipo -->
                    <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0',
                        tx.type === 'earn'    ? 'bg-green-100 dark:bg-green-900' :
                        tx.type === 'redeem'  ? 'bg-red-100 dark:bg-red-900' :
                                               'bg-amber-100 dark:bg-amber-900'
                    ]">
                        {{ tx.type === 'earn' ? '⬆️' : tx.type === 'redeem' ? '⬇️' : '🛒' }}
                    </div>

                    <div class="flex-1">
                        <p class="font-medium text-gray-800 dark:text-white text-sm">
                            {{ tx.description || typeLabel(tx.type) }}
                        </p>
                        <p class="text-gray-400 text-xs mt-0.5">
                            {{ formatDate(tx.created_at) }}
                        </p>
                    </div>

                    <div :class="[
                        'font-bold text-lg',
                        tx.type === 'redeem' ? 'text-red-500' : 'text-green-500'
                    ]">
                        {{ tx.type === 'redeem' ? '−' : '+' }}{{ tx.amount.toLocaleString() }}
                        <span class="text-xs font-normal text-gray-400 ml-1">mi.</span>
                    </div>
                </div>
            </div>

            <!-- Paginación -->
            <div v-if="milesStore.pagination.lastPage > 1"
                class="flex justify-center gap-2 mt-8">
                <button v-for="page in milesStore.pagination.lastPage" :key="page"
                    @click="goToPage(page)"
                    :class="[
                        'w-9 h-9 rounded-lg text-sm font-medium transition',
                        page === milesStore.pagination.currentPage
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
import { ref, computed, onMounted } from 'vue'
import { useMilesStore } from '../stores/miles'
import AppNavbar from '../components/AppNavbar.vue'

const milesStore   = useMilesStore()
const activeFilter = ref('all')

const filters = [
    { label: 'Todas',     value: 'all' },
    { label: '⬆️ Ganadas', value: 'earn' },
    { label: '🛒 Compras', value: 'purchase' },
    { label: '⬇️ Canjes',  value: 'redeem' },
]

const tierIcon = computed(() => {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }
    return icons[milesStore.account?.tier?.name] || '🏆'
})

function typeLabel(type) {
    const labels = { earn: 'Millas acreditadas', redeem: 'Millas redimidas', purchase: 'Compra en tienda' }
    return labels[type] || type
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

async function applyFilter(value) {
    activeFilter.value = value
    const params = value === 'all' ? {} : { type: value }
    await milesStore.fetchTransactions(params)
}

async function goToPage(page) {
    const params = { page }
    if (activeFilter.value !== 'all') params.type = activeFilter.value
    await milesStore.fetchTransactions(params)
}

onMounted(async () => {
    await milesStore.fetchBalance()
    await milesStore.fetchTransactions()
})
</script>