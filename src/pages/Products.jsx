import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, ShoppingCart, ChevronRight, ChevronDown, LayoutGrid, List, SlidersHorizontal, Plus, Eye, X, Package } from "lucide-react";
import ProductCardWithVariants from "../components/ProductCardWithVariants";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { getCategoryIcon, CATEGORY_METADATA } from "../utils/categoryData.js";
import { getProductImage, PLACEHOLDER_IMAGE } from "../utils/productHelpers";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { addToCart } = useCart();

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch products (limit 1000 to get all for now) and categories
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts({ limit: 1000 }),
          api.getCategories()
        ]);

        if (categoriesRes.success) {
          // Merge API categories with local metadata (icons, subcategories)
          const mergedCategories = categoriesRes.data.map(cat => ({
            ...cat,
            icon: getCategoryIcon(cat.id),
            subcategories: CATEGORY_METADATA[cat.id]?.subcategories || []
          }));
          setCategories(mergedCategories);
        }

        if (productsRes.success && Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
          setFilteredProducts(productsRes.data);
        } else {
             // Fallback/log if success but data is not array
             console.warn("Products data is not an array:", productsRes);
             setProducts([]);
             setFilteredProducts([]);
        }

      } catch (err) {
        console.error("Error loading products:", err);
        setError("NÃ£o foi possÃ­vel carregar os produtos.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const searchParam = searchParams.get("search");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setExpandedCategory(categoryParam); // Expande a categoria quando vem da URL
    } else {
      setSelectedCategory("all");
    }

    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
    } else {
      setSelectedSubcategory("");
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Filter products
  useEffect(() => {
    if (loading) return;

    let result = (Array.isArray(products) ? products : []).filter(p => p != null);
    const filterParam = searchParams.get("filter");

    if (selectedCategory !== "all") {
      result = result.filter((product) => product && product.categoryId === selectedCategory);
    }

    if (selectedSubcategory) {
      result = result.filter((product) => product && product.subcategory === selectedSubcategory);
    }

    if (filterParam === "outlet") {
      // Simulate outlet: first 6 products
      result = result.slice(0, 6);
    } else if (filterParam === "offers") {
      // Simulate offers: products with price < 100
      result = result.filter(p => p && p.price < 100);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product &&
          product.name &&
          (product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query)))
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, selectedSubcategory, searchQuery, searchParams, products, loading]);

  // Handle ESC key to close quick view modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && quickViewProduct) {
        setQuickViewProduct(null);
      }
    };
    
    if (quickViewProduct) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [quickViewProduct]);

  // Toggle para expandir/colapsar subcategorias
  const handleCategoryToggle = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null); // Colapsa se jÃ¡ estÃ¡ expandido
    } else {
      setExpandedCategory(categoryId); // Expande a categoria
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(""); // Reset subcategory when changing category
    setSearchParams({ category: categoryId });
    setExpandedCategory(categoryId);
    setIsMobileFiltersOpen(false);
  };

  const handleSubcategoryChange = (categoryId, subcategoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    setSearchParams({ category: categoryId, subcategory: subcategoryId });
    setIsMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("");
    setSearchQuery("");
    setSearchParams({});
    setIsMobileFiltersOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Search Bar */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 hidden md:block">
              Nossos <span className="text-primary">Produtos</span>
            </h1>

            <div className="flex items-center gap-4 w-full md:w-auto flex-1 md:max-w-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="O que vocÃª procura?"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-0 rounded-xl transition-all font-medium text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      setSearchParams({ ...Object.fromEntries(searchParams), search: e.target.value });
                    } else {
                      const newParams = Object.fromEntries(searchParams);
                      delete newParams.search;
                      setSearchParams(newParams);
                    }
                  }}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              <button 
                className="md:hidden p-3 bg-gray-100 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setIsMobileFiltersOpen(true)}
                aria-label="Abrir filtros"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={18} />
                  Categorias
                </h3>
                {(selectedCategory !== "all" || searchQuery) && (
                  <button onClick={clearFilters} className="text-[10px] text-red-500 font-bold uppercase hover:underline">
                    Limpar
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Todos os Produtos
                </button>
                
                {categories.map((category) => (
                  <div key={category.id} className="mb-2">
                    <button
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                        selectedCategory === category.id
                          ? "bg-primary/5 text-primary"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {category.icon && <category.icon size={16} className={selectedCategory === category.id ? "text-primary" : "text-gray-400 group-hover:text-primary transition-colors"} />}
                        <span onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryChange(category.id);
                        }}>{category.name}</span>
                      </div>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ChevronRight 
                          size={14} 
                          className={`transition-transform duration-300 ${expandedCategory === category.id ? "rotate-90" : ""}`} 
                        />
                      )}
                    </button>
                    
                    {/* Subcategories */}
                    {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                      <div className="ml-9 mt-2 space-y-1 border-l-2 border-gray-100 pl-3">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryChange(category.id, sub.id)}
                            className={`w-full text-left py-1 text-xs transition-colors ${
                              selectedSubcategory === sub.id
                                ? "text-primary font-bold"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter Placeholder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Faixa de PreÃ§o
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-500">R$ 0</div>
                  <div className="text-gray-300">-</div>
                  <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-400">R$ 5.000</div>
                </div>
              </div>
            </div>

            {/* Promo Banner in Sidebar */}
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] group shadow-xl">
              <img src="https://images.unsplash.com/photo-1542332213-9b5a5a3fab35" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Promo" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-6 text-white text-center">
                <h4 className="font-black uppercase text-xl mb-4 leading-tight">Energia Solar<br/>Eletrostart</h4>
                <Link to="/contact" className="bg-white text-primary py-2 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-secondary hover:text-white transition-all shadow-lg">Solicitar OrÃ§amento</Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar for Mobile/Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex items-center justify-between gap-4">
              <div className="text-sm text-gray-500 font-medium">
                Mostrando <strong className="text-gray-900">{filteredProducts.length}</strong> produtos
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow text-primary" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow text-primary" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mb-6">Tente ajustar seus filtros ou busca.</p>
                <button onClick={clearFilters} className="text-primary font-bold hover:underline">
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" 
                : "flex flex-col gap-6"
              }>
                {filteredProducts.filter(product => product != null).map((product) => (
                  product.variants && product.variants.length > 0 ? (
                    // Use ProductCardWithVariants for products with variants
                    <ProductCardWithVariants 
                      key={product.id} 
                      product={product}
                      onAddToCart={(prod, variant) => addToCart(prod, 1, variant)}
                    />
                  ) : (
                    // Original card for products without variants
                    <div 
                      key={product.id} 
                      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex ${viewMode === "list" ? "flex-col md:flex-row h-auto" : "flex-col h-full"}`}
                    >
                      {/* Image Area */}
                      <div className={`relative overflow-hidden bg-white ${viewMode === "list" ? "w-full md:w-64 h-64 shrink-0" : "aspect-[4/3]"} border border-gray-100`}>
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        
                        {/* Quick View Button */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button 
                            onClick={() => setQuickViewProduct(product)}
                            aria-label="Ver detalhes do produto"
                            className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-gray-600 hover:text-primary transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          >
                            <Eye size={20} />
                          </button>
                        </div>

                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button 
                            onClick={() => addToCart(product)}
                            aria-label="Adicionar ao carrinho"
                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-primary hover:bg-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            title="Adicionar ao carrinho"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Info Area */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                            {categories.find(c => c.id === product.categoryId)?.name || product.category?.name || "Geral"}
                          </span>
                          <div className="flex items-center space-x-1 text-yellow-400">
                            <span className="text-xs font-bold text-gray-400 mr-1">4.8</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="flex items-baseline space-x-2 mb-4">
                            <span className="text-2xl font-black text-gray-900 font-mono">
                              {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">/{product.unit}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => addToCart(product)}
                              className="flex-1 bg-primary hover:bg-blue-800 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-primary/20 uppercase tracking-wider text-xs"
                            >
                              <ShoppingCart size={16} />
                              <span>Comprar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Pagination Placeholder */}
            {filteredProducts.length > 20 && (
               <div className="mt-16 flex justify-center items-center space-x-2">
                  <p className="text-gray-400 text-sm">Mostrando todos os produtos</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-80 bg-white h-full p-8 animate-slide-left overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase">Filtros</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-gray-400">
                <ChevronDown size={28} className="rotate-90" />
              </button>
            </div>
            
             <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Todos os Produtos
                </button>
                
                {categories.map((category) => (
                  <div key={category.id} className="mb-2">
                    <button
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? "text-primary font-bold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{category.name}</span>
                       {category.subcategories && category.subcategories.length > 0 && (
                        <ChevronRight 
                          size={14} 
                          className={`transition-transform duration-300 ${expandedCategory === category.id ? "rotate-90" : ""}`} 
                        />
                      )}
                    </button>
                     {/* Subcategories Mobile */}
                    {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-100 pl-3">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryChange(category.id, sub.id)}
                            className={`w-full text-left py-2 text-xs transition-colors ${
                              selectedSubcategory === sub.id
                                ? "text-primary font-bold"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
          </div>
        </div>
      )}
      {/* Quick View Modal for Regular Products */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setQuickViewProduct(null)}
              aria-label="Fechar"
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <X size={24} />
            </button>

            {/* Image */}
            <div className="p-4 bg-gray-50 flex items-center justify-center">
              <img
                src={getProductImage(quickViewProduct)}
                alt={quickViewProduct.name}
                loading="lazy"
                decoding="async"
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
              />
            </div>

            {/* Product Info */}
            <div className="p-6 bg-white border-t border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-2">{quickViewProduct.name}</h3>
              <p className="text-gray-500 text-sm mb-4 whitespace-normal break-words">{quickViewProduct.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {quickViewProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-sm text-gray-400 font-bold">/{quickViewProduct.unit}</span>
                </div>
                <button 
                  onClick={() => {
                    addToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="bg-primary hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all uppercase tracking-widest text-sm shadow-lg active:scale-95"
                >
                  <ShoppingCart size={18} />
                  <span>Adicionar ao Carrinho</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


import ErrorBoundary from "../components/ErrorBoundary";

const ProductsPage = () => (
  <ErrorBoundary>
    <Products />
  </ErrorBoundary>
);

export default ProductsPage;

