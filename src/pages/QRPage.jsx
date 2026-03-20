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
import { QrCode as QrCodeIcon, AlertCircle, Loader, Download, Package } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { Card } from '../components/Shared/Card';
import { Button } from '../components/Shared/Button';
import { EmptyState } from '../components/Shared/EmptyState';
import persistentQRService from '../services/persistentQRService';
import offlineMenuRegistry from '../services/offlineMenuRegistry';
import offlineBundleService from '../services/offlineBundleService';
import { trackEvent } from '../services/analyticsService';

export const QRPage = () => {
  const {
    currentUser,
    authLoading,
    menuItems,
    stallData,
    isLoading,
  } = useUserContext();

  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrDetails, setQrDetails] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const generateQRCode = useCallback(async () => {
    if (!currentUser || !currentUser.uid) {
      console.error('❌ [QRPage] No user UID available');
      setError('User session not found. Please try logging in again.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await persistentQRService.generatePersistentQR(currentUser.uid, {
        includeSnapshot: true,
        menuItems,
        stallData,
        errorCorrectionLevel: 'M',
        width: 400,
      });

      setQrCodeUrl(result.image);
      setQrDetails({
        vendorId: result.payload.vid,
        channelId: result.payload.c,
        tokenLength: result.token.length,
        urlLength: result.url.length,
      });

      trackEvent('qr_generated', {
        vendorId: result.payload.vid,
        tokenLength: result.token.length,
        mode: 'persistent',
      });

    } catch (err) {
      console.error('❌ [QRPage] QR generation failed:', err);
      setError(`QR generation failed: ${err.message}`);
      setQrCodeUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, [currentUser, menuItems, stallData]);

  const exportOfflineBundle = useCallback(async () => {
    if (!currentUser?.uid) {
      setError('Cannot export bundle without an authenticated vendor.');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Ensure latest state is captured before export.
      offlineMenuRegistry.upsertMenuSnapshot(currentUser.uid, {
        channelId: `menu-${currentUser.uid}`,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
        stallData,
        menuItems,
        source: 'bundle-export',
      });

      const { bundle, encoded } = await offlineMenuRegistry.exportEncodedBundle(currentUser.uid, true);
      offlineBundleService.downloadBundle(encoded, currentUser.uid, bundle.version);

      trackEvent('offline_bundle_exported', {
        vendorId: currentUser.uid,
        version: bundle.version,
        size: encoded.length,
      });
    } catch (err) {
      console.error('❌ [QRPage] Failed to export offline bundle:', err);
      setError(`Failed to export offline bundle: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  }, [currentUser, menuItems, stallData]);

  // Generate once identity is available. Payload remains fixed for that vendor.
  useEffect(() => {
    const hasIdentity = currentUser?.uid ? Boolean(persistentQRService.getVendorIdentity(currentUser.uid)) : false;
    const canGenerate = Boolean(currentUser) && (menuItems.length > 0 || hasIdentity);

    if (!authLoading && !isLoading && canGenerate) {
      generateQRCode();
    }
  }, [currentUser, authLoading, isLoading, menuItems.length, generateQRCode]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    try {
      const link = document.createElement('a');
      link.download = `${stallData.stallName || 'menu'}-persistent-qr.png`;
      link.href = qrCodeUrl;
      link.click();
      trackEvent('qr_downloaded', {
        vendorId: currentUser?.uid || 'unknown',
        mode: 'persistent',
      });
    } catch (err) {
      console.error('❌ [QRPage] Download failed:', err);
      setError('Failed to download QR code');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Permanent QR</h1>
          </div>
          <button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isGenerating ? 'Generating...' : 'Regenerate Image'}
          </button>
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

        {isGenerating ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Loader className="w-16 h-16 text-purple-600 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-700">Generating Permanent QR...</p>
              <p className="text-sm text-gray-500 mt-2">This QR remains valid across all future menu updates</p>
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
                  <li>2. Print it once and keep it fixed</li>
                  <li>3. Share offline update bundles whenever menu changes</li>
                  <li className="font-bold">4. QR never needs replacement</li>
                </ol>
              </div>

              {qrDetails && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">Payload Details</p>
                  <p>Vendor ID: {qrDetails.vendorId}</p>
                  <p>Channel: {qrDetails.channelId}</p>
                  <p>QR token length: {qrDetails.tokenLength} chars</p>
                  <p>URL length: {qrDetails.urlLength} chars</p>
                </div>
              )}

              {menuItems.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No menu items yet"
                  description="You can still keep this permanent QR. Add items later and export update bundles."
                />
              ) : (
                <Button
                  onClick={exportOfflineBundle}
                  disabled={isExporting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  <Package className="w-5 h-5 mr-2" />
                  {isExporting ? 'Exporting Update Bundle...' : 'Export Offline Update Bundle'}
                </Button>
              )}

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Permanent QR
              </Button>

              {import.meta.env.DEV && (
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
