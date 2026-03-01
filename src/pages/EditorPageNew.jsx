/**
 * EditorPageNew Component
 * Practical 08: Updated Editor using Global Context
 * 
 * Simplified editor that uses UserContext for state management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3, Wifi, WifiOff } from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MenuEditor } from '../components/MenuEditor/MenuEditor';
import { StallSettings } from '../components/MenuEditor/StallSettings';
import { ToastContainer } from '../components/Shared/Toast';
import { InstallBanner } from '../components/Shared/InstallBanner';
import storageService from '../services/storageService';

export const EditorPageNew = () => {
  const navigate = useNavigate();
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [localStallData, setLocalStallData] = useState({ stallName: '', waitTime: '' });

  // Disable pull-to-refresh for native app feel
  usePullToRefresh(true);

  // PWA Install Management
  const { canInstall, promptInstall, dismissPrompt, hasInstalled } = usePWAInstall();

  // Notification system
  const { notifyItemAdded } = useNotifications();

  // Global state from UserContext
  const {
    menuItems,
    isLoading,
    error: menuError,
    addItem,
    updateItem,
    deleteItem,
    updateStallData,
  } = useUserContext();

  const { toasts, removeToast, success, error } = useToast();

  // Show success message when app is installed
  useEffect(() => {
    if (hasInstalled) {
      success('🎉 QuickMenu installed! Launch from your home screen.', 'success');
    }
  }, [hasInstalled]);

  // Load stall data on mount
  useEffect(() => {
    const saved = storageService.loadStallData();
    setLocalStallData(saved);
    updateStallData(saved);
  }, []);

  const handleStallSave = (data) => {
    setLocalStallData(data);
    updateStallData(data);
  };

  // Handle PWA installation
  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === 'accepted') {
      success('🚀 Installing QuickMenu... Check your home screen!', 'success');
    } else if (result.outcome === 'dismissed') {
      success('You can install QuickMenu anytime from browser menu!', 'info');
    }
    return result;
  };

  // Check if service worker is active
  useEffect(() => {
    const checkServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        if (navigator.serviceWorker.controller) {
          console.log('✅ Service Worker is active');
          setIsOfflineReady(true);
        }
      }
    };

    checkServiceWorker();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsOfflineReady(true);
      });
    }
  }, []);

  // Enhanced addItem with navigation to edit screen
  const handleAddItem = async (item) => {
    const result = await addItem(item);
    if (result.success) {
      success(`✨ ${result.item.name} added!`, 'success');
      
      // Show notification
      notifyItemAdded(result.item.name);
      
      // Option: Navigate to edit screen
      // navigate(`/dashboard/edit/${result.item.id}`);
    }
    return result;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading your menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* PWA Install Banner */}
      {canInstall && (
        <InstallBanner
          onInstall={handleInstall}
          onDismiss={dismissPrompt}
          variant="banner"
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Menu Editor</h1>
            </div>
            {isOfflineReady ? (
              <div className="flex items-center gap-2 text-sm font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <WifiOff size={14} />
                Offline
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                <Wifi size={14} />
                Online
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {menuError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            <p className="font-semibold">Error: {menuError}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StallSettings onSave={handleStallSave} onToast={success} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MenuEditor
            menuItems={menuItems}
            onAdd={handleAddItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onToast={success}
          />
        </motion.div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
