'use client';

import { X, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  minWeight: number | null;
  maxWeight: number | null;
  minPopularity: number | null;
  maxPopularity: number | null;
  sortBy: string;
  sortOrder: string;
}

interface FilterModalProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  localFilters: FilterState;
  setLocalFilters: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  productsCount: number;
}

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'weight', label: 'Weight' },
  { value: 'popularity', label: 'Popularity' },
];

export default function FilterModal({
  showFilters,
  setShowFilters,
  localFilters,
  setLocalFilters,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters,
  productsCount
}: FilterModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  const handleFilterChange = (key: keyof FilterState, value: string | number | null) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle modal opening animation
  useEffect(() => {
    if (showFilters) {
      setShouldRender(true);
      // Small delay to ensure DOM is updated before animation starts
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [showFilters]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFilters) {
        setShowFilters(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showFilters, setShowFilters]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-full shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-300 flex items-center justify-center group"
        title="Open Filters"
      >
        <Filter className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
        {hasActiveFilters && (
          <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        )}
      </button>

      {shouldRender && (
        <>
          {/* Backdrop with fade animation */}
          <div
            className={`fixed inset-0 z-40 backdrop-blur-sm bg-black/30 transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setShowFilters(false)}
          />
          
          {/* Modal Content with slide animation */}
          <div
            className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-out ${
              isAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800" style={{ fontFamily: 'Montserrat' }}>
                  Filters & Sort
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 hover:bg-gray-100 rounded-full transition-colors group"
                  title="Close Filters"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-gray-800" />
                </button>
              </div>
              
              {hasActiveFilters && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Filters Active
                  </span>
                </div>
              )}
            </div>

            {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Sort Options */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <label className="block mb-3 font-medium text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Montserrat' }}>
                  Sort Products
                </label>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
                  <select
                    value={localFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="col-span-2 p-3 border border-gray-600 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-800"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={localFilters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="p-3 border border-gray-600 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-800"
                  >
                    <option value="asc">↑ Asc</option>
                    <option value="desc">↓ Desc</option>
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block mb-3 font-medium text-gray-700" style={{ fontFamily: 'Montserrat', fontSize: '14px' }}>
                  Price Range (USD)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min $"
                    value={localFilters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Max $"
                    value={localFilters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium"
                  />
                </div>
              </div>

              {/* Weight Range */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block mb-3 font-medium text-gray-700" style={{ fontFamily: 'Montserrat', fontSize: '14px' }}>
                  Weight Range (grams)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min g"
                    value={localFilters.minWeight || ''}
                    onChange={(e) => handleFilterChange('minWeight', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max g"
                    value={localFilters.maxWeight || ''}
                    onChange={(e) => handleFilterChange('maxWeight', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium"
                  />
                </div>
              </div>

              {/* Popularity Range */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block mb-3 font-medium text-gray-700" style={{ fontFamily: 'Montserrat', fontSize: '14px' }}>
                  Popularity Score
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    placeholder="Min"
                    value={localFilters.minPopularity || ''}
                    onChange={(e) => handleFilterChange('minPopularity', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    placeholder="Max"
                    value={localFilters.maxPopularity || ''}
                    onChange={(e) => handleFilterChange('maxPopularity', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Range: 0.0 - 1.0</p>
              </div>

              {/* Results Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {productsCount} Product{productsCount !== 1 ? 's' : ''} Found
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {hasActiveFilters ? 'With active filters' : 'All products'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{productsCount}</span>
                  </div>
                </div>
              </div>

              {/* Extra padding at bottom for scroll */}
              <div className="h-4"></div>
            </div>

            {/* Footer Actions - Fixed */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 space-y-3">
              <button
                onClick={() => {
                  onApplyFilters();
                  setShowFilters(false);
                }}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-3 rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-200 font-medium text-sm shadow-sm"
              >
                Apply Filters & Close
              </button>
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export type { FilterState }; 