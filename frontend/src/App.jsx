import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
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
import PaymentResultPage from './pages/PaymentResultPage';
import MockPaymentPage from './pages/MockPaymentPage';
import WithdrawalPage from './pages/WithdrawalPage';
import AddressPage from './pages/AddressPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ToastContainer } from './components/ToastNotification';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminCategoriesPage from './pages/Admin/AdminCategoriesPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminCouponsPage from './pages/Admin/AdminCouponsPage';
import AdminWithdrawalsPage from './pages/Admin/AdminWithdrawalsPage';

// Staff Pages
import StaffProductsPage from './pages/Staff/StaffProductsPage';
import StaffDashboard from './pages/Staff/StaffDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <MainLayout>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
            <Route path="/mock-payment" element={<MockPaymentPage />} />

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
            <Route
              path="/withdrawal"
              element={
                <PrivateRoute allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                  <WithdrawalPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/addresses"
              element={
                <PrivateRoute allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                  <AddressPage />
                </PrivateRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <PrivateRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/products"
              element={
                <PrivateRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffProductsPage />
                </PrivateRoute>
              }
            />

            {/* Admin/Staff Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'STAFF']}>
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
                <PrivateRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminCategoriesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'STAFF']}>
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
            <Route
              path="/admin/withdrawals"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminWithdrawalsPage />
                </PrivateRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}><h1>404 - Trang Không Tìm Thấy</h1></div>} />
          </Routes>
        </MainLayout>
        </NotificationProvider>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
}

export default App;
