<template>
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

            <!-- Header -->
            <div class="text-center mb-8">
                <div class="bg-gradient-to-br from-yellow-400 to-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span class="text-3xl">✨</span>
                </div>
                <h1 class="text-2xl font-bold text-gray-800">Crear cuenta</h1>
                <p class="text-gray-500 mt-1">Empieza a acumular millas hoy</p>
            </div>

            <!-- Tier preview -->
            <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p class="text-xs font-medium text-amber-600 mb-2">🎁 Al registrarte obtienes:</p>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">🥉</div>
                    <div>
                        <p class="font-semibold text-gray-800 text-sm">Tier Bronze</p>
                        <p class="text-xs text-gray-500">1.0x millas en cada compra</p>
                    </div>
                </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {{ error }}
            </div>

            <!-- Form -->
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <input
                        v-model="form.name"
                        type="text"
                        placeholder="Juan Pérez"
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input
                        v-model="form.email"
                        type="email"
                        placeholder="tu@email.com"
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                        v-model="form.password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                    <input
                        v-model="form.password_confirmation"
                        type="password"
                        placeholder="Repite tu contraseña"
                        @keyup.enter="handleRegister"
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                </div>

                <button
                    @click="handleRegister"
                    :disabled="loading"
                    class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md"
                >
                    {{ loading ? 'Creando cuenta...' : 'Crear cuenta y empezar' }}
                </button>
            </div>

            <p class="text-center text-gray-500 text-sm mt-6">
                ¿Ya tienes cuenta?
                <router-link to="/login" class="text-amber-500 font-medium hover:underline">
                    Inicia sesión
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

const form = ref({
    name:                  '',
    email:                 '',
    password:              '',
    password_confirmation: '',
})

async function handleRegister() {
    if (!form.value.name || !form.value.email || !form.value.password) {
        toast.error('Por favor completa todos los campos.')
        return
    }

    if (form.value.password !== form.value.password_confirmation) {
        toast.error('Las contraseñas no coinciden.')
        return
    }

    loading.value = true
    error.value   = null

    try {
        await auth.register(form.value)
        toast.success('¡Cuenta creada! Bienvenido al programa de millas 🏆')
        router.push('/dashboard')
    } catch (e) {
        error.value = e.response?.data?.message || 'Error al crear la cuenta.'
    } finally {
        loading.value = false
    }
}
</script>