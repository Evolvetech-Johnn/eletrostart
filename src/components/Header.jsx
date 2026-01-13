import React, { useState } from "react";
import { Menu, X, Phone, Mail, ChevronDown, Search, User, ShoppingCart, Mic } from "lucide-react";
import logo from "../assets/logoeletrostart.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { categories } from "../data/products";
import { useCart } from "../context/CartContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { cartItemCount, cartTotal, toggleCart } = useCart();

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const navLinkClass = ({ isActive }) =>
    `font-semibold text-sm transition-colors px-3 py-2 flex items-center gap-1 ${
      isActive ? "text-primary" : "text-gray-700 hover:text-primary"
    }`;

  const handleCategoryClick = (categoryId) => {
    setIsMenuOpen(false);
    setIsProductsDropdownOpen(false);
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
            <span className="font-semibold uppercase tracking-wider">Frete Grátis acima de R$ 299*</span>
          </div>
          <div className="flex items-center space-x-4 uppercase font-bold text-[10px]">
            <Link to="/about" className="hover:underline">Quem Somos</Link>
            <Link to="/contact" className="hover:underline">Atendimento</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            <img src={logo} alt="Eletrostart Logo" className="h-[52px] md:h-[73px] w-auto" />
            <span className="text-2xl md:text-3xl font-black text-[#222998] tracking-tight uppercase">ELETROSTART</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl order-3 lg:order-none w-full lg:w-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value;
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
                <Mic size={18} className="cursor-pointer hover:text-primary transition-colors" />
                <button type="submit">
                  <Search size={20} className="cursor-pointer hover:text-primary transition-colors" />
                </button>
              </div>
            </form>
          </div>

          {/* User & Cart Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/account" className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors">
              <User size={24} />
              <div className="hidden sm:block text-left leading-none">
                <span className="text-[10px] block opacity-70 uppercase font-bold">Olá, visitante!</span>
                <span className="text-xs font-bold block">Minha Conta</span>
              </div>
            </Link>
            
            <button 
              onClick={toggleCart}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <span className="text-[10px] block opacity-70 uppercase font-bold">Meu Carrinho</span>
                <span className="text-xs font-bold block">{formatPrice(cartTotal)}</span>
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
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2">
            <div className="relative group mr-4">
              <button className="flex items-center space-x-2 bg-primary text-white px-4 py-3 font-bold text-sm uppercase transition-colors hover:bg-blue-800">
                <Menu size={20} />
                <span>Todos os Departamentos</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left border-t-2 border-primary z-[60]">
                {categories.map((category) => (
                  <div key={category.id} className="relative group/sub">
                    <Link
                      to={`/products?category=${category.id}`}
                      className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary border-b border-gray-100 transition-colors"
                    >
                      <span>{category.name}</span>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ChevronDown size={14} className="-rotate-90 opacity-40" />
                      )}
                    </Link>
                    
                    {/* Submenu for subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="absolute left-full top-0 w-56 bg-white shadow-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 border-l-2 border-primary z-[70]">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/products?category=${category.id}&subcategory=${sub.id}`}
                            className="block px-5 py-3 text-sm text-gray-700 hover:bg-primary hover:text-white border-b border-gray-100 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <NavLink to="/" className={navLinkClass}>INÍCIO</NavLink>
            <NavLink to="/products" className={navLinkClass}>PRODUTOS</NavLink>
            <NavLink to="/services" className={navLinkClass}>SERVIÇOS</NavLink>
            <NavLink to="/contact" className={navLinkClass}>CONTATO</NavLink>
            <div className="flex-grow"></div>
            <div className="flex items-center space-x-4 text-[#222998] font-bold text-xs uppercase italic">
              <Link to="/products?filter=outlet" className="hover:text-black transition-colors">Outlet</Link>
              <Link to="/products?filter=offers" className="hover:text-black transition-colors">Ofertas do Dia</Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] bg-white z-[100] overflow-y-auto pb-20">
          <div className="flex flex-col">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex items-center justify-between px-6 py-4 text-gray-700 border-b border-gray-50 active:bg-gray-100 transition-colors"
              >
                <span className="font-semibold uppercase text-xs tracking-wider">{category.name}</span>
                <ChevronDown size={18} className="-rotate-90 opacity-40" />
              </button>
            ))}
            <div className="mt-4 px-6 space-y-4">
              <Link to="/" className="block py-2 text-primary font-bold uppercase text-sm" onClick={() => setIsMenuOpen(false)}>Início</Link>
              <Link to="/products" className="block py-2 text-gray-700 font-bold uppercase text-sm" onClick={() => setIsMenuOpen(false)}>Produtos</Link>
              <Link to="/services" className="block py-2 text-gray-700 font-bold uppercase text-sm" onClick={() => setIsMenuOpen(false)}>Serviços</Link>
              <Link to="/about" className="block py-2 text-gray-700 font-bold uppercase text-sm" onClick={() => setIsMenuOpen(false)}>Sobre Nós</Link>
              <Link to="/contact" className="block py-2 text-center bg-secondary text-white rounded-md py-3 font-bold shadow-md uppercase text-sm" onClick={() => setIsMenuOpen(false)}>Fale Conosco</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
