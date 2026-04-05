import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import { statusBadge, priorityBadge } from '../../utils/badges'

interface Dispute {
  id: string
  title: string
  orderId?: string
  customerName?: string
  retailerName?: string
  status: string
  priority: string
  createdAt: string
  amount?: number
}

export default function DisputeList() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = 'Admin - Disputes'
  }, [])

  useEffect(() => {
    fetchDisputes()
  }, [page, statusFilter])

  async function fetchDisputes() {
    try {
      setLoading(true)
      setError('')
      const params: Record<string, string | number> = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/admin/disputes', { params })
      const data = res.data
      setDisputes(data?.data ?? data?.disputes ?? [])
      setTotalPages(data?.meta?.totalPages ?? data?.totalPages ?? 1)
    } catch {
      setError('Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchDisputes()
  }


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="text-sm text-gray-500 mt-1">Manage open disputes between users and retailers</p>
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
              placeholder="Search disputes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dispute</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Retailer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Opened</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  </tr>
                ))
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <AlertTriangle size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No disputes found</p>
                  </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/disputes/${d.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                        {d.title || `Dispute #${d.id.slice(0, 8)}`}
                      </Link>
                      {d.orderId && <p className="text-xs text-gray-400">Order #{d.orderId.slice(0, 8)}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.customerName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{d.retailerName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadge(d.priority)}`}>
                        {d.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-right font-medium">
                      {d.amount !== undefined ? `$${d.amount.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
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
