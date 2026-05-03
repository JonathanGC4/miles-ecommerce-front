import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useCategoriesStore = defineStore('categories', () => {
    const categories = ref([])
    const loading    = ref(false)

    async function fetchCategories() {
        loading.value = true
        try {
            const { data } = await api.get('/categories')
            categories.value = data.data
        } finally {
            loading.value = false
        }
    }

    async function createCategory(payload) {
        const { data } = await api.post('/categories', payload)
        categories.value.push(data.data)
        return data.data
    }

    async function updateCategory(id, payload) {
        const { data } = await api.put(`/categories/${id}`, payload)
        const index = categories.value.findIndex(c => c.id === id)
        if (index !== -1) categories.value[index] = data.data
        return data.data
    }

    async function deleteCategory(id) {
        await api.delete(`/categories/${id}`)
        categories.value = categories.value.filter(c => c.id !== id)
    }

    return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory }
})