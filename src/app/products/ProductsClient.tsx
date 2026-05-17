'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/products/ProductCard'
import type { Product } from '@/types'



//const CATEGORIES = ['Skincare', 'Makeup', 'Serums', 'Fragrance', 'Haircare', 'Suncare']
//const [categoryList, setCategoryList] = useState<any[]>([])
const BRANDS = ['AIC Natural', 'GlowLab', 'PureEssence']

export function ProductsClient() {
  
  const [categoryList, setCategoryList] = useState<any[]>([])
  
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [categories, setCategories] = useState<string[]>(searchParams.get('category') ? [searchParams.get('category')!] : [])
  const [maxPrice, setMaxPrice] = useState(20000)
  const [minRating, setMinRating] = useState(0)
  const [inStock, setInStock] = useState(false)
  const [onSale, setOnSale] = useState(searchParams.get('sale') === '1')
  const [sort, setSort] = useState('featured')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categories.length === 1) params.set('category', categories[0])
    if (onSale) params.set('sale', '1')
    if (inStock) params.set('inStock', '1')
    params.set('maxPrice', String(maxPrice))
    params.set('minRating', String(minRating))
    params.set('sort', sort)
    const res = await fetch('/api/products?' + params.toString())
    const data = await res.json()



     setProducts(data)
    setLoading(false)
  }, [search, categories, onSale, inStock, maxPrice, minRating, sort])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // =======================================================
  // 🔵 جلب الكاتيجوريز من قاعدة البيانات
  // =======================================================
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategoryList)
      .catch(err => console.error("Failed to load categories", err))
  }, [])

  // =======================================================
  // 🟣 تغيير اختيار الكاتيجوري بالـ ID
  // =======================================================
  function toggleCategory(catId: string) {
    setCategories(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    )
  }

  return (
    <>
      <style>{`
        .products-shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 30px;
        }

        .products-sidebar {
          background: #fff;
          border-radius: var(--radius);
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 90px;
        }

        .products-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
        }

        .products-toolbar select {
          min-width: 180px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .products-shell {
            grid-template-columns: 1fr;
          }

          .products-sidebar {
            position: static;
            top: auto;
            width: 100%;
            margin-bottom: 24px;
          }

          .products-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .products-toolbar select {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .products-shell {
            padding: 24px 16px;
            gap: 20px;
          }

          .products-toolbar {
            gap: 16px;
          }
        }
      `}</style>

      {/* Page Hero */}
      <div style={{ background: 'linear-gradient(135deg,var(--beige),var(--blue-pale))', padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(28px,4vw,42px)', color: 'var(--text-dark)', marginBottom: 10 }}>All Products</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>Home › Products</p>
      </div>

      <div className="products-shell">
        {/* Sidebar Filters */}
        <aside className="products-sidebar">
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, marginBottom: 24 }}>Filters</h3>

          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: 8 }}>Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Name or code..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--beige-dark)', fontFamily: 'Jost,sans-serif', fontSize: 14, outline: 'none' }} />
          </div>

          {/* Categories */}
          {/* <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: 12 }}>Category</label>
            {CATEGORIES.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-mid)' }}>
                <input type="checkbox" checked={categories.includes(cat)} onChange={() => toggleCategory(cat)} />
                {cat}
              </label>
            ))}
          </div>*/}
          {/* Categories */}
<div style={{ marginBottom: 24 }}>
  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: 12 }}>
    Category
  </label>

  {categoryList.length === 0 ? (
    <p style={{ fontSize: 13, color: 'gray' }}>Loading categories...</p>
  ) : (
    categoryList.map(cat => (
      <label
        key={cat.id}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-mid)' }}
      >
        <input
          type="checkbox"
          checked={categories.includes(String(cat.id))}
          onChange={() => toggleCategory(String(cat.id))}
        />
        {cat.name}
      </label>
    ))
  )}
</div>

          {/* Price */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: 8 }}>
              Max Price: <strong>{maxPrice.toLocaleString('en-US')} DZD</strong>
            </label>
            <input type="range" min={500} max={20000} step={500} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
              style={{ width: '100%' }} />
          </div>

          {/* Rating */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: 12 }}>Min Rating</label>
            {[0, 3, 4, 4.5].map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-mid)' }}>
                <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} />
                {r === 0 ? 'All ratings' : `${r}+ ★`}
              </label>
            ))}
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-mid)' }}>
              <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />
              In Stock Only
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-mid)' }}>
              <input type="checkbox" checked={onSale} onChange={e => setOnSale(e.target.checked)} />
              On Sale Only
            </label>
          </div>

          <button onClick={() => { setSearch(''); setCategories([]); setMaxPrice(20000); setMinRating(0); setInStock(false); setOnSale(false); setSort('featured') }}
            style={{ marginTop: 20, width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid var(--blue)', color: 'var(--blue)', background: 'transparent', cursor: 'pointer', fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600 }}>
            Clear Filters
          </button>
        </aside>

        {/* Products Grid */}
        <div>
          <div className="products-toolbar" style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 14, color: 'var(--text-mid)' }}><strong>{products.length}</strong> products found</span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--beige-dark)', fontFamily: 'Jost,sans-serif', fontSize: 14, outline: 'none', background: '#fff' }}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Best Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-light)' }}>Loading...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, marginBottom: 10 }}>No products found</h3>
              <p style={{ color: 'var(--text-light)' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24 }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
