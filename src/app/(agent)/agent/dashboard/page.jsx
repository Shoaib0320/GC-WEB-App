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
//   Filter,
//   Download
// } from 'lucide-react';
// import { AgentContext } from '../../../../context/AgentContext';
// import { useOfficeLocation } from '../../../../context/LocationContext';
// import { agentAttendanceService } from '../../../../services/agentAttendenceService';
// import { agentSalesService } from '../../../../services/agentSalesService';
// import { getAddressFromCoords, getCurrentLocation, getDistance } from '../../../../utils/locationUtils';
// import ShiftSchedule from '../../../../components/ShiftSchedule';

// // Accuracy threshold — ignore fixes with accuracy worse than this (in meters)
// const ACCURACY_THRESHOLD = 1000;

// // Animation variants
// const fadeUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: (custom = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.6, delay: custom * 0.1, ease: "easeOut" }
//   })
// };

// const scaleIn = {
//   hidden: { opacity: 0, scale: 0.9 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: { duration: 0.5, ease: "easeOut" }
//   }
// };

// const HomeScreen = () => {
//   const router = useRouter();
//   const { agent, isLoggedIn, isLoading: agentLoading } = useContext(AgentContext);
//   const { officeLocation, checkRadius } = useOfficeLocation();

//   const [distance, setDistance] = useState(null);
//   const [currentAddress, setCurrentAddress] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [isAtOffice, setIsAtOffice] = useState(false);
//   const [agentStats, setAgentStats] = useState(null);
//   const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
//   const [locationAccuracy, setLocationAccuracy] = useState(null);
//   const [attendanceData, setAttendanceData] = useState({
//     todayStatus: null,
//     monthlyStats: null,
//     todaysCheckIns: 0,
//     lastCheckInTime: null
//   });

//   // Stats data for UI
//   const [stats, setStats] = useState({
//     totalBookings: 0,
//     monthlyTarget: 0,
//     achievedSales: 0, // Total number of sales achieved
//     activeLeads: 0,
//     conversionRate: 0
//   });

//   const [recentActivity, setRecentActivity] = useState([]);

//   // Fetch attendance data
//   const fetchAttendanceData = async () => {
//     try {
//       const [todayStatusResp, monthlyStatsResp] = await Promise.allSettled([
//         agentAttendanceService.getTodayStatus?.(),
//         agentAttendanceService.getMonthlySummary?.()
//       ]);

//       let todayStatus = null;
//       if (todayStatusResp.status === 'fulfilled') {
//         const data = todayStatusResp.value?.data ?? todayStatusResp.value;
//         todayStatus = Array.isArray(data) ? data[0] : data;
//       }

//       let monthlyStats = null;
//       if (monthlyStatsResp.status === 'fulfilled') {
//         monthlyStats = monthlyStatsResp.value?.data ?? monthlyStatsResp.value;
//       }

//       setAttendanceData({
//         todayStatus,
//         monthlyStats,
//         todaysCheckIns: todayStatus ? 1 : 0
//       });

//     } catch (error) {
//       console.error('Error fetching attendance:', error);
//     }
//   };
  
//   // Fetch agent stats
//   const fetchAgentStats = async () => {
//     if (!agent?.id && !agent?._id) return;
    
//     try {
//       const agentId = agent.id || agent._id;
      
//       // Get current month's start and end dates
//       const now = new Date();
//       const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//       const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
//       const [overviewResponse, bookingsResponse] = await Promise.all([
//         agentSalesService.getAgentSalesOverview(agentId),
//         agentSalesService.getAgentBookings(agentId, { limit: 100 }) // Get more bookings to filter current month
//       ]);

//       const overview = overviewResponse?.data?.overview || {};
      
//       // Get all bookings
//       const allBookings = Array.isArray(bookingsResponse?.data?.bookings) 
//         ? bookingsResponse.data.bookings 
//         : Array.isArray(bookingsResponse?.bookings) 
//         ? bookingsResponse.bookings 
//         : [];
      
//       // Filter current month's bookings
//       const currentMonthBookings = allBookings.filter(booking => {
//         const bookingDate = new Date(booking.createdAt);
//         return bookingDate >= currentMonthStart && bookingDate <= currentMonthEnd;
//       });
      
