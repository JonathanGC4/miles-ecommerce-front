<template>
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">

            <div class="text-center mb-6 sm:mb-8">
                <div class="bg-gradient-to-br from-yellow-400 to-amber-500 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                    <span class="text-2xl sm:text-3xl">🏆</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Miles E-commerce</h1>
                <p class="text-gray-500 mt-1 text-sm">Inicia sesión en tu cuenta</p>
            </div>

            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {{ error }}
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input v-model="form.email" type="email" placeholder="tu@email.com"
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input v-model="form.password" type="password" placeholder="••••••••"
                        @keyup.enter="handleLogin"
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                </div>

                <button @click="handleLogin" :disabled="loading"
                    class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-md text-sm sm:text-base">
                    {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                </button>
            </div>

            <!-- Cuentas de prueba -->
            <div class="mt-5 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <p class="text-xs font-medium text-gray-500 mb-2">Cuentas de prueba:</p>
                <div class="grid grid-cols-2 gap-1">
                    <button v-for="account in testAccounts" :key="account.email"
                        @click="fillCredentials(account)"
                        class="text-left text-xs px-2 py-2 rounded-lg hover:bg-white transition flex flex-col">
                        <span class="font-medium text-gray-700">{{ account.label }}</span>
                        <span class="text-gray-400 truncate">{{ account.email }}</span>
                    </button>
                </div>
            </div>

            <p class="text-center text-gray-500 text-sm mt-5">
                ¿No tienes cuenta?
                <router-link to="/register" class="text-amber-500 font-medium hover:underline">
                    Regístrate
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const router  = useRouter()
const auth    = useAuthStore()
const toast   = useToastStore()
const loading = ref(false)
const error   = ref(null)

const form = ref({ email: '', password: '' })

const testAccounts = [
    { label: '👑 Admin',    email: 'admin@miles.com',  password: 'password123' },
    { label: '🏪 Seller',   email: 'carlos@miles.com', password: 'password123' },
    { label: '🥉 Bronze',   email: 'ana@miles.com',    password: 'password123' },
    { label: '🥈 Silver',   email: 'pedro@miles.com',  password: 'password123' },
    { label: '🥇 Gold',     email: 'maria@miles.com',  password: 'password123' },
    { label: '💎 Platinum', email: 'juan@miles.com',   password: 'password123' },
]

function fillCredentials(account) {
    form.value.email    = account.email
    form.value.password = account.password
}

async function handleLogin() {
    if (!form.value.email || !form.value.password) {
        toast.error('Por favor completa todos los campos.')
        return
    }

    loading.value = true
    error.value   = null

    try {
        await auth.login(form.value)
        toast.success(`¡Bienvenido! 👋`)
        router.push('/dashboard')
    } catch (e) {
        error.value = e.response?.data?.message || 'Error al iniciar sesión.'
    } finally {
        loading.value = false
    }
}
</script>