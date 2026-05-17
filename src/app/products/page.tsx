import { Suspense } from 'react'
import { ProductsClient } from './ProductsClient'

export const metadata = { title: 'Products | Pova Pharm' }

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: 'center' }}>Loading products...</div>}>
      <ProductsClient />
    </Suspense>
  )
}

