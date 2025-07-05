'use client';

import Image from 'next/image';

interface Product {
  name: string;
  popularityScore: number;
  weight: number;
  price: number;
  images: {
    yellow: string;
    rose: string;
    white: string;
  };
}

interface ProductCardProps {
  product: Product;
  selectedColor: string;
  onColorChange: (colorKey: string) => void;
}

const colorOptions = [
  { name: "Yellow Gold", code: "#E6CA97", key: "yellow" },
  { name: "White Gold", code: "#D9D9D9", key: "white" },
  { name: "Rose Gold", code: "#E1A4A9", key: "rose" },
];

export default function ProductCard({ product, selectedColor, onColorChange }: ProductCardProps) {
  const getSelectedColorName = (colorKey: string) => {
    const color = colorOptions.find(c => c.key === colorKey);
    return color ? color.name : 'Yellow Gold';
  };

  const renderStars = (popularityScore: number) => {
    // Convert popularity score (0-1) to star rating (1-5)
    const rating = (popularityScore * 4) + 1;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starNumber) => {
          const fillPercentage = Math.min(Math.max(rating - starNumber + 1, 0), 1);
          
          return (
            <div key={starNumber} className="relative inline-block text-sm sm:text-base lg:text-lg">
              {/* Background star (gray) */}
              <span className="text-gray-300">★</span>
              {/* Foreground star (yellow) with clipping */}
              <span 
                className="absolute top-0 left-0 text-yellow-400 overflow-hidden"
                style={{ 
                  width: `${fillPercentage * 100}%`,
                  whiteSpace: 'nowrap'
                }}
              >
                ★
              </span>
            </div>
          );
        })}
        <span className="text-gray-600 ml-1 sm:ml-2 text-xs sm:text-sm lg:text-base font-montserrat font-normal">
          {rating.toFixed(1)}/5
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col w-full h-full">
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <Image
          src={product.images[selectedColor as keyof typeof product.images] || product.images.yellow}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      
      {/* Product Details */}
      <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
        {/* Product Title */}
        <h3 className="text-gray-900 mb-2 sm:mb-3 leading-tight text-sm sm:text-base lg:text-lg font-montserrat font-medium">
          {product.name}
        </h3>
        
        {/* Price */}
        <p className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg font-montserrat font-normal">
          ${product.price.toFixed(2)} USD
        </p>
        
        {/* Color Options */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          {colorOptions.map((color) => (
            <button
              key={color.key}
              onClick={() => onColorChange(color.key)}
              className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full transition-all hover:scale-110 ${
                selectedColor === color.key 
                  ? 'ring-2 ring-gray-800 ring-offset-1 sm:ring-offset-2' 
                  : 'hover:ring-1 hover:ring-gray-400 hover:ring-offset-1'
              }`}
              style={{ backgroundColor: color.code }}
              title={`Switch to ${color.name}`}
            />
          ))}
        </div>
        
        {/* Selected Color Name */}
        <p className="text-gray-700 mb-4 sm:mb-6 text-xs sm:text-sm lg:text-base font-avenir font-normal">
          {getSelectedColorName(selectedColor)}
        </p>
        
        {/* Star Rating */}
        <div className="mt-auto font-avenir font-normal">
          {renderStars(product.popularityScore)}
        </div>
      </div>
    </div>
  );
} 