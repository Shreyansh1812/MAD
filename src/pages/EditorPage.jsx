/**
 * EditorPage Component
 * Main page for vendor menu management
 */

import { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff, Edit3, Eye, QrCode as QrCodeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../hooks/useMenu';
import { useQRCode } from '../hooks/useQRCode';
import { useToast } from '../hooks/useToast';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MenuEditor } from '../components/MenuEditor/MenuEditor';
import { StallSettings } from '../components/MenuEditor/StallSettings';
import { MenuPreview } from '../components/MenuPreview/MenuPreview';
import { QRGenerator } from '../components/QRGenerator/QRGenerator';
import { ToastContainer } from '../components/Shared/Toast';
import { Alert } from '../components/Shared/Alert';
import { InstallBanner } from '../components/Shared/InstallBanner';
import storageService from '../services/storageService';
import { androidTransitions, tabTransition } from '../utils/motionConfig';

export const EditorPage = () => {
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [stallData, setStallData] = useState({ stallName: '', waitTime: '' });
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'preview', 'qr'
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  
  // Disable pull-to-refresh for native app feel
  usePullToRefresh(true);
  
  // PWA Install Management
  const { canInstall, promptInstall, dismissPrompt, isStandalone, hasInstalled } = usePWAInstall();

  const {
    menuItems,
    isLoading,
    error: menuError,
    addItem,
    updateItem,
    deleteItem,
  } = useMenu();

  const {
    qrCodeUrl,
    isGenerating,
    error: qrError,
    generateQR,
    downloadQR,
  } = useQRCode();

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
    setStallData(saved);
  }, []);

  const handleStallSave = (data) => {
    setStallData(data);
  };
  
  // Handle tab change with direction tracking
  const handleTabChange = (newTab) => {
    const tabs = ['editor', 'preview', 'qr'];
    const currentIndex = tabs.indexOf(activeTab);
    const newIndex = tabs.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
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

  // Auto-regenerate QR when menu or stall data changes
  useEffect(() => {
    if (menuItems.length > 0) {
      generateQR(menuItems, stallData);
    }
  }, [menuItems, stallData, generateQR]);

  // Check if service worker is active
  useEffect(() => {
    const checkServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        // Check if service worker is controlling the page
        if (navigator.serviceWorker.controller) {
          console.log('✅ Service Worker is active and controlling the page');
          setIsOfflineReady(true);
        } else {
          console.log('⏳ Service Worker not active yet');
          setIsOfflineReady(false);
        }
      } else {
        console.log('❌ Service Worker not supported');
        setIsOfflineReady(false);
      }
    };

    checkServiceWorker();

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ Service Worker is ready');
        setIsOfflineReady(true);
      });

      // Listen for controllerchange event (when SW becomes active)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed');
        setIsOfflineReady(true);
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <Menu className="absolute inset-0 m-auto text-primary-600" size={32} />
          </div>
          <p className="text-xl text-gray-700 font-semibold">Loading your menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* PWA Install Banner - Only shows when installable and not in standalone */}
      {canInstall && (
        <InstallBanner 
          onInstall={handleInstall}
          onDismiss={dismissPrompt}
          variant="banner"
        />
      )}
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-3 rounded-2xl shadow-lg">
                <Menu className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">QuickMenu</h1>
                <p className="text-sm text-gray-600 font-medium mt-0.5">Offline QR Menu Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isOfflineReady ? (
                <div className="hidden sm:flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-md">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                  <WifiOff size={16} />
                  Offline Ready
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-gray-400 to-gray-500 text-white px-5 py-2.5 rounded-xl shadow-md">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  <Wifi size={16} />
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Android-style Tab Navigation */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex relative">
              {/* Tab Buttons */}
              <button
                onClick={() => handleTabChange('editor')}
                className={`flex-1 py-4 text-center font-bold text-sm transition-colors relative ${
                  activeTab === 'editor' ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Edit3 size={18} />
                  <span>Editor</span>
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('preview')}
                className={`flex-1 py-4 text-center font-bold text-sm transition-colors relative ${
                  activeTab === 'preview' ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye size={18} />
                  <span>Preview</span>
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('qr')}
                className={`flex-1 py-4 text-center font-bold text-sm transition-colors relative ${
                  activeTab === 'qr' ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <QrCodeIcon size={18} />
                  <span>QR Code</span>
                </div>
              </button>
              
              {/* Animated Tab Indicator */}
              <motion.div
                className="absolute bottom-0 h-1 bg-primary-600 rounded-t-full"
                initial={false}
                animate={{
                  x: activeTab === 'editor' ? '0%' : activeTab === 'preview' ? '100%' : '200%',
                  width: '33.333%',
                }}
                transition={tabTransition}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Animated Tab Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        {menuError && (
          <Alert 
            type="error" 
            title="Error" 
            message={menuError} 
            className="mb-6 animate-fade-in" 
          />
        )}

        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait" initial={false}>
            {/* Editor Tab */}
            {activeTab === 'editor' && (
              <motion.div
                key="editor"
                custom={direction}
                variants={direction > 0 ? androidTransitions.slideFromRight : androidTransitions.slideFromLeft}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <StallSettings onSave={handleStallSave} onToast={success} />
                <MenuEditor
                  menuItems={menuItems}
                  onAdd={addItem}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                  onToast={success}
                />
              </motion.div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                custom={direction}
                variants={direction > 0 ? androidTransitions.slideFromRight : androidTransitions.slideFromLeft}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <MenuPreview menuItems={menuItems} stallData={stallData} />
              </motion.div>
            )}

            {/* QR Code Tab */}
            {activeTab === 'qr' && (
              <motion.div
                key="qr"
                custom={direction}
                variants={direction > 0 ? androidTransitions.slideFromRight : androidTransitions.slideFromLeft}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <QRGenerator
                  menuItems={menuItems}
                  stallData={stallData}
                  qrCodeUrl={qrCodeUrl}
                  isGenerating={isGenerating}
                  error={qrError}
                  onGenerate={generateQR}
                  onDownload={downloadQR}
                  onToast={success}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t-2 border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 font-medium">
            <span className="font-bold text-primary-600">QuickMenu</span> - Built for small vendors. 
            <span className="mx-2">•</span> 
            Works 100% offline. 
            <span className="mx-2">•</span> 
            No cost. No internet needed. 🚀
          </p>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
