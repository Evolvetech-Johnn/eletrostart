import React, { useState, useEffect, useRef } from "react";
import { ChevronsUpDown, Loader2, Search } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productService, Product } from "../../../../services/productService";

// Hook de debounce nativo
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface ProductComboboxProps {
  value: string;
  onSelect: (product: Product) => void;
  error?: boolean;
  selectedProductCache?: Product; // Produto já carregado pro display
}

export function ProductCombobox({ value, onSelect, error, selectedProductCache }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["products-search", debouncedSearch],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      return productService.getProductsPaginated({
        search: debouncedSearch,
        page: pageParam as number,
        limit: 20,
        active: true
      });
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: open, 
  });

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const products = data?.pages.flatMap((p) => p.data) || [];

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setOpen(!open)}
        className={`w-full bg-white border outline-none px-3 py-2 text-sm rounded-lg cursor-pointer flex justify-between items-center transition-colors ${error ? "border-red-300 ring-1 ring-red-200" : "border-gray-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary"}`}
      >
        <span className="truncate pr-4 text-gray-700">
          {selectedProductCache 
            ? `${selectedProductCache.code || selectedProductCache.sku ? `[${selectedProductCache.code || selectedProductCache.sku}] ` : ''}${selectedProductCache.name}` 
            : "Buscar produto por nome ou SKU..."}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400 opacity-50" />
      </div>

      {open && (
        <div className="absolute z-50 w-[100%] md:w-[150%] xl:w-[200%] top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center border-b border-gray-100 px-3 py-2 bg-gray-50/50">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              className="flex-1 w-full bg-transparent outline-none text-sm placeholder-gray-400 text-gray-700 font-medium"
              placeholder="Digite o nome ou SKU (ex: 1234)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          
          <ul 
            className="max-h-64 overflow-y-auto py-1"
            onScroll={handleScroll}
          >
            {isLoading && !products.length && (
              <li className="p-6 text-center text-sm text-gray-400 flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Buscando produtos...
              </li>
            )}
            
            {!isLoading && products.length === 0 && (
              <li className="p-6 text-center text-sm text-gray-500">
                Nenhum produto encontrado.
              </li>
            )}

            {products.map((p) => (
              <li 
                key={p.id}
                onClick={() => {
                  if (p.stock <= 0) return;
                  onSelect(p);
                  setOpen(false);
                  setSearch("");
                }}
                className={`flex flex-col px-4 py-2.5 transition-colors border-b border-gray-50 last:border-0 ${p.stock > 0 ? 'cursor-pointer hover:bg-gray-50/80 active:bg-gray-100' : 'opacity-50 cursor-not-allowed bg-gray-50'} ${p.id === value ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {p.name}
                  </span>
                  <span className="text-sm font-black text-gray-700 whitespace-nowrap">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-xs text-gray-500 font-medium font-mono">
                    SKU: {p.sku || "N/A"} {p.code && `| COD: ${p.code}`}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase tracking-wider ${p.stock > 0 ? "bg-green-100/80 text-green-700 border border-green-200" : "bg-red-100/80 text-red-700 border border-red-200"}`}>
                    {p.stock > 0 ? `Estoque: ${p.stock}` : 'Esgotado'}
                  </span>
                </div>
              </li>
            ))}
            
            {isFetchingNextPage && (
              <li className="p-3 text-center text-xs font-medium text-gray-400 flex justify-center items-center gap-2 bg-gray-50/50">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando mais resultados...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
