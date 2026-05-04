<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-5">💰 Acreditar Millas</h2>

            <!-- Buscar / seleccionar cliente -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                <h3 class="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm sm:text-base">
                    Seleccionar cliente
                </h3>

                <!-- Select con búsqueda -->
                <div class="relative">
                    <!-- Input búsqueda -->
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        @focus="showDropdown = true"
                        @blur="handleBlur"
                        class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm pr-10" />

                    <!-- Ícono -->
                    <div class="absolute right-3 top-3.5 text-gray-400">
                        <svg v-if="!client" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <button v-else @click="clearClient" class="text-gray-400 hover:text-red-500 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Dropdown -->
                    <div v-if="showDropdown && filteredClients.length > 0"
                        class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                        <button
                            v-for="c in filteredClients" :key="c.id"
                            @mousedown="selectClient(c)"
                            class="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 dark:hover:bg-gray-700 transition text-left border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <!-- Avatar -->
                            <div class="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {{ c.name?.charAt(0).toUpperCase() }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-gray-800 dark:text-white text-sm truncate">{{ c.name }}</p>
                                <p class="text-gray-400 text-xs truncate">{{ c.email }}</p>
                            </div>
                            <div class="text-right flex-shrink-0">
                                <span class="text-sm">{{ getTierIcon(c.tier) }}</span>
                                <p class="text-xs text-gray-400">{{ c.balance?.toLocaleString() }} mi.</p>
                            </div>
                        </button>

                        <!-- Sin resultados -->
                        <div v-if="filteredClients.length === 0 && searchQuery"
                            class="px-4 py-3 text-center text-gray-400 text-sm">
                            No se encontraron clientes
                        </div>
                    </div>

                    <!-- Loading clientes -->
                    <div v-if="loadingClients"
                        class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 px-4 py-3 text-center text-gray-400 text-sm">
                        Cargando clientes...
                    </div>
                </div>
            </div>

            <!-- Info del cliente seleccionado -->
            <div v-if="client"
                class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">

                <!-- Perfil -->
                <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                        {{ client.name?.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-gray-800 dark:text-white text-sm sm:text-base truncate">{{ client.name }}</p>
                        <p class="text-gray-500 dark:text-gray-400 text-xs truncate">{{ client.email }}</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <div class="text-xl sm:text-2xl">{{ getTierIcon(client.tier) }}</div>
                        <p class="font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-300">{{ client.tier }}</p>
                        <p class="text-xs text-gray-400">{{ client.multiplier }}x</p>
                    </div>
                </div>

                <!-- Saldo -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-amber-50 dark:bg-amber-900 rounded-xl p-3 sm:p-4 text-center">
                        <p class="text-amber-600 dark:text-amber-300 text-xs">Saldo actual</p>
                        <p class="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-200 mt-1">
                            {{ client.balance?.toLocaleString() }}
                        </p>
                        <p class="text-amber-500 text-xs">millas</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 text-center">
                        <p class="text-gray-500 dark:text-gray-400 text-xs">Lifetime</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">
                            {{ client.lifetime_miles?.toLocaleString() }}
                        </p>
                        <p class="text-gray-400 text-xs">millas</p>
                    </div>
                </div>

                <!-- Formulario acreditar -->
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Millas a acreditar
                        </label>
                        <input v-model.number="earnForm.amount" type="number" min="1"
                            placeholder="Ej: 1000"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />

                        <!-- Preview multiplicador -->
                        <div v-if="earnForm.amount > 0"
                            class="mt-2 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                            <p class="text-green-600 dark:text-green-300 text-xs sm:text-sm">
                                El cliente recibirá
                                <strong>{{ Math.round(earnForm.amount * (client.multiplier || 1)).toLocaleString() }} millas</strong>
                                <span class="opacity-75">({{ earnForm.amount }} × {{ client.multiplier }}x)</span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción (opcional)
                        </label>
                        <input v-model="earnForm.description" type="text"
                            placeholder="Ej: Compra en tienda física"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                    </div>

                    <button @click="handleEarn" :disabled="earning"
                        class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm sm:text-base">
                        {{ earning ? 'Acreditando...' : '💰 Acreditar millas' }}
                    </button>
                </div>
            </div>

            <!-- Sin cliente seleccionado -->
            <div v-else
                class="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                <p class="text-4xl mb-3">👤</p>
                <p class="text-gray-400 text-sm">Busca y selecciona un cliente para acreditarle millas</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMilesStore } from '../../stores/miles'
import { useToastStore } from '../../stores/toast'
import api from '../../plugins/axios'
import AppNavbar from '../../components/AppNavbar.vue'

const milesStore = useMilesStore()
const toast      = useToastStore()

const allClients   = ref([])
const client       = ref(null)
const searchQuery  = ref('')
const showDropdown = ref(false)
const loadingClients = ref(false)
const earning      = ref(false)
const earnForm     = ref({ amount: null, description: '' })

// Filtrar clientes según búsqueda
const filteredClients = computed(() => {
    if (!searchQuery.value) return allClients.value
    const q = searchQuery.value.toLowerCase()
    return allClients.value.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
})

function getTierIcon(tierName) {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }
    return icons[tierName] || '🏆'
}

function selectClient(c) {
    client.value      = c
    searchQuery.value = c.name
    showDropdown.value = false
    earnForm.value    = { amount: null, description: '' }
}

function clearClient() {
    client.value       = null
    searchQuery.value  = ''
    showDropdown.value = false
    earnForm.value     = { amount: null, description: '' }
}

function handleBlur() {
    // Delay para permitir click en dropdown
    setTimeout(() => { showDropdown.value = false }, 150)
}

async function loadClients() {
    loadingClients.value = true
    try {
        const { data } = await api.get('/admin/clients/all')
        allClients.value = data.data
    } catch (e) {
        toast.error('Error al cargar clientes.')
    } finally {
        loadingClients.value = false
    }
}

async function handleEarn() {
    if (!earnForm.value.amount || earnForm.value.amount < 1) {
        toast.error('Ingresa una cantidad válida.')
        return
    }

    earning.value = true
    try {
        const result = await milesStore.earn({
            user_id:     client.value.id,
            amount:      earnForm.value.amount,
            description: earnForm.value.description,
        })

        toast.success('✅ Millas acreditadas correctamente')

        // Actualizar datos del cliente en la lista
        const index = allClients.value.findIndex(c => c.id === client.value.id)
        if (index !== -1) {
            allClients.value[index].balance        = result.data.balance
            allClients.value[index].lifetime_miles = result.data.lifetime_miles
            allClients.value[index].tier           = result.data.tier
        }

        // Actualizar cliente seleccionado
        client.value.balance        = result.data.balance
        client.value.lifetime_miles = result.data.lifetime_miles
        client.value.tier           = result.data.tier

        earnForm.value = { amount: null, description: '' }
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al acreditar.')
    } finally {
        earning.value = false
    }
}

onMounted(() => loadClients())
</script>