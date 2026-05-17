import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  discount: number
  promoCode: string
  wishlist: Product[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  clearCart: () => void
  applyPromo: (code: string, discount: number) => void
  toggleWishlist: (product: Product) => void
  isWishlisted: (productId: number) => boolean
  subtotal: () => number
  total: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      promoCode: '',
      wishlist: [],

      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, qty }] }
        })
      },

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),

      updateQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),

      clearCart: () => set({ items: [], discount: 0, promoCode: '' }),

      applyPromo: (code, discount) => set({ promoCode: code, discount }),

      toggleWishlist: (product) =>
        set((state) => {
          const exists = state.wishlist.find((w) => w.id === product.id)
          return {
            wishlist: exists
              ? state.wishlist.filter((w) => w.id !== product.id)
              : [...state.wishlist, product],
          }
        }),

      isWishlisted: (productId) => get().wishlist.some((w) => w.id === productId),

      subtotal: () => get().items.reduce((s, i) => s + i.product.price * i.qty, 0),

      total: () => {
        const sub = get().subtotal()
        const delivery = sub >= 10000 ? 0 : 500
        return Math.max(0, sub + delivery - get().discount)
      },
    }),
    { name: 'Pova-cart' }
  )
)

