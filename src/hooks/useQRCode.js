/**
 * Custom Hook: useQRCode
 * Manages QR code generation and download
 */

import { useState, useCallback } from 'react';
import qrService from '../services/qrService';

/**
 * QR code generation hook
 * @returns {Object} QR state and operations
 */
export const useQRCode = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate QR code for menu
   * @param {Array} menuItems - Menu items to encode
   * @param {Object} stallData - Stall metadata
   * @param {Object} options - QR generation options
   */
  const generateQR = useCallback(async (menuItems, stallData = {}, options = {}) => {
    if (!menuItems || menuItems.length === 0) {
      setError('No menu items to generate QR code');
      setQrCodeUrl(null);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQrCodeUrl(null); // Clear existing QR code first

    try {
      const dataUrl = await qrService.generateMenuQR(menuItems, stallData, options);
      setQrCodeUrl(dataUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
      setQrCodeUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Download QR code as image
   * @param {string} filename - Download filename
   */
  const downloadQR = useCallback((filename = 'quickmenu-qr.png') => {
    if (!qrCodeUrl) {
      setError('No QR code to download');
      return;
    }

    try {
      qrService.downloadQRCode(qrCodeUrl, filename);
    } catch (err) {
      setError('Failed to download QR code');
      console.error(err);
    }
  }, [qrCodeUrl]);

  /**
   * Clear QR code
   */
  const clearQR = useCallback(() => {
    setQrCodeUrl(null);
    setError(null);
  }, []);

  return {
    qrCodeUrl,
    isGenerating,
    error,
    generateQR,
    downloadQR,
    clearQR,
    hasQR: !!qrCodeUrl,
  };
};
