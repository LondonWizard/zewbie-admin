import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  Store,
  Calendar,
  RefreshCw,
  Image,
} from 'lucide-react'
import api from '../../lib/api'
import { statusBadge } from '../../utils/badges'

interface ProductData {
  id: string
  name: string
  description?: string
  category?: string
  price: number
  compareAtPrice?: number
  status: string
  retailer?: string
  retailerId?: string
  images?: string[]
  inventory?: number
  sku?: string
  createdAt: string
  updatedAt?: string
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Admin - Product Detail'
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchProduct(controller.signal)
    return () => controller.abort()
  }, [id])

  async function fetchProduct(signal?: AbortSignal) {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/catalog/products/${id}`, { signal })
      setProduct(res.data?.data ?? res.data)
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      setError('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="p-6">
        <Link to="/catalog/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/catalog/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <button onClick={() => fetchProduct()} aria-label="Refresh product data" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {product?.images && product.images.length > 0 ? (
            <div className="space-y-2">
              {product.images.slice(0, 4).map((img, i) => (
                <img key={`img-${i}`} src={img} alt={`${product.name} image ${i + 1}`} className="w-full rounded-lg object-cover" />
              ))}
            </div>
          ) : (
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <Image size={40} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{product?.name || 'Unknown Product'}</h2>
                {product?.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>}
              </div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(product?.status ?? '')}`}>
                {product?.status}
              </span>
            </div>
            {product?.description && (
              <p className="text-sm text-gray-600 mt-3">{product.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><DollarSign size={12} /> Price</div>
              <p className="text-lg font-bold text-gray-900">${product?.price?.toFixed(2) ?? '0.00'}</p>
              {product?.compareAtPrice && (
                <p className="text-xs text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</p>
              )}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Package size={12} /> Inventory</div>
              <p className="text-lg font-bold text-gray-900">{product?.inventory ?? '—'}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Tag size={12} /> Category</div>
              <p className="text-sm font-medium text-gray-900">{product?.category ?? '—'}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Store size={12} /> Retailer</div>
              <p className="text-sm font-medium text-gray-900">
                {product?.retailerId ? (
                  <Link to={`/retailers/${product.retailerId}`} className="text-indigo-600 hover:text-indigo-800">
                    {product.retailer || product.retailerId}
                  </Link>
                ) : (
                  product?.retailer ?? '—'
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={14} /> Created: {product?.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—'}</span>
              {product?.updatedAt && (
                <span className="flex items-center gap-1"><Calendar size={14} /> Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
