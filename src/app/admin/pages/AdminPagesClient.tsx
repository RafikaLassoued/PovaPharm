'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Page = {
  id: number
  slug: string
  title: string
  content: string
  published: boolean
  updatedAt: Date
}

export function AdminPagesClient({ pages: initialPages }: { pages: Page[] }) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const resetForm = () => {
    setSelectedPage(null)
    setIsEditing(false)
    setIsCreating(false)
    setMsg('')
    if (formRef.current) formRef.current.reset()
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const slug = formData.get('slug') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const published = formData.get('published') === 'on'

    if (!slug || !title || !content) {
      setMsg('❌ All fields are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, content, published }),
      })
      if (res.ok) {
        const newPage = await res.json()
        setPages([newPage, ...pages])
        setMsg('✓ Page created successfully')
        resetForm()
      } else {
        const error = await res.json()
        setMsg(`❌ ${error.error || 'Failed to create page'}`)
      }
    } catch (error) {
      setMsg('❌ Error creating page')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPage) return

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const published = formData.get('published') === 'on'

    if (!title || !content) {
      setMsg('❌ All fields are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPage.id, title, content, published }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPages(pages.map(p => p.id === updated.id ? updated : p))
        setMsg('✓ Page updated successfully')
        resetForm()
      } else {
        setMsg('❌ Failed to update page')
      }
    } catch (error) {
      setMsg('❌ Error updating page')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (pageId: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/pages?id=${pageId}`, { method: 'DELETE' })
      if (res.ok) {
        setPages(pages.filter(p => p.id !== pageId))
        setMsg('✓ Page deleted successfully')
        resetForm()
      } else {
        setMsg('❌ Failed to delete page')
      }
    } catch (error) {
      setMsg('❌ Error deleting page')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 20 }}>📄 Manage Pages</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
        {/* Pages List */}
        <div>
          <h3 style={{ marginBottom: 16 }}>Pages</h3>
          <button
            onClick={() => {
              setIsCreating(true)
              setIsEditing(false)
              setSelectedPage(null)
              if (formRef.current) formRef.current.reset()
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: 16,
              background: 'var(--green)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ➕ New Page
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pages.map(page => (
              <div
                key={page.id}
                onClick={() => {
                  setSelectedPage(page)
                  setIsEditing(true)
                  setIsCreating(false)
                }}
                style={{
                  padding: '12px',
                  background: selectedPage?.id === page.id ? 'var(--blue)' : '#f5f5f5',
                  color: selectedPage?.id === page.id ? 'white' : 'black',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600 }}>{page.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>/{page.slug}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div>
          {msg && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: 20,
                background: msg.includes('✓') ? '#d4edda' : '#f8d7da',
                color: msg.includes('✓') ? '#155724' : '#721c24',
                borderRadius: 'var(--radius)',
                fontSize: 14,
              }}
            >
              {msg}
            </div>
          )}

          {(isEditing || isCreating) && (
            <form
              ref={formRef}
              onSubmit={isCreating ? handleCreate : handleEdit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h3 style={{ marginBottom: 0 }}>
                {isCreating ? '✏️ Create New Page' : `✏️ Edit: ${selectedPage?.title}`}
              </h3>

              {isCreating && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Slug (URL)*
                  </label>
                  <input
                    type="text"
                    name="slug"
                    placeholder="e.g., about, terms, privacy"
                    defaultValue={selectedPage?.slug || ''}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: 'var(--radius)',
                      fontSize: 14,
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Title*
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Page title"
                  defaultValue={selectedPage?.title || ''}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: 'var(--radius)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Content (HTML)*
                </label>
                <textarea
                  name="content"
                  placeholder="Page content (supports HTML tags)"
                  defaultValue={selectedPage?.content || ''}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'monospace',
                    minHeight: 300,
                    fontSize: 12,
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 14, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={selectedPage?.published ?? true}
                />
                <span>Published</span>
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Saving...' : isCreating ? '➕ Create' : '💾 Save'}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedPage!.id)}
                    disabled={loading}
                    style={{
                      padding: '10px 16px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 16px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!isEditing && !isCreating && (
            <div style={{ textAlign: 'center', color: '#999', paddingTop: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
              <p>Select a page to edit or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}