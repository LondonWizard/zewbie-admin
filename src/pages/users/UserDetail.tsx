import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  ShoppingCart,
  Store,
  Ban,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import api from '../../lib/api'
import { statusBadge } from '../../utils/badges'
import ConfirmDialog from '../../components/ConfirmDialog'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  avatar?: string
  phone?: string
  orders?: Array<{ id: string; total: number; status: string; createdAt: string }>
  stores?: Array<{ id: string; name: string; status: string }>
  activity?: Array<{ id: string; action: string; timestamp: string }>
}

export default function UserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'unsuspend' | null>(null)

  useEffect(() => {
    document.title = 'Admin - User Detail'
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchUser(controller.signal)
    return () => controller.abort()
  }, [id])

  async function fetchUser(signal?: AbortSignal) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/admin/users/${id}`, { signal })
      setUser(res.data?.data ?? res.data)
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      setError('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: 'suspend' | 'unsuspend' | 'changeRole', role?: string) {
    try {
      setActionLoading(true)
      if (action === 'changeRole') {
        await api.patch(`/admin/users/${id}`, { role })
      } else {
        await api.patch(`/admin/users/${id}`, { status: action === 'suspend' ? 'suspended' : 'active' })
      }
      await fetchUser()
    } catch {
      setError(`Failed to ${action} user`)
    } finally {
      setActionLoading(false)
    }
  }

  function handleConfirmedAction() {
    if (confirmAction) {
      handleAction(confirmAction)
      setConfirmAction(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full" />
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-64" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="p-6">
        <Link to="/users" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction === 'suspend' ? 'Suspend User' : 'Unsuspend User'}
        message={
          confirmAction === 'suspend'
            ? 'Are you sure you want to suspend this user? They will lose access to the platform.'
            : 'Are you sure you want to unsuspend this user? They will regain access to the platform.'
        }
        confirmLabel={confirmAction === 'suspend' ? 'Suspend' : 'Unsuspend'}
        variant={confirmAction === 'suspend' ? 'danger' : 'default'}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />

      <div className="flex items-center justify-between">
        <Link to="/users" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <div className="flex gap-2">
          {user?.status === 'active' ? (
            <button
              onClick={() => setConfirmAction('suspend')}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              <Ban size={14} /> Suspend
            </button>
          ) : user?.status === 'suspended' ? (
            <button
              onClick={() => setConfirmAction('unsuspend')}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
            >
              <CheckCircle size={14} /> Unsuspend
            </button>
          ) : null}
          <button
            onClick={() => fetchUser()}
            aria-label="Refresh user data"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              (user?.name?.[0] ?? 'U').toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Unknown User'}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail size={14} /> {user?.email}</span>
              <span className="flex items-center gap-1"><Shield size={14} /> {user?.role}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
              {user?.phone && <span className="flex items-center gap-1"><User size={14} /> {user.phone}</span>}
            </div>
            <div className="mt-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(user?.status ?? '')}`}>
                {user?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Role Change */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          <span className="text-sm text-gray-500">Change role:</span>
          {['user', 'admin', 'retailer'].filter((r) => r !== user?.role).map((role) => (
            <button
              key={role}
              onClick={() => handleAction('changeRole', role)}
              disabled={actionLoading}
              className="px-3 py-1 text-xs font-medium capitalize border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <ShoppingCart size={16} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Orders</h3>
          </div>
          <div className="p-4">
            {!user?.orders || user.orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No orders found</p>
            ) : (
              <div className="space-y-2">
                {user.orders.slice(0, 10).map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium text-indigo-600">#{order.id.slice(0, 8)}</span>
                    <span className="text-gray-500">${order.total?.toFixed(2)}</span>
                    <span className="capitalize text-gray-400 text-xs">{order.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stores */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Store size={16} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Stores</h3>
          </div>
          <div className="p-4">
            {!user?.stores || user.stores.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No stores associated</p>
            ) : (
              <div className="space-y-2">
                {user.stores.map((store) => (
                  <Link
                    key={store.id}
                    to={`/retailers/${store.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium text-indigo-600">{store.name}</span>
                    <span className="capitalize text-gray-400 text-xs">{store.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Activity History</h3>
        </div>
        <div className="p-4">
          {!user?.activity || user.activity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No activity recorded</p>
          ) : (
            <div className="space-y-3">
              {user.activity.slice(0, 20).map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-gray-700">{item.action}</span>
                  <span className="text-gray-400 ml-auto text-xs">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
