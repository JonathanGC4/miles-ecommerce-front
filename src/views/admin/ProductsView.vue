<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-6xl mx-auto px-6 py-8">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">📦 Gestión de Productos</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {{ productsStore.pagination.total || 0 }} productos en total
                    </p>
                </div>
                <button @click="openModal()"
                    class="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold px-4 py-2 rounded-xl transition shadow-sm text-sm">
                    + Nuevo producto
                </button>
            </div>

            <!-- Buscador -->
            <div class="mb-6">
                <input v-model="search" type="select"
                    placeholder="Buscar producto...🔍"
                    @input="handleSearch"
                    class="w-full sm:w-72 px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm" />
            </div>


            <!-- Loading -->
            <div v-if="productsStore.loading" class="text-center py-16 text-gray-400">
                Cargando productos...
            </div>

            <!-- Tabla de productos -->
            <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-100 dark:border-gray-700">
                            <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                            <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                            <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                            <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Millas/$</th>
                            <th class="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                            <th class="text-right px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        <tr v-for="product in productsStore.products" :key="product.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-amber-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                                        {{ getProductEmoji(product.name) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-800 dark:text-white text-sm">{{ product.name }}</p>
                                        <p class="text-gray-400 text-xs truncate max-w-xs">{{ product.description }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="font-medium text-gray-800 dark:text-white">${{ product.price }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="[
                                    'font-medium',
                                    product.stock === 0   ? 'text-red-500' :
                                    product.stock <= 5    ? 'text-yellow-500' :
                                                           'text-green-500'
                                ]">
                                    {{ product.stock }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-amber-500 font-medium">{{ product.miles_per_dollar }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="[
                                    'text-xs px-2 py-1 rounded-full font-medium',
                                    product.active
                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                ]">
                                    {{ product.active ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2 justify-end">
                                    <button @click="openModal(product)"
                                        class="text-gray-400 hover:text-indigo-600 transition p-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button @click="handleDelete(product)"
                                        class="text-gray-400 hover:text-red-500 transition p-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <!-- Empty -->
                        <tr v-if="productsStore.products.length === 0">
                            <td colspan="6" class="text-center py-12 text-gray-400">
                                No hay productos
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Paginación -->
            <div v-if="productsStore.pagination.lastPage > 1"
                class="flex justify-center gap-2 mt-6">
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

        <!-- Modal crear/editar -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-5">
                    {{ editingProduct ? 'Editar producto' : 'Nuevo producto' }}
                </h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input v-model="form.name" type="text" placeholder="Nombre del producto"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea v-model="form.description" rows="2"
                            placeholder="Descripción del producto"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio ($)</label>
                            <input v-model.number="form.price" type="number" min="0.01" step="0.01"
                                placeholder="0.00"
                                class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                            <input v-model.number="form.stock" type="number" min="0"
                                placeholder="0"
                                class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                        </div>
                    </div>
                    <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Categoría
    </label>

    <select v-model="form.category_id"
        class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition">

        <option :value="null">— Sin categoría —</option>

        <option v-if="categoriesStore.loading" disabled>
            Cargando...
        </option>

        <option v-for="cat in categoriesStore.categories"
            :key="cat.id"
            :value="cat.id">
            {{ cat.icon }} {{ cat.name }}
        </option>

        <option v-if="!categoriesStore.loading && categoriesStore.categories.length === 0" disabled>
            No hay categorías
        </option>

    </select>
</div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Millas por dólar
                            <span class="text-gray-400 font-normal">(ej: 10 = 10 millas por cada $1)</span>
                        </label>
                        <input v-model.number="form.miles_per_dollar" type="number" min="1"
                            placeholder="10"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />

                        <!-- Preview millas -->
                        <p v-if="form.price && form.miles_per_dollar"
                            class="text-xs text-amber-500 mt-1">
                            Un cliente Bronze ganaría {{ Math.round(form.price * form.miles_per_dollar) }} millas por este producto
                        </p>
                    </div>

                    <div class="flex items-center gap-3">
                        <input v-model="form.active" type="checkbox" id="active"
                            class="w-4 h-4 accent-amber-500" />
                        <label for="active" class="text-sm text-gray-700 dark:text-gray-300">
                            Producto activo (visible en tienda)
                        </label>
                    </div>
                </div>
                                               <!-- Upload de imagen -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Imagen del producto
                    </label>

                    <!-- Preview -->
                    <div v-if="imagePreview"
                        class="relative mb-3 rounded-xl overflow-hidden h-40 bg-gray-100 dark:bg-gray-700">
                        <img :src="imagePreview" alt="Preview"
                            class="w-full h-full object-cover" />
                        <button @click="removeImage"
                            class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition">
                            ✕
                        </button>
                    </div>

                <!-- Drop zone -->
                <div v-else
                    @click="imageInput.click()"
                    class="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition">
                    <p class="text-3xl mb-2">📸</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Click para subir imagen</p>
                    <p class="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — máx. 2MB</p>
                </div>

                <input ref="imageInput" type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="handleImageChange"
                    class="hidden" />
            </div>
                        

                <div class="flex gap-3 mt-6">
                    <button @click="closeModal"
                        class="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Cancelar
                    </button>
                    <button @click="handleSave" :disabled="saving"
                        class="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                        {{ saving ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Crear producto' }}
                    </button></div>
                </div>
 

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '../../stores/products'
import { useCategoriesStore } from '../../stores/categories' // 👈 NUEVO
import { useToastStore } from '../../stores/toast'
import AppNavbar from '../../components/AppNavbar.vue'

const productsStore   = useProductsStore()
const categoriesStore = useCategoriesStore() // 👈 NUEVO
const toast           = useToastStore()

const showModal      = ref(false)
const editingProduct = ref(null)
const saving         = ref(false)
const search         = ref('')
const imagePreview   = ref(null)
const imageFile      = ref(null)
const imageInput     = ref(null)
let   searchTimer    = null

// ✅ FORM CORREGIDO
const form = ref({
    name: '',
    description: '',
    price: null,
    stock: null,
    miles_per_dollar: 10,
    active: true,
    category_id: null, // 👈 NUEVO
})

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

function handleSearch() {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        productsStore.fetchAdminProducts({ search: search.value })
    }, 400)
}

async function goToPage(page) {
    await productsStore.fetchAdminProducts({ page, search: search.value })
}

// ✅ MODAL CORREGIDO (mantiene categoría)
function openModal(product = null) {
    editingProduct.value = product
    imagePreview.value   = product?.image_url || null
    imageFile.value      = null

    form.value = product ? {
        name:             product.name,
        description:      product.description || '',
        price:            product.price,
        stock:            product.stock,
        miles_per_dollar: product.miles_per_dollar,
        active:           product.active,
        category_id:      product.category_id || null, // 👈 CLAVE
    } : {
        name: '',
        description: '',
        price: null,
        stock: null,
        miles_per_dollar: 10,
        active: true,
        category_id: null,
    }

    showModal.value = true
}

function closeModal() {
    showModal.value      = false
    editingProduct.value = null
    imagePreview.value   = null
    imageFile.value      = null
}

function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no puede superar 2MB.')
        return
    }

    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
    imagePreview.value = null
    imageFile.value    = null
    if (imageInput.value) imageInput.value.value = ''
}