//       // Filter current month's completed bookings
//       const currentMonthCompletedBookings = currentMonthBookings.filter(booking => 
//         booking.status === 'completed' || booking.status === 'Completed'
//       );
      
//       setStats({
//         totalBookings: currentMonthBookings.length, // Current month's total bookings
//         monthlyTarget: agent.monthlyTarget || 0, // Agent's monthly sales target
//         achievedSales: currentMonthCompletedBookings.length, // Current month's completed bookings
//         activeLeads: overview.activePromoCodes || 0,
//         conversionRate: overview.conversionRate || 0
//       });

//       // Create recent activity from latest bookings
//       const activity = allBookings.slice(0, 5).map((booking, index) => ({
//         id: booking._id || index,
//         message: `New booking from ${booking?.formData?.firstName || booking?.customerName || 'Customer'}`,
//         time: new Date(booking.createdAt).toLocaleDateString('en-IN', {
//           month: 'short',
//           day: 'numeric'
//         })
//       }));

//       setRecentActivity(activity);

//     } catch (error) {
//       console.error('❌ Error fetching agent stats:', error);
//     }
//   };

//   const fetchLocationData = async () => {
//     try {
//       let location = null;
//       let address = '';

//       if (agent?.location?.latitude && agent?.location?.longitude) {
//         location = {
//           latitude: agent.location.latitude,
//           longitude: agent.location.longitude,
//           accuracy: agent.location.accuracy
//         };
//         address = agent.location.address || '';
//       }
//       else {
//         try {
//           const freshLocation = await getCurrentLocation();
//           if (freshLocation) {
//             location = freshLocation;
//             try {
//               const freshAddress = await getAddressFromCoords(freshLocation.latitude, freshLocation.longitude);
//               address = freshAddress || '';
//             } catch (addressError) {
//               console.warn('Could not get address:', addressError);
//             }
//           }
//         } catch (error) {
//           console.warn('Failed to get fresh location from browser:', error);
//         }
//       }

//       if (!location || !location.latitude || !location.longitude) {
//         setCurrentAddress('Location unavailable');
//         setIsAtOffice(false);
//         setDistance(null);
//         setLocationAccuracy(null);
//         setLastLocationUpdate(null);
//         return;
//       }

//       if (location.accuracy && location.accuracy > ACCURACY_THRESHOLD) {
//         setCurrentAddress('Location unavailable (low accuracy)');
//         setIsAtOffice(false);
//         setDistance(null);
//         setLocationAccuracy(location.accuracy || null);
//         setLastLocationUpdate(new Date());
//         return;
//       }

//       const dist = getDistance(
//         location.latitude,
//         location.longitude,
//         officeLocation.latitude,
//         officeLocation.longitude
//       );
      
//       setCurrentAddress(address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
//       setIsAtOffice(dist <= checkRadius);
//       setDistance(dist);
//       setLocationAccuracy(location.accuracy || null);
//       setLastLocationUpdate(new Date());
//     } catch (error) {
//       console.error('❌ Error fetching location:', error);
//       setCurrentAddress('Address unavailable');
//       setIsAtOffice(false);
//       setDistance(null);
//       setLocationAccuracy(null);
//     }
//   };

//   const fetchAllData = async () => {
//     if (!isLoggedIn || agentLoading) {
//       return;
//     }
    
//     try {
//       setLoading(true);
//       await Promise.all([
//         fetchLocationData(),
//         fetchAttendanceData(),
//         fetchAgentStats()
//       ]);
//     } catch (error) {
//       console.error('Error fetching all data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data when login status or agent changes
//   useEffect(() => {
//     if (isLoggedIn && !agentLoading) {
//       fetchAllData();
      
//       // Refetch location every 10 seconds (reduced frequency for better performance)
//       const locationRefreshInterval = setInterval(() => {
//         fetchLocationData();
//       }, 10000);
      
//       return () => clearInterval(locationRefreshInterval);
//     }
//   }, [officeLocation, checkRadius, agent, isLoggedIn, agentLoading]);

