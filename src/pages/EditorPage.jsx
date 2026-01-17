/**
 * EditorPage Component
 * Main page for vendor menu management
 */

import { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import { useQRCode } from '../hooks/useQRCode';
import { useToast } from '../hooks/useToast';
import { MenuEditor } from '../components/MenuEditor/MenuEditor';
import { MenuPreview } from '../components/MenuPreview/MenuPreview';
import { QRGenerator } from '../components/QRGenerator/QRGenerator';
import { ToastContainer } from '../components/Shared/Toast';
import { Alert } from '../components/Shared/Alert';

export const EditorPage = () => {
  const [isOfflineReady, setIsOfflineReady] = useState(false);

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
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
      </header>

      {/* Main Content - Three Column Layout */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {menuError && (
          <Alert 
            type="error" 
            title="Error" 
            message={menuError} 
            className="mb-6 animate-fade-in" 
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Menu Editor */}
          <div className="lg:col-span-1">
            <MenuEditor
              menuItems={menuItems}
              onAdd={addItem}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onToast={success}
            />
          </div>

          {/* Column 2: Live Preview */}
          <div className="lg:col-span-1">
            <MenuPreview menuItems={menuItems} />
          </div>

          {/* Column 3: QR Code */}
          <div className="lg:col-span-1">
            <QRGenerator
              menuItems={menuItems}
              qrCodeUrl={qrCodeUrl}
              isGenerating={isGenerating}
              error={qrError}
              onGenerate={generateQR}
              onDownload={downloadQR}
              onToast={success}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t-2 border-gray-200 bg-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
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
