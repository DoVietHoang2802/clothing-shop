import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import MainLayout from './layouts/MainLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import UserProfilePage from './pages/UserProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import WishlistPage from './pages/WishlistPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminCategoriesPage from './pages/Admin/AdminCategoriesPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminCouponsPage from './pages/Admin/AdminCouponsPage';

// Staff Pages
import StaffProductsPage from './pages/Staff/StaffProductsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Routes */}
            <Route
              path="/cart"
              element={
                <PrivateRoute allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                  <CartPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <PrivateRoute allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                  <MyOrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                  <UserProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <PrivateRoute allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                  <ChangePasswordPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                  <WishlistPage />
                </PrivateRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/products"
              element={
                <PrivateRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffProductsPage />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminCategoriesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminOrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminCouponsPage />
                </PrivateRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}><h1>404 - Trang Không Tìm Thấy</h1></div>} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
