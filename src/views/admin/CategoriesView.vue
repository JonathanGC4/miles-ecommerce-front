<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-3xl mx-auto px-6 py-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">🏷️ Categorías</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {{ categoriesStore.categories.length }} categorías
                    </p>
                </div>
                <button @click="openModal()"
                    class="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition">
                    + Nueva categoría
                </button>
            </div>

            <!-- Lista -->
            <div class="space-y-3">
                <div v-for="cat in categoriesStore.categories" :key="cat.id"
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center text-2xl">
                        {{ cat.icon || '📦' }}
                    </div>
                    <div class="flex-1">
                        <p class="font-medium text-gray-800 dark:text-white">{{ cat.name }}</p>
                        <p class="text-gray-400 text-xs">{{ cat.description }}</p>
                    </div>
                    <span class="text-xs text-gray-400">{{ cat.products_count }} productos</span>
                    <div class="flex gap-2">
                        <button @click="openModal(cat)"
                            class="text-gray-400 hover:text-indigo-600 transition p-1">
                            ✏️
                        </button>
                        <button @click="handleDelete(cat)"
                            class="text-gray-400 hover:text-red-500 transition p-1">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-5">
                    {{ editingCat ? 'Editar categoría' : 'Nueva categoría' }}
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input v-model="form.name" type="text" placeholder="Ej: Electrónica"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ícono (emoji)</label>
                        <input v-model="form.icon" type="text" placeholder="Ej: 💻"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <input v-model="form.description" type="text" placeholder="Descripción breve"
                            class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button @click="closeModal"
                        class="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Cancelar
                    </button>
                    <button @click="handleSave" :disabled="saving"
                        class="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                        {{ saving ? 'Guardando...' : 'Guardar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '../../stores/categories'
import { useToastStore }      from '../../stores/toast'
import AppNavbar from '../../components/AppNavbar.vue'

const categoriesStore = useCategoriesStore()
const toast           = useToastStore()

const showModal  = ref(false)
const editingCat = ref(null)
const saving     = ref(false)
const form       = ref({ name: '', icon: '', description: '' })

function openModal(cat = null) {
    editingCat.value = cat
    form.value = cat
        ? { name: cat.name, icon: cat.icon || '', description: cat.description || '' }
        : { name: '', icon: '', description: '' }
    showModal.value = true
}

function closeModal() {
    showModal.value  = false
    editingCat.value = null
}

async function handleSave() {
    if (!form.value.name) { toast.error('El nombre es obligatorio.'); return }
    saving.value = true
    try {
        if (editingCat.value) {
            await categoriesStore.updateCategory(editingCat.value.id, form.value)
            toast.success('Categoría actualizada.')
        } else {
            await categoriesStore.createCategory(form.value)
            toast.success('Categoría creada.')
        }
        closeModal()
    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al guardar.')
    } finally {
        saving.value = false
    }
}

async function handleDelete(cat) {
    if (confirm(`¿Eliminar "${cat.name}"? Los productos quedarán sin categoría.`)) {
        try {
            await categoriesStore.deleteCategory(cat.id)
            toast.success('Categoría eliminada.')
        } catch (e) {
            toast.error('Error al eliminar.')
        }
    }
}

onMounted(() => categoriesStore.fetchCategories())
</script>