/**
 * Analytics Service
 * High-level analytics functions for generating insights
 */

import { 
  getAnalytics, 
  getEventsByType, 
  getEventsForLastDays,
  trackEvent as trackEventStorage 
} from './analyticsStorage';
import { startOfDay, format, subDays } from 'date-fns';

/**
 * Track event wrapper (exports to storage)
 */
export const trackEvent = trackEventStorage;

/**
 * Get item popularity data
 * Returns array of items with their interaction counts
 * UPDATED: Prioritizes CUSTOMER views over vendor edits
 */
export const getItemPopularity = () => {
  const analytics = getAnalytics();
  
  // Customer views (most important!)
  const customerViews = analytics.events.filter(e => e.type === 'customer_item_viewed');
  const vendorEdits = analytics.events.filter(event => 
    ['menu_item_added', 'menu_item_updated', 'menu_item_deleted'].includes(event.type)
  );
  
  const itemStats = {};
  
  // Track customer views
  customerViews.forEach(event => {
    const itemName = event.data.itemName || 'Unknown';
    if (!itemStats[itemName]) {
      itemStats[itemName] = {
        name: itemName,
        customerViews: 0,
        added: 0,
        updated: 0,
        deleted: 0,
        total: 0
      };
    }
    itemStats[itemName].customerViews++;
    itemStats[itemName].total++;
  });
  
  // Track vendor edits (secondary metric)
  vendorEdits.forEach(event => {
    const itemName = event.data.item?.name || event.data.name || 'Unknown';
    const itemId = event.data.item?.id || event.data.id;
    
    if (!itemStats[itemName]) {
      itemStats[itemName] = {
        name: itemName,
        id: itemId,
        customerViews: 0,
        added: 0,
        updated: 0,
        deleted: 0,
        total: 0
      };
    }
    
    if (event.type === 'menu_item_added') itemStats[itemName].added++;
    if (event.type === 'menu_item_updated') itemStats[itemName].updated++;
    if (event.type === 'menu_item_deleted') itemStats[itemName].deleted++;
    itemStats[itemName].total++;
  });
  
  return Object.values(itemStats)
    .sort((a, b) => {
      // Prioritize customer views, then total interactions
      if (b.customerViews !== a.customerViews) {
        return b.customerViews - a.customerViews;
      }
      return b.total - a.total;
    })
    .slice(0, 10); // Top 10
};

/**
 * Get category performance
 */
export const getCategoryPerformance = (menuItems) => {
  const analytics = getAnalytics();
  const categoryStats = {};
  
  // Initialize with current menu items
  menuItems.forEach(item => {
    const category = item.category || 'Other';
    if (!categoryStats[category]) {
      categoryStats[category] = {
        name: category,
        itemCount: 0,
        interactions: 0,
        revenue: 0 // Can be calculated if we track orders
      };
    }
    categoryStats[category].itemCount++;
  });
  
  // Count interactions per category
  analytics.events.forEach(event => {
    if (['menu_item_added', 'menu_item_updated'].includes(event.type)) {
      const category = event.data.item?.category || event.data.category || 'Other';
      if (categoryStats[category]) {
        categoryStats[category].interactions++;
      }
    }
  });
  
  return Object.values(categoryStats);
};

/**
 * Get activity timeline (last 7 days)
 */
export const getActivityTimeline = (days = 7) => {
  const events = getEventsForLastDays(days);
  const timeline = [];
  
  // Generate days array
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const dayStart = startOfDay(date).getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    
    const dayEvents = events.filter(event => 
      event.timestamp >= dayStart && event.timestamp < dayEnd
    );
    
    timeline.push({
      date: dateKey,
      label: format(date, 'MMM dd'),
      total: dayEvents.length,
      added: dayEvents.filter(e => e.type === 'menu_item_added').length,
      updated: dayEvents.filter(e => e.type === 'menu_item_updated').length,
      deleted: dayEvents.filter(e => e.type === 'menu_item_deleted').length,
      qrGenerated: dayEvents.filter(e => e.type === 'qr_generated').length,
      qrDownloaded: dayEvents.filter(e => e.type === 'qr_downloaded').length
    });
  }
  
  return timeline;
};

/**
 * Get event type breakdown
 */
