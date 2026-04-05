import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

interface UseListPageOptions {
  /** API endpoint path, e.g. '/admin/users' */
  endpoint: string
  /** How many items per page (default 20) */
  limit?: number
  /** Extra query params from filters, e.g. { role: 'admin', status: 'active' } */
  filters?: Record<string, string>
  /** Key(s) in response body that contain the data array */
  dataKeys?: string[]
}

interface UseListPageReturn<T> {
  items: T[]
  loading: boolean
  error: string
  page: number
  totalPages: number
  search: string
  setSearch: (v: string) => void
  setPage: (v: number | ((p: number) => number)) => void
  handleSearch: (e: React.FormEvent) => void
  refresh: () => void
}

/** Shared hook that encapsulates the fetch/paginate/search/filter pattern for list pages. */
export function useListPage<T>(options: UseListPageOptions): UseListPageReturn<T> {
  const { endpoint, limit = 20, filters = {}, dataKeys = ['data'] } = options
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const filterString = JSON.stringify(filters)
  const dataKeysString = dataKeys.join('|')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params: Record<string, string | number> = { page, limit }
      if (search) params.search = search
      const parsedFilters = JSON.parse(filterString) as Record<string, string>
      for (const [k, v] of Object.entries(parsedFilters)) {
        if (v) params[k] = v
      }
      const res = await api.get(endpoint, { params })
      const data = res.data
      let found: T[] = []
      const keys = dataKeysString.split('|')
      for (const key of keys) {
        if (data?.[key]) {
          found = data[key]
          break
        }
      }
      if (found.length === 0 && Array.isArray(data)) found = data
      setItems(found)
      setTotalPages(data?.meta?.totalPages ?? data?.totalPages ?? 1)
    } catch {
      setError(`Failed to load data from ${endpoint}`)
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, limit, search, filterString, dataKeysString])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    handleSearch,
    refresh: fetchData,
  }
}
