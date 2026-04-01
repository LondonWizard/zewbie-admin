export default function Dashboard() {
  const widgets = [
    'Platform Revenue',
    'Active Users',
    'Active Retailers',
    'Pending Approvals',
    'Open Disputes',
    'Order Volume Graph',
    'System Health',
    'Recent Activity',
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-4">Route: /dashboard</p>
      <p className="text-gray-600">Central overview of platform health, revenue, and key operational metrics.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget) => (
          <div
            key={widget}
            className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-500">{widget}</p>
            <p className="text-xs text-gray-400 mt-1">Widget placeholder</p>
          </div>
        ))}
      </div>
    </div>
  )
}
