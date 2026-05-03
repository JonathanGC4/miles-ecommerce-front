import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useProductsStore = defineStore('products', () => {
    const products   = ref([])
    const pagination = ref({})
    const loading    = ref(false)

    async function fetchProducts(filters = {}) {
        loading.value = true
        try {
            const { data } = await api.get('/products', { params: filters })
            products.value   = data.data
            pagination.value = {
                total:       data.total,
                currentPage: data.current_page,
                lastPage:    data.last_page,
            }
        } finally {
            loading.value = false
        }
    }

    async function fetchAdminProducts(filters = {}) {
        loading.value = true
        try {
            const { data } = await api.get('/admin/products', { params: filters })
            products.value   = data.data
            pagination.value = {
                total:       data.total,
                currentPage: data.current_page,
                lastPage:    data.last_page,
            }
        } finally {
            loading.value = false
        }
    }

    async function createProduct(formData) {
        const { data } = await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        products.value.unshift(data.data)
        return data.data
    }

    async function updateProduct(id, formData) {
        // Laravel no soporta PUT con multipart, usamos POST + _method
        formData.append('_method', 'PUT')
        const { data } = await api.post(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) products.value[index] = data.data
        return data.data
    }

    async function deleteProduct(id) {
        await api.delete(`/products/${id}`)
        products.value = products.value.filter(p => p.id !== id)
    }

    return { products, pagination, loading, fetchProducts, fetchAdminProducts, createProduct, updateProduct, deleteProduct }
})