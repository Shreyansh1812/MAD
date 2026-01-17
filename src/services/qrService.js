/**
 * QR Code Service
 * Handles QR code generation with configurable options
 * Uses qrcode library for robust QR generation
 */

import QRCode from 'qrcode';

/**
 * QR Code generation service
 */
class QRService {
  /**
   * Default QR code options optimized for menu viewing
   */
  static DEFAULT_OPTIONS = {
    errorCorrectionLevel: 'M', // Medium error correction (15%)
    type: 'image/png',
    quality: 0.92,
    margin: 2,
    width: 512,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  /**
   * Generate QR code as data URL
   * @param {string} data - Data to encode (URL or menu JSON)
   * @param {Object} options - QR generation options
   * @returns {Promise<string>} Data URL of QR code image
   */
  async generateQRCode(data, options = {}) {
    const mergedOptions = { ...QRService.DEFAULT_OPTIONS, ...options };

    try {
      const dataUrl = await QRCode.toDataURL(data, mergedOptions);
      return dataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw new Error('QR code generation failed');
    }
  }

  /**
   * Generate QR code for menu data
   * Creates a data URI containing the entire menu
   * @param {Array} menuItems - Array of menu items
   * @param {Object} options - QR generation options
   * @returns {Promise<string>} Data URL of QR code
   */
  async generateMenuQR(menuItems, options = {}) {
    try {
      // Create a compact menu data structure
      const menuData = {
        v: '1.0', // Version
        t: Date.now(), // Timestamp
        items: menuItems.map(item => ({
          n: item.name,
          p: item.price,
        })),
      };

      // Encode as base64 for compact representation
      const encodedData = btoa(JSON.stringify(menuData));
      
      // Create a data URI that can be decoded by the menu viewer
      const qrData = `${window.location.origin}${window.location.pathname}#menu=${encodedData}`;

      return await this.generateQRCode(qrData, options);
    } catch (error) {
      console.error('Failed to generate menu QR:', error);
      throw error;
    }
  }

  /**
   * Download QR code as PNG file
   * @param {string} dataUrl - QR code data URL
   * @param {string} filename - Download filename
   */
  downloadQRCode(dataUrl, filename = 'menu-qr.png') {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      throw new Error('QR code download failed');
    }
  }

  /**
   * Decode menu data from URL hash
   * @param {string} hash - URL hash containing menu data
   * @returns {Array|null} Decoded menu items or null
   */
  decodeMenuFromHash(hash) {
    try {
      // Extract menu data from hash (format: #menu=base64data)
      const match = hash.match(/^#menu=(.+)$/);
      if (!match) {
        return null;
      }

      const encodedData = match[1];
      const jsonData = atob(encodedData);
      const menuData = JSON.parse(jsonData);

      // Transform back to full format
      return menuData.items.map(item => ({
        name: item.n,
        price: item.p,
      }));
    } catch (error) {
      console.error('Failed to decode menu from hash:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new QRService();
