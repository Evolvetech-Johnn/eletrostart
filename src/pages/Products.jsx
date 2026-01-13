import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, ShoppingCart, ChevronRight, ChevronDown, LayoutGrid, List, SlidersHorizontal, Plus } from "lucide-react";
import { categories, products as baseProducts, getProductImage, PLACEHOLDER_IMAGE } from "../data/products";
import { iluminacaoProducts } from "../data/iluminacaoProducts";
import ProductCardWithVariants from "../components/ProductCardWithVariants";
import { useCart } from "../context/CartContext";

// Combinar produtos base com produtos de iluminação
const allProducts = [...baseProducts, ...iluminacaoProducts];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const { addToCart } = useCart();

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
    let result = allProducts;
    const filterParam = searchParams.get("filter");

    if (selectedCategory !== "all") {
      result = result.filter((product) => product.category === selectedCategory);
    }

    if (selectedSubcategory) {
      result = result.filter((product) => product.subcategory === selectedSubcategory);
    }

    if (filterParam === "outlet") {
      // Simulate outlet: first 6 products
      result = result.slice(0, 6);
    } else if (filterParam === "offers") {
      // Simulate offers: products with price < 100
      result = result.filter(p => p.price < 100);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, selectedSubcategory, searchQuery, searchParams]);

  // Toggle para expandir/colapsar subcategorias
  const handleCategoryToggle = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null); // Colapsa se já está expandido
    } else {
      setExpandedCategory(categoryId); // Expande a categoria
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    if (categoryId === "all") {
      searchParams.delete("category");
      searchParams.delete("subcategory");
      setExpandedCategory(null);
    } else {
      searchParams.set("category", categoryId);
      searchParams.delete("subcategory");
      setExpandedCategory(categoryId);
    }
    setSearchParams(searchParams);
    setIsMobileFiltersOpen(false);
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    if (subcategoryId) {
      searchParams.set("subcategory", subcategoryId);
    } else {
      searchParams.delete("subcategory");
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      {/* Breadcrumbs & Title */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-xs text-gray-400 uppercase font-bold tracking-widest mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Início</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Produtos</span>
            {selectedCategory !== "all" && (
              <>
                <ChevronRight size={12} />
                <span className="text-primary">{categories.find(c => c.id === selectedCategory)?.name}</span>
              </>
            )}
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-3xl font-black text-gray-900 uppercase">
              {selectedCategory === "all" ? "Todos os Produtos" : categories.find(c => c.id === selectedCategory)?.name}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-medium">{filteredProducts.length} produtos encontrados</span>
              <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-gray-400"}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-gray-400"}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="space-y-8 sticky top-32">
              {/* Category Filter */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 pb-2 border-b border-gray-50 flex items-center justify-between">
                  Categorias
                  <Filter size={14} className="text-primary" />
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-between group ${
                      selectedCategory === "all" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>Todos</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedCategory === "all" ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}`}>{allProducts.length}</span>
                  </button>
                  {categories.map((category) => {
                    const isExpanded = expandedCategory === category.id;
                    const isSelected = selectedCategory === category.id;
                    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                    
                    return (
                    <div key={category.id}>
                      <div className="flex items-center">
                        {/* Botão principal da categoria - seleciona e filtra */}
                        <button
                          onClick={() => handleCategoryChange(category.id)}
                          className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-between group ${
                            isSelected ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="truncate">{category.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                            {allProducts.filter(p => p.category === category.id).length}
                          </span>
                        </button>
                        
                        {/* Botão de toggle para expandir/colapsar subcategorias */}
                        {hasSubcategories && (
                          <button
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`ml-1 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isExpanded ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      
                      {/* Subcategories - aparece quando expandido */}
                      {isExpanded && hasSubcategories && (
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-primary/20 pl-3 animate-fade-in">
                          <button
                            onClick={() => handleSubcategoryChange("")}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isSelected && !selectedSubcategory ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            Todas
                          </button>
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                if (selectedCategory !== category.id) {
                                  handleCategoryChange(category.id);
                                }
                                handleSubcategoryChange(sub.id);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                selectedSubcategory === sub.id ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              </div>

              {/* Price Range Filter (UI Placeholder) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 pb-2 border-b border-gray-50">Faixa de Preço</h3>
                <div className="space-y-4">
                  <input type="range" className="w-full accent-primary" min="0" max="5000" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-400">R$ 0</div>
                    <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-400">R$ 5.000</div>
                  </div>
                </div>
              </div>

              {/* Promo Banner in Sidebar */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] group shadow-xl">
                <img src="https://images.unsplash.com/photo-1542332213-9b5a5a3fab35" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-6 text-white text-center">
                  <h4 className="font-black uppercase text-xl mb-4 leading-tight">Energia Solar<br/>Eletrostart</h4>
                  <Link to="/contact" className="bg-white text-primary py-2 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-secondary hover:text-white transition-all shadow-lg">Solicitar Orçamento</Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar for Mobile/Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Pesquisar nesta categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-medium"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
              >
                <SlidersHorizontal size={20} />
              </button>
              <div className="hidden md:flex items-center space-x-4">
                <select className="bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 outline-none border border-transparent focus:border-primary transition-all">
                  <option>Destaques</option>
                  <option>Menor Preço</option>
                  <option>Maior Preço</option>
                  <option>A - Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" 
                : "flex flex-col gap-6"
              }>
                {filteredProducts.map((product) => (
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
                      <div className={`relative overflow-hidden bg-gray-50 ${viewMode === "list" ? "w-full md:w-64 h-64 shrink-0" : "aspect-square"}`}>
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button 
                            onClick={() => addToCart(product)}
                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-primary hover:bg-white transition-colors shadow-sm"
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
                            {categories.find(c => c.id === product.category)?.name}
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
                              className="flex-1 bg-[#222998] hover:bg-primary text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                            >
                              <ShoppingCart size={16} />
                              Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Search size={64} className="mx-auto text-gray-200 mb-6" />
                <h3 className="text-2xl font-black text-gray-900 uppercase mb-2">Sem resultados</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                  Não encontramos nada para sua busca. Tente mudar os filtros.
                </p>
                <button 
                  onClick={() => {setSearchQuery(""); setSelectedCategory("all");}}
                  className="bg-primary text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            )}

            {/* Pagination Placeholder */}
            {filteredProducts.length > 0 && (
              <div className="mt-16 flex justify-center items-center space-x-2">
                <button className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20">1</button>
                <button className="w-10 h-10 rounded-xl bg-white text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors border border-gray-100">2</button>
                <button className="w-10 h-10 rounded-xl bg-white text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors border border-gray-100">3</button>
                <div className="px-2 font-bold text-gray-300">...</div>
                <button className="w-10 h-10 rounded-xl bg-white text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors border border-gray-100">12</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal (Placeholder) */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-80 bg-white h-full p-8 animate-slide-left">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase">Filtros</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-gray-400">
                <ChevronDown size={28} className="rotate-90" />
              </button>
            </div>
            {/* Replicate Sidebar Content here for mobile if needed */}
            <p className="text-sm text-gray-500 italic">Os filtros de categorias e preços estão disponíveis aqui.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
