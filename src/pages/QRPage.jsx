/**
 * QRPage Component
 * Practical 08: QR Code Generation Screen
 * 
 * Dedicated screen for QR code generation and sharing
 * 
 * FIXES IMPLEMENTED:
 * 1. Data Guarding - Checks loading states before rendering
 * 2. Global State Integration - Uses currentUser.uid from UserContext
 * 3. Dynamic URL Generation - Uses mad-eosin.vercel.app/view/ + uid
 * 4. Error Handling - Try-catch around QR generation with logging
 */

import { motion } from 'framer-motion';
import { QrCode as QrCodeIcon, AlertCircle, Loader } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useUserContext } from '../contexts/UserContext';
import QRCode from 'qrcode';
import { Card } from '../components/Shared/Card';
import { Button } from '../components/Shared/Button';
import { EmptyState } from '../components/Shared/EmptyState';

export const QRPage = () => {
  // ============================================
  // REQUIREMENT 2: Global State Integration
  // Pull uid from UserContext to ensure navigation doesn't lose session
  // ============================================
  const { 
    currentUser,      // User object with uid
    authLoading,      // Check if auth is still loading
    menuItems, 
    stallData,
    isLoading         // Check if menu data is loading
  } = useUserContext();

  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // REQUIREMENT 3: Dynamic URL Generation
  // Use Vercel production URL with uid
  // ============================================
  const generateQRCode = useCallback(async () => {
    // Validate we have all required data
    if (!currentUser || !currentUser.uid) {
      console.error('❌ [QRPage] No user UID available');
      setError('User session not found. Please try logging in again.');
      return;
    }

    if (!menuItems || menuItems.length === 0) {
      console.log('ℹ️ [QRPage] No menu items to generate QR');
      setQrCodeUrl(null);
      return;
    }

    // ============================================
    // REQUIREMENT 4: Error Handling
    // Wrap QR generation in try-catch with specific logging
    // ============================================
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🔄 [QRPage] Starting QR generation...');
      console.log('👤 [QRPage] User UID:', currentUser.uid);
      console.log('📊 [QRPage] Menu items count:', menuItems.length);

      // Compact menu data for URL encoding
      const compactData = menuItems.map(item => ({
        n: item.name,
        p: item.price,
        d: item.description || '',
        c: item.category || 'Other',
        v: item.isVeg !== undefined ? item.isVeg : true,
        a: item.isAvailable !== undefined ? item.isAvailable : true,
      }));

      const payload = {
        i: compactData,
        s: stallData.stallName || '',
        w: stallData.waitTime || 0,
      };

      // Generate encoded URL
      const jsonString = JSON.stringify(payload);
      const encodedJSON = encodeURIComponent(jsonString);
      const base64Data = btoa(encodedJSON);

      // REQUIREMENT 3: Use production Vercel URL
      const productionURL = 'https://mad-eosin.vercel.app';
      const menuUrl = `${productionURL}/view?m=${base64Data}`;

      console.log('🔗 [QRPage] Generated URL:', menuUrl.substring(0, 100) + '...');

      // Generate QR code using qrcode library
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(qrDataUrl);
      console.log('✅ [QRPage] QR code generated successfully');

    } catch (err) {
      // REQUIREMENT 4: Specific error logging
      console.error('❌ [QRPage] QR generation failed:', err);
      console.error('❌ [QRPage] Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      
      setError(`QR generation failed: ${err.message}`);
      setQrCodeUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, [currentUser, menuItems, stallData]);

  // Auto-generate QR when menu or user changes
  useEffect(() => {
    if (!authLoading && !isLoading && currentUser && menuItems.length > 0) {
      generateQRCode();
    }
  }, [currentUser, menuItems, stallData, authLoading, isLoading, generateQRCode]);

  // Handle QR download
  const handleDownload = () => {
    if (!qrCodeUrl) return;

    try {
      const link = document.createElement('a');
      link.download = `${stallData.stallName || 'menu'}-qr-code.png`;
      link.href = qrCodeUrl;
      link.click();
      console.log('✅ [QRPage] QR code downloaded');
    } catch (err) {
      console.error('❌ [QRPage] Download failed:', err);
      setError('Failed to download QR code');
    }
  };

  // ============================================
  // REQUIREMENT 1: Data Guarding
  // Show loading spinner if data is still loading
  // ============================================
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4"
        >
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">QR Code</h1>
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          <p className="text-xl font-semibold text-gray-700">Loading your menu...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Check if user session is missing
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4"
        >
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">QR Code</h1>
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
          <p className="text-xl font-semibold text-gray-700">Session Lost</p>
          <p className="text-sm text-gray-500 mt-2">Please log in again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">QR Code</h1>
          </div>
          {menuItems.length > 0 && (
            <button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isGenerating ? 'Generating...' : 'Refresh'}
            </button>
          )}
        </div>
      </motion.div>

      {/* QR Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4"
      >
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* REQUIREMENT 1: Show appropriate state based on data */}
        {menuItems.length === 0 ? (
          <EmptyState
            icon={QrCodeIcon}
            title="No Items Added"
            description="Add menu items in the Editor to generate a QR code"
          />
        ) : isGenerating ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Loader className="w-16 h-16 text-purple-600 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-700">Generating QR Code...</p>
              <p className="text-sm text-gray-500 mt-2">Creating your shareable menu</p>
            </div>
          </Card>
        ) : qrCodeUrl ? (
          <Card>
            <div className="p-6 space-y-6">
              {/* QR Code Display */}
              <div className="relative flex justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 w-full max-w-md">
                  <img
                    src={qrCodeUrl}
                    alt="Menu QR Code"
                    className="w-full h-auto rounded-xl"
                    style={{ maxWidth: '400px', margin: '0 auto', display: 'block' }}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <QrCodeIcon className="w-5 h-5" />
                  How to use:
                </h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li>1. Download the QR code below</li>
                  <li>2. Print it or display on your device</li>
                  <li>3. Customers scan to view menu instantly</li>
                  <li className="font-bold">4. Works 100% offline! 🎉</li>
                </ol>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
              >
                Download QR Code
              </Button>

              {/* Debug Info (hidden in production) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                  <p><strong>Debug Info:</strong></p>
                  <p>User ID: {currentUser?.uid}</p>
                  <p>Items: {menuItems.length}</p>
                  <p>Stall: {stallData.stallName || 'Not set'}</p>
                </div>
              )}
            </div>
          </Card>
        ) : null}
      </motion.div>
    </div>
  );
};
