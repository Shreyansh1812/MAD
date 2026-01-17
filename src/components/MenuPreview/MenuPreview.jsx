/**
 * MenuPreview Component
 * Real-time preview of the customer-facing menu with category navigation
 */

import { useState, useMemo, useEffect } from 'react';
import { UtensilsCrossed, Eye, Smartphone, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../Shared/Card';
import { EmptyState } from '../Shared/EmptyState';
import { formatPrice } from '../../utils/validation';
import { useHaptics } from '../../hooks/useHaptics';
import { staggerContainer, staggerItem, androidTransitions } from '../../utils/motionConfig';

export const MenuPreview = ({ menuItems, stallData }) => {
  const stallName = stallData?.stallName || 'Quick Menu';
  const { lightTap } = useHaptics();
  
  // Get unique categories from menu items
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(menuItems.map(item => item.category || 'Other'))];
    return ['All', ...uniqueCategories.sort()];
  }, [menuItems]);
  
  // Active category state
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Update active category if it no longer exists in the categories list
  useEffect(() => {
    if (activeCategory !== 'All' && !categories.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [categories, activeCategory]);
  
  // Filter items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') {
      return menuItems;
    }
    return menuItems.filter(item => (item.category || 'Other') === activeCategory);
  }, [menuItems, activeCategory]);
  
  // Group items by category for 'All' view
  const groupedItems = useMemo(() => {
    if (activeCategory !== 'All') {
      return { [activeCategory]: filteredItems };
    }
    
    const groups = {};
    menuItems.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [menuItems, activeCategory, filteredItems]);
  
  // Handle category change with haptic feedback
  const handleCategoryChange = (category) => {
    lightTap();
    setActiveCategory(category);
  };
  
  return (
    <Card className="h-full shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl shadow-md">
            <Eye size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1.5">
              <Smartphone size={14} />
              Customer view • Updates in real-time
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="bg-gradient-to-br from-gray-50 to-white">
        {/* Customer Menu Preview */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          {/* Phone Header Simulation */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <UtensilsCrossed size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-center">{stallName}</h3>
            <p className="text-center text-primary-100 mt-1 font-medium">Digital Menu</p>
          </div>

          {/* Category Tab Bar */}
          {menuItems.length > 0 && (
            <div className="border-b-2 border-gray-200 bg-white px-4 py-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => {
                  const itemCount = category === 'All' 
                    ? menuItems.length 
                    : menuItems.filter(item => (item.category || 'Other') === category).length;
                  
                  return (
                    <motion.button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`relative px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 whitespace-nowrap ${
                        activeCategory === category
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{category}</span>
                      <span className={`ml-2 text-xs font-black px-2 py-0.5 rounded-full ${
                        activeCategory === category
                          ? 'bg-white/30 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {itemCount}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6 min-h-[400px]">
            {menuItems.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="Preview your menu"
                description="Items you add will appear here exactly as customers see them"
              />
            ) : filteredItems.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title={`No items in ${activeCategory}`}
                description="Add items to this category from the editor"
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  {activeCategory === 'All' ? (
                    // Grouped by category view
                    Object.entries(groupedItems).map(([category, items]) => (
                      <div key={category}>
                        <motion.h4 
                          variants={staggerItem}
                          className="text-lg font-black text-gray-800 mb-4 pb-2 border-b-2 border-primary-200 flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          {category}
                          <span className="text-sm font-semibold text-gray-500 ml-auto">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                          </span>
                        </motion.h4>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <MenuItem key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Single category view
                    <div className="space-y-3">
                      {filteredItems.map((item) => (
                        <MenuItem key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {menuItems.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
              <p className="text-center text-sm text-gray-600 font-medium">
                {activeCategory === 'All' 
                  ? `Total ${menuItems.length} ${menuItems.length === 1 ? 'item' : 'items'} available`
                  : `Showing ${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'items'} in ${activeCategory}`
                }
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * MenuItem Component
 * Individual menu item card with animations
 */
const MenuItem = ({ item }) => {
  return (
    <motion.div
      variants={staggerItem}
      className="group relative bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Veg/Non-veg indicator */}
            {item.isVeg !== undefined && (
              item.isVeg ? (
                <div className="w-6 h-6 border-2 border-green-600 rounded flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              ) : (
                <div className="w-6 h-6 border-2 border-red-600 rounded flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              )
            )}
            <h4 className="font-black text-xl text-gray-900 group-hover:text-primary-700 transition-colors">
              {item.name}
            </h4>
          </div>
          {item.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {item.description}
            </p>
          )}
          {item.isAvailable === false && (
            <span className="inline-block mt-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
              Currently Unavailable
            </span>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-5 py-3 rounded-xl shadow-md">
            <p className="text-2xl font-black">
              ₹{formatPrice(item.price)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
