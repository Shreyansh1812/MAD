/**
 * InstallBanner Component
 * Custom UI for PWA installation prompt
 * Shows only on Android when app is installable
 */

import { useState } from 'react';
import { Download, X, Smartphone, Zap, WifiOff, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Shared/Button';
import { androidTransitions } from '../../utils/motionConfig';

export const InstallBanner = ({ onInstall, onDismiss, variant = 'banner' }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleInstall = async () => {
    const result = await onInstall();
    if (result.outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  if (variant === 'floating') {
    return (
      <AnimatePresence>
        <motion.div
          variants={androidTransitions.slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-4 border-2 border-primary-500">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-start gap-4 pr-8">
              <div className="bg-white/20 p-3 rounded-xl">
                <Smartphone size={28} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">
                  Install QuickMenu App
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  Add to your home screen for instant access, offline support, and native app experience!
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1 bg-white text-primary-700 hover:bg-gray-100"
                  >
                    <Download size={18} className="mr-2" />
                    Install Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-white hover:bg-white/20"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant (default)
  return (
    <AnimatePresence>
      <motion.div
        variants={androidTransitions.slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 border-b-4 border-primary-800 relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="hidden sm:flex bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Smartphone size={32} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                  <span className="hidden sm:inline">Install QuickMenu App</span>
                  <span className="sm:hidden">Install App</span>
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full animate-pulse">
                    PWA
                  </span>
                </h3>
                <p className="text-white/90 text-sm hidden md:block">
                  Add to home screen • Works offline • Native app experience
                </p>
                
                {/* Feature highlights */}
                <div className="flex gap-3 mt-2 text-white/80 text-xs">
                  <div className="flex items-center gap-1">
                    <WifiOff size={14} />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={14} />
                    <span className="hidden sm:inline">Fast</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Native</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleInstall}
                className="bg-white text-primary-700 hover:bg-gray-100 font-bold shadow-lg hover:scale-105"
                enableHaptics={true}
              >
                <Download size={20} className="mr-2" />
                <span className="hidden sm:inline">Install Now</span>
                <span className="sm:hidden">Install</span>
              </Button>
              
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * InstallButton Component
 * Standalone button for install action (can be placed anywhere)
 */
export const InstallButton = ({ onInstall, size = 'md' }) => {
  return (
    <Button
      variant="primary"
      size={size}
      onClick={onInstall}
      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
    >
      <Download size={20} className="mr-2" />
      Install App
    </Button>
  );
};
