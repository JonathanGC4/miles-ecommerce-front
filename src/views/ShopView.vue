<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
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

            <!-- Layout -->
            <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">

                <!-- Filtros -->
                <div class="w-full sm:w-56 flex-shrink-0">

                    <!-- Botón móvil -->
                    <button @click="filtersOpen = !filtersOpen"
                        class="sm:hidden w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span>🔍 Filtros</span>
                        <span>{{ filtersOpen ? '▲' : '▼' }}</span>
                    </button>

                    <div :class="[filtersOpen ? 'block' : 'hidden', 'sm:block space-y-6']">

                        <!-- Buscar -->
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Buscar</label>
                            <input v-model="filters.search" @input="handleFilter"
                                class="w-full px-3 py-2 border rounded-xl text-sm"
                                placeholder="Nombre..." />
                        </div>

                        <!-- Categorías -->
                        <div>
                            <label class="block text-xs font-bold text-gray-500 mb-2">Categoría</label>
                            <div class="space-y-1">
                                <button @click="filters.category = ''; handleFilter()"
                                    class="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
                                    Todas
                                </button>

                                <button v-for="cat in categoriesStore.categories" :key="cat.id"
                                    @click="filters.category = cat.slug; handleFilter()"
                                    class="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
                                    {{ cat.icon }} {{ cat.name }}
                                </button>
                            </div>
                        </div>

                        <!-- Precio -->
                        <div>
                            <label class="block text-xs font-bold text-gray-500 mb-2">Precio</label>
                            <input v-model.number="filters.min_price" @change="handleFilter"
                                type="number" placeholder="Min"
                                class="w-full mb-2 px-3 py-2 border rounded-xl text-sm" />
                            <input v-model.number="filters.max_price" @change="handleFilter"
                                type="number" placeholder="Max"
                                class="w-full px-3 py-2 border rounded-xl text-sm" />
                        </div>

                        <!-- Orden -->
                        <div>
                            <select v-model="filters.sort" @change="handleFilter"
                                class="w-full px-3 py-2 border rounded-xl text-sm">
                                <option value="">Nombre</option>
                                <option value="price_asc">Precio ↑</option>
                                <option value="price_desc">Precio ↓</option>
                            </select>
                        </div>

                        <!-- Limpiar -->
                        <button v-if="hasActiveFilters" @click="clearFilters"
                            class="text-red-400 text-sm">
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                <!-- Productos -->
                <div class="flex-1 min-w-0">

                    <!-- Loading -->
                    <div v-if="productsStore.loading" class="text-center py-10">
                        Cargando...
                    </div>

                    <!-- Empty -->
                    <div v-else-if="filteredProducts.length === 0" class="text-center py-10">
                        No hay productos
                    </div>

                    <!-- Grid -->
                    <div v-else>
                        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">

                            <div v-for="product in filteredProducts" :key="product.id"
                                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">

                                <!-- Imagen -->
                                <div class="h-36 bg-gray-100 flex items-center justify-center">
                                    <img v-if="product.image_url" :src="product.image_url" class="h-full w-full object-cover"/>
                                    <div v-else class="text-3xl">
                                        {{ getProductEmoji(product.name) }}
                                    </div>
                                </div>

                                <!-- Info -->
                                <div class="p-3">
                                    <h3 class="text-sm font-semibold">{{ product.name }}</h3>

                                    <p class="text-xs text-gray-400">
                                        ${{ product.price }}
                                    </p>

                                    <p class="text-xs text-gray-400">
                                        Stock: {{ product.stock }}
                                    </p>

                                    <button @click="handleAddToCart(product)"
                                        class="mt-2 w-full bg-amber-500 text-white text-xs py-2 rounded-lg">
                                        🛒 Agregar
                                    </button>
                                </div>
                            </div>

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

const filtersOpen = ref(false)
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