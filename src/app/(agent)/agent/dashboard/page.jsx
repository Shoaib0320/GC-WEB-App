// // src/app/(agent)/agent/dashboard/page.jsx
// "use client";
// import { useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { 
//   BarChart3, 
//   MapPin, 
//   Users, 
//   Calendar, 
//   Zap, 
//   Award, 
//   Star, 
//   TrendingUp, 
//   Target,
//   ChevronRight,
//   Activity,
//   DollarSign,
//   Clock,
//   CheckCircle2,
//   XCircle
// } from 'lucide-react';
// import { AgentContext } from '../../../../context/AgentContext';
// import { useOfficeLocation } from '../../../../context/LocationContext';
// import { ThemeContext } from '../../../../context/ThemeContext';
// import { agentAttendanceService } from '../../../../services/agentAttendenceService';
// import { agentSalesService } from '../../../../services/agentSalesService';
// import { getAddressFromCoords, getCurrentLocation, getDistance } from '../../../../utils/locationUtils';

// // Animation variants
// const fadeUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: (custom = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.6, delay: custom * 0.1 }
//   })
// };

// const HomeScreen = () => {
//   const router = useRouter();
//   const { theme } = useContext(ThemeContext);
//   const { agent, isLoggedIn, isLoading: agentLoading } = useContext(AgentContext);
//   const { officeLocation, checkRadius } = useOfficeLocation();

//   const [distance, setDistance] = useState(null);
//   const [currentAddress, setCurrentAddress] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [isAtOffice, setIsAtOffice] = useState(false);
//   const [agentStats, setAgentStats] = useState(null);
//   const [attendanceData, setAttendanceData] = useState({
//     todayStatus: null,
//     monthlyStats: null,
//     todaysCheckIns: 0,
//     lastCheckInTime: null
//   });

//   // Mock data for UI
//   const [stats, setStats] = useState({
//     totalBookings: 0,
//     monthlyRevenue: 0,
//     activeLeads: 0,
//     conversionRate: 0
//   });

//   const [recentActivity, setRecentActivity] = useState([]);

//   // Helper functions
//   const pickMostRecent = (arr) => {
//     if (!Array.isArray(arr) || arr.length === 0) return null;
//     return arr.slice().sort((a, b) => {
//       const aT = (a.checkInTime || a.createdAt) ? new Date(a.checkInTime || a.createdAt).getTime() : 0;
//       const bT = (b.checkInTime || b.createdAt) ? new Date(b.checkInTime || b.createdAt).getTime() : 0;
//       return bT - aT;
//     })[0];
//   };

//   const normalizeMonthlyStats = (payload) => {
//     if (!payload) return null;
//     if (payload.summary && typeof payload.summary === 'object') {
//       const s = payload.summary;
//       return {
//         present: s.present ?? s.presentDays ?? 0,
//         late: s.late ?? 0,
//         absent: s.absent ?? 0,
//         completed: s.completed ?? s.completedDays ?? 0,
//         totalLateMinutes: s.totalLateMinutes ?? 0,
//         totalOvertimeMinutes: s.totalOvertimeMinutes ?? 0,
//         raw: payload,
//         records: payload.records ?? []
//       };
//     }
//     if (typeof payload.present === 'number' || typeof payload.late === 'number') {
//       return {
//         present: payload.present ?? 0,
//         late: payload.late ?? 0,
//         absent: payload.absent ?? 0,
//         completed: payload.completed ?? 0,
//         totalLateMinutes: payload.totalLateMinutes ?? 0,
//         totalOvertimeMinutes: payload.totalOvertimeMinutes ?? 0,
//         raw: payload,
//         records: payload.records ?? []
//       };
//     }
//     if (Array.isArray(payload)) {
//       const present = payload.filter(r => r.status === 'present').length;
//       const late = payload.filter(r => r.status === 'late').length;
//       const absent = payload.filter(r => r.status === 'absent').length;
//       const completed = payload.filter(r => r.checkOutTime).length;
//       const totalLateMinutes = payload.reduce((s, r) => s + (r.lateMinutes || 0), 0);
//       const totalOvertimeMinutes = payload.reduce((s, r) => s + (r.overtimeMinutes || 0), 0);
//       return { present, late, absent, completed, totalLateMinutes, totalOvertimeMinutes, raw: payload, records: payload };
//     }
//     if (payload.data) return normalizeMonthlyStats(payload.data);
//     if (payload.result) return normalizeMonthlyStats(payload.result);
//     return null;
//   };

