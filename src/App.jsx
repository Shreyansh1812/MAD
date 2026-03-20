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

import { useCallback, useEffect, useState } from 'react';
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
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginScreen } from './components/Auth/LoginScreen';
import { RegisterScreen } from './components/Auth/RegisterScreen';
import { NotificationPermissionBanner } from './components/Shared/NotificationPermissionBanner';
import persistentQRService from './services/persistentQRService';
import offlineMenuRegistry from './services/offlineMenuRegistry';
import { trackEvent } from './services/analyticsService';

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
        <Route path="analytics" element={<AnalyticsPage />} />
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
  const [missingVendorId, setMissingVendorId] = useState(null);
  const [importStatus, setImportStatus] = useState('idle');
  const [importError, setImportError] = useState(null);

  const parseLegacyPayload = (encodedPayload) => {
    const encodedJSON = atob(encodedPayload);
    const jsonString = decodeURIComponent(encodedJSON);
    const payload = JSON.parse(jsonString);

    const compactData = Array.isArray(payload) ? payload : payload.i || [];
    const stall = !Array.isArray(payload)
      ? { stallName: payload.s || '', waitTime: payload.w || '' }
      : null;

    return {
      menuItems: compactData.map((item, index) => ({
        id: `qr-${index}`,
        name: item.n,
        price: item.p,
        description: item.d || '',
        category: item.c || 'Other',
        isVeg: item.v !== undefined ? item.v : true,
        isAvailable: item.a !== undefined ? item.a : true,
      })),
      stallData: stall,
    };
  };

  const resolvePersistentPayload = (token) => {
    const payload = persistentQRService.decodePayload(token);
    const validation = persistentQRService.validatePayload(payload);

    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const latest = offlineMenuRegistry.resolveLatestMenu(payload.vid);
    if (latest?.menuItems?.length) {
      setSharedMenu(latest.menuItems);
      setStallData(latest.stallData || null);
      setMissingVendorId(null);
      trackEvent('customer_menu_viewed', {
        vendorId: payload.vid,
        source: 'offline-registry',
        itemCount: latest.menuItems.length,
      });
      return;
    }

    if (payload.s?.i?.length) {
      const snapshotItems = payload.s.i.map((item, index) => ({
        id: `snap-${index}`,
        name: item.n,
        price: item.p,
        description: '',
        category: item.c || 'Other',
        isVeg: item.v !== false,
        isAvailable: item.a !== false,
      }));

      setSharedMenu(snapshotItems);
      setStallData({
        stallName: payload.s.s || 'Quick Menu',
        waitTime: payload.s.w || '',
      });
      setMissingVendorId(payload.vid);
      return;
    }

    setSharedMenu(null);
    setStallData(null);
    setMissingVendorId(payload.vid);
  };

  const parseMenuFromURL = useCallback(() => {
    setIsLoading(true);
    setParseError(null);
    setImportError(null);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qToken = searchParams.get('q');
      const legacyData = searchParams.get('m');

      if (qToken) {
        resolvePersistentPayload(qToken);
      } else if (legacyData) {
        const legacy = parseLegacyPayload(legacyData);
        setSharedMenu(legacy.menuItems);
        setStallData(legacy.stallData);
        setMissingVendorId(null);
      } else {
        setSharedMenu(null);
        setStallData(null);
        setParseError('No menu payload found in URL.');
      }
    } catch (error) {
      console.error('Error parsing menu from URL:', error);
      setParseError(error.message);
      setSharedMenu(null);
      setStallData(null);
      setMissingVendorId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    parseMenuFromURL();
  }, [parseMenuFromURL]);

  const importBundleText = async (bundleText) => {
    setImportStatus('importing');
    setImportError(null);

    try {
      const result = await offlineMenuRegistry.importEncodedBundle(bundleText);

      trackEvent('offline_bundle_imported', {
        vendorId: result.vendorId,
        version: result.version,
      });

      setImportStatus('success');
      parseMenuFromURL();
    } catch (error) {
      setImportStatus('error');
      setImportError(error.message);
    }
  };

  const handleBundleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    await importBundleText(content.trim());
    event.target.value = '';
  };

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

  if (!sharedMenu || sharedMenu.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Menu Data Not Synced Yet</h1>
          <p className="text-gray-600 mb-4">
            This is a permanent QR for vendor {missingVendorId || 'unknown'}. Import the latest offline bundle to view updated menu data.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Offline Import</p>
            <input
              type="file"
              accept=".qmb,.txt"
              onChange={handleBundleFileImport}
              className="block w-full text-sm text-gray-700"
            />
          </div>

          {importStatus === 'importing' && (
            <p className="text-sm text-gray-600">Importing bundle...</p>
          )}

          {importStatus === 'success' && (
            <p className="text-sm text-green-700">Bundle imported successfully. Reloading latest menu...</p>
          )}

          {importError && (
            <p className="text-sm text-red-700">Bundle import failed: {importError}</p>
          )}
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
