<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-2xl mx-auto px-6 py-8">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">💰 Acreditar Millas</h2>

            <!-- Buscar cliente -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <h3 class="font-bold text-gray-700 dark:text-gray-300 mb-4">Buscar cliente</h3>
                <div class="flex gap-3">
                    <input v-model="searchEmail" type="email"
                        placeholder="email@cliente.com"
                        @keyup.enter="searchClient"
                        class="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    <button @click="searchClient" :disabled="searching"
                        class="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50">
                        {{ searching ? '...' : 'Buscar' }}
                    </button>
                </div>
            </div>

            <!-- Info del cliente encontrado -->
            <div v-if="client"
                class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">

                <!-- Perfil cliente -->
                <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <div class="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                        {{ client.name?.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-gray-800 dark:text-white">{{ client.name }}</p>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">{{ client.email }}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl">{{ getTierIcon(client.miles_account?.tier?.name) }}</div>
                        <p class="font-bold text-sm text-gray-700 dark:text-gray-300">
                            {{ client.miles_account?.tier?.name }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ client.miles_account?.tier?.multiplier }}x multiplicador
                        </p>
                    </div>
                </div>

                <!-- Saldo actual -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-amber-50 dark:bg-amber-900 rounded-xl p-4 text-center">
                        <p class="text-amber-600 dark:text-amber-300 text-sm">Saldo actual</p>
                        <p class="text-2xl font-bold text-amber-700 dark:text-amber-200">
                            {{ client.miles_account?.balance?.toLocaleString() }}
                        </p>
                        <p class="text-amber-500 text-xs">millas</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Millas históricas</p>
                        <p class="text-2xl font-bold text-gray-700 dark:text-gray-200">
                            {{ client.miles_account?.lifetime_miles?.toLocaleString() }}
                        </p>
                        <p class="text-gray-400 text-xs">lifetime</p>
                    </div>
                </div>

                <!-- Formulario acreditar -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Millas a acreditar
                        </label>
                        <input v-model.number="earnForm.amount" type="number" min="1"
                            placeholder="Ej: 1000"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />

                        <!-- Preview con multiplicador -->
                        <div v-if="earnForm.amount > 0"
                            class="mt-2 p-3 bg-green-50 dark:bg-green-900 rounded-lg text-sm">
                            <span class="text-green-600 dark:text-green-300">
                                El cliente recibirá
                                <strong>{{ Math.round(earnForm.amount * (client.miles_account?.tier?.multiplier || 1)).toLocaleString() }} millas</strong>
                                ({{ earnForm.amount }} × {{ client.miles_account?.tier?.multiplier }}x)
                            </span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción (opcional)
                        </label>
                        <input v-model="earnForm.description" type="text"
                            placeholder="Ej: Compra en tienda física"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>

                    <button @click="handleEarn" :disabled="earning"
                        class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                        {{ earning ? 'Acreditando...' : '💰 Acreditar millas' }}
                    </button>
                </div>
            </div>

            <!-- Estado vacío -->
            <div v-else-if="searched && !client"
                class="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p class="text-4xl mb-3">🔍</p>
                <p class="text-gray-500 dark:text-gray-400">No se encontró ningún cliente con ese email</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMilesStore } from '../../stores/miles'
import { useToastStore } from '../../stores/toast'
import api from '../../plugins/axios'
import AppNavbar from '../../components/AppNavbar.vue'

const milesStore  = useMilesStore()
const toast       = useToastStore()

const searchEmail = ref('')
const client      = ref(null)
const searched    = ref(false)
const searching   = ref(false)
const earning     = ref(false)

const earnForm = ref({ amount: null, description: '' })

function getTierIcon(tierName) {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }
    return icons[tierName] || '🏆'
}

async function searchClient() {
    if (!searchEmail.value) {
        toast.error('Ingresa un email.')
        return
    }

    searching.value = true
    client.value    = null
    searched.value  = false

    try {
        const { data } = await api.get('/admin/clients', {
            params: { email: searchEmail.value }
        })
        client.value   = data.data
        searched.value = true
    } catch (e) {
        searched.value = true
        toast.error('Cliente no encontrado.')
    } finally {
        searching.value = false
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

        toast.success(`✅ Millas acreditadas correctamente`)

        // Actualizar info del cliente
        client.value.miles_account.balance        = result.data.balance
        client.value.miles_account.lifetime_miles = result.data.lifetime_miles
        client.value.miles_account.tier.name      = result.data.tier

        earnForm.value = { amount: null, description: '' }
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al acreditar.')
    } finally {
        earning.value = false
    }
}
</script>