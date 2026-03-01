/**
 * AccountPage Component
 * Practical 08: Account Management Screen
 * 
 * User profile and settings page with logout functionality
 */

import { motion } from 'framer-motion';
import { LogOut, User, Mail, Shield, Info, Bell, Zap, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/Shared/Button';
import { Card } from '../components/Shared/Card';
import { ToastContainer } from '../components/Shared/Toast';

export const AccountPage = () => {
  const { currentUser, logout, menuItems, stallData } = useUserContext();
  const { toasts, removeToast, success, error } = useToast();
  const navigate = useNavigate();
  
  // Notification hooks for testing
  const {
    permission,
    requestPermission,
    notify,
    notifyItemAdded,
    notifyMenuUpdated,
    notifyQRGenerated,
    scheduleNotification,
    scheduleDailyReminder,
    unreadCount,
  } = useNotifications();

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully', 'success');
      navigate('/login');
    } catch (err) {
      error('Failed to logout', 'error');
    }
  };
  
  // Test notification functions
  const testImmediateNotification = () => {
    notify({
      title: '🎉 Test Notification',
      body: 'This is an immediate notification! Click to navigate.',
      action: '/dashboard/editor',
      tag: 'test-notification',
      type: 'test'
    });
    success('Notification sent!', 'success');
  };
  
  const testItemAddedNotification = () => {
    notifyItemAdded('Paneer Butter Masala');
    success('Item added notification sent!', 'success');
  };
  
  const testMenuUpdatedNotification = () => {
    notifyMenuUpdated();
    success('Menu updated notification sent!', 'success');
  };
  
  const testQRNotification = () => {
    notifyQRGenerated();
    success('QR notification sent!', 'success');
  };
  
  const testScheduledNotification = () => {
    scheduleNotification({
      title: '⏰ Scheduled Test',
      body: 'This notification was scheduled for 5 seconds!',
      action: '/dashboard/notifications',
    }, 5000); // 5 seconds
    success('Notification scheduled for 5 seconds!', 'success');
  };
  
  const testDailyReminder = () => {
    const now = new Date();
    const testHour = now.getHours();
    const testMinute = now.getMinutes() + 1; // 1 minute from now
    
    scheduleDailyReminder({
      title: '📅 Daily Reminder Test',
      body: 'This is your daily reminder!',
      action: '/dashboard/editor',
    }, testHour, testMinute);
    
    success(`Daily reminder set for ${testHour}:${testMinute}`, 'success');
  };
  
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      success('Notification permission granted!', 'success');
    } else if (result === 'denied') {
      error('Notification permission denied', 'error');
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

        {/* Notification Testing Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  Test Notifications
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  permission === 'granted' 
                    ? 'bg-green-100 text-green-700' 
                    : permission === 'denied'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {permission === 'granted' ? '✓ Enabled' : permission === 'denied' ? '✗ Blocked' : '? Not Set'}
                </span>
              </div>

              {/* Permission Request */}
              {permission !== 'granted' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    📢 Notification permission required to test
                  </p>
                  <Button
                    onClick={handleRequestPermission}
                    size="sm"
                    className="w-full"
                  >
                    <Bell className="w-4 h-4" />
                    Request Permission
                  </Button>
                </div>
              )}

              {/* Test Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={testImmediateNotification}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  disabled={permission !== 'granted'}
                >
                  <Zap className="w-4 h-4" />
                  Instant Notification
                </Button>

                <Button
                  onClick={testItemAddedNotification}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  disabled={permission !== 'granted'}
                >
                  <Bell className="w-4 h-4" />
                  Item Added Alert
                </Button>

                <Button
                  onClick={testMenuUpdatedNotification}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  disabled={permission !== 'granted'}
                >
                  <Bell className="w-4 h-4" />
                  Menu Updated Alert
                </Button>

                <Button
                  onClick={testQRNotification}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  disabled={permission !== 'granted'}
                >
                  <Bell className="w-4 h-4" />
                  QR Generated Alert
                </Button>

                <Button
                  onClick={testScheduledNotification}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  disabled={permission !== 'granted'}
                >
                  <Clock className="w-4 h-4" />
                  Scheduled (5 sec)
                </Button>

                <Button
                  onClick={testDailyReminder}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  disabled={permission !== 'granted'}
                >
                  <Calendar className="w-4 h-4" />
                  Daily Reminder (1 min)
                </Button>
              </div>

              {/* Unread Count */}
              {unreadCount > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📬 You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard/notifications')}
                    size="sm"
                    className="w-full mt-2"
                  >
                    View Notifications
                  </Button>
                </div>
              )}
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
