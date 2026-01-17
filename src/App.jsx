/**
 * Main Application Component
 * Routes between editor and view modes
 */

import { useEffect, useState } from 'react';
import { EditorPage } from './pages/EditorPage';
import { MenuViewPage } from './pages/MenuViewPage';

function App() {
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    // Check if URL contains menu data (view mode)
    const checkMode = () => {
      const hasMenuData = window.location.hash.includes('menu=');
      setIsViewMode(hasMenuData);
    };

    checkMode();

    // Listen for hash changes
    window.addEventListener('hashchange', checkMode);
    
    return () => {
      window.removeEventListener('hashchange', checkMode);
    };
  }, []);

  return isViewMode ? <MenuViewPage /> : <EditorPage />;
}

export default App;
