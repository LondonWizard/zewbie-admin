import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useListPage } from '../../hooks/useListPage'
import DataTable from '../../components/DataTable'
import { statusBadge } from '../../utils/badges'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function UserList() {
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    document.title = 'Admin - Users'
  }, [])

  const filters = useMemo(
    () => ({ role: roleFilter, status: statusFilter }),
    [roleFilter, statusFilter],
  )

  const {
    items: users,
    loading,
    error,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    handleSearch,
  } = useListPage<User>({
    endpoint: '/admin/users',
    filters,
    dataKeys: ['data', 'users'],
  })

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessor: (user: User) => (
          <Link to={`/users/${user.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
            {user.name || '—'}
          </Link>
        ),
      },
      {
        header: 'Email',
        accessor: (user: User) => <span className="text-gray-600">{user.email}</span>,
      },
      {
        header: 'Role',
        accessor: (user: User) => <span className="capitalize text-gray-600">{user.role}</span>,
      },
      {
        header: 'Status',
        accessor: (user: User) => (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(user.status)}`}>
            {user.status}
          </span>
        ),
      },
      {
        header: 'Created',
        accessor: (user: User) => (
          <span className="text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and manage all platform users</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="retailer">Retailer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyIcon={<Users size={32} className="mx-auto text-gray-300" />}
        emptyMessage="No users found"
        keyExtractor={(user) => user.id}
      />
    </div>
  )
}
