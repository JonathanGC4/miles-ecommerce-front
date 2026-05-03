<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <AppNavbar />

        <div class="max-w-5xl mx-auto px-6 py-8">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">⚡ Checkout</h2>

            <!-- Stepper -->
            <div class="flex items-center justify-between mb-8 relative">
                <div class="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                <div
                    class="absolute top-4 left-0 h-0.5 bg-amber-400 z-0 transition-all duration-500"
                    :style="{ width: stepperWidth }"
                ></div>

                <div v-for="(step, index) in steps" :key="index"
                    class="flex flex-col items-center relative z-10">
                    <div :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                        currentStep > index + 1
                            ? 'bg-amber-500 text-white'
                            : currentStep === index + 1
                                ? 'bg-amber-500 text-white ring-4 ring-amber-200'
                                : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-600'
                    ]">
                        <span v-if="currentStep > index + 1">✓</span>
                        <span v-else>{{ index + 1 }}</span>
                    </div>
                    <p class="text-xs mt-2 font-medium"
                        :class="currentStep >= index + 1 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'">
                        {{ step }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- Formulario pasos -->
                <div class="lg:col-span-2">

                    <!-- PASO 1 — Dirección -->
                    <div v-if="currentStep === 1"
                        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-5">📍 Dirección de entrega</h3>

                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="col-span-2">
                                    <label class="label">Nombre completo</label>
                                    <input v-model="shipping.name" type="text"
                                        placeholder="Juan Pérez"
                                        class="input" />
                                </div>
                                <div class="col-span-2">
                                    <label class="label">Dirección</label>
                                    <input v-model="shipping.address" type="text"
                                        placeholder="Calle, número, colonia"
                                        class="input" />
                                </div>
                                <div>
                                    <label class="label">Ciudad</label>
                                    <input v-model="shipping.city" type="text"
                                        placeholder="San Salvador"
                                        class="input" />
                                </div>
                                <div>
                                    <label class="label">País</label>
                                    <input v-model="shipping.country" type="text"
                                        placeholder="El Salvador"
                                        class="input" />
                                </div>
                                <div class="col-span-2">
                                    <label class="label">Teléfono</label>
                                    <input v-model="shipping.phone" type="tel"
                                        placeholder="7777-7777"
                                        class="input" />
                                </div>
                            </div>
                        </div>

                        <button @click="goToStep(2)" class="btn-primary mt-6 w-full">
                            Continuar →
                        </button>
                    </div>

                    <!-- PASO 2 — Método de pago -->
                    <div v-if="currentStep === 2"
                        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-5">💳 Método de pago</h3>

                        <!-- Selector método -->
                        <div class="grid grid-cols-2 gap-3 mb-6">
                            <button
                                @click="paymentMethod = 'card'"
                                :class="[
                                    'p-4 rounded-xl border-2 text-left transition',
                                    paymentMethod === 'card'
                                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-amber-300'
                                ]">
                                <div class="text-2xl mb-2">💳</div>
                                <p class="font-semibold text-gray-800 dark:text-white text-sm">Tarjeta</p>
                                <p class="text-gray-400 text-xs">Crédito o débito</p>
                            </button>
                            <button
                                @click="paymentMethod = 'cash'"
                                :class="[
                                    'p-4 rounded-xl border-2 text-left transition',
                                    paymentMethod === 'cash'
                                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-amber-300'
                                ]">
                                <div class="text-2xl mb-2">💵</div>
                                <p class="font-semibold text-gray-800 dark:text-white text-sm">Efectivo</p>
                                <p class="text-gray-400 text-xs">Contra entrega</p>
                            </button>
                        </div>

                        <!-- Campos tarjeta -->
                        <div v-if="paymentMethod === 'card'" class="space-y-4">
                            <div>
                                <label class="label">Número de tarjeta</label>
                                <input v-model="card.number"
                                    type="text"
                                    placeholder="4111 1111 1111 1111"
                                    maxlength="19"
                                    @input="formatCardNumber"
                                    class="input font-mono" />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="label">Fecha de expiración</label>
                                    <input v-model="card.expiry"
                                        type="text"
                                        placeholder="MM/AA"
                                        maxlength="5"
                                        @input="formatExpiry"
                                        class="input font-mono" />
                                </div>
                                <div>
                                    <label class="label">CVV</label>
                                    <input v-model="card.cvv"
                                        type="password"
                                        placeholder="•••"
                                        maxlength="4"
                                        class="input font-mono" />
                                </div>
                            </div>

                            <!-- Card preview -->
                            <div class="mt-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white">
                                <div class="flex justify-between items-start mb-6">
                                    <span class="text-xs text-gray-400">Miles E-commerce</span>
                                    <span class="text-xl">💳</span>
                                </div>
                                <p class="font-mono text-lg tracking-widest mb-4">
                                    {{ card.number || '•••• •••• •••• ••••' }}
                                </p>
                                <div class="flex justify-between text-sm">
                                    <div>
                                        <p class="text-gray-400 text-xs">Titular</p>
                                        <p>{{ shipping.name || 'NOMBRE APELLIDO' }}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-gray-400 text-xs">Expira</p>
                                        <p>{{ card.expiry || 'MM/AA' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Efectivo info -->
                        <div v-if="paymentMethod === 'cash'"
                            class="bg-green-50 dark:bg-green-900 rounded-xl p-4 text-sm text-green-700 dark:text-green-300">
                            <p class="font-medium mb-1">💵 Pago contra entrega</p>
                            <p>Tendrás que pagar al repartidor al momento de recibir tu pedido. Prepara el monto exacto.</p>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button @click="goToStep(1)" class="btn-secondary flex-1">
                                ← Volver
                            </button>
                            <button @click="goToStep(3)" class="btn-primary flex-1">
                                Continuar →
                            </button>
                        </div>
                    </div>

                    <!-- PASO 3 — Millas -->
                    <div v-if="currentStep === 3"
                        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-2">🏆 Aplicar millas</h3>
                        <p class="text-gray-400 text-sm mb-5">100 millas = $1.00 de descuento (máx. 30% del total)</p>

                        <!-- Saldo disponible -->
                        <div class="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 text-white mb-5">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="text-yellow-100 text-xs">Saldo disponible</p>
                                    <p class="text-2xl font-bold">{{ milesStore.account?.balance?.toLocaleString() }}</p>
                                    <p class="text-yellow-100 text-xs">millas</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-yellow-100 text-xs">Descuento máximo</p>
                                    <p class="text-xl font-bold">${{ preview?.max_discount?.toFixed(2) }}</p>
                                    <p class="text-yellow-100 text-xs">{{ preview?.max_miles?.toLocaleString() }} millas</p>
                                </div>
                            </div>
                        </div>

                        <!-- Input millas -->
                        <div class="space-y-4">
                            <div>
                                <label class="label">Millas a aplicar</label>
                                <div class="flex gap-3">
                                    <input v-model.number="discountMiles"
                                        type="number" min="0"
                                        :max="Math.min(preview?.max_miles || 0, milesStore.account?.balance || 0)"
                                        placeholder="0"
                                        @input="updatePreview"
                                        class="input flex-1" />
                                    <button @click="applyMaxMiles"
                                        class="px-4 py-3 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-xl text-sm font-medium hover:bg-amber-200 transition whitespace-nowrap">
                                        Máximo
                                    </button>
                                </div>
                            </div>

                            <!-- Preview descuento -->
                            <div v-if="discountMiles > 0 && preview"
                                class="bg-green-50 dark:bg-green-900 rounded-xl p-4 space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600 dark:text-gray-300">Millas aplicadas</span>
                                    <span class="text-amber-500 font-medium">-{{ discountMiles.toLocaleString() }} mi.</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600 dark:text-gray-300">Descuento</span>
                                    <span class="text-green-600 dark:text-green-400 font-bold">
                                        -${{ preview.discount_amount?.toFixed(2) }}
                                    </span>
                                </div>
                                <div class="flex justify-between text-sm font-bold border-t border-green-200 dark:border-green-700 pt-2">
                                    <span class="text-gray-800 dark:text-white">Total a pagar</span>
                                    <span class="text-gray-800 dark:text-white">${{ preview.final_total?.toFixed(2) }}</span>
                                </div>
                            </div>

                            <!-- Sin millas -->
                            <div v-else class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                Ingresa millas para ver el descuento
                            </div>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button @click="goToStep(2)" class="btn-secondary flex-1">
                                ← Volver
                            </button>
                            <button @click="goToStep(4)" class="btn-primary flex-1">
                                Continuar →
                            </button>
                        </div>
                    </div>

                    <!-- PASO 4 — Confirmar -->
                    <div v-if="currentStep === 4"
                        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-5">📋 Confirmar orden</h3>

                        <!-- Resumen dirección -->
                        <div class="space-y-4 mb-6">
                            <div class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <span class="text-xl">📍</span>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800 dark:text-white text-sm">{{ shipping.name }}</p>
                                    <p class="text-gray-500 dark:text-gray-400 text-xs">{{ shipping.address }}, {{ shipping.city }}, {{ shipping.country }}</p>
                                    <p class="text-gray-500 dark:text-gray-400 text-xs">📞 {{ shipping.phone }}</p>
                                </div>
                                <button @click="goToStep(1)" class="text-xs text-amber-500 hover:underline">Editar</button>
                            </div>

                            <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <span class="text-xl">{{ paymentMethod === 'card' ? '💳' : '💵' }}</span>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800 dark:text-white text-sm">
                                        {{ paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo contra entrega' }}
                                    </p>
                                    <p v-if="paymentMethod === 'card'" class="text-gray-500 dark:text-gray-400 text-xs">
                                        •••• •••• •••• {{ card.number?.slice(-4) || '••••' }}
                                    </p>
                                </div>
                                <button @click="goToStep(2)" class="text-xs text-amber-500 hover:underline">Editar</button>
                            </div>

                            <div v-if="discountMiles > 0"
                                class="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900 rounded-xl">
                                <span class="text-xl">🏆</span>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800 dark:text-white text-sm">
                                        {{ discountMiles.toLocaleString() }} millas aplicadas
                                    </p>
                                    <p class="text-amber-600 dark:text-amber-300 text-xs">
                                        -${{ preview?.discount_amount?.toFixed(2) }} de descuento
                                    </p>
                                </div>
                                <button @click="goToStep(3)" class="text-xs text-amber-500 hover:underline">Editar</button>
                            </div>
                        </div>

                        <!-- Items -->
                        <div class="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Productos</p>
                            <div class="space-y-2">
                                <div v-for="item in cartStore.cart?.items" :key="item.id"
                                    class="flex justify-between text-sm">
                                    <span class="text-gray-600 dark:text-gray-400">
                                        {{ item.product?.name }} × {{ item.quantity }}
                                    </span>
                                    <span class="text-gray-800 dark:text-white font-medium">
                                        ${{ (item.product?.price * item.quantity).toFixed(2) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Totales finales -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
                                <span class="text-gray-700 dark:text-gray-300">${{ preview?.subtotal?.toFixed(2) }}</span>
                            </div>
                            <div v-if="discountMiles > 0" class="flex justify-between text-sm">
                                <span class="text-green-600 dark:text-green-400">Descuento millas</span>
                                <span class="text-green-600 dark:text-green-400 font-medium">
                                    -${{ preview?.discount_amount?.toFixed(2) }}
                                </span>
                            </div>
                            <div class="flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                                <span class="text-gray-800 dark:text-white">Total</span>
                                <span class="text-gray-800 dark:text-white text-lg">
                                    ${{ preview?.final_total?.toFixed(2) }}
                                </span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-amber-500">Millas a ganar</span>
                                <span class="text-amber-500 font-bold">
                                    +{{ preview?.miles_earned?.toLocaleString() }} 🏆
                                </span>
                            </div>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button @click="goToStep(3)" class="btn-secondary flex-1">
                                ← Volver
                            </button>
                            <button @click="handleCheckout" :disabled="processing"
                                class="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md">
                                {{ processing ? 'Procesando...' : '⚡ Confirmar compra' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Resumen lateral -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                        <h3 class="font-bold text-gray-800 dark:text-white mb-4 text-sm">Tu orden</h3>

                        <div class="space-y-2 mb-4">
                            <div v-for="item in cartStore.cart?.items" :key="item.id"
                                class="flex items-center gap-2">
                                <span class="text-lg">{{ getProductEmoji(item.product?.name) }}</span>
                                <span class="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {{ item.product?.name }}
                                </span>
                                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    ${{ (item.product?.price * item.quantity).toFixed(2) }}
                                </span>
                            </div>
                        </div>

                        <div class="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>${{ cartStore.cart?.subtotal }}</span>
                            </div>
                            <div v-if="discountMiles > 0" class="flex justify-between text-xs">
                                <span class="text-green-500">Descuento</span>
                                <span class="text-green-500">-${{ preview?.discount_amount?.toFixed(2) }}</span>
                            </div>
                            <div class="flex justify-between font-bold text-sm pt-1 border-t border-gray-100 dark:border-gray-700">
                                <span class="text-gray-800 dark:text-white">Total</span>
                                <span class="text-gray-800 dark:text-white">
                                    ${{ (preview?.final_total ?? cartStore.cart?.subtotal)?.toFixed ? (preview?.final_total ?? cartStore.cart?.subtotal).toFixed(2) : cartStore.cart?.subtotal }}
                                </span>
                            </div>
                        </div>

                        <div class="mt-3 p-2 bg-amber-50 dark:bg-amber-900 rounded-lg text-center">
                            <p class="text-amber-600 dark:text-amber-300 text-xs">
                                Ganarás <strong>{{ (preview?.miles_earned ?? cartStore.cart?.estimated_miles)?.toLocaleString() }}</strong> millas 🏆
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal éxito -->
        <div v-if="orderSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Compra exitosa!</h3>

                <div class="space-y-2 my-6 text-sm">
                    <div v-if="orderResult?.discount_miles > 0"
                        class="flex justify-between px-4">
                        <span class="text-gray-500">Millas usadas</span>
                        <span class="text-amber-500">-{{ orderResult?.discount_miles?.toLocaleString() }} mi.</span>
                    </div>
                    <div class="flex justify-between px-4">
                        <span class="text-gray-500">Total pagado</span>
                        <span class="font-bold text-gray-800 dark:text-white">${{ orderResult?.final_total?.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between px-4">
                        <span class="text-gray-500">Millas ganadas</span>
                        <span class="text-green-500 font-bold">+{{ orderResult?.miles_earned?.toLocaleString() }} 🏆</span>
                    </div>
                    <div class="flex justify-between px-4">
                        <span class="text-gray-500">Nuevo saldo</span>
                        <span class="font-bold text-gray-800 dark:text-white">{{ orderResult?.balance?.toLocaleString() }} mi.</span>
                    </div>
                </div>

                <!-- Tier upgrade -->
                <div v-if="tierUpgrade"
                    class="bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl p-4 mb-4">
                    <p class="font-bold">🏆 ¡Subiste de tier!</p>
                    <p class="text-sm">Ahora eres <strong>{{ orderResult?.tier }}</strong></p>
                </div>

                <div class="space-y-3">
                    <button @click="router.push('/orders')"
                        class="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold py-3 rounded-xl">
                        Ver mi orden
                    </button>
                    <button @click="router.push('/shop')"
                        class="w-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Seguir comprando
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter }      from 'vue-router'
import { useCartStore }   from '../stores/cart'
import { useMilesStore }  from '../stores/miles'
import { useToastStore }  from '../stores/toast'
import AppNavbar from '../components/AppNavbar.vue'

const router     = useRouter()
const cartStore  = useCartStore()
const milesStore = useMilesStore()
const toast      = useToastStore()

const currentStep   = ref(1)
const steps         = ['Dirección', 'Pago', 'Millas', 'Confirmar']
const processing    = ref(false)
const orderSuccess  = ref(false)
const orderResult   = ref(null)
const tierUpgrade   = ref(false)
const preview       = ref(null)
const discountMiles = ref(0)
let   previewTimer  = null

const shipping = ref({
    name: '', address: '', city: '', country: '', phone: ''
})

const card = ref({
    number: '', expiry: '', cvv: ''
})

const paymentMethod = ref('card')

const stepperWidth = computed(() => {
    const widths = { 1: '0%', 2: '33%', 3: '66%', 4: '100%' }
    return widths[currentStep.value]
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

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16)
    card.value.number = value.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4)
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2)
    card.value.expiry = value
}

function goToStep(step) {
    // Validaciones por paso
    if (step > 1) {
        if (!shipping.value.name || !shipping.value.address ||
            !shipping.value.city || !shipping.value.country || !shipping.value.phone) {
            toast.error('Completa todos los campos de dirección.')
            currentStep.value = 1
            return
        }
    }
    if (step > 2 && paymentMethod.value === 'card') {
        if (!card.value.number || !card.value.expiry || !card.value.cvv) {
            toast.error('Completa los datos de la tarjeta.')
            currentStep.value = 2
            return
        }
    }
    currentStep.value = step
    if (step === 3 || step === 4) loadPreview()
}

async function loadPreview() {
    try {
        preview.value = await cartStore.previewCheckout(discountMiles.value)
    } catch (e) {
        console.error('Error cargando preview', e)
    }
}

function updatePreview() {
    clearTimeout(previewTimer)
    previewTimer = setTimeout(() => loadPreview(), 500)
}

function applyMaxMiles() {
    const maxMiles   = preview.value?.max_miles || 0
    const balance    = milesStore.account?.balance || 0
    discountMiles.value = Math.min(maxMiles, balance)
    loadPreview()
}

async function handleCheckout() {
    processing.value = true
    try {
        const prevTier = milesStore.account?.tier?.name

        const payload = {
            payment_method:    paymentMethod.value,
            discount_miles:    discountMiles.value || 0,
            shipping_address:  shipping.value,
        }

        if (paymentMethod.value === 'card') {
            payload.card_number = card.value.number.replace(/\s/g, '')
            payload.card_expiry = card.value.expiry
            payload.card_cvv    = card.value.cvv
        }

        const result      = await cartStore.checkout(payload)
        orderResult.value = result.data
        tierUpgrade.value = result.data.tier !== prevTier
        orderSuccess.value = true
        await milesStore.fetchBalance()

    } catch (e) {
        toast.error(e.response?.data?.message || 'Error al procesar la compra.')
    } finally {
        processing.value = false
    }
}

onMounted(async () => {
    await cartStore.fetchCart()
    await milesStore.fetchBalance()
    await loadPreview()

    // Pre-llenar nombre si está en el perfil
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.name) shipping.value.name = user.name
})
</script>

<style scoped>
.label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}
.input {
    @apply w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm;
}
.btn-primary {
    @apply bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition;
}
.btn-secondary {
    @apply border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition;
}
</style>