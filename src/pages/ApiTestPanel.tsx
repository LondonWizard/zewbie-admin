import { useState, useEffect } from 'react'
import api from '../lib/api'

interface TestResult {
  endpoint: string
  method: string
  status: number | null
  data: unknown
  error: string | null
  timestamp: string
}

const SERVICE_CHECKS = ['API', 'Database', 'Redis', 'S3'] as const

const ENDPOINT_GROUPS = [
  {
    label: 'System',
    endpoints: [{ method: 'GET', path: '/system/health', description: 'Health check' }],
  },
  {
    label: 'Auth',
    endpoints: [
      { method: 'POST', path: '/auth/login', description: 'Admin login' },
      { method: 'POST', path: '/auth/register', description: 'Register' },
      { method: 'POST', path: '/auth/refresh', description: 'Token refresh' },
    ],
  },
  {
    label: 'Users',
    endpoints: [
      { method: 'GET', path: '/users', description: 'List users' },
      { method: 'GET', path: '/users/1', description: 'Get user by ID' },
    ],
  },
  {
    label: 'Retailers',
    endpoints: [
      { method: 'GET', path: '/retailers', description: 'List retailers' },
      { method: 'GET', path: '/retailers/1', description: 'Get retailer by ID' },
    ],
  },
  {
    label: 'Products',
    endpoints: [
      { method: 'GET', path: '/products', description: 'List products' },
      { method: 'GET', path: '/products/1', description: 'Get product by ID' },
    ],
  },
  {
    label: 'Orders',
    endpoints: [
      { method: 'GET', path: '/orders', description: 'List orders' },
      { method: 'GET', path: '/orders/1', description: 'Get order by ID' },
    ],
  },
  {
    label: 'Categories',
    endpoints: [
      { method: 'GET', path: '/categories', description: 'List categories' },
    ],
  },
] as const

export default function ApiTestPanel() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [serviceHealth, setServiceHealth] = useState<Record<string, 'up' | 'down' | 'unknown'>>(
    Object.fromEntries(SERVICE_CHECKS.map((s) => [s, 'unknown' as const])),
  )

  useEffect(() => {
    document.title = 'Admin - API Test Panel'
  }, [])

  async function runTest(method: string, path: string) {
    const key = `${method} ${path}`
    setLoading(key)
    try {
      const response = method === 'GET'
        ? await api.get(path)
        : await api.post(path, {})
      const result: TestResult = {
        endpoint: key,
        method,
        status: response.status,
        data: response.data,
        error: null,
        timestamp: new Date().toISOString(),
      }
      setResults((prev) => [result, ...prev])

      if (path === '/system/health' && response.data) {
        setServiceHealth({
          API: 'up',
          Database: response.data.database ? 'up' : 'down',
          Redis: response.data.redis ? 'up' : 'down',
          S3: response.data.s3 ? 'up' : 'down',
        })
      }
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data: unknown }; message: string }
      const result: TestResult = {
        endpoint: key,
        method,
        status: error.response?.status ?? null,
        data: error.response?.data ?? null,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
      setResults((prev) => [result, ...prev])

      if (path === '/system/health') {
        setServiceHealth({
          API: 'down',
          Database: 'unknown',
          Redis: 'unknown',
          S3: 'unknown',
        })
      }
    } finally {
      setLoading(null)
    }
  }

  const statusColor = (s: 'up' | 'down' | 'unknown') => {
    if (s === 'up') return 'bg-green-100 text-green-800'
    if (s === 'down') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">API Test Panel</h1>
      <p className="text-gray-500 mb-4">Route: /api-test</p>
      <p className="text-gray-600 mb-6">
        Test API connectivity and endpoint responses. Base URL:{' '}
        <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">
          {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
        </code>
      </p>

      {/* Service Health */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Service Health</h2>
        <div className="flex gap-3">
          {SERVICE_CHECKS.map((service) => (
            <div
              key={service}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusColor(serviceHealth[service])}`}
            >
              {service}: {serviceHealth[service]}
            </div>
          ))}
        </div>
      </section>

      {/* Connection Test */}
      <section className="mb-8">
        <button
          onClick={() => runTest('GET', '/system/health')}
          disabled={loading !== null}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading === 'GET /system/health' ? 'Testing...' : 'Test Connection'}
        </button>
      </section>

      {/* Endpoint Groups */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">CRUD Tests</h2>
        <div className="space-y-4">
          {ENDPOINT_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{group.label}</h3>
              <div className="flex flex-wrap gap-2">
                {group.endpoints.map((ep) => {
                  const key = `${ep.method} ${ep.path}`
                  return (
                    <button
                      key={key}
                      onClick={() => runTest(ep.method, ep.path)}
                      disabled={loading !== null}
                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      <span
                        className={`text-xs font-mono font-bold ${
                          ep.method === 'GET' ? 'text-green-600' : 'text-amber-600'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-gray-600">{ep.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Response Display */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Responses{' '}
          {results.length > 0 && (
            <button
              onClick={() => setResults([])}
              className="text-xs font-normal text-gray-400 hover:text-gray-600 ml-2"
            >
              Clear
            </button>
          )}
        </h2>
        {results.length === 0 ? (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-400">No responses yet — click a test button above</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((r) => (
              <div
                key={r.timestamp}
                className={`p-3 rounded-lg border text-sm ${
                  r.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-medium">{r.endpoint}</span>
                  <span className="text-xs text-gray-400">
                    {r.status && `${r.status} · `}
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {r.error && <p className="text-red-600 text-xs mb-1">{r.error}</p>}
                <pre className="text-xs text-gray-700 overflow-x-auto max-h-32">
                  {JSON.stringify(r.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
