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

  useEffect(() => {
    // Check if URL contains menu data (view mode)
    const parseMenuFromURL = () => {
      try {
        const hash = window.location.hash;
        console.log('🔍 Current hash:', hash);
        
        // Check if hash contains view route
        if (!hash.includes('/view')) {
          console.log('📝 Editor mode - no /view in hash');
          setIsViewMode(false);
          setSharedMenu(null);
          return;
        }

        // Extract query parameters from hash
        // Hash format: #/view?m=base64data
        const hashParts = hash.split('?');
        
        if (hashParts.length < 2) {
          console.log('⚠️ No query parameters found in hash');
          setIsViewMode(true);
          setSharedMenu(null);
          return;
        }

        const searchParams = new URLSearchParams(hashParts[1]);
        const base64Data = searchParams.get('m');
        
        console.log('🔑 Base64 data found:', base64Data ? `${base64Data.substring(0, 20)}...` : 'null');

        if (!base64Data) {
          console.log('⚠️ No "m" parameter in URL');
          setIsViewMode(true);
          setSharedMenu(null);
          return;
        }

        // Decode the menu data
        console.log('🔓 Decoding base64...');
        const encodedJSON = atob(base64Data);
        
        console.log('🔓 Decoding URI component...');
        const jsonString = decodeURIComponent(encodedJSON);
        
        console.log('📦 Parsing JSON...');
        const compactData = JSON.parse(jsonString);
        
        console.log('✅ Parsed menu items count:', compactData.length);

        // Transform compact data to full menu item format
        const menuItems = compactData.map((item, index) => ({
          id: `qr-${index}`,
          name: item.n,
          price: item.p,
        }));

        console.log('✨ Menu items ready:', menuItems);
        setSharedMenu(menuItems);
        setIsViewMode(true);
        
      } catch (error) {
        console.error('❌ Error parsing menu from URL:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          hash: window.location.hash
        });
        
        // Still show view mode but with null data (will show error)
        setIsViewMode(true);
        setSharedMenu(null);
      }
    };

    parseMenuFromURL();

    // Listen for hash changes
    window.addEventListener('hashchange', parseMenuFromURL);
    
    return () => {
      window.removeEventListener('hashchange', parseMenuFromURL);
    };
  }, []);

  return isViewMode ? <MenuViewPage menuData={sharedMenu} /> : <EditorPage />;
}

export default App;
