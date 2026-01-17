/**
 * useHaptics Hook
 * Provides haptic feedback for Android devices using the Vibration API
 */

import { useCallback, useRef } from 'react';

export const useHaptics = () => {
  const isSupported = useRef(
    typeof navigator !== 'undefined' && 'vibrate' in navigator
  );

  /**
   * Light tap haptic feedback (20ms)
   * Use for: button clicks, toggles, minor interactions
   */
  const lightTap = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate(20);
    }
  }, []);

  /**
   * Success pulse haptic feedback (dual 30ms pulses)
   * Use for: successful actions, item added, data saved
   * Pattern: vibrate 30ms, pause 50ms, vibrate 30ms
   */
  const successPulse = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate([30, 50, 30]);
    }
  }, []);

  /**
   * Medium impact haptic feedback (50ms)
   * Use for: warnings, important notifications
   */
  const mediumImpact = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate(50);
    }
  }, []);

  /**
   * Error haptic feedback (triple short pulses)
   * Use for: error messages, validation failures
   * Pattern: vibrate 20ms, pause 40ms, vibrate 20ms, pause 40ms, vibrate 20ms
   */
  const errorPulse = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate([20, 40, 20, 40, 20]);
    }
  }, []);

  /**
   * Custom vibration pattern
   * @param {number|number[]} pattern - Single duration or array of [vibrate, pause, vibrate, pause, ...]
   */
  const customVibrate = useCallback((pattern) => {
    if (isSupported.current) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    lightTap,
    successPulse,
    mediumImpact,
    errorPulse,
    customVibrate,
    isSupported: isSupported.current,
  };
};
