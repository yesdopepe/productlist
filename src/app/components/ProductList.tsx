'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Filter, Palette } from 'lucide-react';
import ProductCard from './ProductCard';
import FilterModal, { FilterState } from './FilterModal';

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

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState<{ [key: number]: string }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);
  
  // Touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    minPrice: null,
    maxPrice: null,
    minWeight: null,
    maxWeight: null,
    minPopularity: null,
    maxPopularity: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // For range inputs, we need local state to avoid constant API calls
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const buildQueryString = useCallback((filterState: FilterState) => {
    const params = new URLSearchParams();
    
    if (filterState.minPrice !== null) params.append('minPrice', filterState.minPrice.toString());
    if (filterState.maxPrice !== null) params.append('maxPrice', filterState.maxPrice.toString());
    if (filterState.minWeight !== null) params.append('minWeight', filterState.minWeight.toString());
    if (filterState.maxWeight !== null) params.append('maxWeight', filterState.maxWeight.toString());
    if (filterState.minPopularity !== null) params.append('minPopularity', filterState.minPopularity.toString());
    if (filterState.maxPopularity !== null) params.append('maxPopularity', filterState.maxPopularity.toString());
    if (filterState.sortBy) params.append('sortBy', filterState.sortBy);
    if (filterState.sortOrder) params.append('sortOrder', filterState.sortOrder);
    
    return params.toString();
  }, []);

  const fetchProducts = useCallback(async (filterState: FilterState) => {
    setLoading(true);
    try {
      const queryString = buildQueryString(filterState);
      const response = await fetch(`/api/products${queryString ? `?${queryString}` : ''}`);
      const data = await response.json();
      setProducts(data);
      
      // Reset carousel index when filters change
      setCurrentIndex(0);
      
      // Initialize all products with yellow gold color
      const initialColors: { [key: number]: string } = {};
      data.forEach((_: Product, index: number) => {
        initialColors[index] = 'yellow';
      });
      setSelectedColors(initialColors);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  // Responsive slides calculation
  const getSlidesPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 1;  // sm
    if (window.innerWidth < 768) return 2;  // md
    if (window.innerWidth < 1024) return 3; // lg
    return 4; // xl and up
  };

  const [slidesPerView, setSlidesPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setSlidesPerView(getSlidesPerView());
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlideIndex = Math.max(0, products.length - slidesPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => prev >= maxSlideIndex ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => prev <= 0 ? maxSlideIndex : prev - 1);
  };

  // Touch handlers for swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const handleProductColorChange = (productIndex: number, colorKey: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [productIndex]: colorKey
    }));
  };

  const handleSetAllColors = (colorKey: string) => {
    const newColors: { [key: number]: string } = {};
    products.forEach((_, index) => {
      newColors[index] = colorKey;
    });
    setSelectedColors(newColors);
    setShowColorPanel(false);
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      minPrice: null,
      maxPrice: null,
      minWeight: null,
      maxWeight: null,
      minPopularity: null,
      maxPopularity: null,
      sortBy: 'name',
      sortOrder: 'asc',
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  const hasActiveFilters = filters.minPrice !== null || filters.maxPrice !== null || 
                          filters.minWeight !== null || filters.maxWeight !== null ||
                          filters.minPopularity !== null || filters.maxPopularity !== null ||
                          filters.sortBy !== 'name' || filters.sortOrder !== 'asc';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  const slideWidth = 100 / slidesPerView;

  return (
    <div className="min-h-screen flex flex-col px-4 py-4 md:py-6 overflow-hidden">
      <h1 className="text-center mb-4 md:mb-6 text-gray-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-avenir">
        Product List
      </h1>

      {/* Mobile Color Panel Button */}
      <button
        onClick={() => setShowColorPanel(true)}
        className="md:hidden fixed top-4 left-4 z-30 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-gray-200"
        title="Color Options"
      >
        <Palette className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile Color Panel Modal */}
      {showColorPanel && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowColorPanel(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-700 font-montserrat text-lg">
                Set All Product Colors
              </h3>
              <button
                onClick={() => setShowColorPanel(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: "Yellow Gold", code: "#E6CA97", key: "yellow" },
                { name: "White Gold", code: "#D9D9D9", key: "white" },
                { name: "Rose Gold", code: "#E1A4A9", key: "rose" },
              ].map((color) => (
                <button
                  key={color.key}
                  onClick={() => handleSetAllColors(color.key)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-gray-50 border border-gray-200"
                  title={`Set all products to ${color.name}`}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.code }}
                  />
                  <span className="text-base text-gray-700" style={{ fontFamily: 'Avenir', fontWeight: 400 }}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
        {/* Color Selection - Desktop Sidebar */}
        <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h3 className="text-center mb-4 font-medium text-gray-700 font-montserrat text-sm lg:text-base">
              Set All Product Colors
            </h3>
            <div className="space-y-3">
              {[
                { name: "Yellow Gold", code: "#E6CA97", key: "yellow" },
                { name: "White Gold", code: "#D9D9D9", key: "white" },
                { name: "Rose Gold", code: "#E1A4A9", key: "rose" },
              ].map((color) => (
                <button
                  key={color.key}
                  onClick={() => handleSetAllColors(color.key)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200"
                  title={`Set all products to ${color.name}`}
                >
                  <div
                    className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.code }}
                  />
                  <span className="text-xs lg:text-sm text-gray-700" style={{ fontFamily: 'Avenir', fontWeight: 400 }}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Product Carousel */}
        <div className="flex-1 relative min-w-0 overflow-hidden flex items-center">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200 w-full">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg text-gray-500 font-medium text-center px-4">No products match your filters</p>
              <p className="text-sm text-gray-400 mt-1 text-center px-4">Try adjusting your filter criteria</p>
            </div>
          ) : (
            <>
              <div 
                ref={carouselRef}
                className="relative overflow-hidden w-full h-full flex items-center"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div 
                  className="flex transition-transform duration-300 ease-in-out w-full h-full"
                  style={{ 
                    transform: `translateX(-${currentIndex * slideWidth}%)`,
                  }}
                >
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 h-full flex items-center justify-center px-1 sm:px-2"
                      style={{ width: `${slideWidth}%` }}
                    >
                      <div className="w-full max-w-[280px]">
                        <ProductCard
                          product={product}
                          selectedColor={selectedColors[index] || 'yellow'}
                          onColorChange={(colorKey) => handleProductColorChange(index, colorKey)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Arrows - Centered */}
              {products.length > slidesPerView && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 sm:left-0 sm:-translate-x-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all z-10 border border-gray-200"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 sm:right-0 sm:translate-x-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all z-10 border border-gray-200"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        productsCount={products.length}
      />
    </div>
  );
} 