import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingCart, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import api from '../../lib/api'
import { statusBadge } from '../../utils/badges'

interface Order {
  id: string
  orderNumber?: string
  customerName?: string
  customerEmail?: string
  total: number
  status: string
  createdAt: string
  itemCount?: number
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    document.title = 'Admin - Orders'
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  async function fetchOrders() {
    try {
      setLoading(true)
      setError('')
      const params: Record<string, string | number> = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/orders', { params })
      const data = res.data
      setOrders(data?.data ?? data?.orders ?? [])
      setTotalPages(data?.meta?.totalPages ?? data?.totalPages ?? 1)
      setTotalRevenue(data?.meta?.totalRevenue ?? data?.totalRevenue ?? 0)
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchOrders()
  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
          <p className="text-sm text-gray-500 mt-1">View all platform orders across all retailers</p>
        </div>
        {totalRevenue > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <DollarSign size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">Total: ${totalRevenue.toLocaleString()}</span>
          </div>
        )}
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
              placeholder="Search by order number or customer…"
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
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-36" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <ShoppingCart size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                        #{order.orderNumber || order.id.slice(0, 8)}
                      </Link>
                      {order.itemCount !== undefined && (
                        <span className="text-xs text-gray-400 ml-1">({order.itemCount} items)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.customerName || order.customerEmail || '—'}</td>
                    <td className="px-4 py-3 text-gray-900 text-right font-medium">${order.total?.toFixed(2) ?? '0.00'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
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
