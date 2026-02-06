import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  LogOut, 
  Zap, 
  Menu, 
  X, 
  User, 
  Settings, 
  Package, 
  ShoppingBag,
  Folder
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/messages', label: 'Mensagens', icon: MessageSquare },
    { path: '/admin/products', label: 'Produtos', icon: Package },
    { path: '/admin/categories', label: 'Categorias', icon: Folder },
    { path: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    { path: '/admin/integrations', label: 'Integrações', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#222998] text-white">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Zap size={24} className="text-primary" />
            </div>
            <div>
              <span className="font-black text-lg uppercase tracking-wider">Eletrostart</span>
              <p className="text-xs text-white/60">Painel Admin</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive(item.path)
                    ? 'bg-white text-primary'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-all font-bold"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#222998] text-white z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Zap size={24} />
          <span className="font-black uppercase">Eletrostart</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#222998] text-white pt-16">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive(item.path)
                        ? 'bg-white text-primary'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-all font-bold"
              >
                <LogOut size={20} />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
