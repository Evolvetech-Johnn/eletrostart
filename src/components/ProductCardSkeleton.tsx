const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image Area Skeleton */}
      <div className="relative aspect-[4/3] bg-gray-200" />

      {/* Info Area Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category Skeleton */}
        <div className="h-3 w-1/3 bg-gray-200 rounded mb-3" />

        {/* Name Skeleton */}
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />

        {/* Description Skeleton */}
        <div className="h-3 w-full bg-gray-200 rounded mb-1" />
        <div className="h-3 w-4/5 bg-gray-200 rounded mb-4" />

        {/* Price & Button Skeleton */}
        <div className="mt-auto">
          <div className="flex items-baseline space-x-2 mb-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