// ✅ SAVE CORREGIDO (envía categoría)
async function handleSave() {
    if (!form.value.name || !form.value.price || form.value.stock === null) {
        toast.error('Completa los campos obligatorios.')
        return
    }

    saving.value = true
    try {
        const formData = new FormData()

        formData.append('name',             form.value.name)
        formData.append('description',      form.value.description || '')
        formData.append('price',            form.value.price)
        formData.append('stock',            form.value.stock)
        formData.append('miles_per_dollar', form.value.miles_per_dollar)
        formData.append('active',           form.value.active ? '1' : '0')

        // 👇 CLAVE
        formData.append('category_id', form.value.category_id ?? '')

        if (imageFile.value) {
            formData.append('image', imageFile.value)
        }

        if (editingProduct.value) {
            await productsStore.updateProduct(editingProduct.value.id, formData)
            toast.success('Producto actualizado correctamente.')
        } else {
            await productsStore.createProduct(formData)
            toast.success('Producto creado correctamente.')
        }

        closeModal()

    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al guardar.')
    } finally {
        saving.value = false
    }
}

async function handleDelete(product) {
    if (confirm(`¿Desactivar "${product.name}"?`)) {
        try {
            await productsStore.deleteProduct(product.id)
            toast.success('Producto desactivado correctamente.')
        } catch (e) {
            toast.error('Error al desactivar el producto.')
        }
    }
}

// ✅ MOUNT CORREGIDO
onMounted(() => {
    productsStore.fetchAdminProducts()
    categoriesStore.fetchCategories() // 👈 CLAVE
})
</script>