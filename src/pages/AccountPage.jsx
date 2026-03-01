/**
 * AccountPage Component
 * Practical 08: Account Management Screen
 * 
 * User profile and settings page with logout functionality
 */

import { motion } from 'framer-motion';
import { LogOut, User, Mail, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Shared/Button';
import { Card } from '../components/Shared/Card';
import { ToastContainer } from '../components/Shared/Toast';

export const AccountPage = () => {
  const { currentUser, logout, menuItems, stallData } = useUserContext();
  const { toasts, removeToast, success, error } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully', 'success');
      navigate('/login');
    } catch (err) {
      error('Failed to logout', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 p-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">Account</h1>
      </motion.div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {stallData.stallName || 'Vendor'}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {menuItems.length}
                  </p>
                  <p className="text-sm text-gray-500">Menu Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stallData.waitTime || 0} min
                  </p>
                  <p className="text-sm text-gray-500">Wait Time</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-gray-800 mb-4">Account Details</h3>
              
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-800 font-medium">User ID</p>
                  <p className="text-gray-500 truncate">{currentUser?.uid}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Info className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-800 font-medium">Account Status</p>
                  <p className="text-green-600">Active</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="w-full bg-red-50 text-red-600 hover:bg-red-100"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