//   // Data fetching functions
//   const fetchAttendanceData = async () => {
//     try {
//       const [todayStatusResp, monthlyStatsResp] = await Promise.allSettled([
//         agentAttendanceService.getTodayStatus?.(),
//         agentAttendanceService.getMonthlySummary?.()
//       ]);

//       let todayStatus = null;
//       if (todayStatusResp.status === 'fulfilled') {
//         const t = todayStatusResp.value?.data ?? todayStatusResp.value;
//         if (Array.isArray(t)) {
//           todayStatus = pickMostRecent(t);
//         } else if (t && typeof t === 'object') {
//           todayStatus = t.record ?? t.attendance ?? t;
//         }
//       }

//       let monthlyStats = null;
//       if (monthlyStatsResp.status === 'fulfilled') {
//         const m = monthlyStatsResp.value?.data ?? monthlyStatsResp.value;
//         monthlyStats = normalizeMonthlyStats(m);
//       }

//       const todaysCheckIns = todayStatus ? 1 : 0;
//       const lastCheckInTime = todayStatus?.checkInTime || todayStatus?.createdAt || null;

//       setAttendanceData({
//         todayStatus,
//         monthlyStats,
//         todaysCheckIns,
//         lastCheckInTime
//       });

//     } catch (error) {
//       console.error('❌ Error fetching attendance:', error);
//       setAttendanceData({
//         todayStatus: null,
//         monthlyStats: null,
//         todaysCheckIns: 0,
//         lastCheckInTime: null
//       });
//     }
//   };

//   const fetchAgentStats = async () => {
//     if (!agent?.id && !agent?._id) return;
    
//     try {
//       const agentId = agent.id || agent._id;
//       const [overviewResponse, statsResponse, bookingsResponse] = await Promise.all([
//         agentSalesService.getAgentSalesOverview(agentId),
//         agentSalesService.getAgentBookingStats(agentId),
//         agentSalesService.getAgentBookings(agentId, { limit: 5 })
//       ]);

//       const statsData = {
//         overview: overviewResponse?.overview || {},
//         bookingStats: statsResponse?.overview || {},
//         recentBookings: bookingsResponse?.bookings || bookingsResponse || [],
//         promoCodes: overviewResponse?.promoCodeAnalytics || []
//       };

//       setAgentStats(statsData);

//       // Update stats for UI
//       setStats({
//         totalBookings: statsData.overview.totalBookings || 0,
//         monthlyRevenue: statsData.overview.monthlyRevenue || 0,
//         activeLeads: statsData.overview.activeLeads || 0,
//         conversionRate: statsData.overview.conversionRate || 0
//       });

//       // Create recent activity from bookings
//       const activity = statsData.recentBookings.slice(0, 5).map((booking, index) => ({
//         id: booking._id || index,
//         type: 'booking',
//         status: booking.status === 'completed' ? 'success' : 'pending',
//         message: `New booking from ${booking.formData?.firstName || 'Customer'}`,
//         time: new Date(booking.createdAt).toLocaleDateString('en-IN', { 
//           month: 'short', 
//           day: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit'
//         })
//       }));

//       setRecentActivity(activity);

//     } catch (error) {
//       console.error('❌ Error fetching agent stats:', error);
//     }
//   };

//   const fetchLocationData = async () => {
//     try {
//       // Use agent's current location from context if available
//       let location;
//       if (agent?.location?.latitude && agent?.location?.longitude) {
//         location = {
//           latitude: agent.location.latitude,
//           longitude: agent.location.longitude
//         };
//         setCurrentAddress(agent.location.address || '');
//       } else {
//         // Fallback to getting current location
//         location = await getCurrentLocation();
//         const address = await getAddressFromCoords(location.latitude, location.longitude);
//         setCurrentAddress(address);
//       }

//       const dist = getDistance(
//         location.latitude,
//         location.longitude,
//         officeLocation.latitude,
//         officeLocation.longitude
//       );
      
//       setIsAtOffice(dist <= checkRadius);
//       setDistance(dist);
//     } catch (error) {
//       console.error('❌ Error fetching location:', error);
//       setCurrentAddress('Address unavailable');
//       setIsAtOffice(false);
//     }
//   };

//   const fetchAllData = async () => {
//     if (!isLoggedIn || agentLoading) return;
    
