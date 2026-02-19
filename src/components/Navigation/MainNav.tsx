import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productService, Category } from "../../services/productService";
import MegaMenu from "./MegaMenu";
import {
  MAIN_CATEGORIES,
  MainCategoryName,
  classifyMainCategory,
} from "../../utils/categoryData";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
};

const classifyParent = (cat: Category): MainCategoryName => {
  return classifyMainCategory(cat.name, cat.slug);
};

const MainNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeMenu, setActiveMenu] = useState<MainCategoryName | null>(null);
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const base: Record<MainCategoryName, Category[]> = {
      "Iluminação": [],
      "Fios e Cabos": [],
      "Chuveiros e Torneiras": [],
      "Industrial e Proteção": [],
      "Ferramentas": [],
      "Interruptores e Tomadas": [],
    };
    categories.forEach((cat) => {
      const isMain = MAIN_CATEGORIES.includes(cat.name as MainCategoryName);
      if (isMain) return;
      const parent = classifyParent(cat);
      base[parent].push(cat);
    });
    return base;
  }, [categories]);

  const mainOnly = useMemo(() => {
    return categories.filter((c) => MAIN_CATEGORIES.includes(c.name as MainCategoryName));
  }, [categories]);

  const handleMainClick = (name: MainCategoryName) => {
    const main = mainOnly.find((c) => c.name === name);
    if (main) {
      navigate(`/products?category=${main.slug || main.id}`);
    }
  };

  return (
    <div className="flex items-center space-x-1 relative">
      {MAIN_CATEGORIES.map((name) => (
        <div
          key={name}
          className="relative"
          onMouseEnter={() => isDesktop && setActiveMenu(name)}
          onMouseLeave={() => isDesktop && setActiveMenu(null)}
        >
          <button
            onClick={() => handleMainClick(name)}
            className="font-bold text-sm text-gray-700 hover:text-primary px-4 py-3 uppercase transition-colors"
          >
            {name}
          </button>
          {isDesktop && (
            <MegaMenu
              active={activeMenu === name}
              subcategories={grouped[name]}
            />
          )}
        </div>
      ))}
      <div className="flex items-center space-x-1">
        <Link
          to="/"
          className="font-bold text-sm text-gray-700 hover:text-primary px-4 py-3 uppercase transition-colors"
        >
          Home
        </Link>
        <Link
          to="/products"
          className="font-bold text-sm text-gray-700 hover:text-primary px-4 py-3 uppercase transition-colors"
        >
          Ofertas
        </Link>
        <Link
          to="/contact"
          className="font-bold text-sm text-gray-700 hover:text-primary px-4 py-3 uppercase transition-colors"
        >
          Fale Conosco
        </Link>
      </div>
    </div>
  );
};

export default MainNav;
