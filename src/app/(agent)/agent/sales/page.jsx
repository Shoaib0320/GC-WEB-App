// //src/app/(agent)/agent/sales/page.jsx
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

  // State for target progress
  const [targetProgress, setTargetProgress] = useState({
    achievedDigits: 0,
    achievedAmount: 0,
    digitTarget: 0,
    amountTarget: 0,
    targetType: 'none',
    currency: 'PKR'
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

  // Calculate date range - FIXED VERSION
  const getDateRange = useCallback(
    (range, month = null) => {
      const now = new Date();
      let start, end;

      // Agar specific month select kiya gaya hai to usi month ka data show karein
      if (month) {
        const [monthName, year] = month.split(" ");
        const monthIndex = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ].indexOf(monthName);

        if (monthIndex !== -1) {
          // Specific month ke start aur end dates
          start = new Date(year, monthIndex, 1);
          end = new Date(year, monthIndex + 1, 0, 23, 59, 59);
          
          return {
            startDate: start.toISOString().split("T")[0],
            endDate: end.toISOString().split("T")[0],
            month: month,
            monthName: monthName,
            year: parseInt(year),
            monthIndex: monthIndex
          };
        }
      }

      // Agar koi specific month nahi hai, to timeRange ke basis par calculate karein
      switch (range) {
        case "day":
          start = new Date(now);
          start.setDate(now.getDate() - 1);
          break;
        case "week":
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          break;
        case "month":
          start = new Date(now);
          start.setMonth(now.getMonth() - 1);
          break;
        case "year":
          start = new Date(now);
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start = new Date(now);
          start.setMonth(now.getMonth() - 1);
      }

      end = new Date(now);
      
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        month: month || `${months[now.getMonth()]} ${now.getFullYear()}`,
        isSpecificMonth: false
      };
    },
    []
  );

  // Helper function to calculate month dates
  const getMonthDates = (monthString) => {
    if (!monthString) {
      const now = new Date();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      monthString = `${months[now.getMonth()]} ${now.getFullYear()}`;
    }
    
    const [monthName, year] = monthString.split(" ");
    const monthIndex = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ].indexOf(monthName);
    
    if (monthIndex === -1) {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      };
    }
    
    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 0, 23, 59, 59)
    };
  };

  // Fetch sales data - FIXED VERSION
  const fetchSalesData = useCallback(
    async (isRefreshing = false) => {
      if (!isLoggedIn || agentLoading) {
        console.log("⚠️ Agent not logged in or still loading");
        setSalesOverview(null);
        setPromoCodes([]);
        setRecentBookings([]);
        setPerformanceMetrics(null);
        setBookingStats(null);
        setTargetProgress({
          achievedDigits: 0,
          achievedAmount: 0,
          digitTarget: 0,
          amountTarget: 0,
          targetType: 'none',
          currency: 'PKR'
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Check if agent exists
      if (!agent) {
        console.log("❌ Agent not found in context");
        toast.error("Agent information not found. Please login again.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const agentId = agent.id || agent._id;
      if (!agentId) {
        console.log("❌ No agent ID found");
        toast.error("Invalid agent information");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("🔄 Starting sales data fetch for agent:", agentId, {
        selectedMonth,
        agentTargetType: agent.monthlyTargetType,
      });

      try {
        if (!isRefreshing) setLoading(true);

        const dateParams = getDateRange(timeRange, selectedMonth);
        console.log("📅 Date range params:", dateParams);

        // Get month dates for selected month (FOR TARGET CALCULATION)
        const selectedMonthDates = getMonthDates(selectedMonth);
        console.log("📆 Selected month dates:", {
          start: selectedMonthDates.start.toLocaleDateString(),
          end: selectedMonthDates.end.toLocaleDateString()
        });

        // Get all bookings for target calculations
        const allBookingsResponse = await agentSalesService.getAgentBookings(agentId, {
          limit: 1000
        });

        // Extract bookings data from response
        let allBookings = [];
        if (allBookingsResponse?.data?.bookings && Array.isArray(allBookingsResponse.data.bookings)) {
          allBookings = allBookingsResponse.data.bookings;
        } else if (allBookingsResponse?.bookings && Array.isArray(allBookingsResponse.bookings)) {
          allBookings = allBookingsResponse.bookings;
        }

        console.log(`📦 Total bookings fetched: ${allBookings.length}`);

        // Filter SELECTED month's bookings (not current month)
        const selectedMonthBookings = allBookings.filter(booking => {
          if (!booking.createdAt) return false;
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= selectedMonthDates.start && bookingDate <= selectedMonthDates.end;
        });

        console.log(`📅 Selected month (${selectedMonth}) bookings: ${selectedMonthBookings.length}`);

        // Filter selected month's completed bookings
        const selectedMonthCompletedBookings = selectedMonthBookings.filter(booking => {
          const status = booking.status?.toLowerCase() || '';
          return status === 'completed' || status === 'approved' || status === 'success';
        });

        console.log(`✅ Selected month completed bookings: ${selectedMonthCompletedBookings.length}`);

        // Calculate achieved values based on agent's target type
        let achievedDigits = 0;
        let achievedAmount = 0;

        // Get agent's target information
        const agentTargetType = agent.monthlyTargetType || 'none';
        const digitTarget = agent.monthlyDigitTarget || 0;
        const amountTarget = agent.monthlyAmountTarget || 0;
        const currency = agent.targetCurrency || 'PKR';

        console.log("🎯 Agent target info:", {
          type: agentTargetType,
          digitTarget,
          amountTarget,
          currency
        });

        if (agentTargetType === 'digit' || agentTargetType === 'both') {
          achievedDigits = selectedMonthCompletedBookings.length;
        }

        if (agentTargetType === 'amount' || agentTargetType === 'both') {
          // Calculate total amount from completed bookings
          achievedAmount = selectedMonthCompletedBookings.reduce((sum, booking) => {
            const amount = parseFloat(booking.amount) || 
                          parseFloat(booking.totalAmount) || 
                          parseFloat(booking.total) || 
                          0;
            return sum + amount;
          }, 0);

          console.log("💰 Achieved amount:", achievedAmount);
        }

        console.log("📊 Achieved values for selected month:", {
          selectedMonth,
          achievedDigits,
          achievedAmount,
          digitTarget,
          amountTarget
        });

        // Update target progress state
        setTargetProgress({
          achievedDigits,
          achievedAmount,
          digitTarget,
          amountTarget,
          targetType: agentTargetType,
          currency
        });

        // Now fetch other data in parallel
        const [
          overviewResponse,
          conversionResponse,
          recentBookingsResponse,
          statsResponse,
        ] = await Promise.allSettled([
          agentSalesService.getAgentSalesOverview(agentId, dateParams),
          agentSalesService.getAgentConversionRates(agentId, dateParams),
          agentSalesService.getAgentBookings(agentId, {
            ...dateParams,
            limit: 10,
            sort: '-createdAt'
          }),
          agentSalesService.getAgentBookingStats(agentId, dateParams),
        ]);

        console.log("📋 API Responses received");

        // Process overview response
        if (overviewResponse.status === 'fulfilled' && overviewResponse.value?.data) {
          setSalesOverview(overviewResponse.value.data);

          // Extract promo codes from overview
          const promoCodesFromResponse = overviewResponse.value.data.promoCodeAnalytics ||
            overviewResponse.value.data.promoCodeData ||
            overviewResponse.value.data.promo_codes ||
            [];
          setPromoCodes(promoCodesFromResponse);
          
          console.log("📈 Overview data set");
        } else {
          console.warn("❌ Overview API failed or returned no data");
          setSalesOverview(null);
          setPromoCodes([]);
        }

        // Process conversion response
        if (conversionResponse.status === 'fulfilled' && conversionResponse.value?.data) {
          setPerformanceMetrics(conversionResponse.value.data);
          console.log("📊 Performance metrics set");
        } else {
          console.warn("❌ Conversion API failed or returned no data");
          setPerformanceMetrics(null);
        }

        // Process recent bookings response
        if (recentBookingsResponse.status === 'fulfilled') {
          const recentData = recentBookingsResponse.value?.data?.bookings ||
            recentBookingsResponse.value?.bookings ||
            [];
          setRecentBookings(recentData);
          console.log("📦 Recent bookings set:", recentData.length);
        } else {
          console.warn("❌ Recent bookings API failed");
          setRecentBookings([]);
        }

        // Process stats response
        if (statsResponse.status === 'fulfilled' && statsResponse.value?.data) {
          setBookingStats(statsResponse.value.data);
          console.log("📋 Booking stats set");
        } else {
          console.warn("❌ Stats API failed or returned no data");
          setBookingStats(null);
        }

        // Show success message if refreshing
        if (isRefreshing) {
          toast.success("Sales data refreshed successfully!");
        }

      } catch (error) {
        console.error("💥 Error fetching sales data:", error);

        // Show specific error messages
        let errorMessage = "Failed to load sales data. Please try again.";

        if (error.response) {
          errorMessage = error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = error.message || "Request setup failed.";
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        console.log("🏁 Fetch process completed");
      }
    },
    [agent, isLoggedIn, agentLoading, timeRange, selectedMonth, getDateRange, toast]
  );

  // Fetch data when component mounts or when selectedMonth changes
  useEffect(() => {
    if (isLoggedIn && !agentLoading && selectedMonth) {
      console.log("🔄 Triggering fetch due to selectedMonth change:", selectedMonth);
      fetchSalesData();
    }
  }, [fetchSalesData, isLoggedIn, agentLoading, selectedMonth]);

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your performance and revenue metrics
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchSalesData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Monthly Progress & Selector Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly Progress */}
          <div className="lg:col-span-2">
            <MonthlyTargetProgress
              theme={theme}
              currentMonth={selectedMonth}
              // Pass actual data as props
              achievedDigits={targetProgress.achievedDigits}
              achievedAmount={targetProgress.achievedAmount}
              digitTarget={targetProgress.digitTarget}
              amountTarget={targetProgress.amountTarget}
              targetType={targetProgress.targetType}
              currency={targetProgress.currency}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Sales Statistics</h2>
                  <p className="text-gray-600 text-sm">Overview of your booking performance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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