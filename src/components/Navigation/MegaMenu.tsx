import React from "react";
import { Category } from "../../services/productService";
import MegaMenuColumn from "./MegaMenuColumn";

type Props = {
  active: boolean;
  subcategories: Category[];
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const MegaMenu: React.FC<Props> = ({ active, subcategories }) => {
  const columns = chunk(subcategories, 8);

  return (
    <div
      className={`absolute top-full left-0 w-auto bg-white shadow-2xl rounded-2xl border border-gray-100 p-6 z-50 transition-all duration-200 ${
        active ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-w-[640px]">
        {columns.map((col, idx) => (
          <MegaMenuColumn key={idx} items={col} />
        ))}
      </div>
    </div>
  );
};

export default MegaMenu;