//   // Watch for agent location changes specifically
//   useEffect(() => {
//     if (agent?.location && isLoggedIn) {
//       fetchLocationData();
//     }
//   }, [agent?.location?.latitude, agent?.location?.longitude]);

//   // Redirect if not logged in (must be in useEffect to avoid setState during render)
//   useEffect(() => {
//     if (!agentLoading && !isLoggedIn) {
//       router.push('/agent/login');
//     }
//   }, [isLoggedIn, agentLoading, router]);

//   // Show loading
//   if (agentLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   // Return null while redirecting
//   if (!isLoggedIn) {
//     return null;
//   }

//   // Helper functions
//   const formatDistance = (dist) => {
//     if (dist == null) return 'Unknown';
    
//     // If within 10m radius, show "You're in office"
//     if (dist <= checkRadius) {
//       return '✅ You\'re in office';
//     }
    
//     // If greater than 10m, show distance from office
//     if (dist < 1000) {
//       return `📏 ${dist.toFixed(0)} m from office`;
//     }
    
//     return `📏 ${(dist / 1000).toFixed(2)} km from office`;
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return 'None';
//     return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//   };

//   const goToAttendance = () => router.push('/agent/attendance');
//   const goToSales = () => router.push('/agent/sales');

//   // Calculate progress percentage (sales count based)
//   const progressPercentage = stats.monthlyTarget > 0 
//     ? Math.min(Math.round((stats.achievedSales / stats.monthlyTarget) * 100), 100)
//     : 0;

//   // Stat cards data
//   const statCards = [
//     {
//       title: "Total Bookings",
//       value: stats.totalBookings.toString(),
//       subtitle: "This Month",
//       icon: CheckCircle2,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50',
//       onClick: goToSales
//     },
//     {
//       title: "Present Days",
//       value: (attendanceData.monthlyStats?.present || 0).toString(),
//       icon: Users,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-50',
//       onClick: goToAttendance
//     },
//     {
//       title: "Monthly Target",
//       value: stats.monthlyTarget.toString(),
//       subtitle: "Sales Target",
//       icon: Target,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-50',
//       onClick: goToSales
//     },
//     {
//       title: "Completed Sales",
//       value: stats.achievedSales.toString(),
//       subtitle: "This Month",
//       icon: TrendingUp,
//       color: 'text-orange-600',
//       bgColor: 'bg-orange-50',
//       onClick: goToSales
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="mb-8 p-16">
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//           Welcome back, {agent?.agentName || agent?.name || "Agent"}!
//         </h1>
//         <p className="text-gray-600 mt-2">
//           Here's your performance overview
//         </p>
//       </div>

