/**
 * Analytics Dashboard Page
 * Practical Lab: Advanced Mobile Feature - Data Visualization
 * 
 * FEATURES:
 * ✅ Real-time analytics tracking
 * ✅ Multiple chart types (Line, Bar, Pie, Area)
 * ✅ Interactive visualizations
 * ✅ Insight cards with trends
 * ✅ Export analytics data
 * ✅ Time range filtering
 * 
 * LEARNING OBJECTIVES:
 * - Data visualization with Recharts
 * - Chart customization and theming
 * - Data aggregation and processing
 * - Performance metrics display
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  Activity,
  Package,
  Layers,
  QrCode,
  Clock,
  Zap,
  Users,
  Eye,
  MousePointer
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useUserContext } from '../contexts/UserContext';
import {
  getInsights,
  getActivityTimeline,
  getCategoryPerformance,
  getItemPopularity,
  getEventTypeBreakdown,
  getQRAnalytics,
  getPeakActivityHours,
  getCustomerAnalytics
} from '../services/analyticsService';
import { exportAnalytics, clearAnalytics } from '../services/analyticsStorage';
import { Button } from '../components/Shared/Button';
import { Card, CardHeader, CardBody } from '../components/Shared/Card';
import { EmptyState } from '../components/Shared/EmptyState';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export const AnalyticsPage = () => {
  const { menuItems } = useUserContext();
  const [insights, setInsights] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [itemPopularity, setItemPopularity] = useState([]);
  const [eventBreakdown, setEventBreakdown] = useState([]);
  const [qrAnalytics, setQRAnalytics] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // days
  const [refreshKey, setRefreshKey] = useState(0);

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [menuItems, timeRange, refreshKey]);

  const loadAnalytics = () => {
    const insightsData = getInsights(menuItems);
    const timelineData = getActivityTimeline(timeRange);
    const categoryData = getCategoryPerformance(menuItems);
    const popularityData = getItemPopularity();
    const breakdownData = getEventTypeBreakdown();
    const qrData = getQRAnalytics();
    const hoursData = getPeakActivityHours();
    const customerData = getCustomerAnalytics();

    setInsights(insightsData);
    setTimeline(timelineData);
    setCategoryData(categoryData);
    setItemPopularity(popularityData);
    setEventBreakdown(breakdownData);
    setQRAnalytics(qrData);
    setPeakHours(hoursData);
    setCustomerAnalytics(customerData);
  };

  const handleExport = () => {
    const blob = exportAnalytics();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickmenu-analytics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      clearAnalytics();
      setRefreshKey(prev => prev + 1);
    }
  };

  const hasData = insights && insights.totalEvents > 0;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          </div>
        </div>
        <div className="p-4">
          <EmptyState
            icon={Activity}
            title="No Analytics Data Yet"
            description="Start using your menu editor to see analytics here. Add items, generate QR codes, and watch your stats grow!"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Export Data"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                timeRange === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Key Metrics Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <MetricCard
            icon={Package}
            label="Total Items"
            value={insights.totalItems}
            color="bg-blue-500"
          />
          <MetricCard
            icon={Layers}
            label="Categories"
            value={insights.totalCategories}
            color="bg-purple-500"
          />
          <MetricCard
            icon={Activity}
            label="Total Events"
            value={insights.totalEvents}
            color="bg-pink-500"
          />
          <MetricCard
            icon={QrCode}
            label="QR Generated"
            value={insights.qrGenerated}
            color="bg-green-500"
          />
        </motion.div>

        {/* Insights Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <InsightCard
            title="Most Popular Item"
            value={insights.mostPopularItem}
            icon={Zap}
            color="text-yellow-600"
          />
          <InsightCard
            title="Active Category"
            value={insights.mostActiveCategory}
            icon={Layers}
            color="text-purple-600"
          />
          <InsightCard
            title="Activity Trend"
            value={insights.activityTrend}
            icon={
              insights.trendDirection === 'up'
                ? TrendingUp
                : insights.trendDirection === 'down'
                ? TrendingDown
                : Minus
            }
            color={
              insights.trendDirection === 'up'
                ? 'text-green-600'
                : insights.trendDirection === 'down'
                ? 'text-red-600'
                : 'text-gray-600'
            }
          />
        </motion.div>

        {/* 👤 CUSTOMER BEHAVIOR ANALYTICS (REAL DATA!) */}
        {customerAnalytics && customerAnalytics.totalMenuViews > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
              <CardHeader>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  👤 Customer Behavior (Real QR Scan Data!)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tracking actual customer interactions from QR code scans
                </p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-md">
                    <Users className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {customerAnalytics.totalMenuViews}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Menu Views</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-md">
                    <MousePointer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {customerAnalytics.totalItemViews}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Item Clicks</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-md">
                    <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {customerAnalytics.avgSessionDuration}s
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Avg Time</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-md">
                    <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {customerAnalytics.conversionRate}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Engagement</div>
                  </div>
                </div>
                
                {customerAnalytics.topViewedItems.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Most Viewed by Customers
                    </h3>
                    <div className="space-y-2">
                      {customerAnalytics.topViewedItems.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-cyan-600">#{index + 1}</span>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-bold">
                            {item.views} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Activity Timeline Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Timeline
              </h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Event Type Breakdown (Pie) & Category Performance (Bar) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Event Types Pie Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-800">Event Distribution</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={eventBreakdown}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.type}: ${entry.count}`}
                  >
                    {eventBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Category Performance Bar Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-800">Category Performance</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="itemCount" fill="#3b82f6" name="Items" />
                  <Bar dataKey="interactions" fill="#8b5cf6" name="Interactions" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Item Popularity List */}
        {itemPopularity.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-gray-800">Top 10 Popular Items</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sorted by customer views, then vendor interactions
                </p>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {itemPopularity.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${
                          item.customerViews > 0 ? 'bg-cyan-600' : 'bg-blue-600'
                        } text-white flex items-center justify-center font-bold`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                      <div className="flex gap-2 text-sm text-gray-600 flex-wrap justify-end">
                        {item.customerViews > 0 && (
                          <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded font-bold flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.customerViews} views
                          </span>
                        )}
                        {item.added > 0 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            +{item.added}
                          </span>
                        )}
                        {item.updated > 0 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            ↻{item.updated}
                          </span>
                        )}
                        {item.deleted > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                            -{item.deleted}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Peak Activity Hours */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Peak Activity Hours
              </h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* QR Analytics */}
        {qrAnalytics && qrAnalytics.totalGenerated > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code Analytics
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {qrAnalytics.totalGenerated}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Generated</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {qrAnalytics.totalDownloaded}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Downloaded</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">
                      {qrAnalytics.conversionRate}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Conversion</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Reset Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center pt-4"
        >
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Clear All Analytics Data
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-md">
    <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-600 mt-1">{label}</div>
  </div>
);

// Insight Card Component
const InsightCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-md">
    <div className={`flex items-center gap-2 mb-2 ${color}`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-600">{title}</span>
    </div>
    <div className="text-xl font-bold text-gray-800 truncate">{value}</div>
  </div>
);
