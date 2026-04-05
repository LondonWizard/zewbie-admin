import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Store, Clock, ExternalLink } from 'lucide-react'
import api from '../../lib/api'

interface PendingRetailer {
  id: string
  businessName: string
  email: string
  createdAt: string
  phone?: string
  description?: string
}

export default function RetailerApprovals() {
  const [retailers, setRetailers] = useState<PendingRetailer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Admin - Retailer Approvals'
  }, [])

  useEffect(() => {
    fetchPending()
  }, [])

  async function fetchPending() {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/admin/retailers', { params: { status: 'pending' } })
      const data = res.data
      setRetailers(data?.data ?? data?.retailers ?? [])
    } catch {
      setError('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(retailerId: string, action: 'approve' | 'reject') {
    try {
      setActionLoading(retailerId)
      await api.post(`/admin/retailers/${retailerId}/review`, { action })
      setRetailers((prev) => prev.filter((r) => r.id !== retailerId))
    } catch {
      setError(`Failed to ${action} retailer`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Retailer Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and process pending retailer applications</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : retailers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle size={40} className="mx-auto text-green-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">All caught up!</h3>
          <p className="text-sm text-gray-500 mt-1">No pending retailer applications to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {retailers.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{r.businessName}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock size={10} /> Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{r.email}</p>
                    {r.description && <p className="text-sm text-gray-500 mt-1">{r.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">Applied {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/retailers/${r.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={14} /> View
                  </Link>
                  <button
                    onClick={() => handleReview(r.id, 'approve')}
                    disabled={actionLoading === r.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleReview(r.id, 'reject')}
                    disabled={actionLoading === r.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