//       {/* Location Card */}
//       {(currentAddress || distance !== null) && (
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeUp}
//           custom={1}
//           className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 mb-6 lg:mb-8"
//         >
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div className="flex items-start sm:items-center gap-4 flex-1">
//               <div className="p-3 bg-blue-100 rounded-2xl">
//                 <MapPin className="h-6 w-6 text-blue-600" />
//               </div>
//               <div className="space-y-2 flex-1">
//                 {currentAddress && (
//                   <p className="text-slate-700 font-medium flex items-center gap-2">
//                     <span className="text-slate-500">📍</span>
//                     {currentAddress}
//                   </p>
//                 )}
//                 {distance !== null && (
//                   <p className="text-slate-600 flex items-center gap-2">
//                     <Target className="h-4 w-4 text-slate-400" />
//                     Distance from office: <span className="font-semibold text-slate-800">{formatDistance(distance)}</span>
//                   </p>
//                 )}
//                 {/* Real-time tracking status */}
//                 <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
//                   <motion.div 
//                     className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200"
//                     animate={{ opacity: [0.7, 1] }}
//                     transition={{ duration: 0.5, repeat: Infinity }}
//                   >
//                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
//                     <span className="font-medium">Live Tracking</span>
//                   </motion.div>
//                   {/* Show accuracy badge only when NOT at office */}
//                   {locationAccuracy && !isAtOffice && (
//                     <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">
//                       <span>Accuracy: {locationAccuracy.toFixed(2)}m</span>
//                     </div>
//                   )}
//                   {lastLocationUpdate && (
//                     <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
//                       <span>Updated: {lastLocationUpdate.toLocaleTimeString()}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             {isAtOffice && (
//               <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200">
//                 🏢 At Office Location
//               </div>
//             )}
//           </div>
//         </motion.div>
//       )}

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {statCards.map((stat, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             whileHover={{ scale: 1.02 }}
//             onClick={stat.onClick}
//             className="cursor-pointer"
//           >
//             <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//                   <p className="text-sm text-gray-600 mt-1">
//                     {stat.title}
//                     {stat.subtitle && <span className="text-xs ml-1">({stat.subtitle})</span>}
//                   </p>
//                 </div>
//                 <div className={`p-2 rounded-lg ${stat.bgColor}`}>
//                   <stat.icon className={`h-5 w-5 ${stat.color}`} />
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Main Content Grid - UPDATED LAYOUT WITH SHIFT SCHEDULE */}
//       <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 lg:gap-8">
//         {/* Recent Activity - 4/7 width on large screens */}
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeUp}
//           custom={3}
//           className="xl:col-span-4"
//         >
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
//             {/* Header with Actions */}
//             <div className="p-6 border-b border-slate-100/50">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div className="flex items-center">
//                   <div className="p-2 bg-blue-100 rounded-xl mr-3">
//                     <Activity className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
//                     <p className="text-slate-600 text-sm">Latest bookings and updates</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
//                     <Filter className="h-4 w-4 text-slate-600" />
//                   </button>
//                   <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
//                     <Download className="h-4 w-4 text-slate-600" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="p-4">
//               <div className="space-y-3">
//                 {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
//                   <motion.div
//                     key={activity.id}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                   >
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-gray-900">{activity.message}</p>
//                       <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
//                     </div>
//                     <ChevronRight className="h-4 w-4 text-gray-400" />
//                   </motion.div>
//                 )) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                     <p>No recent activity</p>
//                   </div>
//                 )}
//               </div>
//               {recentActivity.length > 0 && (
//                 <button 
//                   onClick={goToSales}
//                   className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
//                 >
//                   View All Activity
//                 </button>
//               )}
//             </div>
//           </div>
//         </motion.div>

//         {/* Sidebar - 3/7 width on large screens */}
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeUp}
//           custom={4}
//           className="xl:col-span-3 space-y-6 lg:space-y-8"
//         >
//           {/* Shift Schedule Component */}
//           <ShiftSchedule />

//           {/* Quick Actions */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//             <div className="p-4 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
//             </div>
//             <div className="p-4 space-y-3">
//               <button 
//                 onClick={goToSales}
//                 className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-sm font-medium transition-colors"
//               >
//                 Add New Lead
//               </button>
//               <button 
//                 onClick={goToAttendance}
//                 className="w-full text-left bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg text-sm font-medium transition-colors"
//               >
//                 View Attendance
//               </button>
//               <button className="w-full text-left bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-sm font-medium transition-colors">
//                 Generate Report
//               </button>
//             </div>
//           </div>

