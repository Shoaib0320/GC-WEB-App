//src/app/(agent)/agent/sales/page.jsx
"use client";

import React, { useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  RefreshCw,
  Calendar,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { useAgent } from "@/context/AgentContext";
import { agentSalesService } from "@/services/agentSalesService";
import SalesOverview from "@/components/sales/SalesOverview";
import PromoCodesList from "@/components/sales/PromoCodesList";
import RecentBookings from "@/components/sales/RecentBookings";
import PerformanceMetrics from "@/components/sales/PerformanceMetrics";
import TimeRangeSelector from "@/components/sales/TimeRangeSelector";
import MonthlyTargetProgress from "@/components/sales/MonthlyTargetProgress";
import MonthSelector from "@/components/sales/MonthSelector";
import { toast } from "sonner";

const SalesScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { agent, isLoggedIn, isLoading: agentLoading } = useAgent();

  console.log("SalesScreen - agent from AgentContext:", agent);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [salesOverview, setSalesOverview] = useState(null);
  const [promoCodes, setPromoCodes] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [monthlyProgress, setMonthlyProgress] = useState({
    currentBookings: 0,
    monthlyTarget: 0,
  });

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: custom * 0.1, ease: "easeOut" }
    })
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Get current month on mount
  useEffect(() => {
    const currentDate = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const currentMonth = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Calculate date range
  const getDateRange = useCallback(
    (range, month = null) => {
      const now = new Date();
      let start = new Date();

      if (month) {
        const [monthName, year] = month.split(" ");
        const monthIndex = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ].indexOf(monthName);

        if (monthIndex !== -1) {
          start = new Date(year, monthIndex, 1);
          const end = new Date(year, monthIndex + 1, 0);
          return {
            startDate: start.toISOString().split("T")[0],
            endDate: end.toISOString().split("T")[0],
            month: month,
          };
        }
      }

      switch (range) {
        case "day":
          start.setDate(now.getDate() - 1);
          break;
        case "week":
          start.setDate(now.getDate() - 7);
          break;
        case "month":
          start.setMonth(now.getMonth() - 1);
          break;
        case "year":
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start.setMonth(now.getMonth() - 1);
      }

      return {
        startDate: start.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
        month: selectedMonth,
      };
    },
    [selectedMonth]
  );

  // Fetch sales data - UPDATED FOR AGENT CONTEXT
  const fetchSalesData = useCallback(
    async (isRefreshing = false) => {
      if (!isLoggedIn || agentLoading) {
        console.log("⚠️ Agent not logged in or still loading");
        setSalesOverview(null);
        setPromoCodes([]);
        setRecentBookings([]);
        setPerformanceMetrics(null);
        setBookingStats(null);
        setMonthlyProgress({
          currentBookings: 0,
          monthlyTarget: 0,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      if (!agent?.id && !agent?._id) {
        console.log("❌ No agent ID found in agent object, applying fallback data");
        setSalesOverview(null);
        setPromoCodes([]);
        setRecentBookings([]);
        setPerformanceMetrics(null);
        setBookingStats(null);
        setMonthlyProgress({
          currentBookings: 0,
          monthlyTarget: 0,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const agentId = agent.id || agent._id;
        console.log("🔄 Starting sales data fetch for agent:", agentId);

        if (!isRefreshing) setLoading(true);

        const dateParams = getDateRange(timeRange, selectedMonth);
        console.log("📅 Date range params:", dateParams);

        const [
          overviewResponse,
          conversionResponse,
          bookingsResponse,
          statsResponse,
        ] = await Promise.all([
          agentSalesService.getAgentSalesOverview(agentId, dateParams),
          agentSalesService.getAgentConversionRates(agentId, dateParams),
          agentSalesService.getAgentBookings(agentId, { ...dateParams, limit: 10 }),
          agentSalesService.getAgentBookingStats(agentId, dateParams),
        ]);

        console.log('Agent Sales Overview', overviewResponse);
        console.log('Agent Conversion Rates', conversionResponse);
        console.log('Agent Bookings', bookingsResponse);
        console.log('Agent Booking Stats', statsResponse);

        console.log("✅ All APIs responded successfully");

        // CORRECTED DATA SETTING
        if (overviewResponse?.data) {
          setSalesOverview(overviewResponse.data);
          setPromoCodes(overviewResponse.data.promoCodeAnalytics || []);
          console.log("📈 Overview data set:", overviewResponse.data);
          console.log("🎫 Promo codes set:", overviewResponse.data.promoCodeAnalytics);
        }

        if (conversionResponse?.data) {
          setPerformanceMetrics(conversionResponse.data);
          console.log("📊 Performance metrics set:", conversionResponse.data);
        }

        if (bookingsResponse?.data) {
          setRecentBookings(bookingsResponse.data.bookings || []);
          console.log("📦 Recent bookings set:", bookingsResponse.data.bookings?.length);
        }

        if (statsResponse?.data) {
          setBookingStats(statsResponse.data);
          console.log("📋 Booking stats set:", statsResponse.data);

          setMonthlyProgress({
            currentBookings: statsResponse.data.overview?.completedBookings || 0,
            monthlyTarget: agent.monthlyTarget || 10,
          });
        }
      } catch (error) {
        console.error("💥 Error fetching sales data:", error);
        toast.error(error.response?.data?.message || "Failed to load sales data. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        console.log("🏁 Fetch process completed");
      }
    },
    [agent, isLoggedIn, agentLoading, timeRange, selectedMonth, getDateRange]
  );

  useEffect(() => {
    if (isLoggedIn && !agentLoading) {
      fetchSalesData();
    }
  }, [fetchSalesData, isLoggedIn, agentLoading]);

  // Show loading while agent context is loading
  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 text-lg font-medium">Loading sales data...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Access Required</h3>
            <p className="text-slate-600">Please login to view sales data</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 text-lg font-medium">Loading sales data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8"
      >
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            Sales Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg lg:text-xl max-w-2xl">
            Track your performance and revenue metrics
          </p>
        </div>
        
        {/* Refresh Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchSalesData(true)}
          disabled={refreshing}
          className="flex-shrink-0 bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`h-5 w-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="font-medium text-slate-700 text-sm">Refresh</span>
        </motion.button>
      </motion.div>

      {/* Main Content Grid */}
      <div className="space-y-6 lg:space-y-8">
        {/* Monthly Progress & Selector Row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Monthly Progress - 2/3 width */}
          <div className="lg:col-span-2">
            <MonthlyTargetProgress
              monthlyTarget={monthlyProgress.monthlyTarget}
              currentBookings={monthlyProgress.currentBookings}
              theme={theme}
              currentMonth={selectedMonth}
            />
          </div>

          {/* Month Selector - 1/3 width */}
          <div className="lg:col-span-1">
            <MonthSelector
              currentMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              theme={theme}
            />
          </div>
        </motion.div>

        {/* Sales Overview */}
        <AnimatePresence>
          {salesOverview && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              <SalesOverview
                data={salesOverview}
                theme={theme}
                timeRange={timeRange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Stats */}
        <AnimatePresence>
          {bookingStats && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Sales Statistics</h2>
                      <p className="text-slate-600 text-sm">Overview of your booking performance</p>
                    </div>
                  </div>
                </div>

                <motion.div
                  variants={staggerChildren}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {[
                    { 
                      label: "Total Sales", 
                      value: bookingStats.overview?.totalBookings || 0, 
                      icon: TrendingUp,
                      color: "from-blue-500 to-blue-600",
                      bgColor: "bg-blue-50"
                    },
                    { 
                      label: "Completed", 
                      value: bookingStats.overview?.completedBookings || 0, 
                      icon: CheckCircle,
                      color: "from-emerald-500 to-green-600",
                      bgColor: "bg-emerald-50"
                    },
                    { 
                      label: "Pending", 
                      value: bookingStats.overview?.pendingBookings || 0, 
                      icon: Clock,
                      color: "from-amber-500 to-orange-600",
                      bgColor: "bg-amber-50"
                    },
                    { 
                      label: "Cancelled", 
                      value: bookingStats.overview?.cancelledBookings || 0, 
                      icon: XCircle,
                      color: "from-red-500 to-pink-600",
                      bgColor: "bg-red-50"
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      variants={fadeUp}
                      custom={index}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${item.bgColor}`}>
                          <item.icon className={`h-5 w-5 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 mb-1">
                          {item.value}
                        </p>
                        <p className="text-slate-600 text-sm font-medium">
                          {item.label}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Promo Codes & Recent Bookings Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8"
        >
          {/* Promo Codes */}
          <div>
            <PromoCodesList promoCodes={promoCodes} theme={theme} />
          </div>

          {/* Recent Bookings */}
          <div>
            <RecentBookings bookings={recentBookings} theme={theme} />
          </div>
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {!salesOverview && promoCodes.length === 0 && recentBookings.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-md mx-auto">
                <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Data Available</h3>
                <p className="text-slate-600 mb-6">
                  No sales data available for the selected period
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchSalesData(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SalesScreen;