//     try {
//       setLoading(true);
//       await Promise.all([
//         fetchLocationData(),
//         fetchAttendanceData(),
//         fetchAgentStats()
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isLoggedIn && !agentLoading) {
//       fetchAllData();
//     }
//   }, [officeLocation, checkRadius, agent, isLoggedIn, agentLoading]);

//   // Show loading while agent context is loading
//   if (agentLoading) {
//     return (
//       <div className="w-full bg-white py-1 sm:py-2 md:py-4 flex items-center justify-center min-h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-slate-600">Loading agent data...</p>
//         </div>
//       </div>
//     );
//   }

//   // Redirect if not logged in
//   if (!isLoggedIn) {
//     router.push('/agent/login');
//     return null;
//   }

//   // UI Helpers
//   const formatDistance = (dist) => {
//     if (dist == null) return 'Unknown';
//     if (dist <= checkRadius) return 'At Office 🏢';
//     if (dist < 1000) return `${dist.toFixed(0)} m`;
//     return `${(dist / 1000).toFixed(2)} km`;
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return 'None';
//     return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//   };

//   const goToAttendance = () => router.push('/agent/attendance');
//   const goToSales = () => router.push('/agent/sales');

//   // Stat cards data
//   const statCards = [
//     {
//       title: "Today's Check-ins",
//       value: attendanceData.todaysCheckIns?.toString() || '0',
//       icon: CheckCircle2,
//       color: 'text-green-600'
//     },
//     {
//       title: "Present Days",
//       value: (attendanceData.monthlyStats?.present || 0).toString(),
//       icon: Users,
//       color: 'text-blue-600'
//     },
//     {
//       title: "Monthly Revenue",
//       value: `Rs. ${stats.monthlyRevenue.toLocaleString()}`,
//       icon: DollarSign,
//       color: 'text-emerald-600'
//     },
//     {
//       title: "Active Leads",
//       value: stats.activeLeads.toString(),
//       icon: TrendingUp,
//       color: 'text-purple-600'
//     }
//   ];

//   const getActivityIcon = (type, status) => {
//     const iconProps = { className: "h-5 w-5" };
    
//     switch (status) {
//       case 'success':
//         return <CheckCircle2 {...iconProps} className="text-emerald-500" />;
//       case 'pending':
//         return <Clock {...iconProps} className="text-amber-500" />;
//       default:
//         return <Activity {...iconProps} className="text-slate-500" />;
//     }
//   };

//   // Normalize monthly stats
//   const ms = attendanceData.monthlyStats || {};
//   const presentCount = ms.present ?? 0;
//   const lateCount = ms.late ?? 0;

//   return (
//     <div className="w-full bg-white py-1 sm:py-2 md:py-4 space-y-2 sm:space-y-4">
//       {/* Header */}
//       <div className="flex items-center">
//         <motion.div 
//           className="ml-auto mr-2 flex-shrink-0"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="text-emerald-500 border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm">
//             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//             <span className="text-sm font-medium">Online</span>
//           </div>
//         </motion.div>
//       </div>

//       {/* Welcome Card */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeUp}
//         custom={1}
//         className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"
//       >
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div className="flex items-start">
//             <div className="p-3 bg-indigo-100 rounded-xl mr-4">
//               <BarChart3 className="h-6 w-6 text-indigo-600" />
//             </div>
//             <div>
//               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
//                 Welcome back, {agent?.agentName || agent?.name || "Agent"}!
//               </h1>
//               <p className="text-slate-600 mt-2 text-base lg:text-lg">
//                 Here's what's happening with your business today.
//               </p>
//               {currentAddress && (
//                 <div className="flex items-center mt-3 text-sm text-slate-500">
//                   <MapPin className="h-4 w-4 mr-2 text-slate-400" />
//                   <span>Current location: {currentAddress}</span>
//                 </div>
//               )}
//               {distance !== null && (
//                 <div className="flex items-center mt-2 text-sm text-slate-500">
//                   <Target className="h-4 w-4 mr-2 text-slate-400" />
//                   <span>Distance from office: {formatDistance(distance)}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Stats Cards */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeUp}
//         custom={2}
//         className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
//       >
//         {statCards.map((stat, index) => (
//           <motion.div
//             key={index}
//             whileHover={{ scale: 1.03, y: -5 }}
//             whileTap={{ scale: 0.98 }}
//             className="cursor-pointer"
//             onClick={stat.title.includes('Check-in') ? goToAttendance : goToSales}
//           >
//             <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden h-full border border-gray-100">
//               <div className="p-6">
//                 <div className="flex items-center">
//                   <stat.icon className={`h-8 w-8 ${stat.color} mr-3`} />
//                   <div>
//                     <p className="text-2xl font-bold text-slate-900">
//                       {stat.value}
//                     </p>
//                     <p className="text-sm text-slate-600 mt-1">{stat.title}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Activity */}
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeUp}
//           custom={3}
//           className="lg:col-span-2"
//         >
//           <div className="bg-white backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
//             <div className="p-6 border-b border-gray-100">
//               <div className="flex items-center text-xl font-bold text-slate-800">
//                 <div className="p-2 bg-blue-100 rounded-lg mr-3">
//                   <Activity className="h-6 w-6 text-blue-600" />
//                 </div>
//                 Recent Activity
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
//                   <motion.div
//                     key={activity.id}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.05, duration: 0.4 }}
//                     className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-150/50 transition-all duration-300 border border-slate-200/50 shadow-sm hover:shadow-md rounded-xl"
//                   >
//                     <div className="flex items-center space-x-4 flex-1 mb-4 sm:mb-0">
//                       <div className="flex-shrink-0">
//                         {getActivityIcon(activity.type, activity.status)}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="text-base font-semibold text-slate-900 truncate">
//                           {activity.message}
//                         </h4>
//                         <p className="text-sm text-slate-500 mt-1 font-medium">
//                           {activity.time}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
//                       <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
//                         activity.status === 'success'
//                           ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
//                           : activity.status === 'pending'
//                           ? 'bg-amber-100 text-amber-700 border border-amber-200'
//                           : 'bg-slate-100 text-slate-700 border border-slate-200'
//                       }`}>
//                         {activity.status}
//                       </div>
//                       <motion.div
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         className="ml-4"
//                       >
//                         <button className="bg-white/50 border border-slate-300 hover:bg-slate-50 rounded-xl p-2">
//                           <ChevronRight className="h-4 w-4" />
//                         </button>
//                       </motion.div>
//                     </div>
//                   </motion.div>
//                 )) : (
//                   <div className="text-center py-8 text-slate-500">
//                     <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
//                     <p>No recent activity</p>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-6">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <button 
//                     onClick={goToSales}
//                     className="w-full bg-white/50 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold shadow-sm flex items-center justify-center"
//                   >
//                     <BarChart3 className="h-4 w-4 mr-2" />
//                     View All Activity
//                     <ChevronRight className="h-4 w-4 ml-2" />
//                   </button>
//                 </motion.div>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Quick Actions & Goals */}
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeUp}
//           custom={4}
//           className="space-y-6"
//         >
//           {/* Quick Actions */}
//           <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
//             <div className="p-6 border-b border-gray-100">
//               <div className="flex items-center text-xl font-bold text-slate-800">
//                 <div className="p-2 bg-indigo-100 rounded-lg mr-3">
//                   <Zap className="h-6 w-6 text-indigo-600" />
//                 </div>
//                 Quick Actions
//               </div>
//             </div>
//             <div className="p-4 space-y-3">
//               <motion.div
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <button 
//                   onClick={goToSales}
//                   className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center px-4"
//                 >
//                   <Users className="h-5 w-5 mr-3" />
//                   Add New Lead
//                 </button>
//               </motion.div>
//               <motion.div
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <button className="w-full justify-start bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center px-4">
//                   <Calendar className="h-5 w-5 mr-3" />
//                   Schedule Follow-up
//                 </button>
//               </motion.div>
//               <motion.div
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <button 
//                   onClick={goToAttendance}
//                   className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center px-4"
//                 >
//                   <BarChart3 className="h-5 w-5 mr-3" />
//                   View Attendance
//                 </button>
//               </motion.div>
//             </div>
//           </div>

