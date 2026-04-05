import { useState, useEffect } from 'react'
import { Plus, Search, Settings, Trash2, Edit } from 'lucide-react'
import api from '../../lib/api'

interface Attribute {
  id: string
  name: string
  type: string
  values?: string[]
  usedByCategories?: number
  createdAt?: string
}

export default function Attributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('text')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    document.title = 'Admin - Attributes'
  }, [])

  useEffect(() => {
    fetchAttributes()
  }, [])

  async function fetchAttributes() {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/catalog/attributes')
      const data = res.data
      setAttributes(data?.data ?? data?.attributes ?? [])
    } catch {
      setError('Failed to load attributes')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      setCreating(true)
      await api.post('/catalog/attributes', { name: newName.trim(), type: newType })
      setNewName('')
      setShowCreate(false)
      await fetchAttributes()
    } catch {
      setError('Failed to create attribute')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(attrId: string) {
    if (!confirm('Delete this attribute?')) return
    try {
      await api.delete(`/catalog/attributes/${attrId}`)
      setAttributes((prev) => prev.filter((a) => a.id !== attrId))
    } catch {
      setError('Failed to delete attribute')
    }
  }

  const filtered = search
    ? attributes.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : attributes

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      text: 'bg-blue-100 text-blue-700',
      number: 'bg-green-100 text-green-700',
      select: 'bg-purple-100 text-purple-700',
      boolean: 'bg-amber-100 text-amber-700',
      color: 'bg-pink-100 text-pink-700',
    }
    return map[type?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attribute Definitions</h1>
          <p className="text-sm text-gray-500 mt-1">Define and manage product attributes used across categories</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Attribute
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Attribute name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
            <option value="boolean">Boolean</option>
            <option value="color">Color</option>
          </select>
          <button type="submit" disabled={creating || !newName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {creating ? 'Creating…' : 'Create'}
          </button>
          <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </form>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search attributes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Values</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Used By</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Settings size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No attributes found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((attr) => (
                  <tr key={attr.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{attr.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeBadge(attr.type)}`}>
                        {attr.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {attr.values?.length ? attr.values.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{attr.usedByCategories ?? 0} categories</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button aria-label="Edit attribute" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(attr.id)} aria-label="Delete attribute" className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
