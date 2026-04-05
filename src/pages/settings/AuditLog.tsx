import { useState, useEffect } from 'react'
import { Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'

interface AuditEntry {
  id: string
  action: string
  entity: string
  entityId?: string
  actor: string
  actorId?: string
  details?: string
  ipAddress?: string
  timestamp: string
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = 'Admin - Audit Log'
  }, [])

  useEffect(() => {
    fetchAuditLog()
  }, [page, entityFilter, actionFilter])

  async function fetchAuditLog() {
    try {
      setLoading(true)
      setError('')
      const params: Record<string, string | number> = { page, limit: 25 }
      if (search) params.search = search
      if (entityFilter) params.entity = entityFilter
      if (actionFilter) params.action = actionFilter
      const res = await api.get('/admin/audit-logs', { params })
      const data = res.data
      setEntries(data?.data ?? data?.logs ?? [])
      setTotalPages(data?.meta?.totalPages ?? data?.totalPages ?? 1)
    } catch {
      setError('Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchAuditLog()
  }

  const actionBadge = (action: string) => {
    const lower = action?.toLowerCase() ?? ''
    if (lower.includes('create') || lower.includes('add')) return 'bg-green-100 text-green-700'
    if (lower.includes('delete') || lower.includes('remove')) return 'bg-red-100 text-red-700'
    if (lower.includes('update') || lower.includes('edit') || lower.includes('modify')) return 'bg-blue-100 text-blue-700'
    if (lower.includes('approve')) return 'bg-green-100 text-green-700'
    if (lower.includes('reject') || lower.includes('suspend')) return 'bg-red-100 text-red-700'
    if (lower.includes('login') || lower.includes('auth')) return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Chronological log of all admin actions for compliance and debugging</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by actor, entity, or details…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </form>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Entities</option>
          <option value="user">User</option>
          <option value="retailer">Retailer</option>
          <option value="product">Product</option>
          <option value="order">Order</option>
          <option value="dispute">Dispute</option>
          <option value="settings">Settings</option>
        </select>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="suspend">Suspend</option>
          <option value="login">Login</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Details</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-36" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No audit log entries found</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{entry.actor}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${actionBadge(entry.action)}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="capitalize">{entry.entity}</span>
                      {entry.entityId && (
                        <span className="text-xs text-gray-400 ml-1">#{entry.entityId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{entry.details || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{entry.ipAddress || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50" aria-label="Previous page"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50" aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