//           {/* Monthly Goal */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//             <div className="p-4 border-b border-gray-200 flex items-center gap-3">
//               <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
//                 <Target className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">Monthly Sales Target</h3>
//                 <p className="text-xs text-gray-500">Track your sales count progress</p>
//               </div>
//             </div>
//             <div className="p-4">
//               <div className="mb-4">
//                 <div className="flex justify-between items-center text-sm mb-2">
//                   <span className="text-gray-600 font-medium">Sales Progress</span>
//                   <span className="text-lg font-bold text-purple-600">{progressPercentage}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                   <div 
//                     className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative"
//                     style={{ width: `${progressPercentage}%` }}
//                   >
//                     {progressPercentage > 10 && (
//                       <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-3 mb-3">
//                 <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Target className="h-4 w-4 text-purple-600" />
//                     <p className="text-xs text-gray-600 font-medium">Target</p>
//                   </div>
//                   <p className="font-bold text-gray-900 text-lg">{stats.monthlyTarget}</p>
//                   <p className="text-xs text-gray-500">Completed Sales</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
//                   <div className="flex items-center gap-2 mb-1">
//                     <CheckCircle2 className="h-4 w-4 text-green-600" />
//                     <p className="text-xs text-gray-600 font-medium">Completed</p>
//                   </div>
//                   <p className="font-bold text-gray-900 text-lg">{stats.achievedSales}</p>
//                   <p className="text-xs text-gray-500">Sales this month</p>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-100">
//                 <div className="flex items-center gap-2 mb-1">
//                   <TrendingUp className="h-4 w-4 text-orange-600" />
//                   <p className="text-xs text-gray-600 font-medium">Remaining</p>
//                 </div>
//                 <p className="font-bold text-gray-900 text-lg">
//                   {Math.max(0, stats.monthlyTarget - stats.achievedSales)}
//                 </p>
//                 <p className="text-xs text-gray-500">Completed sales needed</p>
//                 {stats.achievedSales >= stats.monthlyTarget && stats.monthlyTarget > 0 && (
//                   <div className="mt-2 flex items-center gap-1 text-green-600">
//                     <Award className="h-4 w-4" />
//                     <span className="text-xs font-semibold">🎉 Monthly Target Achieved!</span>
//                   </div>
//                 )}
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
  Filter,
  Download,
  Hash,
  TrendingDown,
  Percent
} from 'lucide-react';
import { AgentContext } from '../../../../context/AgentContext';
import { useOfficeLocation } from '../../../../context/LocationContext';
import { agentAttendanceService } from '../../../../services/agentAttendenceService';
import { agentSalesService } from '../../../../services/agentSalesService';
import { getAddressFromCoords, getCurrentLocation, getDistance } from '../../../../utils/locationUtils';
import ShiftSchedule from '../../../../components/ShiftSchedule';
import MonthlyTargetProgress from '../../../../components/sales/MonthlyTargetProgress';

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

// Target type configuration
const TARGET_TYPES_CONFIG = {
  none: { label: 'No Target', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Target },
  digit: { label: 'Digit Target', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Hash },
  amount: { label: 'Amount Target', color: 'text-green-600', bgColor: 'bg-green-50', icon: DollarSign },
  both: { label: 'Both Targets', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: TrendingUp }
};