export const getEventTypeBreakdown = () => {
  const analytics = getAnalytics();
  const breakdown = {};
  
  analytics.events.forEach(event => {
    breakdown[event.type] = (breakdown[event.type] || 0) + 1;
  });
  
  return Object.entries(breakdown)
    .map(([type, count]) => ({
      type: formatEventType(type),
      rawType: type,
      count,
      percentage: ((count / analytics.events.length) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Get QR code analytics
 */
export const getQRAnalytics = () => {
  const generated = getEventsByType('qr_generated');
  const downloaded = getEventsByType('qr_downloaded');
  
  return {
    totalGenerated: generated.length,
    totalDownloaded: downloaded.length,
    conversionRate: generated.length > 0 
      ? ((downloaded.length / generated.length) * 100).toFixed(1)
      : 0,
    recentGenerations: generated.slice(0, 5),
    recentDownloads: downloaded.slice(0, 5)
  };
};

/**
 * Get peak activity hours
 */
export const getPeakActivityHours = () => {
  const analytics = getAnalytics();
  const hourCounts = Array(24).fill(0);
  
  analytics.events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count
  }));
};

/**
 * Get overall insights
 */
export const getInsights = (menuItems) => {
  const analytics = getAnalytics();
  const itemPopularity = getItemPopularity();
  const categoryPerformance = getCategoryPerformance(menuItems);
  const qrAnalytics = getQRAnalytics();
  const timeline = getActivityTimeline(7);
  
  // Calculate trends
  const recentActivity = timeline.slice(-3).reduce((sum, day) => sum + day.total, 0);
  const olderActivity = timeline.slice(0, 3).reduce((sum, day) => sum + day.total, 0);
  const trend = olderActivity > 0 
    ? ((recentActivity - olderActivity) / olderActivity * 100).toFixed(1)
    : 0;
  
  return {
    totalEvents: analytics.events.length,
    totalItems: menuItems.length,
    totalCategories: new Set(menuItems.map(item => item.category || 'Other')).size,
    mostPopularItem: itemPopularity[0]?.name || 'N/A',
    mostActiveCategory: categoryPerformance.sort((a, b) => b.interactions - a.interactions)[0]?.name || 'N/A',
    qrGenerated: qrAnalytics.totalGenerated,
    qrDownloaded: qrAnalytics.totalDownloaded,
    activityTrend: trend > 0 ? `+${trend}%` : `${trend}%`,
    trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
  };
};

/**
 * Format event type for display
 */
const formatEventType = (type) => {
  const mapping = {
    'menu_item_added': 'Item Added',
    'menu_item_updated': 'Item Updated',
    'menu_item_deleted': 'Item Deleted',
    'menu_viewed': 'Menu Viewed',
    'qr_generated': 'QR Generated',
    'qr_downloaded': 'QR Downloaded',
    'category_changed': 'Category Changed',
    'item_availability_toggled': 'Availability Toggled',
    'customer_menu_viewed': '👤 Customer Menu View',
    'customer_item_viewed': '👤 Customer Item Click',
    'customer_category_viewed': '👤 Customer Category Switch',
    'customer_session_ended': '👤 Customer Session End'
  };
  return mapping[type] || type;
};

/**
 * Get customer analytics (REAL customer behavior!)
 */
export const getCustomerAnalytics = () => {
  const menuViews = getEventsByType('customer_menu_viewed');
  const itemViews = getEventsByType('customer_item_viewed');
  const categoryViews = getEventsByType('customer_category_viewed');
  const sessions = getEventsByType('customer_session_ended');

  // Most viewed items by customers
  const itemViewStats = {};
  itemViews.forEach(event => {
    const itemName = event.data.itemName;
    if (!itemViewStats[itemName]) {
      itemViewStats[itemName] = {
        name: itemName,
        views: 0,
        price: event.data.itemPrice,
        category: event.data.category
      };
    }
    itemViewStats[itemName].views++;
  });

  const topViewedItems = Object.values(itemViewStats)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Most browsed categories
  const categoryViewStats = {};
  categoryViews.forEach(event => {
    const category = event.data.category;
    categoryViewStats[category] = (categoryViewStats[category] || 0) + 1;
  });

  // Average session duration
  const avgSessionDuration = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.data.durationSeconds || 0), 0) / sessions.length
    : 0;

  return {
    totalMenuViews: menuViews.length,
    totalItemViews: itemViews.length,
    totalCategoryViews: categoryViews.length,
    totalSessions: sessions.length,
    avgSessionDuration: Math.round(avgSessionDuration),
    topViewedItems,
    categoryViewStats,
    conversionRate: menuViews.length > 0 
      ? ((itemViews.length / menuViews.length) * 100).toFixed(1)
      : 0
  };
};

