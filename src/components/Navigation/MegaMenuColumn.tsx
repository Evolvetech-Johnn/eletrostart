import { Link } from "react-router-dom";
import { Category } from "../../services/productService";

type Props = {
  items: Category[];
};

const MegaMenuColumn: React.FC<Props> = ({ items }) => {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/products?category=${item.slug || item.id}`}
          className="block text-sm text-gray-700 hover:text-primary font-medium"
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default MegaMenuColumn;
