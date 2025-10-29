import { ChevronRight } from "lucide-react";
import { ProductCard } from ".";

const ProductSection = ({ title, products, icon: Icon }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-6 h-6 text-green-600" />}
          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>
        </div>
        <button className="flex items-center text-green-600 hover:text-green-700">
          Xem tất cả
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
};
export default ProductSection;