//src/app/(agent)/agent/sales/page.jsx
"use client";

import React, { useContext, useState, useEffect, useCallback } from "react";
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
            currentBookings: statsResponse.data.overview?.totalBookings || 0,
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
      <div style={{ 
        backgroundColor: theme?.colors?.background || '#f5f5f5', 
        minHeight: '100vh', 
        padding: "20px",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p style={{ 
            color: theme?.colors?.text || '#333333', 
            marginTop: "12px", 
            fontSize: "16px" 
          }}>
            Loading agent data...
          </p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div style={{ 
        backgroundColor: theme?.colors?.background || '#f5f5f5', 
        minHeight: '100vh', 
        padding: "20px",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ 
            color: theme?.colors?.text || '#333333', 
            fontSize: "16px" 
          }}>
            Please login to view sales data
          </p>
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div style={{ 
        backgroundColor: theme?.colors?.background || '#f5f5f5', 
        minHeight: '100vh', 
        padding: "20px" 
      }}>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <div className="spinner" />
          <p style={{ 
            color: theme?.colors?.text || '#333333', 
            marginTop: "12px", 
            fontSize: "16px" 
          }}>
            Loading sales data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "transparent",
        minHeight: "100vh",
        padding: "16px",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div style={{ width: "100%", maxWidth: "1024px" }}>

      {/* Monthly Progress */}
      <div style={{ marginBottom: "16px" }}>
        <MonthlyTargetProgress
          monthlyTarget={monthlyProgress.monthlyTarget}
          currentBookings={monthlyProgress.currentBookings}
          theme={theme}
          currentMonth={selectedMonth}
        />
      </div>

      {/* Month Selector */}
      <div style={{ marginBottom: "16px" }}>
        <MonthSelector
          currentMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          theme={theme}
        />
      </div>

      {/* Sales Overview */}
      {salesOverview && (
        <div style={{ marginBottom: "20px" }}>
          <SalesOverview
            data={salesOverview}
            theme={theme}
            timeRange={timeRange}
          />
        </div>
      )}

      {/* Booking Stats */}
      {bookingStats && (
        <section style={{ marginBottom: "24px" }}>
          <h2
            style={{
              color: theme?.colors?.text || '#333333',
              fontWeight: 700,
              marginBottom: "16px",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            Sales Statistics
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            {/* Cards Array */}
            {[
              { label: "Total Sales", value: bookingStats.overview?.totalBookings || 0, color: undefined },
              { label: "Completed", value: bookingStats.overview?.completedBookings || 0, color: "#10B981" },
              { label: "Pending", value: bookingStats.overview?.pendingBookings || 0, color: "#F59E0B" },
              { label: "Cancelled", value: bookingStats.overview?.cancelledBookings || 0, color: "#EF4444" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  flex: "1 1 calc(50% - 16px)", // 50% width minus gap
                  maxWidth: "calc(50% - 16px)",
                  padding: "16px",
                  borderRadius: "14px",
                  backgroundColor: theme?.colors?.surface || '#ffffff',
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <StatItem
                  label={item.label}
                  value={item.value}
                  theme={theme}
                  valueColor={item.color}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Promo Codes */}
      <div style={{ marginBottom: "20px" }}>
        <PromoCodesList promoCodes={promoCodes} theme={theme} />
      </div>

      {/* Recent Bookings */}
      <div style={{ marginBottom: "20px" }}>
        <RecentBookings bookings={recentBookings} theme={theme} />
      </div>

      {/* Empty State */}
      {!salesOverview &&
        promoCodes.length === 0 &&
        recentBookings.length === 0 && (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              fontStyle: "italic",
              color: theme?.colors?.textSecondary || '#666666',
              fontSize: "15px"
            }}
          >
            No sales data available for the selected period
          </div>
        )}

      {/* Refresh Button */}
      {/* <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => fetchSalesData(true)}
          disabled={refreshing}
          style={{
            padding: "10px 20px",
            backgroundColor: theme?.colors?.primary || '#3B82F6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div> */}
    </div>
  </div>
  );
};

const StatItem = ({ label, value, theme, valueColor }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div style={{ 
      fontSize: "18px", 
      fontWeight: "bold", 
      marginBottom: "4px", 
      color: valueColor || theme?.colors?.primary || '#3B82F6' 
    }}>
      {value}
    </div>
    <div style={{ 
      fontSize: "12px", 
      color: theme?.colors?.textSecondary || '#666666' 
    }}>
      {label}
    </div>
  </div>
);

export default SalesScreen;