/**
 * QRGenerator Component
 * Generates and displays QR code for menu
 */

import { useState, useEffect } from 'react';
import { QrCode, Download, RefreshCw, Sparkles, Info, Share2, Copy, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { EmptyState } from '../Shared/EmptyState';
import { Alert } from '../Shared/Alert';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useWebShare } from '../../hooks/useWebShare';

export const QRGenerator = ({ 
  menuItems, 
  stallData,
  qrCodeUrl, 
  isGenerating, 
  error, 
  onGenerate, 
  onDownload,
  onToast
}) => {
  const { isSupported: wakeLockSupported, isActive: wakeLockActive, requestWakeLock, releaseWakeLock } = useWakeLock();
  const { isSupported: shareSupported, shareMenuUrl, copyToClipboard } = useWebShare();
  const [menuUrl, setMenuUrl] = useState('');
  
  // Extract menu URL from QR code when it's generated
  useEffect(() => {
    if (qrCodeUrl && menuItems.length > 0) {
      // Generate the menu URL (same logic as qrService)
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
        w: stallData.waitTime || '',
      };

      const jsonString = JSON.stringify(payload);
      const encodedJSON = encodeURIComponent(jsonString);
      const base64Data = btoa(encodedJSON);
      const productionURL = 'https://mad-eosin.vercel.app';
      const url = `${productionURL}/#/view?m=${base64Data}`;
      
      setMenuUrl(url);
    }
  }, [qrCodeUrl, menuItems, stallData]);
  
  // Request wake lock when QR code is displayed
  useEffect(() => {
    if (qrCodeUrl && !isGenerating && wakeLockSupported) {
      requestWakeLock();
      onToast?.('🔒 Screen will stay on while QR is displayed', 'info');
    }
    
    // Release wake lock when component unmounts or QR is cleared
    return () => {
      if (wakeLockActive) {
        releaseWakeLock();
      }
    };
  }, [qrCodeUrl, isGenerating, wakeLockSupported]);
  
  // QR generation is now handled by EditorPage useEffect
  
  const handleRegenerate = () => {
    onGenerate(menuItems, stallData);
    onToast?.('QR code regenerated successfully! ✨', 'success');
  };

  const handleDownload = () => {
    onDownload();
    onToast?.('QR code downloaded successfully! 🎉', 'success');
  };
  
  const handleShare = async () => {
    if (!menuUrl) {
      onToast?.('No menu URL to share', 'error');
      return;
    }

    const result = await shareMenuUrl(menuUrl, stallData.stallName);
    
    if (result.success) {
      onToast?.('Menu shared successfully! 🎉', 'success');
    } else if (result.error === 'cancelled') {
      // User cancelled - don't show error
      return;
    } else {
      onToast?.('Share failed, URL copied to clipboard instead', 'info');
      // Fallback to copy
      const copyResult = await copyToClipboard(menuUrl);
      if (copyResult.success) {
        onToast?.('URL copied to clipboard! 📋', 'success');
      }
    }
  };
  
  const handleCopyLink = async () => {
    if (!menuUrl) {
      onToast?.('No menu URL to copy', 'error');
      return;
    }
    
    const result = await copyToClipboard(menuUrl);
    if (result.success) {
      onToast?.('URL copied to clipboard! 📋', 'success');
    } else {
      onToast?.('Failed to copy URL', 'error');
    }
  };

  return (
    <Card className="h-full shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2.5 rounded-xl shadow-md">
              <QrCode size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">QR Code</h2>
              <p className="text-sm text-gray-600 mt-0.5">Share with customers</p>
            </div>
          </div>
          {qrCodeUrl && !isGenerating && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={menuItems.length === 0}
              className="hover:scale-105"
            >
              <RefreshCw size={16} className="mr-1.5" />
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardBody>
        {error && (
          <Alert type="error" message={error} className="mb-4" />
        )}

        {menuItems.length === 0 ? (
          <EmptyState
            icon={QrCode}
            title="No QR code yet"
            description="Add menu items above to generate a scannable QR code"
          />
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-200 border-t-primary-600"></div>
              <Sparkles className="absolute inset-0 m-auto text-primary-600 animate-pulse" size={32} />
            </div>
            <p className="text-gray-600 mt-6 font-medium">Generating your QR code...</p>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border-4 border-gray-100">
                <img
                  src={qrCodeUrl}
                  alt="Menu QR Code"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Info size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">How to use:</h4>
                  <ol className="text-sm text-blue-800 space-y-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">1</span>
                      <span>Download the QR code using the button below</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">2</span>
                      <span>Print it or display on your device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">3</span>
                      <span>Customers scan to view menu instantly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">4</span>
                      <span className="font-black">Works 100% offline - no internet needed! 🎉</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardBody>
      
      {qrCodeUrl && !isGenerating && (
        <CardFooter className="bg-gradient-to-r from-green-50 to-emerald-50 space-y-3">
          {wakeLockActive && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 font-semibold bg-green-100 px-4 py-2 rounded-xl">
              <Shield size={16} />
              <span>Screen locked on - won't dim</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 w-full">
            {shareSupported ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleShare}
                className="font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Share2 size={20} className="mr-2" />
                Share Menu
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyLink}
                className="font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Copy size={20} className="mr-2" />
                Copy Link
              </Button>
            )}
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownload}
              disabled={!qrCodeUrl}
              className="font-bold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Download size={20} className="mr-2" />
              Download QR
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
