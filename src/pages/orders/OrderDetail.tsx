import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  User,
} from 'lucide-react'
import api from '../../lib/api'
import { statusBadge } from '../../utils/badges'

interface OrderItem {
  id: string
  productName: string
  productId?: string
  quantity: number
  unitPrice: number
  total: number
}

interface TimelineEvent {
  id: string
  status: string
  message: string
  timestamp: string
}

interface OrderData {
  id: string
  orderNumber?: string
  status: string
  total: number
  subtotal?: number
  tax?: number
  shipping?: number
  discount?: number
  createdAt: string
  updatedAt?: string
  customer?: { id: string; name: string; email: string }
  retailer?: { id: string; name: string }
  items?: OrderItem[]
  timeline?: TimelineEvent[]
  paymentMethod?: string
  paymentStatus?: string
  shippingAddress?: string
  trackingNumber?: string
  notes?: string
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Admin - Order Detail'
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchOrder(controller.signal)
    return () => controller.abort()
  }, [id])

  async function fetchOrder(signal?: AbortSignal) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/orders/${id}`, { signal })
      setOrder(res.data?.data ?? res.data)
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const timelineIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': case 'delivered': return <CheckCircle size={16} className="text-green-500" />
      case 'cancelled': return <XCircle size={16} className="text-red-500" />
      case 'shipped': return <Truck size={16} className="text-indigo-500" />
      case 'processing': return <Package size={16} className="text-blue-500" />
      default: return <Clock size={16} className="text-amber-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="p-6">
        <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <button onClick={() => fetchOrder()} aria-label="Refresh order data" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-gray-400" />
              Order #{order?.orderNumber || order?.id?.slice(0, 8)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Placed {order?.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
            </p>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(order?.status ?? '')}`}>
            {order?.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
            {!order?.items || order.items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No items</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      {item.productId ? (
                        <Link to={`/catalog/products/${item.productId}`} className="font-medium text-indigo-600 hover:text-indigo-800 text-sm">
                          {item.productName}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900 text-sm">{item.productName}</span>
                      )}
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Totals */}
            <div className="p-4 border-t border-gray-200 space-y-1 text-sm">
              {order?.subtotal !== undefined && (
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                </div>
              )}
              {order?.shipping !== undefined && (
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span><span>${order.shipping.toFixed(2)}</span>
                </div>
              )}
              {order?.tax !== undefined && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span><span>${order.tax.toFixed(2)}</span>
                </div>
              )}
              {order?.discount !== undefined && order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span><span>${order?.total?.toFixed(2) ?? '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Timeline</h3>
            </div>
            <div className="p-4">
              {!order?.timeline || order.timeline.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No timeline events</p>
              ) : (
                <div className="space-y-4">
                  {order.timeline.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="mt-0.5">{timelineIcon(event.status)}</div>
                      <div>
                        <p className="text-sm text-gray-900">{event.message}</p>
                        <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <User size={16} className="text-gray-400" /> Customer
            </h3>
            {order?.customer ? (
              <div>
                <Link to={`/users/${order.customer.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  {order.customer.name}
                </Link>
                <p className="text-xs text-gray-500">{order.customer.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No customer data</p>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-gray-400" /> Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900">{order?.paymentMethod ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(order?.paymentStatus ?? '')}`}>
                  {order?.paymentStatus ?? '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Truck size={16} className="text-gray-400" /> Shipping
            </h3>
            <div className="space-y-2 text-sm">
              {order?.shippingAddress && (
                <p className="text-gray-600">{order.shippingAddress}</p>
              )}
              {order?.trackingNumber ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking</span>
                  <span className="text-gray-900 font-mono text-xs">{order.trackingNumber}</span>
                </div>
              ) : (
                <p className="text-gray-400">No tracking info</p>
              )}
            </div>
          </div>

          {order?.retailer && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Retailer</h3>
              <Link to={`/retailers/${order.retailer.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                {order.retailer.name}
              </Link>
            </div>
          )}

          {order?.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
