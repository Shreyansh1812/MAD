/**
 * MenuViewPage Component
 * Customer-facing menu view (accessed via QR code)
 * Enhanced with categories, veg/non-veg indicators, and availability status
 */

import { useState } from 'react';
import { UtensilsCrossed, ArrowLeft, Clock, Phone, Leaf } from 'lucide-react';
import { Button } from '../components/Shared/Button';
import { EmptyState } from '../components/Shared/EmptyState';
import { Alert } from '../components/Shared/Alert';
import { formatPrice, CATEGORIES } from '../utils/validation';

export const MenuViewPage = ({ menuData, stallData }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const menuItems = menuData || [];
  const hasMenu = menuItems && menuItems.length > 0;
  const error = !menuData;
  
  const stallName = stallData?.stallName || 'Quick Menu';
  const waitTime = stallData?.waitTime || '';

  // Get categories that have items
  const availableCategories = ['All', ...new Set(menuItems.map(item => item.category || 'Other'))];
  
  // Filter items by selected category
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => (item.category || 'Other') === selectedCategory);

  // Group items by category for display
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (error || !hasMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Alert 
            type="error" 
            title="Menu Not Found" 
            message="This QR code doesn't contain valid menu data. Please scan a valid QuickMenu QR code." 
            className="animate-fade-in"
          />
          <div className="mt-8 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = window.location.origin}
            >
              <ArrowLeft size={20} className="mr-2" />
              Go to Menu Editor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 pb-24">
      {/* Sticky Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b-4 border-primary-600">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-4 rounded-3xl shadow-2xl mb-4">
              <UtensilsCrossed className="text-white" size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{stallName}</h1>
            <p className="text-base text-gray-600 mt-2 font-semibold">Digital Menu • Offline-Enabled</p>
            {waitTime && (
              <div className="flex items-center gap-2 mt-3 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <Clock size={16} />
                <span className="text-sm font-bold">Wait Time: {waitTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {availableCategories.length > 1 && (
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all flex-shrink-0 ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Menu Items */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <EmptyState
              icon={UtensilsCrossed}
              title="No items in this category"
              description="Try selecting a different category!"
            />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {Object.entries(itemsByCategory).map(([category, items]) => (
              <div key={category} className="space-y-3">
                {selectedCategory === 'All' && (
                  <h2 className="text-2xl font-black text-white mb-4 px-2">
                    {category}
                  </h2>
                )}
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border-2 ${
                      item.isAvailable === false
                        ? 'border-gray-300 opacity-60'
                        : 'border-white hover:border-primary-300 transform hover:scale-[1.02] hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Veg/Non-Veg Indicator */}
                        <div className="flex-shrink-0 mt-1">
                          {item.isVeg ? (
                            <div className="w-6 h-6 border-2 border-green-600 rounded flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-red-600 rounded flex items-center justify-center">
                              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">
                              {item.name}
                            </h2>
                            {item.isAvailable === false && (
                              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`px-6 py-3 rounded-2xl shadow-lg ${
                          item.isAvailable === false
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        }`}>
                          <p className="text-3xl font-black">
                            ₹{formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-white px-8 py-6">
            <p className="text-gray-600 font-medium">
              Total <span className="font-black text-primary-600">{menuItems.length}</span> items
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Powered by QuickMenu • 100% Offline
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-4 border-primary-600 shadow-2xl z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-xl hover:shadow-2xl text-lg font-black"
            onClick={() => window.alert('Please visit the counter to place your order!')}
          >
            <Phone size={24} className="mr-3" />
            Visit Counter to Order
          </Button>
          {waitTime && (
            <p className="text-center text-sm text-gray-600 mt-2 font-medium">
              <Clock size={14} className="inline mr-1" />
              Estimated wait: {waitTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
