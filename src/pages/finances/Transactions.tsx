import { useState, useEffect } from 'react'
import { Search, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import { statusBadge } from '../../utils/badges'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description?: string
  reference?: string
  createdAt: string
  userId?: string
  userName?: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = 'Admin - Transactions'
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [page, typeFilter, statusFilter])

  async function fetchTransactions() {
    try {
      setLoading(true)
      setError('')
      const params: Record<string, string | number> = { page, limit: 20 }
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/admin/transactions', { params })
      const data = res.data
      setTransactions(data?.data ?? data?.transactions ?? [])
      setTotalPages(data?.meta?.totalPages ?? data?.totalPages ?? 1)
    } catch {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchTransactions()
  }

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      payment: 'bg-green-100 text-green-700',
      refund: 'bg-red-100 text-red-700',
      payout: 'bg-blue-100 text-blue-700',
      fee: 'bg-purple-100 text-purple-700',
    }
    return map[type?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">Full transaction history across the platform</p>
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
              placeholder="Search by reference or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </form>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
          <option value="payout">Payout</option>
          <option value="fee">Fee</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{tx.reference || tx.id.slice(0, 12)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeBadge(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tx.description || '—'}</td>
                    <td className={`px-4 py-3 text-right font-medium ${tx.type === 'refund' ? 'text-red-600' : 'text-gray-900'}`}>
                      {tx.type === 'refund' ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
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
