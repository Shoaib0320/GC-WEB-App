// src/app/(agent)/agent/dashboard/page.jsx
"use client";
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Calendar, 
  Zap, 
  Award, 
  Star, 
  TrendingUp, 
  Target,
  ChevronRight,
  Activity,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { AgentContext } from '../../../../context/AgentContext';
import { useOfficeLocation } from '../../../../context/LocationContext';
import { ThemeContext } from '../../../../context/ThemeContext';
import { agentAttendanceService } from '../../../../services/agentAttendenceService';
import { agentSalesService } from '../../../../services/agentSalesService';
import { getAddressFromCoords, getCurrentLocation, getDistance } from '../../../../utils/locationUtils';
import ShiftSchedule from '../../../../components/ShiftSchedule';

// Accuracy threshold — ignore fixes with accuracy worse than this (in meters)
const ACCURACY_THRESHOLD = 1000;

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: custom * 0.1, ease: "easeOut" }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const HomeScreen = () => {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { agent, isLoggedIn, isLoading: agentLoading } = useContext(AgentContext);
  const { officeLocation, checkRadius } = useOfficeLocation();

  const [distance, setDistance] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAtOffice, setIsAtOffice] = useState(false);
  const [agentStats, setAgentStats] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [attendanceData, setAttendanceData] = useState({
    todayStatus: null,
    monthlyStats: null,
    todaysCheckIns: 0,
    lastCheckInTime: null
  });

  // Mock data for UI
  const [stats, setStats] = useState({
    totalBookings: 0,
    monthlyRevenue: 0,
    activeLeads: 0,
    conversionRate: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Helper functions
  const pickMostRecent = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr.slice().sort((a, b) => {
      const aT = (a.checkInTime || a.createdAt) ? new Date(a.checkInTime || a.createdAt).getTime() : 0;
      const bT = (b.checkInTime || b.createdAt) ? new Date(b.checkInTime || b.createdAt).getTime() : 0;
      return bT - aT;
    })[0];
  };

  const normalizeMonthlyStats = (payload) => {
    if (!payload) return null;
    if (payload.summary && typeof payload.summary === 'object') {
      const s = payload.summary;
      return {
        present: s.present ?? s.presentDays ?? 0,
        late: s.late ?? 0,
        absent: s.absent ?? 0,
        completed: s.completed ?? s.completedDays ?? 0,
        totalLateMinutes: s.totalLateMinutes ?? 0,
        totalOvertimeMinutes: s.totalOvertimeMinutes ?? 0,
        raw: payload,
        records: payload.records ?? []
      };
    }
    if (typeof payload.present === 'number' || typeof payload.late === 'number') {
      return {
        present: payload.present ?? 0,
        late: payload.late ?? 0,
        absent: payload.absent ?? 0,
        completed: payload.completed ?? 0,
        totalLateMinutes: payload.totalLateMinutes ?? 0,
        totalOvertimeMinutes: payload.totalOvertimeMinutes ?? 0,
        raw: payload,
        records: payload.records ?? []
      };
    }
    if (Array.isArray(payload)) {
      const present = payload.filter(r => r.status === 'present').length;
      const late = payload.filter(r => r.status === 'late').length;
      const absent = payload.filter(r => r.status === 'absent').length;
      const completed = payload.filter(r => r.checkOutTime).length;
      const totalLateMinutes = payload.reduce((s, r) => s + (r.lateMinutes || 0), 0);
      const totalOvertimeMinutes = payload.reduce((s, r) => s + (r.overtimeMinutes || 0), 0);
      return { present, late, absent, completed, totalLateMinutes, totalOvertimeMinutes, raw: payload, records: payload };
    }
    if (payload.data) return normalizeMonthlyStats(payload.data);
    if (payload.result) return normalizeMonthlyStats(payload.result);
    return null;
  };

  // Data fetching functions
  const fetchAttendanceData = async () => {
    try {
      const [todayStatusResp, monthlyStatsResp] = await Promise.allSettled([
        agentAttendanceService.getTodayStatus?.(),
        agentAttendanceService.getMonthlySummary?.()
      ]);

      let todayStatus = null;
      if (todayStatusResp.status === 'fulfilled') {
        const t = todayStatusResp.value?.data ?? todayStatusResp.value;
        if (Array.isArray(t)) {
          todayStatus = pickMostRecent(t);
        } else if (t && typeof t === 'object') {
          todayStatus = t.record ?? t.attendance ?? t;
        }
      }

      let monthlyStats = null;
      if (monthlyStatsResp.status === 'fulfilled') {
        const m = monthlyStatsResp.value?.data ?? monthlyStatsResp.value;
        monthlyStats = normalizeMonthlyStats(m);
      }

      const todaysCheckIns = todayStatus ? 1 : 0;
      const lastCheckInTime = todayStatus?.checkInTime || todayStatus?.createdAt || null;

      setAttendanceData({
        todayStatus,
        monthlyStats,
        todaysCheckIns,
        lastCheckInTime
      });

    } catch (error) {
      console.error('❌ Error fetching attendance:', error);
      setAttendanceData({
        todayStatus: null,
        monthlyStats: null,
        todaysCheckIns: 0,
        lastCheckInTime: null
      });
    }
  };

  const fetchAgentStats = async () => {
    if (!agent?.id && !agent?._id) return;
    
    try {
      const agentId = agent.id || agent._id;
      const [overviewResponse, statsResponse, bookingsResponse] = await Promise.all([
        agentSalesService.getAgentSalesOverview(agentId),
        agentSalesService.getAgentBookingStats(agentId),
        agentSalesService.getAgentBookings(agentId, { limit: 5 })
      ]);

      const statsData = {
        overview: overviewResponse?.overview || {},
        bookingStats: statsResponse?.overview || {},
        recentBookings: bookingsResponse?.bookings || bookingsResponse || [],
        promoCodes: overviewResponse?.promoCodeAnalytics || []
      };

      setAgentStats(statsData);

      // Update stats for UI
      setStats({
        totalBookings: statsData.overview.totalBookings || 0,
        monthlyRevenue: statsData.overview.monthlyRevenue || 0,
        activeLeads: statsData.overview.activeLeads || 0,
        conversionRate: statsData.overview.conversionRate || 0
      });

      // Create recent activity from bookings
      const activity = statsData.recentBookings.slice(0, 5).map((booking, index) => ({
        id: booking._id || index,
        type: 'booking',
        status: booking.status === 'completed' ? 'success' : 'pending',
        message: `New booking from ${booking.formData?.firstName || 'Customer'}`,
        amount: booking.amount || Math.random() * 1000,
        time: new Date(booking.createdAt).toLocaleDateString('en-IN', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      setRecentActivity(activity);

    } catch (error) {
      console.error('❌ Error fetching agent stats:', error);
    }
  };

  const fetchLocationData = async () => {
    try {
      // Get location from agent's current location only (real-time)
      let location = null;
      let address = '';

      // Use agent's current location from context (real-time)
      if (agent?.location?.latitude && agent?.location?.longitude) {
        location = {
          latitude: agent.location.latitude,
          longitude: agent.location.longitude,
          accuracy: agent.location.accuracy
        };
        address = agent.location.address || '';
        console.log('✅ Using real-time agent location from context:', location);
      }
      // If agent doesn't have location yet, try to fetch fresh
      else {
        try {
          console.log('📍 Agent location not available, fetching fresh...');
          const freshLocation = await getCurrentLocation();
          if (freshLocation) {
            location = freshLocation;
            try {
              const freshAddress = await getAddressFromCoords(freshLocation.latitude, freshLocation.longitude);
              address = freshAddress || '';
            } catch (addressError) {
              console.warn('Could not get address:', addressError);
            }
            console.log('✅ Fetched fresh location from browser:', location);
          }
        } catch (error) {
          console.warn('Failed to get fresh location from browser:', error);
        }
      }

      if (!location || !location.latitude || !location.longitude) {
        console.warn('❌ No valid location found');
        setCurrentAddress('Location unavailable');
        setIsAtOffice(false);
        setDistance(null);
        setLocationAccuracy(null);
        setLastLocationUpdate(null);
        return;
      }

      // If accuracy exists and is too poor, don't use this location
      if (location.accuracy && location.accuracy > ACCURACY_THRESHOLD) {
        console.warn(`⚠️ Location accuracy ${location.accuracy}m is worse than threshold ${ACCURACY_THRESHOLD}m — ignoring`);
        setCurrentAddress('Location unavailable (low accuracy)');
        setIsAtOffice(false);
        setDistance(null);
        setLocationAccuracy(location.accuracy || null);
        setLastLocationUpdate(new Date());
        return;
      }

      // Calculate distance to office
      const dist = getDistance(
        location.latitude,
        location.longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );
      
      console.log('📏 Distance to office:', dist, 'meters, Check radius:', checkRadius);
      
      setCurrentAddress(address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      setIsAtOffice(dist <= checkRadius);
      setDistance(dist);
      setLocationAccuracy(location.accuracy || null);
      setLastLocationUpdate(new Date());
    } catch (error) {
      console.error('❌ Error fetching location:', error);
      setCurrentAddress('Address unavailable');
      setIsAtOffice(false);
      setDistance(null);
      setLocationAccuracy(null);
    }
  };

  const fetchAllData = async () => {
    if (!isLoggedIn || agentLoading) {
      console.log('⏳ Waiting for login or agent to load...');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Fetching all dashboard data...');
      await Promise.all([
        fetchLocationData(),
        fetchAttendanceData(),
        fetchAgentStats()
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when login status or agent changes
  useEffect(() => {
    if (isLoggedIn && !agentLoading) {
      fetchAllData();
      
      // Refetch location every 10 seconds (reduced frequency for better performance)
      const locationRefreshInterval = setInterval(() => {
        fetchLocationData();
      }, 10000);
      
      return () => clearInterval(locationRefreshInterval);
    }
  }, [officeLocation, checkRadius, agent, isLoggedIn, agentLoading]);

  // Watch for agent location changes specifically
  useEffect(() => {
    if (agent?.location && isLoggedIn) {
      console.log('📍 Agent location updated, refreshing display:', agent.location);
      fetchLocationData();
    }
  }, [agent?.location?.latitude, agent?.location?.longitude]);

  // Show loading while agent context is loading
  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-600 text-lg font-medium"
          >
            Loading your dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!isLoggedIn) {
    router.push('/agent/login');
    return null;
  }

  // UI Helpers
  const formatDistance = (dist) => {
    if (dist == null) return 'Unknown';
    
    // If within 10m radius, show "You're in office"
    if (dist <= checkRadius) {
      return '✅ You\'re in office';
    }
    
    // If greater than 10m, show distance from office
    if (dist < 1000) {
      return `📏 ${dist.toFixed(0)} m from office`;
    }
    
    return `📏 ${(dist / 1000).toFixed(2)} km from office`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'None';
    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const goToAttendance = () => router.push('/agent/attendance');
  const goToSales = () => router.push('/agent/sales');

  // Stat cards data
  const statCards = [
    {
      title: "Today's Check-ins",
      value: attendanceData.todaysCheckIns?.toString() || '0',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100',
      textColor: 'text-emerald-700',
      onClick: goToAttendance
    },
    {
      title: "Present Days",
      value: (attendanceData.monthlyStats?.present || 0).toString(),
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      textColor: 'text-blue-700',
      onClick: goToAttendance
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-purple-100',
      textColor: 'text-violet-700',
      onClick: goToSales
    },
    {
      title: "Active Leads",
      value: stats.activeLeads.toString(),
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
      textColor: 'text-amber-700',
      onClick: goToSales
    }
  ];

  const getActivityIcon = (type, status) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (status) {
      case 'success':
        return <CheckCircle2 {...iconProps} className="text-emerald-500" />;
      case 'pending':
        return <Clock {...iconProps} className="text-amber-500" />;
      default:
        return <Activity {...iconProps} className="text-slate-500" />;
    }
  };

  // Normalize monthly stats
  const ms = attendanceData.monthlyStats || {};
  const presentCount = ms.present ?? 0;
  const lateCount = ms.late ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8"
      >
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            Welcome back, {agent?.agentName || agent?.name || "Agent"}! 👋
          </h1>
          <p className="text-slate-600 mt-2 text-lg lg:text-xl max-w-2xl">
            Here's your performance overview and today's insights
          </p>
        </div>
        
        {/* Status Badge */}
        <motion.div 
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div>
              <p className="font-semibold text-sm">Online Status</p>
              <p className="text-xs opacity-90">Active and ready</p>
            </div>
            <Sparkles className="h-5 w-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* Location Info Card */}
      {(currentAddress || distance !== null) && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 mb-6 lg:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4 flex-1">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-2 flex-1">
                {currentAddress && (
                  <p className="text-slate-700 font-medium flex items-center gap-2">
                    <span className="text-slate-500">📍</span>
                    {currentAddress}
                  </p>
                )}
                {distance !== null && (
                  <p className="text-slate-600 flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-400" />
                    Distance from office: <span className="font-semibold text-slate-800">{formatDistance(distance)}</span>
                  </p>
                )}
                {/* Real-time tracking status */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                  <motion.div 
                    className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200"
                    animate={{ opacity: [0.7, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="font-medium">Live Tracking</span>
                  </motion.div>
                  {/* Show accuracy badge only when NOT at office */}
                  {locationAccuracy && !isAtOffice && (
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">
                      <span>Accuracy: {locationAccuracy.toFixed(2)}m</span>
                    </div>
                  )}
                  {lastLocationUpdate && (
                    <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
                      <span>Updated: {lastLocationUpdate.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isAtOffice && (
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200">
                🏢 At Office Location
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            variants={scaleIn}
            custom={index}
            onClick={stat.onClick}
            className="cursor-pointer group"
          >
            <div className={`${stat.bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 group-hover:shadow-xl transition-all duration-300 h-full`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-500">
                <span>View details</span>
                <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid - UPDATED LAYOUT WITH SHIFT SCHEDULE */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 lg:gap-8">
        {/* Recent Activity - 4/7 width on large screens */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="xl:col-span-4"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            {/* Header with Actions */}
            <div className="p-6 border-b border-slate-100/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-xl mr-3">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                    <p className="text-slate-600 text-sm">Latest bookings and updates</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <Filter className="h-4 w-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <Download className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Activity List */}
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-slate-900 truncate">
                          {activity.message}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          {activity.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          ₹{activity.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        activity.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {activity.status}
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 text-lg">No recent activity</p>
                    <p className="text-slate-400 text-sm mt-2">New activities will appear here</p>
                  </div>
                )}
              </div>

              {/* View All Button */}
              {recentActivity.length > 0 && (
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToSales}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold text-slate-700 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View All Activity
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar - 3/7 width on large screens */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="xl:col-span-3 space-y-6 lg:space-y-8"
        >
          {/* Shift Schedule Component */}
          <ShiftSchedule />

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100/50 bg-gradient-to-r from-blue-50 to-indigo-50/50">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-xl mr-3">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: Users, label: "Add New Lead", color: "from-blue-500 to-blue-600", onClick: goToSales },
                { icon: Calendar, label: "Schedule Follow-up", color: "from-emerald-500 to-emerald-600" },
                { icon: BarChart3, label: "View Attendance", color: "from-purple-500 to-purple-600", onClick: goToAttendance },
                { icon: DollarSign, label: "Generate Report", color: "from-amber-500 to-amber-600" }
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  className={`w-full text-left bg-gradient-to-r ${action.color} hover:shadow-lg text-white border-0 rounded-xl py-4 font-semibold transition-all duration-200 flex items-center px-4 gap-3`}
                >
                  <action.icon className="h-5 w-5" />
                  {action.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Monthly Goal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-xl mr-3">
                    <Award className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Monthly Goal</h3>
                </div>
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-semibold rounded-full">
                  🎯 Active
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">Revenue Target</span>
                    <span className="text-sm text-slate-600">₹15,000</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                      <motion.div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full shadow-sm"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stats.monthlyRevenue / 15000) * 100, 100)}%` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { value: `₹${stats.monthlyRevenue.toLocaleString()}`, label: "Current" },
                    { value: `₹${Math.max(0, 15000 - stats.monthlyRevenue).toLocaleString()}`, label: "Remaining" },
                    { value: `${Math.round(Math.min((stats.monthlyRevenue / 15000) * 100, 100))}%`, label: "Progress" }
                  ].map((item, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-lg font-bold text-slate-900">{item.value}</p>
                      <p className="text-xs text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100/50 bg-gradient-to-r from-amber-50 to-orange-50/50">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-xl mr-3">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Performance Insights</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { icon: TrendingUp, label: "Best Month", value: "December", color: "emerald" },
                  { icon: Users, label: "Top Service", value: "Car Detailing", color: "blue" },
                  { icon: Target, label: "Avg Rating", value: "4.8 ⭐", color: "purple" },
                  { icon: BarChart3, label: "Conversion Rate", value: `${stats.conversionRate}%`, color: "amber" }
                ].map((insight, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 bg-${insight.color}-50 rounded-xl border border-${insight.color}-200`}>
                    <div className="flex items-center text-sm">
                      <insight.icon className={`h-4 w-4 mr-2 text-${insight.color}-600`} />
                      <span className="text-slate-700 font-medium">{insight.label}</span>
                    </div>
                    <span className={`font-bold text-${insight.color}-700`}>{insight.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;