export interface Product {
  id: number
  name: string
  code: string
  category: string
  brand: string
  price: number
  oldPrice: number | null
  emoji: string
  image: string | null
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  sale: boolean
  featured: boolean
  description: string
}

export interface CartItem {
  product: Product
  qty: number
}

export interface Order {
  id: number
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  customerWilaya: string
  paymentMethod: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  delivery: number
  discount: number
  total: number
  createdAt: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  name: string
  code: string
  price: number
  quantity: number
}

export type FilterState = {
  search: string
  categories: string[]
  brands: string[]
  maxPrice: number
  minRating: number
  inStock: boolean
  onSale: boolean
  sort: string
}
