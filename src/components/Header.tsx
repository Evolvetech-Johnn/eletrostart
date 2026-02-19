import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  Mail,
  Search,
  User,
  ShoppingCart,
  Mic,
  LucideIcon,
} from "lucide-react";
import logo from "../assets/logoeletrostart.png";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productService, Category } from "../services/productService";
import { getCategoryIcon, CATEGORY_METADATA } from "../utils/categoryData";
import MainNav from "./Navigation/MainNav";

interface HeaderCategory extends Category {
  icon: LucideIcon;
  subcategories: any[]; // Define a proper type if subcategories structure is known
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<HeaderCategory[]>([]);
  const navigate = useNavigate();
  const { cartItemCount, cartTotal, toggleCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        if (categoriesData) {
          const mergedCategories = categoriesData.map((cat) => ({
            ...cat,
            // icon is a Component
            icon: getCategoryIcon(cat.slug || cat.id),
            subcategories:
              // @ts-ignore - CATEGORY_METADATA might be empty initially
              CATEGORY_METADATA[cat.slug || cat.id]?.subcategories || [],
          }));
          setCategories(mergedCategories);
        }
      } catch (err) {
        console.error("Error fetching categories for header:", err);
      }
    };
    fetchCategories();
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    setIsMenuOpen(false);
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <header className="fixed w-full z-50 shadow-sm bg-white">
      {/* Top Bar */}
      <div className="bg-[#222998] text-white py-2 text-xs">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <span className="font-medium">(43) 3029-5020</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Mail size={14} />
              <span className="font-medium">contato@eletrostart.com.br</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <span className="font-semibold uppercase tracking-wider">
              Frete Grátis acima de R$ 299*
            </span>
          </div>
          <div className="flex items-center space-x-4 uppercase font-bold text-[10px]">
            <Link to="/about" className="hover:underline">
              Quem Somos
            </Link>
            <Link to="/contact" className="hover:underline">
              Atendimento
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-100">
        <div className="layout-container py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            <img
              src={logo}
              alt="Eletrostart Logo"
              className="h-[52px] md:h-[73px] w-auto"
            />
            <span className="text-2xl md:text-3xl font-black text-[#222998] tracking-tight uppercase">
              ELETROSTART
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl order-3 lg:order-none w-full lg:w-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as typeof e.target & {
                  search: { value: string };
                };
                const query = target.search.value;
                if (query) navigate(`/products?search=${query}`);
              }}
              className="relative group"
            >
              <input
                type="text"
                name="search"
                placeholder="O que você está procurando?"
                className="w-full bg-gray-100 border border-transparent focus:border-primary focus:bg-white px-4 py-2.5 rounded-md outline-none transition-all pr-12 text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-gray-400">
                <Mic
                  size={18}
                  className="cursor-pointer hover:text-primary transition-colors"
                />
                <button type="submit">
                  <Search
                    size={20}
                    className="cursor-pointer hover:text-primary transition-colors"
                  />
                </button>
              </div>
            </form>
          </div>

          {/* User & Cart Icons */}
          <div className="flex items-center space-x-6">
            <Link
              to="/account"
              aria-label="Minha Conta"
              className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors"
            >
              <User size={24} />
              <div className="hidden sm:block text-left leading-none">
                <span className="text-[10px] block opacity-70 uppercase font-bold">
                  Olá, visitante!
                </span>
                <span className="text-xs font-bold block">Minha Conta</span>
              </div>
            </Link>

            <button
              onClick={toggleCart}
              aria-label="Meu Carrinho"
              className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <span className="text-[10px] block opacity-70 uppercase font-bold">
                  Meu Carrinho
                </span>
                <span className="text-xs font-bold block">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-700 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu (Desktop) */}
      <div className="hidden lg:block bg-white border-b border-gray-100 shadow-sm">
        <div className="layout-container">
          <nav className="flex items-center space-x-2">
            <MainNav />
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-36 px-4 pb-4 overflow-y-auto">
          <nav className="flex flex-col space-y-4">
            <div className="font-bold text-lg text-gray-800 border-b pb-2">
              Departamentos
            </div>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className="w-full text-left py-2 text-gray-600 hover:text-primary flex items-center space-x-3"
                  >
                    {React.createElement(category.icon, { size: 20 })}
                    <span>{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 space-y-3">
              <Link
                to="/"
                className="block text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Ofertas
              </Link>
              <Link
                to="/contact"
                className="block text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Fale Conosco
              </Link>
              <Link
                to="/account"
                className="block text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Minha Conta
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
