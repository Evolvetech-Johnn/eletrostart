import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
// Removed unused imports: ShoppingCart, ChevronRight, ChevronDown, LayoutGrid, List, Plus, Eye, X, Package
import ProductCardWithVariants from "../components/ProductCardWithVariants";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import SEO from "../components/SEO";
import { productService, Product, Category } from "../services/productService";
import { getCategoryIcon, CATEGORY_METADATA } from "../utils/categoryData";
// Removed unused: getProductImage, PLACEHOLDER_IMAGE

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  // Unused state: viewMode, quickViewProduct
  // const [viewMode, setViewMode] = useState("grid");
  // const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  // const { addToCart } = useCart(); // Unused in this file directly

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch products (limit 1000 to get all for now) and categories
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts({ limit: 1000 }),
          productService.getCategories(),
        ]);

        if (categoriesData) {
          // Merge API categories with local metadata (icons, subcategories)
          const mergedCategories = categoriesData.map((cat) => ({
            ...cat,
            // Try looking up by slug first, then fallback to ID, then default
            icon: getCategoryIcon(cat.slug || ""),
            subcategories: CATEGORY_METADATA[cat.id]?.subcategories || [],
          }));
          setCategories(mergedCategories);
        }

        if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
          setFilteredProducts(productsData);
        } else {
          // Fallback/log if success but data is not array
          console.warn("Products data is not an array:", productsData);
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Não foi possível carregar os produtos.");
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

  // Filter products
  useEffect(() => {
    if (loading) return;

    let result = (Array.isArray(products) ? products : []).filter(
      (p) => p != null,
    );
    const filterParam = searchParams.get("filter");

    if (selectedCategory !== "all") {
      // Filter by Category Slug OR ID
      // We assume selectedCategory matches either categoryId or category.slug
      result = result.filter((product) => {
        if (!product) return false;
        // Check exact ID match
        if (product.categoryId === selectedCategory) return true;
        // Check Slug match (if category object is present)
        if (product.category && product.category.slug === selectedCategory)
          return true;
        return false;
      });
    }

    if (selectedSubcategory) {
      result = result.filter(
        (product) => product && product.subcategory === selectedSubcategory,
      );
    }

    if (filterParam === "outlet") {
      // Simulate outlet: first 6 products
      result = result.slice(0, 6);
    } else if (filterParam === "offers") {
      // Simulate offers: products with price < 100
      result = result.filter((p) => p && p.price < 100);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product &&
          ((product.name && product.name.toLowerCase().includes(query)) ||
            (product.description &&
              product.description.toLowerCase().includes(query)) ||
            (product.sku && product.sku.toLowerCase().includes(query))),
      );
    }

    // Sort products
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(result);
  }, [
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    sortBy,
    searchParams,
    products,
    loading,
  ]);

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
        <div className="container mx-auto px-4 py-4">
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

      <div className="container mx-auto px-4 py-8">
        {/* Render filtered products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCardWithVariants key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Nenhum produto encontrado com os filtros selecionados.
            </p>
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
