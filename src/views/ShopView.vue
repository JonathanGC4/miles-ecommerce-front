<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-7xl mx-auto px-6 py-8">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">🛍️ Tienda</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Ganas <strong class="text-amber-500">{{ milesStore.account?.tier?.multiplier }}x millas</strong>
                        con tu tier {{ milesStore.account?.tier?.name }}
                    </p>
                </div>
                <p class="text-gray-400 text-sm">
                    {{ productsStore.pagination.total || 0 }} productos
                </p>
            </div>

            <div class="flex gap-6">

                <!-- Panel de filtros -->
                <div class="w-56 flex-shrink-0 space-y-6">

                    <!-- Búsqueda -->
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Buscar</label>
                        <input v-model="filters.search" type="text"
                            placeholder="Nombre del producto..."
                            @input="handleFilter"
                            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                    </div>

                    <!-- Categorías -->
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Categoría</label>
                        <div class="space-y-1">
                            <button
                                @click="filters.category = ''; handleFilter()"
                                :class="[
                                    'w-full text-left px-3 py-2 rounded-lg text-sm transition',
                                    !filters.category
                                        ? 'bg-amber-500 text-white font-medium'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                ]">
                                Todas
                            </button>
                            <button
                                v-for="cat in categoriesStore.categories" :key="cat.id"
                                @click="filters.category = cat.slug; handleFilter()"
                                :class="[
                                    'w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between',
                                    filters.category === cat.slug
                                        ? 'bg-amber-500 text-white font-medium'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                ]">
                                <span>{{ cat.icon }} {{ cat.name }}</span>
                                <span class="text-xs opacity-70">{{ cat.products_count }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Precio -->
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Precio</label>
                        <div class="space-y-2">
                            <input v-model.number="filters.min_price" type="number" min="0"
                                placeholder="Mínimo $"
                                @change="handleFilter"
                                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                            <input v-model.number="filters.max_price" type="number" min="0"
                                placeholder="Máximo $"
                                @change="handleFilter"
                                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                        </div>
                    </div>

                    <!-- Ordenar -->
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Ordenar por</label>
                        <select v-model="filters.sort" @change="handleFilter"
                            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm">
                            <option value="">Nombre A-Z</option>
                            <option value="price_asc">Precio: menor a mayor</option>
                            <option value="price_desc">Precio: mayor a menor</option>
                            <option value="miles_desc">Más millas primero</option>
                            <option value="newest">Más recientes</option>
                        </select>
                    </div>

                    <!-- Limpiar filtros -->
                    <button v-if="hasActiveFilters" @click="clearFilters"
                        class="w-full text-sm text-red-400 hover:text-red-600 transition text-center">
                        🗑️ Limpiar filtros
                    </button>
                </div>

                <!-- Grid de productos -->
                <div class="flex-1">

                    <!-- Loading -->
                    <div v-if="productsStore.loading" class="text-center py-16 text-gray-400">
                        Cargando productos...
                    </div>

                    <!-- Empty -->
                    <div v-else-if="productsStore.products.length === 0"
                        class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p class="text-4xl mb-3">🔍</p>
                        <p class="text-gray-400">No se encontraron productos</p>
                        <button @click="clearFilters" class="text-amber-500 text-sm mt-2 hover:underline">
                            Limpiar filtros
                        </button>
                    </div>

                    <div v-else>
                        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div v-for="product in productsStore.products" :key="product.id"
                                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition group">

                                <!-- Imagen -->
                                <div class="h-36 overflow-hidden bg-amber-50 dark:bg-gray-700 relative">
                                    <img v-if="product.image_url"
                                        :src="product.image_url"
                                        :alt="product.name"
                                        class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    <div v-else
                                        class="w-full h-full flex items-center justify-center text-4xl group-hover:scale-105 transition">
                                        {{ getProductEmoji(product.name) }}
                                    </div>

                                    <!-- Badge categoría -->
                                    <div v-if="product.category"
                                        class="absolute top-2 left-2 bg-white dark:bg-gray-800 bg-opacity-90 px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                                        {{ product.category.icon }} {{ product.category.name }}
                                    </div>
                                </div>

                                <div class="p-4">
                                    <h3 class="font-semibold text-gray-800 dark:text-white text-sm leading-tight">
                                        {{ product.name }}
                                    </h3>
                                    <p class="text-gray-400 text-xs mt-1 line-clamp-2">{{ product.description }}</p>

                                    <div class="mt-3 flex items-center justify-between">
                                        <p class="font-bold text-gray-800 dark:text-white">${{ product.price }}</p>
                                        <span class="text-xs bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 px-2 py-1 rounded-full">
                                            +{{ calculateMiles(product) }} mi.
                                        </span>
                                    </div>

                                    <p class="text-xs text-gray-400 mt-1">Stock: {{ product.stock }}</p>

                                    <!-- Cantidad y agregar -->
                                    <div class="mt-3 flex gap-2 items-center">
                                        <div class="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                            <button @click="decreaseQty(product.id)"
                                                class="px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm">−</button>
                                            <span class="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
                                                {{ quantities[product.id] || 1 }}
                                            </span>
                                            <button @click="increaseQty(product.id, product.stock)"
                                                class="px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm">+</button>
                                        </div>
                                        <button @click="handleAddToCart(product)"
                                            :disabled="addingToCart === product.id"
                                            class="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition">
                                            {{ addingToCart === product.id ? '...' : '🛒 Agregar' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Paginación -->
                        <div v-if="productsStore.pagination.lastPage > 1"
                            class="flex justify-center gap-2 mt-8">
                            <button v-for="page in productsStore.pagination.lastPage" :key="page"
                                @click="goToPage(page)"
                                :class="[
                                    'w-9 h-9 rounded-lg text-sm font-medium transition',
                                    page === productsStore.pagination.currentPage
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                ]">
                                {{ page }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore }   from '../stores/products'
import { useCartStore }       from '../stores/cart'
import { useMilesStore }      from '../stores/miles'
import { useToastStore }      from '../stores/toast'
import { useCategoriesStore } from '../stores/categories'
import AppNavbar from '../components/AppNavbar.vue'

const productsStore   = useProductsStore()
const cartStore       = useCartStore()
const milesStore      = useMilesStore()
const toast           = useToastStore()
const categoriesStore = useCategoriesStore()

const quantities   = ref({})
const addingToCart = ref(null)
let   filterTimer  = null

const filters = ref({
    search:    '',
    category:  '',
    min_price: null,
    max_price: null,
    sort:      '',
})

const hasActiveFilters = computed(() =>
    filters.value.search || filters.value.category ||
    filters.value.min_price || filters.value.max_price || filters.value.sort
)

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

function calculateMiles(product) {
    const multiplier = milesStore.account?.tier?.multiplier || 1
    return Math.round(product.price * product.miles_per_dollar * multiplier)
}

function buildParams() {
    const params = {}
    if (filters.value.search)    params.search    = filters.value.search
    if (filters.value.category)  params.category  = filters.value.category
    if (filters.value.min_price) params.min_price = filters.value.min_price
    if (filters.value.max_price) params.max_price = filters.value.max_price
    if (filters.value.sort)      params.sort      = filters.value.sort
    return params
}

function handleFilter() {
    clearTimeout(filterTimer)
    filterTimer = setTimeout(() => {
        productsStore.fetchProducts(buildParams())
    }, 400)
}

function clearFilters() {
    filters.value = { search: '', category: '', min_price: null, max_price: null, sort: '' }
    productsStore.fetchProducts()
}

async function goToPage(page) {
    await productsStore.fetchProducts({ ...buildParams(), page })
}

function increaseQty(id, stock) {
    const current = quantities.value[id] || 1
    if (current < stock) quantities.value[id] = current + 1
}

function decreaseQty(id) {
    const current = quantities.value[id] || 1
    if (current > 1) quantities.value[id] = current - 1
}

async function handleAddToCart(product) {
    addingToCart.value = product.id
    try {
        const qty = quantities.value[product.id] || 1
        await cartStore.addToCart(product.id, qty)
        toast.success(`${product.name} agregado al carrito 🛒`)
        quantities.value[product.id] = 1
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al agregar al carrito.')
    } finally {
        addingToCart.value = null
    }
}

onMounted(async () => {
    await Promise.all([
        productsStore.fetchProducts(),
        milesStore.fetchBalance(),
        categoriesStore.fetchCategories(),
    ])
})
</script>