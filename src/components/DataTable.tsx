import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface Column<T> {
  header: string
  accessor: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number | ((p: number) => number)) => void
  emptyIcon?: ReactNode
  emptyMessage?: string
  keyExtractor: (item: T) => string
}

/** Reusable data table with loading skeletons, empty state, and pagination. */
export default function DataTable<T>({
  columns,
  data,
  loading,
  page,
  totalPages,
  onPageChange,
  emptyIcon,
  emptyMessage = 'No items found',
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`text-left px-4 py-3 font-medium text-gray-600 ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-gray-100 animate-pulse">
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {emptyIcon && <div className="mb-2">{emptyIcon}</div>}
                  <p className="text-gray-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.header} className={`px-4 py-3 ${col.className ?? ''}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange((p: number) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange((p: number) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
