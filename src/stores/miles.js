import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useMilesStore = defineStore('miles', () => {
    const account      = ref(null)
    const transactions = ref([])
    const pagination   = ref({})
    const loading      = ref(false)

    async function fetchBalance() {
        loading.value = true
        try {
            const { data } = await api.get('/miles')
            account.value = data.data
        } finally {
            loading.value = false
        }
    }

    async function fetchTransactions(filters = {}) {
        const { data } = await api.get('/miles/transactions', { params: filters })
        transactions.value = data.data
        pagination.value   = {
            total:       data.total,
            currentPage: data.current_page,
            lastPage:    data.last_page,
        }
    }

    async function earn(payload) {
        const { data } = await api.post('/miles/earn', payload)
        return data
    }

    async function redeem(payload) {
        const { data } = await api.post('/miles/redeem', payload)
        await fetchBalance()
        return data
    }

    return { account, transactions, pagination, loading, fetchBalance, fetchTransactions, earn, redeem }
})