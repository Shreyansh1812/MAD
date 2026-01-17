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
      const hasMenuData = hash.includes('/view?m=');
      
      if (hasMenuData) {
        // Decode menu data from URL hash
        const decodedMenu = qrService.decodeMenuFromHash(hash);
        setMenuData(decodedMenu);
        setIsViewMode(true);
      } else {
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
