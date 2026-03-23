import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layout/Layout";
import Home from "./pages/Home"; // Keep Home eager for LCP
import ScrollToTop from "./components/ScrollToTop";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./pages/admin/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import NotFound from "./pages/NotFound";

// Public Pages (Lazy Loaded)
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Account = lazy(() => import("./pages/Account"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const WorkWithUs = lazy(() => import("./pages/WorkWithUs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));

// Admin Pages (Lazy Loaded)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminMessageDetail = lazy(
  () => import("./pages/admin/AdminMessageDetail"),
);
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("./pages/admin/AdminCustomerDetail"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const NewOrderPage = lazy(() => import("./pages/admin/Orders/NewOrderPage"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAuditLogs = React.lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminStockMovements = lazy(
  () => import("./pages/admin/AdminStockMovements"),
);

// Executive Pages (SUPER_ADMIN only)
const AdminExecutive = lazy(() => import("./pages/admin/AdminExecutive"));
const AdminExecutiveFinancial = lazy(() => import("./pages/admin/AdminExecutiveFinancial"));
const AdminExecutiveInventory = lazy(() => import("./pages/admin/AdminExecutiveInventory"));
const AdminExecutiveCustomers = lazy(() => import("./pages/admin/AdminExecutiveCustomers"));
const AdminExecutiveProfitability = lazy(() => import("./pages/admin/AdminExecutiveProfitability"));

// Admin Loading Component (Full Screen)
const AdminLoading = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      <div className="absolute top-0 left-0 animate-pulse h-16 w-16 rounded-full bg-primary/10"></div>
    </div>
    <p className="mt-4 text-slate-600 font-medium animate-pulse">Carregando painel...</p>
  </div>
);

// Public Loading Component (Inside Layout)
const PublicLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-right" />
          <ScrollToTop />
          <Suspense fallback={null}>
            <Routes>
              {/* Admin Routes - Outside Layout (no header/footer) */}
              <Route
                path="/admin/*"
                element={
                  <Suspense fallback={<AdminLoading />}>
                    <Routes>
                      <Route
                        path="/"
                        element={<Navigate to="/admin/login" replace />}
                      />
                      <Route path="/login" element={<AdminLogin />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analytics"
                        element={
                          <ProtectedRoute>
                            <AdminAnalytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/messages"
                        element={
                          <ProtectedRoute>
                            <AdminMessages />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/messages/:id"
                        element={
                          <ProtectedRoute>
                            <AdminMessageDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/integrations"
                        element={
                          <ProtectedRoute>
                            <AdminIntegrations />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Store Routes */}
                      <Route
                        path="/products"
                        element={
                          <ProtectedRoute>
                            <AdminProducts />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/products/new"
                        element={
                          <ProtectedRoute>
                            <AdminProductForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/products/:id"
                        element={
                          <ProtectedRoute>
                            <AdminProductForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/categories"
                        element={
                          <ProtectedRoute>
                            <AdminCategories />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customers"
                        element={
                          <ProtectedRoute>
                            <AdminCustomers />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customers/new"
                        element={
                          <ProtectedRoute>
                            <AdminCustomerDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customers/:id"
                        element={
                          <ProtectedRoute>
                            <AdminCustomerDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <AdminOrders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders/new"
                        element={
                          <ProtectedRoute>
                            <NewOrderPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders/:id"
                        element={
                          <ProtectedRoute>
                            <AdminOrderDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users"
                        element={
                          <ProtectedRoute>
                            <AdminUsers />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/audit"
                        element={
                          <ProtectedRoute>
                            <AdminAuditLogs />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/stock-movements"
                        element={
                          <ProtectedRoute>
                            <AdminStockMovements />
                          </ProtectedRoute>
                        }
                      />

                      {/* Executive Routes - SUPER_ADMIN only */}
                      <Route
                        path="/executive"
                        element={
                          <ProtectedRoute>
                            <AdminExecutive />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/executive/financial"
                        element={
                          <ProtectedRoute>
                            <AdminExecutiveFinancial />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/executive/inventory"
                        element={
                          <ProtectedRoute>
                            <AdminExecutiveInventory />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/executive/customers"
                        element={
                          <ProtectedRoute>
                            <AdminExecutiveCustomers />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/executive/profitability"
                        element={
                          <ProtectedRoute>
                            <AdminExecutiveProfitability />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Suspense>
                }
              />

              {/* Public Routes - Inside Layout (with header/footer) */}
              <Route
                path="/*"
                element={
                  <Layout>
                    <Suspense fallback={<PublicLoading />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/products" element={<Products />} />
                        <Route
                          path="/product/:id"
                          element={<ProductDetail />}
                        />
                        <Route path="/account" element={<Account />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/work-with-us" element={<WorkWithUs />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/returns" element={<Returns />} />
                        <Route path="/cookies" element={<Cookies />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route
                          path="/meu-pedido/:id"
                          element={<OrderStatus />}
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                }
              />
            </Routes>
          </Suspense>
          <CartDrawer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
