import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Store } from 'lucide-react'
import { useListPage } from '../../hooks/useListPage'
import DataTable from '../../components/DataTable'
import { statusBadge, tierBadge } from '../../utils/badges'

interface Retailer {
  id: string
  businessName: string
  email: string
  status: string
  tier: string
  createdAt: string
}

export default function RetailerList() {
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    document.title = 'Admin - Retailers'
  }, [])

  const filters = useMemo(() => ({ status: statusFilter }), [statusFilter])

  const {
    items: retailers,
    loading,
    error,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    handleSearch,
  } = useListPage<Retailer>({
    endpoint: '/admin/retailers',
    filters,
    dataKeys: ['data', 'retailers'],
  })

  const columns = useMemo(
    () => [
      {
        header: 'Business Name',
        accessor: (r: Retailer) => (
          <Link to={`/retailers/${r.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
            {r.businessName || '—'}
          </Link>
        ),
      },
      {
        header: 'Email',
        accessor: (r: Retailer) => <span className="text-gray-600">{r.email}</span>,
      },
      {
        header: 'Status',
        accessor: (r: Retailer) => (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(r.status)}`}>
            {r.status}
          </span>
        ),
      },
      {
        header: 'Tier',
        accessor: (r: Retailer) => (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${tierBadge(r.tier)}`}>
            {r.tier || '—'}
          </span>
        ),
      },
      {
        header: 'Created',
        accessor: (r: Retailer) => (
          <span className="text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Retailer Management</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and manage all registered retailers</p>
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
              placeholder="Search by business name or email…"
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
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={retailers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyIcon={<Store size={32} className="mx-auto text-gray-300" />}
        emptyMessage="No retailers found"
        keyExtractor={(r) => r.id}
      />
    </div>
  )
}
