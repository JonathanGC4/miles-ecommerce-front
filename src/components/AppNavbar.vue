<template>
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-40">
        <div class="max-w-6xl mx-auto flex items-center justify-between">

            <!-- Logo -->
            <router-link to="/dashboard" class="flex items-center gap-2 flex-shrink-0">
                <div class="bg-gradient-to-br from-yellow-400 to-amber-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                    <span class="text-lg">🏆</span>
                </div>
                <span class="font-bold text-gray-800 dark:text-white text-lg">Miles</span>
            </router-link>

            <!-- Botón hamburguesa (móvil) -->
            <button @click="menuOpen = !menuOpen"
                class="sm:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <!-- Links desktop -->
            <div class="hidden sm:flex items-center gap-2">
                <template v-if="auth.isClient">
                    <router-link to="/shop"         class="nav-link">🛍️ Tienda</router-link>
                    <router-link to="/cart"         class="nav-link relative">
                        🛒 Carrito
                        <span v-if="cartStore.itemCount > 0"
                            class="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {{ cartStore.itemCount }}
                        </span>
                    </router-link>
                    <router-link to="/orders"       class="nav-link">📦 Órdenes</router-link>
                    <router-link to="/transactions" class="nav-link">💰 Millas</router-link>
                    <router-link to="/redeem"       class="nav-link">🎁 Canjear</router-link>
                </template>

                <template v-if="auth.isAdminOrSeller">
                    <router-link to="/admin/earn"   class="nav-link">💰 Acreditar</router-link>
                </template>

                <template v-if="auth.isAdmin">
                    <router-link to="/admin/products"   class="nav-link">📦 Productos</router-link>
                    <router-link to="/admin/categories" class="nav-link">🏷️ Categorías</router-link>
                </template>

                <div class="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1"></div>

                <button @click="theme.toggle()"
                    class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <span v-if="theme.isDark">☀️</span>
                    <span v-else>🌙</span>
                </button>

                <router-link to="/profile"
                    class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <div class="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                        {{ initials }}
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ auth.user?.name?.split(' ')[0] }}</span>
                </router-link>

                <button @click="handleLogout"
                    class="text-sm text-red-500 hover:text-red-700 font-medium transition px-2">
                    Salir
                </button>
            </div>
        </div>

        <!-- Menú móvil -->
        <div v-if="menuOpen"
            class="sm:hidden mt-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">

            <template v-if="auth.isClient">
                <router-link to="/shop"         class="mobile-link" @click="menuOpen = false">🛍️ Tienda</router-link>
                <router-link to="/cart"         class="mobile-link" @click="menuOpen = false">
                    🛒 Carrito
                    <span v-if="cartStore.itemCount > 0"
                        class="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                        {{ cartStore.itemCount }}
                    </span>
                </router-link>
                <router-link to="/orders"       class="mobile-link" @click="menuOpen = false">📦 Órdenes</router-link>
                <router-link to="/transactions" class="mobile-link" @click="menuOpen = false">💰 Millas</router-link>
                <router-link to="/redeem"       class="mobile-link" @click="menuOpen = false">🎁 Canjear</router-link>
            </template>

            <template v-if="auth.isAdminOrSeller">
                <router-link to="/admin/earn"   class="mobile-link" @click="menuOpen = false">💰 Acreditar millas</router-link>
            </template>

            <template v-if="auth.isAdmin">
                <router-link to="/admin/products"   class="mobile-link" @click="menuOpen = false">📦 Productos</router-link>
                <router-link to="/admin/categories" class="mobile-link" @click="menuOpen = false">🏷️ Categorías</router-link>
            </template>

            <div class="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3 space-y-1">
                <router-link to="/profile" class="mobile-link" @click="menuOpen = false">
                    👤 {{ auth.user?.name }}
                </router-link>

                <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Modo oscuro</span>
                    <button @click="theme.toggle()"
                        class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <span v-if="theme.isDark">☀️</span>
                        <span v-else>🌙</span>
                    </button>
                </div>

                <button @click="handleLogout"
                    class="mobile-link text-red-500 hover:text-red-700 w-full text-left">
                    🚪 Cerrar sesión
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter }     from 'vue-router'
import { useAuthStore }  from '../stores/auth'
import { useCartStore }  from '../stores/cart'
import { useThemeStore } from '../stores/theme'
import { useToastStore } from '../stores/toast'

const router    = useRouter()
const auth      = useAuthStore()
const cartStore = useCartStore()
const theme     = useThemeStore()
const toast     = useToastStore()
const menuOpen  = ref(false)

const initials = computed(() =>
    auth.user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
)

async function handleLogout() {
    await auth.logout()
    toast.info('Sesión cerrada.')
    menuOpen.value = false
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
.mobile-link {
    @apply flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 rounded-xl transition;
}
.router-link-active.mobile-link {
    @apply text-amber-600 bg-amber-50 dark:bg-gray-700;
}
</style>