//           {/* Monthly Goal */}
//           <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
//             <div className="p-6 border-b border-gray-100">
//               <div className="flex items-center text-xl font-bold text-slate-800">
//                 <div className="p-2 bg-emerald-100 rounded-lg mr-3">
//                   <Award className="h-6 w-6 text-emerald-600" />
//                 </div>
//                 Monthly Goal
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//                   <div>
//                     <span className="text-sm font-semibold text-slate-700">Revenue Target</span>
//                     <div className="flex items-center mt-2">
//                       <span className="font-bold text-slate-900 text-xl">Rs. 15,000</span>
//                       <span className="text-sm text-slate-600 ml-2">target</span>
//                     </div>
//                   </div>
//                   <div className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 text-sm font-semibold rounded-full">
//                     🎯 Goal Set
//                   </div>
//                 </div>
//                 <div className="relative">
//                   <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
//                     <motion.div
//                       className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-4 rounded-full shadow-sm"
//                       initial={{ width: 0 }}
//                       animate={{ width: `${Math.min((stats.monthlyRevenue / 15000) * 100, 100)}%` }}
//                       transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
//                     ></motion.div>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <p className="text-2xl font-bold text-slate-900">Rs. {stats.monthlyRevenue.toLocaleString()}</p>
//                     <p className="text-sm text-slate-600">Current</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <p className="text-2xl font-bold text-slate-900">Rs. {Math.max(0, 15000 - stats.monthlyRevenue).toLocaleString()}</p>
//                     <p className="text-sm text-slate-600">Remaining</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <p className="text-2xl font-bold text-slate-900">{Math.round(Math.min((stats.monthlyRevenue / 15000) * 100, 100))}%</p>
//                     <p className="text-sm text-slate-600">Progress</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Performance Insights */}
//           <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
//             <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50/50">
//               <div className="flex items-center text-xl font-bold text-slate-800">
//                 <div className="p-2 bg-amber-100 rounded-lg mr-3">
//                   <Star className="h-6 w-6 text-amber-600" />
//                 </div>
//                 Performance Insights
//               </div>
//             </div>
//             <div className="p-4">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
//                   <div className="flex items-center text-sm">
//                     <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
//                     <span className="text-slate-700 font-medium">Best Month</span>
//                   </div>
//                   <span className="font-bold text-emerald-700">December</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
//                   <div className="flex items-center text-sm">
//                     <Users className="h-4 w-4 mr-2 text-blue-600" />
//                     <span className="text-slate-700 font-medium">Top Service</span>
//                   </div>
//                   <span className="font-bold text-blue-700">Car Detailing</span>
//                 </div>
//                 <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
//                   <div className="flex items-center text-sm">
//                     <Target className="h-4 w-4 mr-2 text-purple-600" />
//                     <span className="text-slate-700 font-medium">Avg Rating</span>
//                   </div>
//                   <span className="font-bold text-purple-700">4.8 ⭐</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default HomeScreen;






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
  AlertCircle
} from 'lucide-react';
import { AgentContext } from '../../../../context/AgentContext';
import { useOfficeLocation } from '../../../../context/LocationContext';
import { ThemeContext } from '../../../../context/ThemeContext';
import { agentAttendanceService } from '../../../../services/agentAttendenceService';
import { agentSalesService } from '../../../../services/agentSalesService';
import { getEnhancedLocation, getDistance, checkLocationPermissions, getHighAccuracyLocation, getCurrentLocation, getAddressFromCoords } from '../../../../utils/locationUtils';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: custom * 0.1 }
  })
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
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
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

  // //
  // const fetchLocationData = async () => {
  //   try {
  //     setLocationLoading(true);
  //     setLocationError('');
      
  //     console.log('📍 Starting location fetch...');
      
  //     // Check permissions first
  //     const permission = await checkLocationPermissions();
  //     console.log('📍 Location permission:', permission);
      
  //     if (permission === 'denied') {
  //       throw new Error('Location access denied. Please enable location permissions in your browser settings.');
  //     }

  //     let location;
  //     let address = '';

  //     // Try to get enhanced location (with fallbacks)
  //     try {
  //       const enhancedLocation = await getEnhancedLocation();
  //       location = enhancedLocation;
  //       address = enhancedLocation.address;
  //       console.log('📍 Enhanced location success:', enhancedLocation.source);
  //     } catch (enhancedError) {
  //       console.error('📍 Enhanced location failed, trying basic method:', enhancedError);
        
  //       // Fallback to basic location
  //       location = await getCurrentLocation();
  //       address = await getAddressFromCoords(location.latitude, location.longitude);
  //     }

  //     setCurrentAddress(address);

  //     // Calculate distance
  //     const dist = getDistance(
  //       location.latitude,
  //       location.longitude,
  //       officeLocation.latitude,
  //       officeLocation.longitude
  //     );
      
  //     console.log('🏢 Office distance:', dist, 'meters');
  //     setIsAtOffice(dist <= checkRadius);
  //     setDistance(dist);

  //     // Cache the location
  //     localStorage.setItem('agentCurrentLocation', JSON.stringify({
  //       ...location,
  //       address,
  //       timestamp: Date.now()
  //     }));

  //   } catch (error) {
  //     console.error('❌ Error fetching location:', error);
  //     setLocationError(error.message);
  //     setCurrentAddress('Location unavailable');
  //     setIsAtOffice(false);
      
  //     // Try to use last known location from localStorage
  //     try {
  //       const cached = localStorage.getItem('agentCurrentLocation');
  //       if (cached) {
  //         const parsed = JSON.parse(cached);
  //         setCurrentAddress(parsed.address || 'Using last known location');
  //         if (parsed.latitude && parsed.longitude) {
  //           const dist = getDistance(
  //             parsed.latitude,
  //             parsed.longitude,
  //             officeLocation.latitude,
  //             officeLocation.longitude
  //           );
  //           setDistance(dist);
  //           setIsAtOffice(dist <= checkRadius);
  //         }
  //       }
  //     } catch (cacheError) {
  //       console.error('❌ Cache read error:', cacheError);
  //     }
  //   } finally {
  //     setLocationLoading(false);
  //   }
  // };
  // Dashboard page mein fetchLocationData function ko replace karen
