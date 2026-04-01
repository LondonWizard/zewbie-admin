import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import AuthLayout from './layouts/AuthLayout'

import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import Dashboard from './pages/Dashboard'

import UserList from './pages/users/UserList'
import UserDetail from './pages/users/UserDetail'

import RetailerList from './pages/retailers/RetailerList'
import RetailerDetail from './pages/retailers/RetailerDetail'
import RetailerApprovals from './pages/retailers/RetailerApprovals'

import ProductList from './pages/catalog/ProductList'
import ProductDetail from './pages/catalog/ProductDetail'
import ProductApprovals from './pages/catalog/ProductApprovals'
import Categories from './pages/catalog/Categories'
import CategoryDetail from './pages/catalog/CategoryDetail'
import Attributes from './pages/catalog/Attributes'

import OrderList from './pages/orders/OrderList'
import OrderDetail from './pages/orders/OrderDetail'

import DisputeList from './pages/disputes/DisputeList'
import DisputeDetail from './pages/disputes/DisputeDetail'

import FinanceOverview from './pages/finances/FinanceOverview'
import Transactions from './pages/finances/Transactions'
import UserPayouts from './pages/finances/UserPayouts'
import RetailerPayouts from './pages/finances/RetailerPayouts'

import Settings from './pages/settings/Settings'
import AuditLog from './pages/settings/AuditLog'

import ApiTestPanel from './pages/ApiTestPanel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes — centered layout, no sidebar */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Admin routes — sidebar layout */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetail />} />

          <Route path="/retailers" element={<RetailerList />} />
          <Route path="/retailers/approvals" element={<RetailerApprovals />} />
          <Route path="/retailers/:id" element={<RetailerDetail />} />

          <Route path="/catalog/products" element={<ProductList />} />
          <Route path="/catalog/products/approvals" element={<ProductApprovals />} />
          <Route path="/catalog/products/:id" element={<ProductDetail />} />
          <Route path="/catalog/categories" element={<Categories />} />
          <Route path="/catalog/categories/:id" element={<CategoryDetail />} />
          <Route path="/catalog/attributes" element={<Attributes />} />

          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          <Route path="/disputes" element={<DisputeList />} />
          <Route path="/disputes/:id" element={<DisputeDetail />} />

          <Route path="/finances" element={<FinanceOverview />} />
          <Route path="/finances/transactions" element={<Transactions />} />
          <Route path="/finances/payouts/users" element={<UserPayouts />} />
          <Route path="/finances/payouts/retailers" element={<RetailerPayouts />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/audit-log" element={<AuditLog />} />

          <Route path="/api-test" element={<ApiTestPanel />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