const HomeScreen = () => {
  const router = useRouter();
  const { agent, isLoggedIn, isLoading: agentLoading } = useContext(AgentContext);
  const { officeLocation, checkRadius } = useOfficeLocation();

  const [distance, setDistance] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [loading, setLoading] = useState(true);
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

  // Target stats data
  const [targetStats, setTargetStats] = useState({
    targetType: 'none',
    digitTarget: 0,
    amountTarget: 0,
    currency: 'PKR',
    achievedDigits: 0,
    achievedAmount: 0,
    progressPercentage: 0,
    isTargetAchieved: false
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Calculate progress based on target type
  const calculateProgress = () => {
    const { targetType, digitTarget, amountTarget, achievedDigits, achievedAmount } = targetStats;
    
    if (targetType === 'none') {
      return {
        percentage: 0,
        isAchieved: false,
        remainingText: 'No target set'
      };
    }
    
    if (targetType === 'digit') {
      const progress = digitTarget > 0 ? achievedDigits / digitTarget : 0;
      const percentage = Math.min(progress * 100, 100);
      return {
        percentage,
        isAchieved: achievedDigits >= digitTarget,
        remaining: Math.max(0, digitTarget - achievedDigits),
        completed: achievedDigits,
        target: digitTarget,
        label: 'units',
        type: 'digit'
      };
    }
    
    if (targetType === 'amount') {
      const progress = amountTarget > 0 ? achievedAmount / amountTarget : 0;
      const percentage = Math.min(progress * 100, 100);
      return {
        percentage,
        isAchieved: achievedAmount >= amountTarget,
        remaining: Math.max(0, amountTarget - achievedAmount),
        completed: achievedAmount,
        target: amountTarget,
        label: targetStats.currency,
        type: 'amount'
      };
    }
    
    if (targetType === 'both') {
      // Calculate combined progress (average of both)
      const digitProgress = digitTarget > 0 ? achievedDigits / digitTarget : 0;
      const amountProgress = amountTarget > 0 ? achievedAmount / amountTarget : 0;
      const combinedProgress = (digitProgress + amountProgress) / 2;
      const percentage = Math.min(combinedProgress * 100, 100);
      
      const digitAchieved = achievedDigits >= digitTarget;
      const amountAchieved = achievedAmount >= amountTarget;
      
      return {
        percentage,
        isAchieved: digitAchieved && amountAchieved,
        remainingDigits: Math.max(0, digitTarget - achievedDigits),
        remainingAmount: Math.max(0, amountTarget - achievedAmount),
        completedDigits: achievedDigits,
        completedAmount: achievedAmount,
        targetDigits: digitTarget,
        targetAmount: amountTarget,
        currency: targetStats.currency,
        type: 'both'
      };
    }
    
    return {
      percentage: 0,
      isAchieved: false,
      remainingText: 'Invalid target type'
    };
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      const [todayStatusResp, monthlyStatsResp] = await Promise.allSettled([
        agentAttendanceService.getTodayStatus?.(),
        agentAttendanceService.getMonthlySummary?.()
      ]);

      let todayStatus = null;
      if (todayStatusResp.status === 'fulfilled') {
        const data = todayStatusResp.value?.data ?? todayStatusResp.value;
        todayStatus = Array.isArray(data) ? data[0] : data;
      }

      let monthlyStats = null;
      if (monthlyStatsResp.status === 'fulfilled') {
        monthlyStats = monthlyStatsResp.value?.data ?? monthlyStatsResp.value;
      }

      setAttendanceData({
        todayStatus,
        monthlyStats,
        todaysCheckIns: todayStatus ? 1 : 0
      });

    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };
  
  // Fetch agent stats and targets
  const fetchAgentStats = async () => {
    if (!agent?.id && !agent?._id) return;
    
    try {
      const agentId = agent.id || agent._id;
      
      // Get agent's target info from agent data
      const agentTargetType = agent.monthlyTargetType || 'none';
      const digitTarget = agent.monthlyDigitTarget || 0;
      const amountTarget = agent.monthlyAmountTarget || 0;
      const currency = agent.targetCurrency || 'PKR';
      
      // Get current month's start and end dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const [overviewResponse, bookingsResponse] = await Promise.all([
        agentSalesService.getAgentSalesOverview(agentId),
        agentSalesService.getAgentBookings(agentId, { limit: 100 }) // Get more bookings to filter current month
      ]);

      const overview = overviewResponse?.data?.overview || {};
      
      // Get all bookings
      const allBookings = Array.isArray(bookingsResponse?.data?.bookings) 
        ? bookingsResponse.data.bookings 
        : Array.isArray(bookingsResponse?.bookings) 
        ? bookingsResponse.bookings 
        : [];
      
      // Filter current month's bookings
      const currentMonthBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= currentMonthStart && bookingDate <= currentMonthEnd;
      });
      
      // Filter current month's completed bookings
      const currentMonthCompletedBookings = currentMonthBookings.filter(booking => 
        booking.status === 'completed' || booking.status === 'Completed'
      );
      
      // Calculate achieved values based on target type
      let achievedDigits = 0;
      let achievedAmount = 0;
      
      if (agentTargetType === 'digit' || agentTargetType === 'both') {
        achievedDigits = currentMonthCompletedBookings.length;
      }
      
      if (agentTargetType === 'amount' || agentTargetType === 'both') {
        // Assuming each booking has an amount field, adjust as needed
        achievedAmount = currentMonthCompletedBookings.reduce((sum, booking) => {
          return sum + (parseFloat(booking.amount) || 0);
        }, 0);
      }
      
      // Update target stats
      setTargetStats({
        targetType: agentTargetType,
        digitTarget,
        amountTarget,
        currency,
        achievedDigits,
        achievedAmount,
        progressPercentage: 0, // Will be calculated
        isTargetAchieved: false
      });

      // Create recent activity from latest bookings
      const activity = allBookings.slice(0, 5).map((booking, index) => ({
        id: booking._id || index,
        message: `New booking from ${booking?.formData?.firstName || booking?.customerName || 'Customer'}`,
        amount: booking.amount ? `${booking.currency || currency} ${parseFloat(booking.amount).toLocaleString()}` : null,
        time: new Date(booking.createdAt).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric'
        })
      }));

      setRecentActivity(activity);

    } catch (error) {
      console.error('❌ Error fetching agent stats:', error);
    }
  };

  const fetchLocationData = async () => {
    try {
      let location = null;
      let address = '';

      if (agent?.location?.latitude && agent?.location?.longitude) {
        location = {
          latitude: agent.location.latitude,
          longitude: agent.location.longitude,
          accuracy: agent.location.accuracy
        };
        address = agent.location.address || '';
      }
      else {
        try {
          const freshLocation = await getCurrentLocation();
          if (freshLocation) {
            location = freshLocation;
            try {
              const freshAddress = await getAddressFromCoords(freshLocation.latitude, freshLocation.longitude);
              address = freshAddress || '';
            } catch (addressError) {
              console.warn('Could not get address:', addressError);
            }
          }
        } catch (error) {
          console.warn('Failed to get fresh location from browser:', error);
        }
      }

      if (!location || !location.latitude || !location.longitude) {
        setCurrentAddress('Location unavailable');
        setIsAtOffice(false);
        setDistance(null);
        setLocationAccuracy(null);
        setLastLocationUpdate(null);
        return;
      }

      if (location.accuracy && location.accuracy > ACCURACY_THRESHOLD) {
        setCurrentAddress('Location unavailable (low accuracy)');
        setIsAtOffice(false);
        setDistance(null);
        setLocationAccuracy(location.accuracy || null);
        setLastLocationUpdate(new Date());
        return;
      }

      const dist = getDistance(
        location.latitude,
        location.longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );
      
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
      return;
    }
    
    try {
      setLoading(true);
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
      fetchLocationData();
    }
  }, [agent?.location?.latitude, agent?.location?.longitude]);

  // Redirect if not logged in
  useEffect(() => {
    if (!agentLoading && !isLoggedIn) {
      router.push('/agent/login');
    }
  }, [isLoggedIn, agentLoading, router]);

  // Calculate progress whenever target stats change
  const progressInfo = calculateProgress();

  // Show loading
  if (agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!isLoggedIn) {
    return null;
  }

  // Helper functions
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

  // Get target type config
  const targetConfig = TARGET_TYPES_CONFIG[targetStats.targetType] || TARGET_TYPES_CONFIG.none;
  const TargetIcon = targetConfig.icon;

  // Stat cards data
  const statCards = [
    {
      title: targetStats.targetType === 'digit' || targetStats.targetType === 'both' ? "Completed Units" : "Total Bookings",
      value: targetStats.achievedDigits.toString(),
      subtitle: targetStats.targetType === 'digit' || targetStats.targetType === 'both' ? "This Month" : "Bookings",
      icon: targetStats.targetType === 'digit' || targetStats.targetType === 'both' ? Hash : CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: goToSales
    },
    {
      title: "Present Days",
      value: (attendanceData.monthlyStats?.present || 0).toString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: goToAttendance
    },
    {
      title: targetStats.targetType === 'amount' || targetStats.targetType === 'both' ? "Revenue Achieved" : "Target Type",
      value: targetStats.targetType === 'amount' || targetStats.targetType === 'both' 
        ? `${targetStats.currency} ${targetStats.achievedAmount.toLocaleString()}`
        : targetConfig.label,
      subtitle: targetStats.targetType === 'amount' || targetStats.targetType === 'both' ? "This Month" : "",
      icon: targetStats.targetType === 'amount' || targetStats.targetType === 'both' ? DollarSign : TargetIcon,
      color: targetStats.targetType === 'amount' || targetStats.targetType === 'both' ? 'text-green-600' : targetConfig.color,
      bgColor: targetStats.targetType === 'amount' || targetStats.targetType === 'both' ? 'bg-green-50' : targetConfig.bgColor,
      onClick: goToSales
    },
    {
      title: "Progress",
      value: `${progressInfo.percentage.toFixed(1)}%`,
      subtitle: "Target Completion",
      icon: Percent,
      color: progressInfo.isAchieved ? 'text-green-600' : progressInfo.percentage >= 70 ? 'text-yellow-600' : 'text-red-600',
      bgColor: progressInfo.isAchieved ? 'bg-green-50' : progressInfo.percentage >= 70 ? 'bg-yellow-50' : 'bg-red-50',
      onClick: goToSales
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 p-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {agent?.agentName || agent?.name || "Agent"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your performance overview
        </p>
      </div>

      {/* Location Card */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={stat.onClick}
            className="cursor-pointer"
          >
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {stat.title}
                    {stat.subtitle && <span className="text-xs ml-1">({stat.subtitle})</span>}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 lg:gap-8">
        {/* Recent Activity - 4/7 width */}
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
            <div className="p-4">
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        {activity.amount && (
                          <p className="text-xs font-semibold text-green-600">{activity.amount}</p>
                        )}
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
              {recentActivity.length > 0 && (
                <button 
                  onClick={goToSales}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View All Activity
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar - 3/7 width */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="xl:col-span-3 space-y-6 lg:space-y-8"
        >
          {/* Shift Schedule Component */}
          <ShiftSchedule />

          {/* Target Progress Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className={`p-2 ${targetConfig.bgColor} rounded-lg`}>
                <TargetIcon className={`h-5 w-5 ${targetConfig.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {targetConfig.label} Progress
                </h3>
                <p className="text-xs text-gray-500">
                  {targetStats.targetType === 'none' 
                    ? 'No target set' 
                    : `Track your ${targetStats.targetType} progress`}
                </p>
              </div>
            </div>
            <div className="p-4">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600 font-medium">Completion</span>
                  <span className={`text-lg font-bold ${
                    progressInfo.isAchieved ? 'text-green-600' : 
                    progressInfo.percentage >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {progressInfo.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 relative ${
                      progressInfo.isAchieved ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      progressInfo.percentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${progressInfo.percentage}%` }}
                  >
                    {progressInfo.percentage > 10 && !progressInfo.isAchieved && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Target Details */}
              {targetStats.targetType !== 'none' && (
                <div className="space-y-4">
                  {/* Digit Target Section */}
                  {(targetStats.targetType === 'digit' || targetStats.targetType === 'both') && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-gray-600 font-medium">Digit Target</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {progressInfo.completed || 0} / {progressInfo.target || 0}
                          </p>
                          <p className="text-xs text-gray-500">Completed units</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {progressInfo.remaining || 0} units
                          </p>
                          <p className="text-xs text-gray-500">Remaining</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Amount Target Section */}
                  {(targetStats.targetType === 'amount' || targetStats.targetType === 'both') && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-gray-600 font-medium">Amount Target</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {targetStats.currency} {progressInfo.completed?.toLocaleString() || 0} / {targetStats.currency} {(progressInfo.target || progressInfo.targetAmount || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Revenue achieved</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {targetStats.currency} {(progressInfo.remaining || progressInfo.remainingAmount || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Remaining</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Combined Progress for "both" type */}
                  {targetStats.targetType === 'both' && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <p className="text-xs text-gray-600 font-medium">Combined Progress</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {progressInfo.completedDigits || 0}/{progressInfo.targetDigits || 0}
                          </p>
                          <p className="text-xs text-gray-500">Units</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {targetStats.currency} {(progressInfo.completedAmount || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Target Achieved Message */}
                  {progressInfo.isAchieved && (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-5 w-5 text-emerald-600" />
                        <span className="font-bold text-emerald-700">🎉 Monthly Target Achieved!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* No Target Set Message */}
              {targetStats.targetType === 'none' && (
                <div className="text-center py-4">
                  <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No monthly target has been set for you</p>
                  <p className="text-xs text-gray-400 mt-1">Contact your manager to set targets</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <button 
                onClick={goToSales}
                className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-sm font-medium transition-colors"
              >
                Add New Lead
              </button>
              <button 
                onClick={goToAttendance}
                className="w-full text-left bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg text-sm font-medium transition-colors"
              >
                View Attendance
              </button>
              <button className="w-full text-left bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-sm font-medium transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;