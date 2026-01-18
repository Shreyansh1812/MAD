/**
 * Main Application Component
 * Routes between editor and view modes
 * Implements Firebase authentication and protected routing
 */

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { EditorPage } from './pages/EditorPage';
import { MenuViewPage } from './pages/MenuViewPage';
import { LoginScreen } from './components/Auth/LoginScreen';
import { RegisterScreen } from './components/Auth/RegisterScreen';
import { LogOut } from 'lucide-react';

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  
  // Menu view state
  const [isViewMode, setIsViewMode] = useState(false);
  const [sharedMenu, setSharedMenu] = useState(null);
  const [stallData, setStallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parseError, setParseError] = useState(null);

  // Firebase Auth State Listener
  useEffect(() => {
    console.log('🔐 Setting up Firebase auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.email);
        setCurrentUser(user);
      } else {
        console.log('❌ No user authenticated');
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Update Android Status Bar Color & Launch Haptic Feedback
  useEffect(() => {
    // Update status bar color to match brand
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#0ea5e9');
      console.log('✅ Status bar color updated to #0ea5e9');
    }

    // One-time tactile confirmation when launched from home screen (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (navigator.vibrate) {
        navigator.vibrate(15);
        console.log('📱 Launch haptic feedback triggered');
      }
    }
  }, []);

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

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('✅ User signed out');
      
      // Haptic feedback - success (30ms)
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      
      setCurrentUser(null);
      setShowRegister(false);
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  // Handle successful login/register
  const handleAuthSuccess = (user) => {
    console.log('✅ Auth success:', user.email);
    setCurrentUser(user);
  };

  // Show splash screen while checking auth state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto"></div>
          </div>
          <p className="text-xl text-white font-bold">Loading QuickMenu...</p>
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

  // PUBLIC ACCESS: MenuViewPage is always accessible (bypass auth)
  if (isViewMode) {
    return <MenuViewPage menuData={sharedMenu} stallData={stallData} />;
  }

  // PROTECTED ROUTING: Require authentication for vendor dashboard
  if (!currentUser) {
    // Show Login or Register screen
    if (showRegister) {
      return (
        <RegisterScreen
          onSwitchToLogin={() => setShowRegister(false)}
          onRegisterSuccess={handleAuthSuccess}
        />
      );
    }
    
    return (
      <LoginScreen
        onSwitchToRegister={() => setShowRegister(true)}
        onLoginSuccess={handleAuthSuccess}
      />
    );
  }

  // AUTHENTICATED: Show vendor dashboard with logout button
  return (
    <div className="relative">
      {/* Logout Button - Fixed in top-right corner */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 active:scale-95 transition-all border border-gray-200"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline font-medium">Logout</span>
      </button>

      {/* Vendor Dashboard */}
      <EditorPage user={currentUser} onLogout={handleLogout} />
    </div>
  );
}

export default App;
