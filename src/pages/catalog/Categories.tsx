import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderTree, Plus, Search, ChevronRight } from 'lucide-react'
import api from '../../lib/api'

interface Category {
  id: string
  name: string
  slug?: string
  parentId?: string
  productCount?: number
  status?: string
  children?: Category[]
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    document.title = 'Admin - Categories'
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/catalog/categories')
      const data = res.data
      setCategories(data?.data ?? data?.categories ?? [])
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      setCreating(true)
      await api.post('/catalog/categories', { name: newName.trim() })
      setNewName('')
      setShowCreate(false)
      await fetchCategories()
    } catch {
      setError('Failed to create category')
    } finally {
      setCreating(false)
    }
  }

  const filtered = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the product category hierarchy</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-3">
          <input
            type="text"
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded flex-1 max-w-xs" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog/categories/${cat.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderTree size={18} className="text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    {cat.slug && <span className="text-xs text-gray-400 ml-2">/{cat.slug}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {cat.productCount !== undefined && (
                    <span className="text-xs text-gray-400">{cat.productCount} products</span>
                  )}
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
