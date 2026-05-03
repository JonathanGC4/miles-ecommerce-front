<template>
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40">
        <div class="max-w-6xl mx-auto flex items-center justify-between">

            <!-- Logo -->
            <router-link to="/dashboard" class="flex items-center gap-3">
                <div class="bg-gradient-to-br from-yellow-400 to-amber-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                    <span class="text-lg">🏆</span>
                </div>
                <span class="font-bold text-gray-800 dark:text-white text-lg">Miles</span>
            </router-link>

            <!-- Links según rol -->
            <div class="flex items-center gap-2">

                <!-- Client links -->
                <template v-if="auth.isClient">
                    <router-link to="/shop" class="nav-link">🛍️ Tienda</router-link>
                    <router-link to="/cart" class="nav-link relative">
                        🛒 Carrito
                        <span v-if="cartStore.itemCount > 0"
                            class="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {{ cartStore.itemCount }}
                        </span>
                    </router-link>
                    <router-link to="/orders"       class="nav-link">📦 Órdenes</router-link>
                    <router-link to="/transactions" class="nav-link">💰 Millas</router-link>
                    <router-link to="/redeem" class="nav-link">🎁 Canjear</router-link>
                </template>

                <!-- Seller/Admin links -->
                <template v-if="auth.isAdminOrSeller">
                    <router-link to="/admin/earn" class="nav-link">💰 Acreditar</router-link>
                </template>

                <!-- Admin links -->
                <template v-if="auth.isAdmin">
                    <router-link to="/admin/products" class="nav-link">📦 Productos</router-link>
                    <router-link to="/admin/categories" class="nav-link">🏷️ Categorías</router-link>
                </template>

                <!-- Separador -->
                <div class="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1"></div>

                <!-- Dark mode -->
                <button @click="theme.toggle()"
                    class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <span v-if="theme.isDark">☀️</span>
                    <span v-else>🌙</span>
                </button>

                <!-- Perfil -->
                <router-link to="/profile"
                    class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <div class="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                        {{ initials }}
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{{ auth.user?.name?.split(' ')[0] }}</span>
                </router-link>

                <!-- Logout -->
                <button @click="handleLogout"
                    class="text-sm text-red-500 hover:text-red-700 font-medium transition px-2">
                    Salir
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }  from '../stores/auth'
import { useCartStore }  from '../stores/cart'
import { useThemeStore } from '../stores/theme'
import { useToastStore } from '../stores/toast'

const router    = useRouter()
const auth      = useAuthStore()
const cartStore = useCartStore()
const theme     = useThemeStore()
const toast     = useToastStore()

const initials = computed(() =>
    auth.user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
)

async function handleLogout() {
    await auth.logout()
    toast.info('Sesión cerrada.')
    router.push('/login')
}
</script>

<style scoped>
.nav-link {
    @apply relative text-sm text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700 transition;
}

.router-link-active.nav-link {
    @apply text-amber-600 bg-amber-50 dark:bg-gray-700 dark:text-amber-400;
}
</style>