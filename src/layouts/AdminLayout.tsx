import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Settings,
  FlaskConical,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

interface NavSection {
  label: string
  icon: React.ReactNode
  links: { to: string; label: string }[]
  devOnly?: boolean
}

const navigation: NavSection[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    links: [{ to: '/dashboard', label: 'Overview' }],
  },
  {
    label: 'Users',
    icon: <Users size={18} />,
    links: [{ to: '/users', label: 'All Users' }],
  },
  {
    label: 'Retailers',
    icon: <Store size={18} />,
    links: [
      { to: '/retailers', label: 'All Retailers' },
      { to: '/retailers/approvals', label: 'Approvals' },
    ],
  },
  {
    label: 'Catalog',
    icon: <Package size={18} />,
    links: [
      { to: '/catalog/products', label: 'Products' },
      { to: '/catalog/products/approvals', label: 'Product Approvals' },
      { to: '/catalog/categories', label: 'Categories' },
      { to: '/catalog/attributes', label: 'Attributes' },
    ],
  },
  {
    label: 'Orders',
    icon: <ShoppingCart size={18} />,
    links: [{ to: '/orders', label: 'All Orders' }],
  },
  {
    label: 'Disputes',
    icon: <AlertTriangle size={18} />,
    links: [{ to: '/disputes', label: 'All Disputes' }],
  },
  {
    label: 'Finances',
    icon: <DollarSign size={18} />,
    links: [
      { to: '/finances', label: 'Overview' },
      { to: '/finances/transactions', label: 'Transactions' },
      { to: '/finances/payouts/users', label: 'User Payouts' },
      { to: '/finances/payouts/retailers', label: 'Retailer Payouts' },
    ],
  },
  {
    label: 'Settings',
    icon: <Settings size={18} />,
    links: [
      { to: '/settings', label: 'Platform Settings' },
      { to: '/settings/audit-log', label: 'Audit Log' },
    ],
  },
  {
    label: 'API Tests',
    icon: <FlaskConical size={18} />,
    links: [{ to: '/api-test', label: 'Test Panel' }],
    devOnly: true,
  },
]

function NavSectionItem({ section, onNav }: { section: NavSection; onNav?: () => void }) {
  const [open, setOpen] = useState(true)
  const hasMultipleLinks = section.links.length > 1

  if (!hasMultipleLinks) {
    return (
      <NavLink
        to={section.links[0].to}
        onClick={onNav}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-100',
          )
        }
      >
        {section.icon}
        {section.label}
      </NavLink>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          {section.icon}
          {section.label}
        </span>
        <ChevronDown
          size={14}
          className={clsx('transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="ml-7 mt-1 space-y-1">
          {section.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onNav}
              className={({ isActive }) =>
                clsx(
                  'block px-3 py-1.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleSignOut() {
    localStorage.removeItem('admin_token')
    navigate('/auth/login')
  }

  const filteredNav = navigation.filter((s) => !s.devOnly || import.meta.env.DEV)

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-indigo-700">Zewbie Admin</h1>
          <p className="text-xs text-gray-400">Management Portal</p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 rounded hover:bg-gray-100"
          aria-label="Close sidebar"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredNav.map((section) => (
          <NavSectionItem
            key={section.label}
            section={section}
            onNav={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 p-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold text-indigo-700">Zewbie Admin</h1>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
