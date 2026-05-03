import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: '/dashboard' },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { guest: true }
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue'),
            meta: { guest: true }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/shop',
            name: 'shop',
            component: () => import('../views/ShopView.vue'),
            meta: { requiresAuth: true, requiresClient: true }
        },
        {
            path: '/cart',
            name: 'cart',
            component: () => import('../views/CartView.vue'),
            meta: { requiresAuth: true, requiresClient: true }
        },
        {
            path: '/orders',
            name: 'orders',
            component: () => import('../views/OrdersView.vue'),
            meta: { requiresAuth: true, requiresClient: true }
        },
        {
            path: '/transactions',
            name: 'transactions',
            component: () => import('../views/TransactionsView.vue'),
            meta: { requiresAuth: true, requiresClient: true }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/ProfileView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/products',
            name: 'products',
            component: () => import('../views/admin/ProductsView.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/admin/earn',
            name: 'earn',
            component: () => import('../views/admin/EarnMilesView.vue'),
            meta: { requiresAuth: true, requiresAdminOrSeller: true }
        },
        {
            path: '/checkout',
            name: 'checkout',
            component: () => import('../views/CheckoutView.vue'),
            meta: { requiresAuth: true, requiresClient: true }
        },
        {
            path: '/redeem',
            name: 'redeem',
            component: () => import('../views/RedeemView.vue'),
            meta: { requiresAuth: true, requiresClient: true }
        },
        {
            path: '/admin/categories',
            name: 'categories',
            component: () => import('../views/admin/CategoriesView.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
    ]
})

router.beforeEach((to) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: 'login' }
    }
    if (to.meta.guest && auth.isAuthenticated) {
        return { name: 'dashboard' }
    }
    if (to.meta.requiresAdmin && !auth.isAdmin) {
        return { name: 'dashboard' }
    }
    if (to.meta.requiresAdminOrSeller && !auth.isAdminOrSeller) {
        return { name: 'dashboard' }
    }
    if (to.meta.requiresClient && !auth.isClient) {
        return { name: 'dashboard' }
    }
})

export default router