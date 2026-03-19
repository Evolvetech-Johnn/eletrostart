import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
// Removed unused imports: ShoppingCart, ChevronRight, ChevronDown, LayoutGrid, List, Plus, Eye, X, Package
import ProductCardWithVariants from "../components/ProductCardWithVariants";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import SEO from "../components/SEO";
import { productService, Product, Category } from "../services/productService";
import { getCategoryIcon, CATEGORY_METADATA } from "../utils/categoryData";
import { useCart } from "../context/CartContext";

interface CategoryWithMeta extends Category {
  icon: React.ElementType;
  subcategories?: string[];
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { addToCart } = useCart();

  // Function to load products based on current filters and page
  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const filterParam = searchParams.get("filter");
      let activeParam = true; // default active
      let limitParam = 20;
      
      if (filterParam === "outlet") {
         limitParam = 6;
      }
      
      const paramsToApi: any = {
        page: pagination.page,
        limit: limitParam,
        active: activeParam,
      };

      if (selectedCategory && selectedCategory !== "all") {
        paramsToApi.category = selectedCategory;
      }
      if (selectedSubcategory) {
        paramsToApi.subcategory = selectedSubcategory;
      }
      if (searchQuery) {
        paramsToApi.search = searchQuery;
      }
      
      // We pass the sortBy as sort parameter if backend supports it. For now frontend backend uses just 'orderBy' in some places, 
      // but lets pass sort if we need, or let backend do default sorting. The original code sorted locally.
      
      const res = await productService.getProductsPaginated(paramsToApi);
      
      if (res && res.data) {
        let sortedData = [...res.data];
        
        // As a fallback in case backend sorting is not fully implemented for all fields, we can still sort the returned page locally, 
        // though full backend sorting is ideal. Let's do local sorting on the page for now to maintain previous sort behaviors.
        if (sortBy === "price-asc") {
          sortedData.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
          sortedData.sort((a, b) => b.price - a.price);
        } else if (sortBy === "name-asc") {
          sortedData.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "name-desc") {
          sortedData.sort((a, b) => b.name.localeCompare(a.name));
        }
        
        setProducts(sortedData);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };

  // Load Categories ONCE
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        if (categoriesData) {
          const mergedCategories = categoriesData.map((cat) => ({
            ...cat,
            icon: getCategoryIcon(cat.slug || ""),
            subcategories: CATEGORY_METADATA[cat.id]?.subcategories || [],
          }));
          setCategories(mergedCategories);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Reload products whenever filters or page change
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy, pagination.page, searchParams]);

  // Sync state with URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const searchParam = searchParams.get("search");

    if (categoryParam) {
      // If we have categories loaded, we can check if it's an ID or Slug
      // But for simplicity, we assume the URL param is what we filter by.
      // Ideally we want to move to Slugs in URL.
      setSelectedCategory(categoryParam);
      setExpandedCategory(categoryParam);
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

  // Removido filterEffects locais pesados. A API já se encarrega disso.

  // Handle ESC key to close quick view modal - Removed as quickViewProduct is unused

  // Toggle para expandir/colapsar subcategorias
  // const handleCategoryToggle = (categoryId: string) => {
  //   if (expandedCategory === categoryId) {
  //     setExpandedCategory(null); // Colapsa se já está expandido
  //   } else {
  //     setExpandedCategory(categoryId); // Expande a categoria
  //   }
  // };

  // const handleCategoryChange = (categoryIdentifier: string) => {
  //   // categoryIdentifier can be ID or Slug.
  //   // Preferably we use Slug for URL.
  //   const category = categories.find(
  //     (c) => c.id === categoryIdentifier || c.slug === categoryIdentifier,
  //   );
  //   const valueToUse = category ? category.slug : categoryIdentifier;

  //   setSelectedCategory(valueToUse || "");
  //   setSelectedSubcategory(""); // Reset subcategory when changing category
  //   setSearchParams({ category: valueToUse || "" });
  //   setExpandedCategory(categoryIdentifier); // Keep expansion logic working (it uses the ID usually in the loop below)
  //   setIsMobileFiltersOpen(false);
  // };

  // const handleSubcategoryChange = (categoryId: string, subcategoryId: string) => {
  //   setSelectedCategory(categoryId);
  //   setSelectedSubcategory(subcategoryId);
  //   setSearchParams({ category: categoryId, subcategory: subcategoryId });
  //   setIsMobileFiltersOpen(false);
  // };

  // const clearFilters = () => {
  //   setSelectedCategory("all");
  //   setSelectedSubcategory("");
  //   setSearchQuery("");
  //   setSearchParams({});
  //   setIsMobileFiltersOpen(false);
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white border-b mb-8 p-4 rounded-xl">
            <div className="h-10 bg-gray-200 rounded w-full md:w-1/3 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Catálogo de Produtos"
        description="Explore nossa variedade de materiais elétricos, ferramentas e automação. As melhores marcas com os melhores preços."
      />
      {/* Header / Search Bar */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="layout-container py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 hidden md:block">
              Nossos <span className="text-primary">Produtos</span>
            </h1>

            <div className="flex items-center gap-4 w-full md:w-auto flex-1 md:max-w-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="O que você procura?"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-0 rounded-xl transition-all font-medium text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      setSearchParams({
                        ...Object.fromEntries(searchParams),
                        search: e.target.value,
                      });
                    } else {
                      const newParams = Object.fromEntries(searchParams);
                      delete newParams.search;
                      setSearchParams(newParams);
                    }
                  }}
                />
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>

              {/* Sort Select */}
              <div className="relative hidden md:block min-w-[200px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-0 rounded-xl py-3 pl-4 pr-10 text-sm font-medium cursor-pointer"
                >
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name-asc">A - Z</option>
                  <option value="name-desc">Z - A</option>
                </select>
                <SlidersHorizontal
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
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

      <div className="layout-container py-8">
        {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCardWithVariants
                key={product.id}
                product={product}
                onAddToCart={(p, v) => addToCart(p, 1, v)}
              />
            ))}
          </div>

          {/* Empty State */}
          {products.length === 0 && !loading && (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Tente ajustar os filtros ou buscar por outros termos.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Página Anterior"
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-1 mx-4">
                <span className="text-sm font-medium text-gray-700">Página</span>
                <span className="text-sm font-black text-primary">{pagination.page}</span>
                <span className="text-sm font-medium text-gray-500">de {pagination.totalPages}</span>
              </div>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Próxima Página"
              >
                Próxima
              </button>
            </div>
          )}
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-4/5 h-full p-6 overflow-y-auto shadow-xl transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>

            {/* Mobile Categories - using existing state */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800">Categorias</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setIsMobileFiltersOpen(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <button
                      onClick={() => {
                        if (expandedCategory === cat.id) {
                          setExpandedCategory(null);
                        } else {
                          setExpandedCategory(cat.id);
                        }
                      }}
                      className="flex items-center justify-between w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(cat.slug || cat.id);
                          setIsMobileFiltersOpen(false);
                        }}
                      >
                        {cat.name}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
