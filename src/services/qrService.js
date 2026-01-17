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
      const compactData = menuItems.map(item => ({
        n: item.name,
        p: item.price,
      }));

      // Convert to JSON and handle Unicode characters
      const jsonString = JSON.stringify(compactData);
      
      // Encode URI component first to handle special characters (₹, etc.)
      const encodedJSON = encodeURIComponent(jsonString);
      
      // Convert to base64
      const base64Data = btoa(encodedJSON);
      
      // Use production URL (Vercel alias) instead of window.location.origin
      // This ensures QR codes always point to the stable production URL
      const productionURL = 'https://mad-eosin.vercel.app';
      const qrData = `${productionURL}/#/view?m=${base64Data}`;
      
      console.log('Generated QR URL:', qrData);
      console.log('Menu items count:', menuItems.length);
      console.log('Base64 data length:', base64Data.length);

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
      console.log('Decoding hash:', hash);
      
      // Extract menu data from hash (format: #/view?m=base64data)
      const match = hash.match(/^#\/view\?m=(.+)$/);
      if (!match) {
        console.log('Hash does not match expected format');
        return null;
      }

      const base64Data = match[1];
      console.log('Extracted base64 length:', base64Data.length);
      
      // Decode from base64
      const encodedJSON = atob(base64Data);
      console.log('Decoded from base64');
      
      // Decode URI component to restore special characters
      const jsonString = decodeURIComponent(encodedJSON);
      console.log('Decoded URI component');
      
      // Parse JSON
      const compactData = JSON.parse(jsonString);
      console.log('Parsed menu items:', compactData.length);

      // Transform back to full format with IDs
      const menuItems = compactData.map((item, index) => ({
        id: `qr-${index}`,
        name: item.n,
        price: item.p,
      }));
      
      console.log('Returning menu items:', menuItems);
      return menuItems;
    } catch (error) {
      console.error('Failed to decode menu from hash:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new QRService();
