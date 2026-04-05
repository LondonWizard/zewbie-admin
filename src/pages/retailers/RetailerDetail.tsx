import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Store,
  Mail,
  Calendar,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
  Shield,
} from 'lucide-react'
import api from '../../lib/api'
import { statusBadge } from '../../utils/badges'
import ConfirmDialog from '../../components/ConfirmDialog'

interface RetailerData {
  id: string
  businessName: string
  email: string
  status: string
  tier: string
  verificationStatus: string
  createdAt: string
  phone?: string
  address?: string
  productCount?: number
  totalRevenue?: number
  description?: string
}

export default function RetailerDetail() {
  const { id } = useParams()
  const [retailer, setRetailer] = useState<RetailerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'suspend' | null>(null)

  useEffect(() => {
    document.title = 'Admin - Retailer Detail'
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchRetailer(controller.signal)
    return () => controller.abort()
  }, [id])

  async function fetchRetailer(signal?: AbortSignal) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/admin/retailers/${id}`, { signal })
      setRetailer(res.data?.data ?? res.data)
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      setError('Failed to load retailer details')
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(action: 'approve' | 'reject') {
    try {
      setActionLoading(true)
      await api.post(`/admin/retailers/${id}/review`, { action })
      await fetchRetailer()
    } catch {
      setError(`Failed to ${action} retailer`)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSuspend() {
    try {
      setActionLoading(true)
      await api.patch(`/admin/retailers/${id}`, { status: 'suspended' })
      await fetchRetailer()
    } catch {
      setError('Failed to suspend retailer')
    } finally {
      setActionLoading(false)
    }
  }

  function handleConfirmedAction() {
    if (confirmAction === 'approve' || confirmAction === 'reject') {
      handleReview(confirmAction)
    } else if (confirmAction === 'suspend') {
      handleSuspend()
    }
    setConfirmAction(null)
  }

  const confirmMessages: Record<string, { title: string; message: string }> = {
    approve: { title: 'Approve Retailer', message: 'Are you sure you want to approve this retailer application?' },
    reject: { title: 'Reject Retailer', message: 'Are you sure you want to reject this retailer application? This cannot be easily undone.' },
    suspend: { title: 'Suspend Retailer', message: 'Are you sure you want to suspend this retailer? Their products will become unavailable.' },
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
      </div>
    )
  }

  if (error && !retailer) {
    return (
      <div className="p-6">
        <Link to="/retailers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Retailers
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmMessages[confirmAction ?? '']?.title ?? ''}
        message={confirmMessages[confirmAction ?? '']?.message ?? ''}
        confirmLabel={confirmAction ? confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1) : ''}
        variant={confirmAction === 'reject' || confirmAction === 'suspend' ? 'danger' : 'default'}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />

      <div className="flex items-center justify-between">
        <Link to="/retailers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Retailers
        </Link>
        <div className="flex gap-2">
          {retailer?.status === 'pending' && (
            <>
              <button onClick={() => setConfirmAction('approve')} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">
                <CheckCircle size={14} /> Approve
              </button>
              <button onClick={() => setConfirmAction('reject')} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {retailer?.status === 'active' && (
            <button onClick={() => setConfirmAction('suspend')} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">
              <Ban size={14} /> Suspend
            </button>
          )}
          <button onClick={() => fetchRetailer()} aria-label="Refresh retailer data" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {/* Business Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Store size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{retailer?.businessName || 'Unknown Retailer'}</h2>
            {retailer?.description && <p className="text-sm text-gray-500 mt-1">{retailer.description}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail size={14} /> {retailer?.email}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {retailer?.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : '—'}</span>
              {retailer?.phone && <span>{retailer.phone}</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(retailer?.status ?? '')}`}>
                {retailer?.status}
              </span>
              {retailer?.tier && (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-indigo-100 text-indigo-700">
                  {retailer.tier}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Shield size={14} /> Verification
          </div>
          <p className="text-lg font-bold text-gray-900 capitalize">{retailer?.verificationStatus ?? 'Unknown'}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Package size={14} /> Products
          </div>
          <p className="text-lg font-bold text-gray-900">{retailer?.productCount?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign size={14} /> Revenue
          </div>
          <p className="text-lg font-bold text-gray-900">${(retailer?.totalRevenue ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {retailer?.address && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Address</h3>
          <p className="text-sm text-gray-600">{retailer.address}</p>
        </div>
      )}
    </div>
  )
}
