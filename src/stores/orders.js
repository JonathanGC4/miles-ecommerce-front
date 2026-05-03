import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useOrdersStore = defineStore('orders', () => {
    const orders     = ref([])
    const pagination = ref({})
    const loading    = ref(false)

    async function fetchOrders(filters = {}) {
        loading.value = true
        try {
            const { data } = await api.get('/orders', { params: filters })
            orders.value     = data.data
            pagination.value = {
                total:       data.total,
                currentPage: data.current_page,
                lastPage:    data.last_page,
            }
        } finally {
            loading.value = false
        }
    }

    return { orders, pagination, loading, fetchOrders }
})