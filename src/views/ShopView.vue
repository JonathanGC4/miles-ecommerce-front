<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

            <!-- Header -->
            <div class="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                    <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">🛍️ Tienda</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                        Ganas <strong class="text-amber-500">{{ milesStore.account?.tier?.multiplier }}x millas</strong>
                        con tu tier {{ milesStore.account?.tier?.name }}
                    </p>
                </div>
                <p class="text-gray-400 text-xs sm:text-sm">
                    {{ productsStore.pagination.total || 0 }} productos
                </p>
            </div>

            <!-- Botón toggle filtros móvil -->
            <button @click="filtersOpen = !filtersOpen"
                class="sm:hidden w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>🔍 Filtros {{ hasActiveFilters ? '(activos)' : '' }}</span>
                <span class="text-amber-500">{{ filtersOpen ? '▲ Cerrar' : '▼ Abrir' }}</span>
            </button>

            <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">

                <!-- Panel de filtros -->
                <div :class="[
                    'w-full sm:w-56 flex-shrink-0',
                    'sm:block',
                    filtersOpen ? 'block' : 'hidden'
                ]">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-5">

                        <!-- Búsqueda -->
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Buscar</label>
                            <input v-model="filters.search" type="text"
                                placeholder="Nombre del producto..."
                                @input="handleFilter"
                                class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                        </div>

                        <!-- Categorías -->
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Categoría</label>
                            <div class="flex flex-wrap sm:flex-col gap-1.5 sm:gap-1">
                                <button
                                    @click="filters.category = ''; handleFilter(); filtersOpen = false"
                                    :class="[
                                        'px-3 py-2 rounded-lg text-sm transition',
                                        !filters.category
                                            ? 'bg-amber-500 text-white font-medium'
                                            : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-amber-50'
                                    ]">
                                    Todas
                                </button>
                                <button
                                    v-for="cat in categoriesStore.categories" :key="cat.id"
                                    @click="filters.category = cat.slug; handleFilter(); filtersOpen = false"
                                    :class="[
                                        'px-3 py-2 rounded-lg text-sm transition flex items-center justify-between gap-2',
                                        filters.category === cat.slug
                                            ? 'bg-amber-500 text-white font-medium'
                                            : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-amber-50'
                                    ]">
                                    <span>{{ cat.icon }} {{ cat.name }}</span>
                                    <span class="text-xs opacity-70">{{ cat.products_count }}</span>
                                </button>
                            </div>
                        </div>

                        <!-- Precio -->
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Precio</label>
                            <div class="flex sm:flex-col gap-2">
                                <input v-model.number="filters.min_price" type="number" min="0"
                                    placeholder="Mínimo $"
                                    @change="handleFilter"
                                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                                <input v-model.number="filters.max_price" type="number" min="0"
                                    placeholder="Máximo $"
                                    @change="handleFilter"
                                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
                            </div>
                        </div>

                        <!-- Ordenar -->
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Ordenar por</label>
                            <select v-model="filters.sort" @change="handleFilter"
                                class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm">
                                <option value="">Nombre A-Z</option>
                                <option value="price_asc">Precio: menor a mayor</option>
                                <option value="price_desc">Precio: mayor a menor</option>
                                <option value="miles_desc">Más millas primero</option>
                                <option value="newest">Más recientes</option>
                            </select>
                        </div>

                        <!-- Limpiar filtros -->
                        <button v-if="hasActiveFilters" @click="clearFilters"
                            class="w-full text-sm text-red-400 hover:text-red-600 transition py-2 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900">
                            🗑️ Limpiar filtros
                        </button>
                    </div>
                </div>

                <!-- Grid de productos -->
                <div class="flex-1 min-w-0">

                    <!-- Loading -->
                    <div v-if="productsStore.loading" class="text-center py-16 text-gray-400 text-sm">
                        Cargando productos...
                    </div>

                    <!-- Empty -->
                    <div v-else-if="productsStore.products.length === 0"
                        class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p class="text-4xl mb-3">🔍</p>
                        <p class="text-gray-400 text-sm">No se encontraron productos</p>
                        <button @click="clearFilters" class="text-amber-500 text-sm mt-2 hover:underline">
                            Limpiar filtros
                        </button>
                    </div>

                    <div v-else>
                        <!-- Grid -->
                        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            <div v-for="product in productsStore.products" :key="product.id"
                                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition group flex flex-col">

                                <!-- Imagen -->
                                <div class="h-28 sm:h-36 overflow-hidden bg-amber-50 dark:bg-gray-700 relative flex-shrink-0">
                                    <img v-if="product.image_url"
                                        :src="product.image_url"
                                        :alt="product.name"
                                        class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    <div v-else
                                        class="w-full h-full flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-105 transition">
                                        {{ getProductEmoji(product.name) }}
                                    </div>

                                    <!-- Badge categoría -->
                                    <div v-if="product.category"
                                        class="absolute top-1.5 left-1.5 bg-white dark:bg-gray-800 bg-opacity-90 px-1.5 py-0.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                                        {{ product.category.icon }} {{ product.category.name }}
                                    </div>
                                </div>

                                <!-- Info -->
                                <div class="p-3 sm:p-4 flex flex-col flex-1">
                                    <h3 class="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm leading-tight line-clamp-2">
                                        {{ product.name }}
                                    </h3>
                                    <p class="text-gray-400 text-xs mt-1 line-clamp-1 hidden sm:block">
                                        {{ product.description }}
                                    </p>

                                    <!-- Rating -->
                                    <div class="flex items-center gap-1 mt-1.5">
                                        <div class="flex">
                                            <svg v-for="star in 5" :key="star" class="w-3 h-3"
                                                :class="star <= Math.round(product.average_rating || 0) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'"
                                                fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                        </div>
                                        <span class="text-xs text-gray-400">({{ product.reviews_count || 0 }})</span>
                                    </div>

                                    <div class="mt-2 flex items-center justify-between">
                                        <p class="font-bold text-gray-800 dark:text-white text-sm sm:text-base">${{ product.price }}</p>
                                        <span class="text-xs bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                            +{{ calculateMiles(product) }} mi.
                                        </span>
                                    </div>

                                    <p class="text-xs text-gray-400 mt-0.5">Stock: {{ product.stock }}</p>

                                    <!-- Cantidad y agregar -->
                                    <div class="mt-3 flex gap-1.5 sm:gap-2 items-center mt-auto">
                                        <div class="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                                            <button @click="decreaseQty(product.id)"
                                                class="px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-bold">−</button>
                                            <span class="px-1.5 sm:px-2 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 min-w-[1.5rem] text-center">
                                                {{ quantities[product.id] || 1 }}
                                            </span>
                                            <button @click="increaseQty(product.id, product.stock)"
                                                class="px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-bold">+</button>
                                        </div>
                                        <button @click="handleAddToCart(product)"
                                            :disabled="addingToCart === product.id"
                                            class="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-semibold py-2 sm:py-2 rounded-lg transition min-w-0">
                                            {{ addingToCart === product.id ? '...' : '🛒 Agregar' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Paginación -->
                        <div v-if="productsStore.pagination.lastPage > 1"
                            class="flex justify-center gap-2 mt-6 sm:mt-8 flex-wrap">
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
const filtersOpen  = ref(false)
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
    filtersOpen.value = false
    productsStore.fetchProducts()
}

async function goToPage(page) {
    await productsStore.fetchProducts({ ...buildParams(), page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
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