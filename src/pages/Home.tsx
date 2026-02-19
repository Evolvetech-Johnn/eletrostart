import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { productService, Product, Category } from "../services/productService";
import { getCategoryIcon } from "../utils/categoryData";
import { getProductImage, PLACEHOLDER_IMAGE } from "../utils/productHelpers";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import SEO from "../components/SEO";
import chuveiros from "../assets/chuveiros.png";
import iluminacaoModerna from "../assets/iluminacao-moderna.png";
import ferramentasProfissionais from "../assets/ferramentas-profissionais.png";
import torneirasModernas from "../assets/torneiras-modernas.png";

interface HeroSlide {
  id: string | number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

interface CategoryWithIcon extends Category {
  icon: React.ElementType;
}

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const slides: HeroSlide[] = [
    {
      id: "iluminacao",
      image: iluminacaoModerna,
      title: "ILUMINAÇÃO MODERNA",
      subtitle: "Transforme cada ambiente",
      link: "/products?category=iluminacao",
    },
    {
      id: "chuveiros",
      image: chuveiros,
      title: "CHUVEIROS",
      subtitle: "Conforto e eficiência",
      link: "/products?category=chuveiros-e-torneiras",
    },
    {
      id: "ferramentas",
      image: ferramentasProfissionais,
      title: "FERRAMENTAS",
      subtitle: "Potência e precisão",
      link: "/products?category=ferramentas",
    },
    {
      id: "torneiras",
      image: torneirasModernas,
      title: "TORNEIRAS",
      subtitle: "Design e funcionalidade",
      link: "/products?category=chuveiros-e-torneiras",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Increase limit to ensure we have variety for the slider
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts({ limit: 20 }),
          productService.getCategories(),
        ]);

        let loadedCategories: CategoryWithIcon[] = [];
        if (categoriesData && Array.isArray(categoriesData)) {
          loadedCategories = categoriesData.map((cat) => ({
            ...cat,
            icon: getCategoryIcon(cat.slug || ""), // Changed to use slug as primary or fallback
          }));
          setCategories(loadedCategories);
        }

        if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
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
  const activeSlides = slides;

  const getCategoryName = (product: Product) => {
    if (product.category?.name) return product.category.name;
    if (product.categoryId) {
      const cat = categories.find((c) => c.id === product.categoryId);
      return cat ? cat.name : "Geral";
    }
    return "Geral";
  };

  return (
    <div className="bg-gray-50 pb-16">
      <SEO
        title="Home"
        description="Bem-vindo à EletroStart! Encontre os melhores materiais elétricos e automação para sua casa ou empresa."
      />
      {/* Hero Slider */}
      <section className="relative h-[320px] sm:h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden group">
        {activeSlides.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
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
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase mb-4 tracking-tighter drop-shadow-lg">
                {banner.title}
              </h1>
              <p className="text-base sm:text-lg md:text-2xl font-light mb-8 drop-shadow-md italic">
                {banner.subtitle}
              </p>
              <Link
                to={banner.link || "/products"}
                className="bg-primary hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
              >
                Confira Agora
              </Link>
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + activeSlides.length) % activeSlides.length,
            )
          }
          aria-label="Slide anterior"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
          }
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
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase">
              Destaques da Semana
            </h2>
            <p className="text-gray-500 mt-1 italic">
              As melhores ofertas selecionadas para você
            </p>
          </div>
          <Link
            to="/products"
            className="text-primary font-bold hover:underline uppercase text-sm tracking-widest hidden md:block"
          >
            Ver tudo
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white border-b border-gray-100">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded italic">
                    OFERTA
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    {getCategoryName(product)}
                  </p>
                  <h3 className="font-bold text-gray-800 text-lg mb-4 line-clamp-2 h-14">
                    {product.name}
                  </h3>
                  {product.code && (
                    <div className="mb-2">
                      <span className="inline-block bg-gray-50 text-gray-500 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-gray-100">
                        COD: {product.code}
                      </span>
                    </div>
                  )}
                  <div className="mt-auto">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-gray-400 line-through text-xs font-medium">
                        R$ {(product.price * 1.2).toFixed(2)}
                      </span>
                      <span className="text-2xl font-black text-primary">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      no PIX ou Boleto
                    </p>

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
    </div>
  );
};

export default Home;
