const ProductDetailSkeleton = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12 animate-pulse">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            {/* Left: Gallery Skeleton */}
            <div className="p-6 md:p-8 bg-white flex flex-col gap-4">
              <div className="aspect-square relative rounded-xl bg-gray-200" />

              {/* Thumbnails Skeleton */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-200"
                  />
                ))}
              </div>
            </div>

            {/* Right: Info Skeleton */}
            <div className="p-6 md:p-8 flex flex-col border-t md:border-t-0 md:border-l border-gray-100">
              {/* Category */}
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />

              {/* Title */}
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-1/2 bg-gray-200 rounded mb-6" />

              {/* Code */}
              <div className="h-6 w-32 bg-gray-200 rounded mb-6" />

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                  <div className="h-10 w-48 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-64 bg-gray-200 rounded" />
              </div>

              {/* Variants Skeleton */}
              <div className="mb-6">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-24 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>

              {/* Button Skeleton */}
              <div className="w-full h-14 bg-gray-200 rounded-xl mb-6" />

              {/* Description Skeleton */}
              <div className="space-y-3 mt-8 pt-8 border-t border-gray-100">
                <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
