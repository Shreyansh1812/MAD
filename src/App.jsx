/**
 * Main Application Component
 * Practical 08: Multi-Screen Navigation with React Router
 * 
 * Implements:
 * - React Router for navigation
 * - UserContext for global state
 * - Protected routes for authenticated users
 * - Public menu view route
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUserContext } from './contexts/UserContext';
import { EditorPageNew } from './pages/EditorPageNew';
import { PreviewPage } from './pages/PreviewPage';
import { QRPage } from './pages/QRPage';
import { AccountPage } from './pages/AccountPage';
import { ItemEditScreen } from './pages/ItemEditScreen';
import { DashboardLayout } from './pages/DashboardLayout';
import { MenuViewPage } from './pages/MenuViewPage';
import { RecipeBrowserPage } from './pages/RecipeBrowserPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { LoginScreen } from './components/Auth/LoginScreen';
import { RegisterScreen } from './components/Auth/RegisterScreen';
import { NotificationPermissionBanner } from './components/Shared/NotificationPermissionBanner';

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 * Similar to: Android Navigation with conditional destinations
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, authLoading } = useUserContext();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-xl text-white font-bold">Loading QuickMenu...</p>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

/**
 * AppRoutes Component
 * Defines all application routes
 */
const AppRoutes = () => {
  const { currentUser } = useUserContext();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <Routes>
      {/* PUBLIC ROUTE: Menu View (accessible without auth) */}
      <Route path="/view" element={<PublicMenuView />} />

      {/* AUTH ROUTES */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/dashboard/editor" replace />
          ) : showRegister ? (
            <RegisterScreen
              onSwitchToLogin={() => setShowRegister(false)}
              onRegisterSuccess={() => setShowRegister(false)}
            />
          ) : (
            <LoginScreen
              onSwitchToRegister={() => setShowRegister(true)}
              onLoginSuccess={() => {}}
            />
          )
        }
      />

      {/* PROTECTED ROUTES: Dashboard with Bottom Navigation */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/editor" replace />} />
        <Route path="editor" element={<EditorPageNew />} />
        <Route path="preview" element={<PreviewPage />} />
        <Route path="qr" element={<QRPage />} />
        <Route path="recipes" element={<RecipeBrowserPage />} />
        <Route path="notifications" element={<NotificationCenterPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="edit/:itemId" element={<ItemEditScreen />} />
      </Route>

      {/* DEFAULT REDIRECT */}
      <Route path="/" element={<Navigate to={currentUser ? "/dashboard/editor" : "/login"} replace />} />
      
      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * PublicMenuView Component
 * Handles public menu viewing from QR codes
 */
const PublicMenuView = () => {
  const [sharedMenu, setSharedMenu] = useState(null);
  const [stallData, setStallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    const parseMenuFromURL = () => {
      setIsLoading(true);
      setParseError(null);

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const base64Data = searchParams.get('m');


        if (!base64Data) {
          console.log('⚠️ No "m" parameter in URL');
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
        const stall = !Array.isArray(payload)
          ? { stallName: payload.s || '', waitTime: payload.w || '' }
          : null;

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
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error parsing menu from URL:', error);
        setParseError(error.message);
        setSharedMenu(null);
        setIsLoading(false);
      }
    };

    parseMenuFromURL();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-xl text-white font-bold">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (parseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Menu</h1>
          <p className="text-gray-600 mb-4">{parseError}</p>
          <p className="text-sm text-gray-500">
            Please try scanning the QR code again or contact the vendor.
          </p>
          <a
            href="/"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Go to Menu Editor
          </a>
        </div>
      </div>
    );
  }

  return <MenuViewPage menuData={sharedMenu} stallData={stallData} />;
};

/**
 * Main App Component
 * Wraps everything with UserProvider and BrowserRouter
 */
function App() {
  useEffect(() => {
    // Update Android Status Bar Color & Launch Haptic Feedback
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#0ea5e9');
      console.log('✅ Status bar color updated to #0ea5e9');
    }

    // One-time tactile confirmation when launched from home screen
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (navigator.vibrate) {
        navigator.vibrate(15);
        console.log('📱 Launch haptic feedback triggered');
      }
    }
  }, []);

  return (
    <UserProvider>
      <BrowserRouter>
        <NotificationPermissionBanner />
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;

/**
 * ARCHITECTURE NOTES - PRACTICAL 08:
 * 
 * 1. NAVIGATION SYSTEM:
 *    React Router: BrowserRouter with Routes/Route components
 *    Android: Navigation Component with NavGraph XML
 *    Flutter: Navigator 2.0 with declarative routing
 * 
 * 2. ROUTE PROTECTION:
 *    React: ProtectedRoute wrapper checking auth state
 *    Android: NavGraph destinations with conditional navigation
 *    Flutter: RouteGuard or onGenerateRoute with auth check
 * 
 * 3. NESTED ROUTES:
 *    React: <Route> with <Outlet> for child routes
 *    Android: Nested navigation graphs
 *    Flutter: Navigator nesting or nested routes
 * 
 * 4. ROUTE PARAMETERS:
 *    React: useParams() hook to access :itemId
 *    Android: Safe Args plugin for type-safe arguments
 *    Flutter: ModalRoute.of(context).settings.arguments
 * 
 * 5. PROGRAMMATIC NAVIGATION:
 *    React: useNavigate() hook
 *    Android: navController.navigate(destination)
 *    Flutter: Navigator.pushNamed(context, route)
 * 
 * 6. GLOBAL STATE FLOW:
 *    User edits in Editor → updateItem() in Context →
 *    State updates globally → Preview auto-refreshes!
 *    
 *    Android equivalent:
 *    Fragment calls ViewModel.update() → LiveData.postValue() →
 *    All observers receive new data → UI updates
 *    
 *    Flutter equivalent:
 *    Widget calls Provider.update() → notifyListeners() →
 *    Consumer widgets rebuild → UI updates
 */
