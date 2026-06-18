import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '@/app/routes/index.tsx'
import Login from '@/app/routes/login.tsx'
import ProductsList from '@/app/routes/products/index.tsx'
import ProductDetail from '@/app/routes/products/$id.tsx'
import ProductNew from '@/app/routes/products/new.tsx'
import InventoryPage from '@/app/routes/inventory/index.tsx'
import TransfersPage from '@/app/routes/inventory/transfers.tsx'
import OrdersList from '@/app/routes/orders/index.tsx'
import OrderDetail from '@/app/routes/orders/$id.tsx'
import BatchOrders from '@/app/routes/orders/batch.tsx'
import AnalyticsPage from '@/app/routes/analytics/index.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<ProductsList />} />
      <Route path="/products/new" element={<ProductNew />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/inventory/transfers" element={<TransfersPage />} />
      <Route path="/orders" element={<OrdersList />} />
      <Route path="/orders/batch" element={<BatchOrders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
