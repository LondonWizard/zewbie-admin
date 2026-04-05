/** Returns Tailwind classes for a given status string. */
export function statusBadge(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    delivered: 'bg-green-100 text-green-700',
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    investigating: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    scheduled: 'bg-blue-100 text-blue-700',
    suspended: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
    escalated: 'bg-red-100 text-red-700',
    open: 'bg-amber-100 text-amber-700',
    closed: 'bg-gray-100 text-gray-600',
    resolved: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    draft: 'bg-gray-100 text-gray-600',
    archived: 'bg-red-100 text-red-600',
    refunded: 'bg-gray-100 text-gray-600',
    unpaid: 'bg-red-100 text-red-700',
  }
  return map[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
}

/** Returns Tailwind classes for a priority badge. */
export function priorityBadge(priority: string): string {
  const map: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-800',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
  }
  return map[priority?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
}

/** Returns Tailwind classes for a retailer tier badge. */
export function tierBadge(tier: string): string {
  const map: Record<string, string> = {
    gold: 'bg-yellow-100 text-yellow-700',
    silver: 'bg-gray-200 text-gray-700',
    bronze: 'bg-orange-100 text-orange-700',
    basic: 'bg-gray-100 text-gray-600',
  }
  return map[tier?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
}