const fetchLocationData = async () => {
  try {
    setLocationLoading(true);
    setLocationError('');
    
    console.log('📍 Starting high accuracy location fetch...');
    
    let location;
    let address = '';

    // Try high accuracy location first
    try {
      location = await getHighAccuracyLocation();
      address = await getAddressFromCoords(location.latitude, location.longitude);
      console.log('📍 High accuracy location success');
    } catch (highAccuracyError) {
      console.log('📍 High accuracy failed, trying normal location:', highAccuracyError);
      
      // Fallback to normal location
      try {
        location = await getCurrentLocation();
        address = await getAddressFromCoords(location.latitude, location.longitude);
        console.log('📍 Normal location success');
      } catch (normalError) {
        console.error('📍 All location methods failed:', normalError);
        throw normalError;
      }
    }

    setCurrentAddress(address);

    // Calculate distance
    const dist = getDistance(
      location.latitude,
      location.longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );
    
    console.log('🏢 Office distance:', dist, 'meters, Accuracy:', location.accuracy, 'meters');
    setIsAtOffice(dist <= checkRadius);
    setDistance(dist);

    // Cache the fresh location
    localStorage.setItem('agentCurrentLocation', JSON.stringify({
      ...location,
      address,
      timestamp: Date.now(),
      source: 'fresh'
    }));

  } catch (error) {
    console.error('❌ All location methods failed:', error);
    setLocationError(error.message);
    setCurrentAddress('Location unavailable - ' + error.message);
    setIsAtOffice(false);
    
    // Try to use last known location as fallback
    try {
      const cached = localStorage.getItem('agentCurrentLocation');
      if (cached) {
        const parsed = JSON.parse(cached);
        setCurrentAddress((parsed.address || 'Last known location') + ' (Cached)');
        if (parsed.latitude && parsed.longitude) {
          const dist = getDistance(
            parsed.latitude,
            parsed.longitude,
            officeLocation.latitude,
            officeLocation.longitude
          );
          setDistance(dist);
          setIsAtOffice(dist <= checkRadius);
        }
      }
    } catch (cacheError) {
      console.error('❌ Cache read error:', cacheError);
    }
  } finally {
    setLocationLoading(false);
  }
};

  const fetchAllData = async () => {
    if (!isLoggedIn || agentLoading) return;
    
    try {
      setLoading(true);
      await Promise.all([
        fetchLocationData(),
        fetchAttendanceData(),
        fetchAgentStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retryLocation = async () => {
    await fetchLocationData();
  };

  useEffect(() => {
    if (isLoggedIn && !agentLoading) {
      fetchAllData();
    }
  }, [officeLocation, checkRadius, agent, isLoggedIn, agentLoading]);

  // Show loading while agent context is loading
  if (agentLoading) {
    return (
      <div className="w-full bg-white py-1 sm:py-2 md:py-4 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading agent data...</p>
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
    if (dist <= checkRadius) return 'At Office 🏢';
    if (dist < 1000) return `${dist.toFixed(0)} m`;
    return `${(dist / 1000).toFixed(2)} km`;
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
      color: 'text-green-600'
    },
    {
      title: "Present Days",
      value: (attendanceData.monthlyStats?.present || 0).toString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: "Monthly Revenue",
      value: `Rs. ${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      title: "Active Leads",
      value: stats.activeLeads.toString(),
      icon: TrendingUp,
      color: 'text-purple-600'
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

  // Render location status
  const renderLocationStatus = () => {
    if (locationLoading) {
      return (
        <div className="flex items-center mt-3 text-sm text-slate-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
          <span>Fetching location...</span>
        </div>
      );
    }

    if (locationError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{locationError}</p>
              <button
                onClick={retryLocation}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md transition-colors"
              >
                Retry Location
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <>
        {currentAddress && (
          <div className="flex items-center mt-3 text-sm text-slate-500">
            <MapPin className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
            <span className="truncate">Current location: {currentAddress}</span>
          </div>
        )}
        {distance !== null && (
          <div className="flex items-center mt-2 text-sm text-slate-500">
            <Target className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
            <span>Distance from office: {formatDistance(distance)}</span>
            {isAtOffice && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200">
                At Office
              </span>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="w-full bg-white py-1 sm:py-2 md:py-4 space-y-2 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center">
        <motion.div 
          className="ml-auto mr-2 flex-shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-emerald-500 border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Online</span>
          </div>
        </motion.div>
      </div>

      {/* Welcome Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start">
            <div className="p-3 bg-indigo-100 rounded-xl mr-4">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Welcome back, {agent?.agentName || agent?.name || "Agent"}!
              </h1>
              <p className="text-slate-600 mt-2 text-base lg:text-lg">
                Here's what's happening with your business today.
              </p>
              
              {/* Location Status */}
              {renderLocationStatus()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={stat.title.includes('Check-in') ? goToAttendance : goToSales}
          >
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden h-full border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color} mr-3`} />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{stat.title}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="lg:col-span-2"
        >
          <div className="bg-white backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center text-xl font-bold text-slate-800">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                Recent Activity
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-150/50 transition-all duration-300 border border-slate-200/50 shadow-sm hover:shadow-md rounded-xl"
                  >
                    <div className="flex items-center space-x-4 flex-1 mb-4 sm:mb-0">
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

                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        activity.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : activity.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {activity.status}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="ml-4"
                      >
                        <button className="bg-white/50 border border-slate-300 hover:bg-slate-50 rounded-xl p-2">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button 
                    onClick={goToSales}
                    className="w-full bg-white/50 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold shadow-sm flex items-center justify-center"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View All Activity
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Goals */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center text-xl font-bold text-slate-800">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                Quick Actions
              </div>
            </div>
            <div className="p-4 space-y-3">
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <button 
                  onClick={goToSales}
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center px-4"
                >
                  <Users className="h-5 w-5 mr-3" />
                  Add New Lead
                </button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <button className="w-full justify-start bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center px-4">
                  <Calendar className="h-5 w-5 mr-3" />
                  Schedule Follow-up
                </button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <button 
                  onClick={goToAttendance}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center px-4"
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  View Attendance
                </button>
              </motion.div>
            </div>
          </div>

          {/* Monthly Goal */}
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center text-xl font-bold text-slate-800">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                Monthly Goal
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Revenue Target</span>
                    <div className="flex items-center mt-2">
                      <span className="font-bold text-slate-900 text-xl">Rs. 15,000</span>
                      <span className="text-sm text-slate-600 ml-2">target</span>
                    </div>
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 text-sm font-semibold rounded-full">
                    🎯 Goal Set
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-4 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.monthlyRevenue / 15000) * 100, 100)}%` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-slate-900">Rs. {stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Current</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-slate-900">Rs. {Math.max(0, 15000 - stats.monthlyRevenue).toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Remaining</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-slate-900">{Math.round(Math.min((stats.monthlyRevenue / 15000) * 100, 100))}%</p>
                    <p className="text-sm text-slate-600">Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50/50">
              <div className="flex items-center text-xl font-bold text-slate-800">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                Performance Insights
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="text-slate-700 font-medium">Best Month</span>
                  </div>
                  <span className="font-bold text-emerald-700">December</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-slate-700 font-medium">Top Service</span>
                  </div>
                  <span className="font-bold text-blue-700">Car Detailing</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center text-sm">
                    <Target className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-slate-700 font-medium">Avg Rating</span>
                  </div>
                  <span className="font-bold text-purple-700">4.8 ⭐</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;