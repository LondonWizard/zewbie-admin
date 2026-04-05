import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FolderTree, Package, Save, RefreshCw } from 'lucide-react'
import api from '../../lib/api'

interface CategoryData {
  id: string
  name: string
  slug?: string
  description?: string
  parentId?: string
  parentName?: string
  productCount?: number
  status?: string
  children?: Array<{ id: string; name: string }>
}

export default function CategoryDetail() {
  const { id } = useParams()
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Admin - Category Detail'
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchCategory(controller.signal)
    return () => controller.abort()
  }, [id])

  async function fetchCategory(signal?: AbortSignal) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/catalog/categories/${id}`, { signal })
      const data = res.data?.data ?? res.data
      setCategory(data)
      setEditName(data?.name ?? '')
      setEditDesc(data?.description ?? '')
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      setError('Failed to load category')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      await api.patch(`/catalog/categories/${id}`, { name: editName, description: editDesc })
      await fetchCategory()
    } catch {
      setError('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
    )
  }

  if (error && !category) {
    return (
      <div className="p-6">
        <Link to="/catalog/categories" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Categories
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/catalog/categories" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Categories
        </Link>
        <button onClick={() => fetchCategory()} aria-label="Refresh category data" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FolderTree size={20} className="text-gray-400" /> Edit Category
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {category?.slug && (
          <p className="text-xs text-gray-400">Slug: /{category.slug}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Products</p>
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{category?.productCount ?? 0}</span>
          </div>
        </div>
        {category?.parentName && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Parent Category</p>
            <Link to={`/catalog/categories/${category.parentId}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {category.parentName}
            </Link>
          </div>
        )}
      </div>

      {/* Subcategories */}
      {category?.children && category.children.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Subcategories</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {category.children.map((child) => (
              <Link
                key={child.id}
                to={`/catalog/categories/${child.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <FolderTree size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{child.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
