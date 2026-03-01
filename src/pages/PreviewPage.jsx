/**
 * PreviewPage Component
 * Practical 08: Dedicated Preview Screen
 * 
 * Real-time preview that reflects global state changes
 */

import { motion } from 'framer-motion';
import { Eye, RefreshCw } from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { MenuPreview } from '../components/MenuPreview/MenuPreview';
import { EmptyState } from '../components/Shared/EmptyState';

export const PreviewPage = () => {
  const { menuItems, stallData, loadMenu, isLoading } = useUserContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Live Preview</h1>
        </div>
        <button
          onClick={loadMenu}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </motion.div>

      {/* Preview Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4"
      >
        {menuItems.length > 0 ? (
          <MenuPreview menuItems={menuItems} stallData={stallData} />
        ) : (
          <EmptyState
            icon={Eye}
            title="No Menu Items"
            description="Add items in the Editor to see them here"
          />
        )}
      </motion.div>
    </div>
  );
};
