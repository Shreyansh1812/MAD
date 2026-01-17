/**
 * Main Application Component
 * Routes between editor and view modes
 */

import { useEffect, useState } from 'react';
import { EditorPage } from './pages/EditorPage';
import { MenuViewPage } from './pages/MenuViewPage';
import qrService from './services/qrService';

function App() {
  const [isViewMode, setIsViewMode] = useState(false);
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    // Check if URL contains menu data (view mode)
    const checkMode = () => {
      const hash = window.location.hash;
      console.log('Current hash:', hash);
      
      const hasMenuData = hash.includes('/view?m=');
      
      if (hasMenuData) {
        console.log('Detected view mode with menu data');
        // Decode menu data from URL hash
        const decodedMenu = qrService.decodeMenuFromHash(hash);
        console.log('Decoded menu items:', decodedMenu?.length || 0);
        setMenuData(decodedMenu);
        setIsViewMode(true);
      } else {
        console.log('Editor mode - no menu data in URL');
        setMenuData(null);
        setIsViewMode(false);
      }
    };

    checkMode();

    // Listen for hash changes
    window.addEventListener('hashchange', checkMode);
    
    return () => {
      window.removeEventListener('hashchange', checkMode);
    };
  }, []);

  return isViewMode ? <MenuViewPage menuData={menuData} /> : <EditorPage />;
}

export default App;
