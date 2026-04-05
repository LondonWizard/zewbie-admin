import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw,
  User,
  Store,
  DollarSign,
  Send,
} from 'lucide-react'
import api from '../../lib/api'
import { statusBadge, priorityBadge } from '../../utils/badges'
import ConfirmDialog from '../../components/ConfirmDialog'

interface ChatMessage {
  id: string
  sender: string
  senderRole?: string
  message: string
  timestamp: string
}

interface DisputeData {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  amount?: number
  orderId?: string
  createdAt: string
  customer?: { id: string; name: string; email: string }
  retailer?: { id: string; name: string }
  reason?: string
  resolution?: string
  messages?: ChatMessage[]
}

export default function DisputeDetail() {
  const { id } = useParams()
  const [dispute, setDispute] = useState<DisputeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [note, setNote] = useState('')
  const [confirmResolution, setConfirmResolution] = useState<'refund_customer' | 'side_with_retailer' | 'partial_refund' | null>(null)

  useEffect(() => {
    document.title = 'Admin - Dispute Detail'
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchDispute(controller.signal)
    return () => controller.abort()
  }, [id])

  async function fetchDispute(signal?: AbortSignal) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/admin/disputes/${id}`, { signal })
      setDispute(res.data?.data ?? res.data)
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      setError('Failed to load dispute details')
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(resolution: 'refund_customer' | 'side_with_retailer' | 'partial_refund') {
    try {
      setActionLoading(true)
      await api.post(`/admin/disputes/${id}/resolve`, { resolution })
      await fetchDispute()
    } catch {
      setError('Failed to resolve dispute')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSendNote() {
    if (!note.trim()) return
    try {
      await api.post(`/admin/disputes/${id}/messages`, { message: note.trim() })
      setNote('')
      await fetchDispute()
    } catch {
      setError('Failed to send message')
    }
  }

  function handleConfirmedResolve() {
    if (confirmResolution) {
      handleResolve(confirmResolution)
      setConfirmResolution(null)
    }
  }

  const resolutionLabels: Record<string, { title: string; message: string }> = {
    refund_customer: { title: 'Full Refund to Customer', message: 'Are you sure you want to issue a full refund to the customer?' },
    partial_refund: { title: 'Partial Refund', message: 'Are you sure you want to issue a partial refund?' },
    side_with_retailer: { title: 'Side with Retailer', message: 'Are you sure you want to side with the retailer and deny the refund?' },
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

  if (error && !dispute) {
    return (
      <div className="p-6">
        <Link to="/disputes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Disputes
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      </div>
    )
  }

  const isOpen = ['open', 'investigating', 'escalated'].includes(dispute?.status?.toLowerCase() ?? '')

  return (
    <div className="p-6 space-y-6">
      <ConfirmDialog
        open={confirmResolution !== null}
        title={resolutionLabels[confirmResolution ?? '']?.title ?? ''}
        message={resolutionLabels[confirmResolution ?? '']?.message ?? ''}
        confirmLabel="Confirm"
        variant={confirmResolution === 'side_with_retailer' ? 'danger' : 'warning'}
        onConfirm={handleConfirmedResolve}
        onCancel={() => setConfirmResolution(null)}
      />

      <div className="flex items-center justify-between">
        <Link to="/disputes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Disputes
        </Link>
        <button onClick={() => fetchDispute()} aria-label="Refresh dispute data" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {/* Dispute Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              {dispute?.title || `Dispute #${dispute?.id?.slice(0, 8)}`}
            </h2>
            {dispute?.description && <p className="text-sm text-gray-600 mt-2">{dispute.description}</p>}
            {dispute?.reason && (
              <p className="text-sm text-gray-500 mt-1">Reason: <span className="font-medium">{dispute.reason}</span></p>
            )}
            <p className="text-xs text-gray-400 mt-2">Opened {dispute?.createdAt ? new Date(dispute.createdAt).toLocaleString() : '—'}</p>
          </div>
          <div className="flex gap-2">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadge(dispute?.priority ?? '')}`}>
              {dispute?.priority}
            </span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(dispute?.status ?? '')}`}>
              {dispute?.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chat / Messages */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Communication</h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {!dispute?.messages || dispute.messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {dispute.messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.senderRole === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {msg.sender?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className={`max-w-[75%] rounded-lg p-3 ${
                        msg.senderRole === 'admin' ? 'bg-indigo-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">{msg.sender}</span>
                          <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-800">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isOpen && (
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendNote()}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendNote}
                  disabled={!note.trim()}
                  aria-label="Send note"
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Resolution Actions */}
          {isOpen && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Resolution Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setConfirmResolution('refund_customer')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
                >
                  <CheckCircle size={14} /> Full Refund to Customer
                </button>
                <button
                  onClick={() => setConfirmResolution('partial_refund')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                >
                  <DollarSign size={14} /> Partial Refund
                </button>
                <button
                  onClick={() => setConfirmResolution('side_with_retailer')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={14} /> Side with Retailer
                </button>
              </div>
            </div>
          )}

          {dispute?.resolution && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-5">
              <h3 className="font-semibold text-green-800 mb-1">Resolution</h3>
              <p className="text-sm text-green-700">{dispute.resolution}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {dispute?.customer && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <User size={16} className="text-gray-400" /> Customer
              </h3>
              <Link to={`/users/${dispute.customer.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                {dispute.customer.name}
              </Link>
              <p className="text-xs text-gray-500">{dispute.customer.email}</p>
            </div>
          )}

          {dispute?.retailer && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Store size={16} className="text-gray-400" /> Retailer
              </h3>
              <Link to={`/retailers/${dispute.retailer.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                {dispute.retailer.name}
              </Link>
            </div>
          )}

          {dispute?.orderId && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Related Order</h3>
              <Link to={`/orders/${dispute.orderId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                #{dispute.orderId.slice(0, 8)}
              </Link>
            </div>
          )}

          {dispute?.amount !== undefined && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-gray-400" /> Disputed Amount
              </h3>
              <p className="text-2xl font-bold text-gray-900">${dispute.amount.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
