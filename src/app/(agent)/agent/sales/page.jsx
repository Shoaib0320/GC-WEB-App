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
      transition: { duration: 0.4, delay: custom * 0.1, ease: "easeOut" }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg p-6 shadow-sm max-w-sm">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Access Required</h3>
          <p className="text-gray-600 text-sm">Please login to view sales data</p>
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Section - Simplified */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 p-12">
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your performance and revenue metrics
          </p>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={() => fetchSalesData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Monthly Progress & Selector Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly Progress */}
          <div className="lg:col-span-2">
            <MonthlyTargetProgress
              monthlyTarget={monthlyProgress.monthlyTarget}
              currentBookings={monthlyProgress.currentBookings}
              theme={theme}
              currentMonth={selectedMonth}
            />
          </div>

          {/* Month Selector */}
          <div className="lg:col-span-1">
            <MonthSelector
              currentMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              theme={theme}
            />
          </div>
        </div>

        {/* Sales Overview */}
        <AnimatePresence>
          {salesOverview && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Sales Statistics</h2>
                  <p className="text-gray-600 text-sm">Overview of your booking performance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { 
                    label: "Total Sales", 
                    value: bookingStats.overview?.totalBookings || 0, 
                    icon: TrendingUp,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50"
                  },
                  { 
                    label: "Completed", 
                    value: bookingStats.overview?.completedBookings || 0, 
                    icon: CheckCircle,
                    color: "text-green-600",
                    bgColor: "bg-green-50"
                  },
                  { 
                    label: "Pending", 
                    value: bookingStats.overview?.pendingBookings || 0, 
                    icon: Clock,
                    color: "text-orange-600",
                    bgColor: "bg-orange-50"
                  },
                  { 
                    label: "Cancelled", 
                    value: bookingStats.overview?.cancelledBookings || 0, 
                    icon: XCircle,
                    color: "text-red-600",
                    bgColor: "bg-red-50"
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {item.value}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Promo Codes & Recent Bookings Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Promo Codes */}
          <div>
            <PromoCodesList promoCodes={promoCodes} theme={theme} />
          </div>

          {/* Recent Bookings */}
          <div>
            <RecentBookings bookings={recentBookings} theme={theme} />
          </div>
        </div>

        {/* Empty State */}
        <AnimatePresence>
          {!salesOverview && promoCodes.length === 0 && recentBookings.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-sm mx-auto">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
                <p className="text-gray-600 text-sm mb-4">
                  No sales data available for the selected period
                </p>
                <button
                  onClick={() => fetchSalesData(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SalesScreen;