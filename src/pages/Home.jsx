import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Info } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { getCategoryIcon } from "../utils/categoryData.js";
import { getProductImage, PLACEHOLDER_IMAGE } from "../utils/productHelpers";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();
  
  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=2069",
      title: "Iluminação Moderna",
      subtitle: "Transforme cada ambiente",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1558444479-c8af551b66b8?auto=format&fit=crop&q=80&w=1973",
      title: "Energia Solar",
      subtitle: "Economia e Sustentabilidade",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=2074",
      title: "Ferramentas Profissionais",
      subtitle: "As melhores marcas",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts({ limit: 8 }), // Fetch enough for both sections
          api.getCategories()
        ]);

        if (productsRes.success && Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
        }

        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          const mergedCategories = categoriesRes.data.map(cat => ({
            ...cat,
            icon: getCategoryIcon(cat.id)
          }));
          setCategories(mergedCategories);
        }
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const featuredProducts = products.slice(0, 4);
  const bestSellers = products.slice(4, 8);

  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero Slider */}
      <section className="relative h-[300px] md:h-[500px] overflow-hidden group">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-4">
              <h1 className="text-3xl md:text-6xl font-black uppercase mb-4 tracking-tighter drop-shadow-lg">
                {banner.title}
              </h1>
              <p className="text-lg md:text-2xl font-light mb-8 drop-shadow-md italic">
                {banner.subtitle}
              </p>
              <Link
                to="/products"
                className="bg-primary hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
              >
                Confira Agora
              </Link>
            </div>
          </div>
        ))}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          aria-label="Slide anterior"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          aria-label="Próximo slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={32} />
        </button>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 -mt-10 md:-mt-16 relative z-30">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:border-primary transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Category Image */}
                <div className="relative h-28 overflow-hidden">
                  <img 
                    src={cat.image || PLACEHOLDER_IMAGE}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="font-black text-white text-sm uppercase tracking-wider drop-shadow-lg line-clamp-2 leading-tight">
                      {cat.name}
                    </span>
                  </div>
                  {/* Icon badge */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-lg">
                    <Icon size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products (Destaques) */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10 pb-4 border-b-2 border-primary/10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase">Destaques da Semana</h2>
            <p className="text-gray-500 mt-1 italic">As melhores ofertas selecionadas para você</p>
          </div>
          <Link to="/products" className="text-primary font-bold hover:underline uppercase text-sm tracking-widest hidden md:block">
            Ver tudo
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-white border-b border-gray-100">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded italic">
                    OFERTA
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    {product.category?.name || product.categoryId || "Geral"}
                  </p>
                  <h3 className="font-bold text-gray-800 text-lg mb-4 line-clamp-2 h-14">{product.name}</h3>
                  <div className="mt-auto">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-gray-400 line-through text-xs font-medium">R$ {(product.price * 1.2).toFixed(2)}</span>
                      <span className="text-2xl font-black text-primary">R$ {product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">no PIX ou Boleto</p>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full mt-6 bg-primary hover:bg-blue-800 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors uppercase tracking-widest text-sm shadow-md"
                    >
                      <ShoppingCart size={18} />
                      <span>Comprar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner Row */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-64 rounded-3xl overflow-hidden group shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Iluminação"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex flex-col justify-center p-10 text-white">
              <h3 className="text-3xl font-black uppercase mb-2 leading-none">Novidades em<br/>Iluminação</h3>
              <p className="mb-6 opacity-90 italic">Design e tecnologia para sua casa</p>
              <Link to="/products?category=iluminacao" className="bg-white text-primary w-fit px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-colors shadow-lg">Confira</Link>
            </div>
          </div>
          <div className="relative h-64 rounded-3xl overflow-hidden group shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1592833159057-6bc82a2773b1?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Proteção"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#222998]/80 to-transparent flex flex-col justify-center p-10 text-white">
              <h3 className="text-3xl font-black uppercase mb-2 leading-none">Sua Casa<br/>Mais Segura</h3>
              <p className="mb-6 opacity-90 italic">Proteção elétrica certificada</p>
              <Link to="/products?category=protecao" className="bg-white text-[#222998] w-fit px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-colors shadow-lg">Saiba Mais</Link>
            </div>
          </div>
        </div>
      </section>

      {/* More Products (Mais Vendidos) */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10 pb-4 border-b-2 border-secondary/10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase">Mais Vendidos</h2>
            <p className="text-gray-500 mt-1 italic">Os preferidos dos nossos clientes</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-white border-b border-gray-100">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    {product.category?.name || product.categoryId || "Geral"}
                  </p>
                  <h3 className="font-bold text-gray-800 text-lg mb-4 line-clamp-2 h-14">{product.name}</h3>
                  <div className="mt-auto">
                    <span className="text-2xl font-black text-primary">R$ {product.price.toFixed(2)}</span>
                    <p className="text-[10px] text-gray-500 font-medium">no PIX ou Boleto</p>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full mt-6 border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all uppercase tracking-widest text-sm"
                    >
                      <ShoppingCart size={18} />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-16 mt-16 shadow-inner relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Info size={400} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-white text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 leading-none">Ficar por dentro<br/>de tudo agora!</h2>
              <p className="text-blue-100 italic">Assine nossa newsletter e receba ofertas exclusivas em primeira mão.</p>
            </div>
            <form className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="px-6 py-4 rounded-full w-full md:w-80 outline-none focus:ring-4 ring-blue-400/30 font-medium"
              />
              <button className="bg-secondary hover:bg-red-700 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105">Assinar</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
