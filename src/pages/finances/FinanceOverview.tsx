import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import api from '../../lib/api'

interface FinanceStats {
  totalRevenue: number
  platformFees: number
  totalPayouts: number
  pendingPayouts: number
  avgOrderValue: number
  transactionCount: number
  revenueGrowth?: number
}

export default function FinanceOverview() {
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Admin - Finances'
  }, [])

  useEffect(() => {
    fetchFinances()
  }, [])

  async function fetchFinances() {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/admin/finances')
      const data = res.data?.data ?? res.data
      setStats({
        totalRevenue: data?.totalRevenue ?? 0,
        platformFees: data?.platformFees ?? 0,
        totalPayouts: data?.totalPayouts ?? 0,
        pendingPayouts: data?.pendingPayouts ?? 0,
        avgOrderValue: data?.avgOrderValue ?? 0,
        transactionCount: data?.transactionCount ?? 0,
        revenueGrowth: data?.revenueGrowth,
      })
    } catch {
      setError('Failed to load financial data')
      setStats({
        totalRevenue: 0,
        platformFees: 0,
        totalPayouts: 0,
        pendingPayouts: 0,
        avgOrderValue: 0,
        transactionCount: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const cards = stats
    ? [
        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50', sub: stats.revenueGrowth !== undefined ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}% growth` : undefined },
        { label: 'Platform Fees', value: `$${stats.platformFees.toLocaleString()}`, icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Total Payouts', value: `$${stats.totalPayouts.toLocaleString()}`, icon: Wallet, color: 'text-blue-600 bg-blue-50' },
        { label: 'Pending Payouts', value: `$${stats.pendingPayouts.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
        { label: 'Avg Order Value', value: `$${stats.avgOrderValue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
        { label: 'Transactions', value: stats.transactionCount.toLocaleString(), icon: CreditCard, color: 'text-gray-600 bg-gray-100' },
      ]
    : []

  const quickLinks = [
    { label: 'View All Transactions', to: '/finances/transactions' },
    { label: 'User Payouts', to: '/finances/payouts/users' },
    { label: 'Retailer Payouts', to: '/finances/payouts/retailers' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide financial overview</p>
        </div>
        <button
          onClick={fetchFinances}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{card.label}</span>
                <span className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.sub && (
                <p className={`text-xs mt-1 ${stats?.revenueGrowth && stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>
        </div>
        <div className="p-4 space-y-2">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
