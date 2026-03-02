import React, { useState, useEffect, useRef } from "react";
import { Loader2, Search, X } from "lucide-react";
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
  onSelect: (product: Product) => void;
}

export function ProductCombobox({ onSelect }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelect = (p: Product) => {
    if (p.stock <= 0) return;
    onSelect(p);
    setSearch("");
    setOpen(false);
    // Return focus to input to allow multiple rapid additions
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const products = data?.pages.flatMap((p) => p.data) || [];

  return (
    <div className="relative w-full mb-6 z-[60]" ref={containerRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Adicionar ao Pedido
      </label>
      <div 
        className="flex items-center w-full bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-colors"
      >
        <Search className="w-5 h-5 text-gray-400 mr-3" />
        <input 
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder-gray-400"
          placeholder="Buscar produto por nome ou SKU (ex: TUB-0005)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-[9999] w-[100%] top-[calc(100%+8px)] left-0 bg-white border border-gray-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
          <ul 
            className="max-h-72 overflow-y-auto py-1 overscroll-contain"
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
                onClick={() => handleSelect(p)}
                className={`flex flex-col px-5 py-3 transition-colors border-b border-gray-50 last:border-0 ${p.stock > 0 ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : 'opacity-50 cursor-not-allowed bg-gray-50'}`}
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
                    {p.stock > 0 ? `Estoque: ${p.stock}` : 'Sem estoque'}
                  </span>
                </div>
              </li>
            ))}
            
            {isFetchingNextPage && (
              <li className="p-4 text-center text-xs font-medium text-gray-400 flex justify-center items-center gap-2 bg-gray-50/50">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando mais resultados...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
