/**
 * Main Application Component
 * Routes between editor and view modes
 */

import { useEffect, useState } from 'react';
import { EditorPage } from './pages/EditorPage';
import { MenuViewPage } from './pages/MenuViewPage';

function App() {
  const [isViewMode, setIsViewMode] = useState(false);
  const [sharedMenu, setSharedMenu] = useState(null);
  const [stallData, setStallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    // Check if URL contains menu data (view mode)
    const parseMenuFromURL = () => {
      setIsLoading(true);
      setParseError(null);
      
      try {
        const hash = window.location.hash;
        console.log('🔍 Current hash:', hash);
        
        // Check if hash starts with view route
        if (!hash.startsWith('#/view')) {
          console.log('📝 Editor mode - no /view in hash');
          setIsViewMode(false);
          setSharedMenu(null);
          setIsLoading(false);
          return;
        }

        // Extract query parameters from hash
        // Hash format: #/view?m=base64data
        const hashParts = hash.split('?');
        
        if (hashParts.length < 2) {
          console.log('⚠️ No query parameters found in hash');
          setIsViewMode(true);
          setSharedMenu(null);
          setIsLoading(false);
          return;
        }

        const searchParams = new URLSearchParams(hashParts[1]);
        const base64Data = searchParams.get('m');
        
        console.log('🔑 Base64 data found:', base64Data ? `${base64Data.substring(0, 20)}...` : 'null');

        if (!base64Data) {
          console.log('⚠️ No "m" parameter in URL');
          setIsViewMode(true);
          setSharedMenu(null);
          setIsLoading(false);
          return;
        }

        // Decode the menu data
        console.log('🔓 Decoding base64...');
        const encodedJSON = atob(base64Data);
        
        console.log('🔓 Decoding URI component...');
        const jsonString = decodeURIComponent(encodedJSON);
        
        console.log('📦 Parsing JSON...');
        const payload = JSON.parse(jsonString);
        
        // Handle both old format (array) and new format (object with 'i' property)
        const compactData = Array.isArray(payload) ? payload : payload.i || [];
        const stall = !Array.isArray(payload) ? { stallName: payload.s || '', waitTime: payload.w || '' } : null;
        
        console.log('✅ Parsed menu items count:', compactData.length);
        console.log('✅ Stall data:', stall);

        // Transform compact data to full menu item format
        const menuItems = compactData.map((item, index) => ({
          id: `qr-${index}`,
          name: item.n,
          price: item.p,
          description: item.d || '',
          category: item.c || 'Other',
          isVeg: item.v !== undefined ? item.v : true,
          isAvailable: item.a !== undefined ? item.a : true,
        }));

        console.log('✨ Menu items ready:', menuItems);
        setSharedMenu(menuItems);
        setStallData(stall);
        setIsViewMode(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ Error parsing menu from URL:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          hash: window.location.hash
        });
        
        setParseError(error.message);
        setIsViewMode(true);
        setSharedMenu(null);
        setIsLoading(false);
      }
    };

    parseMenuFromURL();

    // Listen for hash changes
    window.addEventListener('hashchange', parseMenuFromURL);
    
    return () => {
      window.removeEventListener('hashchange', parseMenuFromURL);
    };
  }, []);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto"></div>
          </div>
          <p className="text-xl text-white font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if parsing failed
  if (parseError && isViewMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Menu</h1>
          <p className="text-gray-600 mb-4">{parseError}</p>
          <p className="text-sm text-gray-500">Please try scanning the QR code again or contact the vendor.</p>
          <button 
            onClick={() => window.location.href = window.location.origin}
            className="mt-6 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700"
          >
            Go to Menu Editor
          </button>
        </div>
      </div>
    );
  }

  return isViewMode ? <MenuViewPage menuData={sharedMenu} stallData={stallData} /> : <EditorPage />;
}

export default App;
