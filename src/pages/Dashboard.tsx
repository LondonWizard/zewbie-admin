import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  Users,
  Store,
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import api from '../lib/api'

interface DashboardStats {
  totalRevenue: number
  activeUsers: number
  activeRetailers: number
  pendingApprovals: number
  openDisputes: number
}

interface RecentActivity {
  id: string
  action: string
  entity: string
  timestamp: string
  actor: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [healthOk, setHealthOk] = useState<boolean | null>(null)

  useEffect(() => {
    document.title = 'Admin - Dashboard'
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/admin/dashboard')
      const data = res.data?.data ?? res.data
      setStats({
        totalRevenue: data?.totalRevenue ?? 0,
        activeUsers: data?.activeUsers ?? 0,
        activeRetailers: data?.activeRetailers ?? 0,
        pendingApprovals: data?.pendingApprovals ?? 0,
        openDisputes: data?.openDisputes ?? 0,
      })
      setActivity(data?.recentActivity ?? [])
      setHealthOk(data?.systemHealth !== false)
    } catch {
      setError('Failed to load dashboard data')
      setStats({
        totalRevenue: 0,
        activeUsers: 0,
        activeRetailers: 0,
        pendingApprovals: 0,
        openDisputes: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats
    ? [
        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50', link: '/finances' },
        { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50', link: '/users' },
        { label: 'Active Retailers', value: stats.activeRetailers.toLocaleString(), icon: Store, color: 'text-purple-600 bg-purple-50', link: '/retailers' },
        { label: 'Pending Approvals', value: stats.pendingApprovals.toLocaleString(), icon: Clock, color: 'text-amber-600 bg-amber-50', link: '/retailers/approvals' },
        { label: 'Open Disputes', value: stats.openDisputes.toLocaleString(), icon: AlertTriangle, color: 'text-red-600 bg-red-50', link: '/disputes' },
      ]
    : []

  const quickActions = [
    { label: 'Review Retailer Approvals', to: '/retailers/approvals', icon: Clock },
    { label: 'View Open Disputes', to: '/disputes', icon: AlertTriangle },
    { label: 'Manage Users', to: '/users', icon: Users },
    { label: 'View Audit Log', to: '/settings/audit-log', icon: Activity },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and key metrics</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* System Health */}
      <div className="flex items-center gap-2 text-sm">
        {healthOk === null ? (
          <span className="text-gray-400">Checking system health…</span>
        ) : healthOk ? (
          <>
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-green-700 font-medium">All systems operational</span>
          </>
        ) : (
          <>
            <XCircle size={16} className="text-red-500" />
            <span className="text-red-700 font-medium">System issues detected</span>
          </>
        )}
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{card.label}</span>
                <span className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-8">
                <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="p-1.5 bg-gray-100 rounded-full">
                      <Activity size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.actor}</span>{' '}
                        {item.action} <span className="font-medium">{item.entity}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <action.icon size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
