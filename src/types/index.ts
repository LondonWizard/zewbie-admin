export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  avatar?: string
  phone?: string
  orders?: Array<{ id: string; total: number; status: string; createdAt: string }>
  stores?: Array<{ id: string; name: string; status: string }>
  activity?: Array<{ id: string; action: string; timestamp: string }>
}

export interface Retailer {
  id: string
  businessName: string
  email: string
  status: string
  tier: string
  verificationStatus: string
  createdAt: string
  phone?: string
  address?: string
  productCount?: number
  totalRevenue?: number
  description?: string
}

export interface Order {
  id: string
  orderNumber?: string
  customerName?: string
  customerEmail?: string
  total: number
  status: string
  createdAt: string
  itemCount?: number
  subtotal?: number
  tax?: number
  shipping?: number
  discount?: number
  updatedAt?: string
  customer?: { id: string; name: string; email: string }
  retailer?: { id: string; name: string }
  items?: OrderItem[]
  timeline?: TimelineEvent[]
  paymentMethod?: string
  paymentStatus?: string
  shippingAddress?: string
  trackingNumber?: string
  notes?: string
}

export interface OrderItem {
  id: string
  productName: string
  productId?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface TimelineEvent {
  id: string
  status: string
  message: string
  timestamp: string
}

export interface PaginationMeta {
  page: number
  totalPages: number
  totalItems?: number
  limit?: number
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  message?: string
}
