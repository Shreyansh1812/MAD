/**
 * Android Material Design Motion Patterns
 * Constants and variants for Framer Motion animations
 * Following Material Design motion guidelines
 */

/**
 * Material Design Easing Curves
 * https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 */
export const easings = {
  // Standard easing - most common, feels balanced
  standard: [0.4, 0.0, 0.2, 1],
  
  // Emphasized easing - for important UI changes, feels "heavy"
  emphasized: [0.2, 0.0, 0, 1],
  
  // Decelerated easing - elements entering the screen
  decelerated: [0.0, 0.0, 0.2, 1],
  
  // Accelerated easing - elements exiting the screen
  accelerated: [0.4, 0.0, 1, 1],
};

/**
 * Material Design Durations (in seconds)
 */
export const durations = {
  short1: 0.05,  // 50ms - small UI changes
  short2: 0.1,   // 100ms - simple transitions
  short3: 0.15,  // 150ms - quick interactions
  short4: 0.2,   // 200ms - standard transitions
  medium1: 0.25, // 250ms - medium transitions
  medium2: 0.3,  // 300ms - emphasized transitions
  medium3: 0.35, // 350ms - complex transitions
  medium4: 0.4,  // 400ms - large area transitions
  long1: 0.45,   // 450ms - very large transitions
  long2: 0.5,    // 500ms - screen transitions
  long3: 0.55,   // 550ms - complex screen transitions
  long4: 0.6,    // 600ms - maximum duration
  extraLong1: 0.7, // 700ms - special cases
  extraLong2: 0.8, // 800ms - special cases
  extraLong3: 0.9, // 900ms - special cases
  extraLong4: 1.0, // 1000ms - special cases
};

/**
 * Android Activity Transition Variants
 * Slide and Fade pattern for screen transitions
 */
export const androidTransitions = {
  // Slide from right (entering new screen)
  slideFromRight: {
    initial: {
      x: '100%',
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: durations.medium4,
        ease: easings.emphasized,
      },
    },
    exit: {
      x: '-30%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: durations.medium2,
        ease: easings.accelerated,
      },
    },
  },

  // Slide from left (going back)
  slideFromLeft: {
    initial: {
      x: '-100%',
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: durations.medium4,
        ease: easings.emphasized,
      },
    },
    exit: {
      x: '30%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: durations.medium2,
        ease: easings.accelerated,
      },
    },
  },

  // Fade transition (for modals/overlays)
  fade: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: durations.short4,
        ease: easings.standard,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: durations.short3,
        ease: easings.accelerated,
      },
    },
  },

  // Scale transition (for cards/items appearing)
  scale: {
    initial: {
      scale: 0.9,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: durations.medium1,
        ease: easings.decelerated,
      },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: {
        duration: durations.short4,
        ease: easings.accelerated,
      },
    },
  },

  // Slide up (for bottom sheets)
  slideUp: {
    initial: {
      y: '100%',
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: durations.medium3,
        ease: easings.emphasized,
      },
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: durations.medium1,
        ease: easings.accelerated,
      },
    },
  },
};

/**
 * Tab transition for Android Material Design
 * Heavy, smooth feel with spring physics
 */
export const tabTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1.2, // Higher mass = heavier feel
};

/**
 * List item stagger animation
 * For animating menu items in sequence
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.medium2,
      ease: easings.decelerated,
    },
  },
};

/**
 * Page transition wrapper config
 * For AnimatePresence mode
 */
export const pageTransitionConfig = {
  mode: 'wait', // Wait for exit animation before entering
  initial: false, // Don't animate on first render
};
