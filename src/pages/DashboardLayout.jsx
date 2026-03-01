/**
 * DashboardLayout Component
 * Practical 08: Layout wrapper with Bottom Navigation
 * 
 * Wraps all authenticated screens with bottom navigation
 */

import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '../components/Navigation/BottomNavigation';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Main content area */}
      <div className="pb-16">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
