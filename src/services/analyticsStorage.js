/**
 * Analytics Storage Service
 * Stores and retrieves analytics data from localStorage
 * 
 * Events tracked:
 * - menu_item_added
 * - menu_item_updated
 * - menu_item_deleted
 * - menu_viewed
 * - qr_generated
 * - qr_downloaded
 * - category_changed
 * - item_availability_toggled
 */

const ANALYTICS_KEY = 'quickmenu_analytics';
const MAX_EVENTS = 1000; // Keep last 1000 events

/**
 * Get all analytics events
 */
export const getAnalytics = () => {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    if (!data) {
      return {
        events: [],
        summary: {
          totalEvents: 0,
          firstEvent: null,
          lastEvent: null
        }
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading analytics:', error);
    return {
      events: [],
      summary: {
        totalEvents: 0,
        firstEvent: null,
        lastEvent: null
      }
    };
  }
};

/**
 * Track a new event
 */
export const trackEvent = (eventType, eventData = {}) => {
  try {
    const analytics = getAnalytics();
    const timestamp = Date.now();
    
    const newEvent = {
      id: `evt_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp,
      date: new Date().toISOString(),
      data: eventData
    };
    
    // Add to events array
    const events = [newEvent, ...analytics.events].slice(0, MAX_EVENTS);
    
    // Update summary
    const summary = {
      totalEvents: events.length,
      firstEvent: events[events.length - 1]?.timestamp || timestamp,
      lastEvent: timestamp
    };
    
    const updatedAnalytics = {
      events,
      summary
    };
    
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updatedAnalytics));
    return newEvent;
  } catch (error) {
    console.error('Error tracking event:', error);
    return null;
  }
};

/**
 * Get events by type
 */
export const getEventsByType = (eventType) => {
  const analytics = getAnalytics();
  return analytics.events.filter(event => event.type === eventType);
};

/**
 * Get events by date range
 */
export const getEventsByDateRange = (startDate, endDate) => {
  const analytics = getAnalytics();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return analytics.events.filter(event => 
    event.timestamp >= start && event.timestamp <= end
  );
};

/**
 * Get events for last N days
 */
export const getEventsForLastDays = (days) => {
  const analytics = getAnalytics();
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return analytics.events.filter(event => event.timestamp >= cutoff);
};

/**
 * Clear all analytics (for testing/reset)
 */
export const clearAnalytics = () => {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing analytics:', error);
    return false;
  }
};

/**
 * Export analytics as JSON (for download/backup)
 */
export const exportAnalytics = () => {
  const analytics = getAnalytics();
  const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
  return blob;
};

/**
 * Get summary statistics
 */
export const getAnalyticsSummary = () => {
  const analytics = getAnalytics();
  const events = analytics.events;
  
  // Count by event type
  const eventCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
  
  // Get today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEvents = events.filter(event => event.timestamp >= today.getTime());
  
  // Get this week's events
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekEvents = events.filter(event => event.timestamp >= weekStart.getTime());
  
  return {
    totalEvents: events.length,
    eventCounts,
    todayCount: todayEvents.length,
    weekCount: weekEvents.length,
    firstEvent: analytics.summary.firstEvent,
    lastEvent: analytics.summary.lastEvent
  };
};
