<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-2xl mx-auto px-6 py-8">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Mi Perfil</h2>

            <!-- Card cuenta de millas (solo client) -->
            <div v-if="auth.isClient && milesStore.account"
                class="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-6 text-white shadow-lg mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-yellow-100 text-sm">Saldo disponible</p>
                        <p class="text-4xl font-bold">{{ milesStore.account.balance.toLocaleString() }}</p>
                        <p class="text-yellow-100 text-sm mt-1">millas</p>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl">{{ tierIcon }}</div>
                        <p class="font-bold mt-1">{{ milesStore.account.tier.name }}</p>
                        <p class="text-yellow-100 text-xs">{{ milesStore.account.tier.multiplier }}x</p>
                    </div>
                </div>
            </div>

            <!-- Info del usuario -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                        {{ initials }}
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 dark:text-white text-lg">{{ auth.user?.name }}</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">{{ auth.user?.email }}</p>
                        <span :class="[
                            'text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block',
                            auth.isAdmin  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' :
                            auth.isSeller ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        ]">
                            {{ auth.isAdmin ? '👑 Admin' : auth.isSeller ? '🏪 Seller' : '👤 Client' }}
                        </span>
                    </div>
                </div>

                <!-- Editar perfil -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input v-model="form.name" type="text"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input v-model="form.email" type="email"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>
                    <button @click="handleUpdate" :disabled="saving"
                        class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                </div>
            </div>

            <!-- Redimir millas (solo client) -->
            <div v-if="auth.isClient"
                class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 class="font-bold text-gray-800 dark:text-white mb-4">💸 Redimir Millas</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cantidad a redimir
                            <span class="text-gray-400 font-normal">(disponible: {{ milesStore.account?.balance?.toLocaleString() }})</span>
                        </label>
                        <input v-model.number="redeemForm.amount" type="number" min="1"
                            :max="milesStore.account?.balance"
                            placeholder="Ej: 500"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (opcional)</label>
                        <input v-model="redeemForm.description" type="text"
                            placeholder="Ej: Canje por descuento"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>
                    <button @click="handleRedeem" :disabled="redeeming"
                        class="w-full bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                        {{ redeeming ? 'Redimiendo...' : '💸 Redimir millas' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore }  from '../stores/auth'
import { useMilesStore } from '../stores/miles'
import { useToastStore } from '../stores/toast'
import api from '../plugins/axios'
import AppNavbar from '../components/AppNavbar.vue'

const auth       = useAuthStore()
const milesStore = useMilesStore()
const toast      = useToastStore()

const saving   = ref(false)
const redeeming = ref(false)

const form = ref({
    name:  auth.user?.name  || '',
    email: auth.user?.email || '',
})

const redeemForm = ref({ amount: null, description: '' })

const initials = computed(() =>
    auth.user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
)

const tierIcon = computed(() => {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }
    return icons[milesStore.account?.tier?.name] || '🏆'
})

async function handleUpdate() {
    saving.value = true
    try {
        const { data } = await api.put('/profile', form.value)
        auth.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Perfil actualizado correctamente.')
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al actualizar.')
    } finally {
        saving.value = false
    }
}

async function handleRedeem() {
    if (!redeemForm.value.amount || redeemForm.value.amount < 1) {
        toast.error('Ingresa una cantidad válida.')
        return
    }

    redeeming.value = true
    try {
        await milesStore.redeem(redeemForm.value)
        toast.success(`${redeemForm.value.amount.toLocaleString()} millas redimidas correctamente.`)
        redeemForm.value = { amount: null, description: '' }
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al redimir.')
    } finally {
        redeeming.value = false
    }
}

onMounted(async () => {
    if (auth.isClient) await milesStore.fetchBalance()
})
</script>