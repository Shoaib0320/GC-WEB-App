//src/app/(agent%)/agent/attendance/page.jsx
"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";

import { useAgent } from "@/context/AgentContext";
import { useOfficeLocation } from "@/context/LocationContext";
import { ThemeContext } from "@/context/ThemeContext";
import { agentLeaveService } from "@/services/agentLeaveService";
import {
  setupNotifications,
  startBackgroundLocation,
  stopBackgroundLocation,
} from "@/utils/backgroundLocation";
import { getCurrentLocation, getDistance } from "@/utils/locationUtils";
import { agentAttendanceService } from "@/services/agentAttendenceService";
import { agentAuthService } from "@/services/agentAuthService";

// Components
import AttendanceFilter from "@/components/AttendanceFilter";
import AttendanceSummary from "@/components/AttendanceSummary";
import GlobalModal from "@/components/GlobalModal";
import LeaveRequestModal from "@/components/LeaveRequestModal";
import LeaveRequestsList from "@/components/LeaveRequestsList";
import LocationStatusCard from "@/components/LocationStatusCard";
import TodayDetailsCard from "@/components/TodayDetailsCard";
import TodayStatusCard from "@/components/TodayStatusCard";

const AttendanceScreen = () => {
  const router = useRouter();
  const { agent, refreshAgentData, isLoggedIn, token, logout, checkTokenValidity } = useAgent();
  const { theme } = useContext(ThemeContext);
  const { officeLocation, checkRadius } = useOfficeLocation();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [todayLeave, setTodayLeave] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [agentShift, setAgentShift] = useState(null);
  const [workingTime, setWorkingTime] = useState("00:00");
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [filteredSummary, setFilteredSummary] = useState(null);
  const [showLeaveRequests, setShowLeaveRequests] = useState(false);
  const [activeLeaveModalVisible, setActiveLeaveModalVisible] = useState(false);
  const [activeLeaveDetails, setActiveLeaveDetails] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    details: false,
    location: false
  });

  useEffect(() => {
    if (isLoggedIn) {
      // Ensure token is valid before loading data
      const initializePage = async () => {
        try {
          const currentToken = token || localStorage.getItem('agentToken');

          // If token is missing or invalid/expired, logout and redirect to login
          const isValid = currentToken ? checkTokenValidity() : false;
          if (!isValid) {
            await logout();
            router.replace('/agent/login');
            return;
          }

          await loadInitialData();
          setupNotifications();
        } catch (error) {
          console.error('❌ Error initializing attendance page:', error);
          await loadInitialData(); // Try loading data anyway
        }
      };

      initializePage();
    }
  }, [agent, isLoggedIn, token]);

  useEffect(() => {
    let interval;
    if (todayAttendance && !todayAttendance.checkOutTime) {
      interval = setInterval(updateWorkingTime, 60000);
    }
    return () => clearInterval(interval);
  }, [todayAttendance]);

  // Load all initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAgentShift(),
        loadTodayStatus(),
        checkLocation(),
        loadMonthlySummary(),
        loadTodayLeave(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const loadAgentShift = async () => {
    try {
      if (agent?.shift) {
        setAgentShift(agent.shift);
      } else {
        const freshAgent = await refreshAgentData();
        setAgentShift(freshAgent.shift);
      }
    } catch (error) {
      console.error("Error loading agent shift:", error);
      toast.error("Failed to load shift information");
    }
  };

  const loadTodayStatus = async () => {
    try {
      let status = await agentAttendanceService.getTodayStatus();
      setTodayAttendance(status);
      if (status && !status.checkOutTime) updateWorkingTime();
    } catch (error) {
      console.error("Error loading today status:", error);
      setTodayAttendance(null);
      toast.error("Failed to load today's attendance");
    }
  };

  const loadMonthlySummary = async (year = null, month = null) => {
    try {
      const filterYear = year || currentFilter.year;
      const filterMonth = month || currentFilter.month;
      const summary = await agentAttendanceService.getMonthlySummary(
        filterMonth,
        filterYear
      );
      setFilteredSummary(summary);
      setMonthlySummary(summary);
    } catch (error) {
      console.error("Error loading monthly summary:", error);
      toast.error("Failed to load monthly summary");
    }
  };

  const loadTodayLeave = async () => {
    try {
      const leaves = await agentLeaveService.getMyLeaves("agent");
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const approvedLeave = leaves.find((leave) => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        return leave.status === "approved" && leaveStart <= todayEnd && leaveEnd >= todayStart;
      });

      setTodayLeave(approvedLeave || null);
    } catch (error) {
      console.error("Error loading today's leave:", error);
      setTodayLeave(null);
    }
  };

  // Check if agent has any active/approved leaves
  const checkActiveLeaves = async () => {
    try {
      const leaves = await agentLeaveService.getMyLeaves("agent");
      const today = new Date();

      const activeOrFutureLeave = leaves.find((leave) => {
        const leaveEnd = new Date(leave.endDate);
        return leave.status === "approved" && leaveEnd >= today;
      });

      return activeOrFutureLeave;
    } catch (error) {
      console.error("Error checking active leaves:", error);
      return null;
    }
  };

  // Handle leave request button click
  const handleLeaveRequestClick = async () => {
    const activeLeave = await checkActiveLeaves();

    if (activeLeave) {
      setActiveLeaveDetails(activeLeave);
      setActiveLeaveModalVisible(true);
    } else {
      setShowLeaveModal(true);
    }
  };

  const updateWorkingTime = () => {
    if (!todayAttendance || !todayAttendance.checkInTime) return;
    const checkInTime = new Date(todayAttendance.checkInTime);
    const diffMs = new Date() - checkInTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    setWorkingTime(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    );
  };

  const checkLocation = async () => {
    try {
      // Use agent's current location if available, otherwise get new location
      let location;
      if (agent?.location?.latitude && agent?.location?.longitude) {
        location = {
          latitude: agent.location.latitude,
          longitude: agent.location.longitude
        };
      } else {
        location = await getCurrentLocation();
      }
      
      const dist = getDistance(
        location.latitude,
        location.longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );
      setDistance(dist);
    } catch (error) {
      console.error("Error fetching distance:", error);
      setDistance(null);
      toast.error("Failed to get location");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshAgentData().then((freshAgent) => setAgentShift(freshAgent.shift)),
        loadTodayStatus(),
        checkLocation(),
        loadMonthlySummary(),
        loadTodayLeave(),
      ]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckIn = async () => {
    if (!agentShift) return toast.error("No shift assigned.");
    if (todayLeave) return toast.info("You have an approved leave today.");
    if (distance === null || distance > checkRadius)
      return toast.error(`You must be within ${checkRadius} meters to check in.`);

    try {
      setChecking(true);
      const location = await getCurrentLocation();
      const result = await agentAttendanceService.checkIn({
        shiftId: agentShift._id,
        location: { lat: location.latitude, lng: location.longitude },
        userType: "agent",
      });

      if (result.success) {
        toast.success("Checked in successfully!");
        await loadTodayStatus();
        await loadMonthlySummary();
        await startBackgroundLocation();
      } else {
        toast.error(result.message || "Unable to check in");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error(error.message || "Check-in failed");
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return toast.error("No check-in found today.");
    if (todayLeave) return toast.info("You have an approved leave today.");
    if (distance === null || distance > checkRadius)
      return toast.error(`You must be within ${checkRadius} meters to check out.`);

    try {
      setChecking(true);
      const location = await getCurrentLocation();
      const result = await agentAttendanceService.checkOut({
        attendanceId: todayAttendance._id,
        location: { lat: location.latitude, lng: location.longitude },
        userType: "agent",
      });

      if (result.success) {
        toast.success("Checked out successfully!");
        await loadTodayStatus();
        await loadMonthlySummary();
        await stopBackgroundLocation();
      } else {
        toast.error(result.message || "Unable to check out");
      }
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error(error.message || "Check-out failed");
    } finally {
      setChecking(false);
    }
  };

  const canCheckIn = () =>
    !todayAttendance &&
    !todayLeave &&
    distance !== null &&
    distance <= checkRadius &&
    agentShift &&
    !checking;

  const canCheckOut = () =>
    todayAttendance &&
    !todayAttendance.checkOutTime &&
    !todayLeave &&
    distance !== null &&
    distance <= checkRadius &&
    !checking;

  const handleLeaveSubmit = async (formData) => {
    try {
      const response = await agentLeaveService.requestLeave({ ...formData, userType: "agent" });
      if (response.success) {
        toast.success("Leave request submitted successfully!");
        setShowLeaveModal(false);
        await loadTodayLeave();
      } else {
        toast.error(response.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Leave submit error:", error);
      toast.error(error.message || "Failed to submit leave request");
    }
  };

  const handleFilterApply = (filter) => {
    setCurrentFilter(filter);
    loadMonthlySummary(filter.year, filter.month);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months[monthNumber - 1] || "";
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Show loading while agent context is loading
  if (!isLoggedIn) {
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
          <p className="text-slate-600 text-lg font-medium">Loading attendance data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Attendance
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Track your daily check-ins and working hours
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={refreshing}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterModalVisible(true)}
              className="flex-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4 text-slate-600" />
              <span className="font-medium text-slate-700">
                {getMonthName(currentFilter.month)} {currentFilter.year}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLeaveRequestClick}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
              >
                Request Leave
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLeaveRequests(!showLeaveRequests)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm text-slate-700"
              >
                {showLeaveRequests ? "Hide Leaves" : "My Leaves"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Leave Request Modal */}
        <LeaveRequestModal
          visible={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={handleLeaveSubmit}
        />

        {/* Leave Requests List */}
        <AnimatePresence>
          {showLeaveRequests && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LeaveRequestsList />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Leave Banner */}
        <AnimatePresence>
          {todayLeave && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">
                    Approved Leave Today
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {todayLeave.leaveType} • From {new Date(todayLeave.startDate).toLocaleDateString()} to{" "}
                    {new Date(todayLeave.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Check In/Out Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden"
        >
          <div className="p-6">
            {!todayAttendance ? (
              <motion.button
                whileHover={{ scale: canCheckIn() ? 1.02 : 1 }}
                whileTap={{ scale: canCheckIn() ? 0.98 : 1 }}
                onClick={handleCheckIn}
                disabled={!canCheckIn()}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                  canCheckIn()
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {checking ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Checking In...
                  </div>
                ) : (
                  "Check In Now"
                )}
              </motion.button>
            ) : !todayAttendance.checkOutTime ? (
              <motion.button
                whileHover={{ scale: canCheckOut() ? 1.02 : 1 }}
                whileTap={{ scale: canCheckOut() ? 0.98 : 1 }}
                onClick={handleCheckOut}
                disabled={!canCheckOut()}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                  canCheckOut()
                    ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {checking ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Checking Out...
                  </div>
                ) : (
                  "Check Out Now"
                )}
              </motion.button>
            ) : (
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Today's attendance completed
                </h3>
                <div className="text-green-700 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-in: {formatTime(todayAttendance.checkInTime)}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-out: {formatTime(todayAttendance.checkOutTime)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Monthly Summary */}
        {filteredSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AttendanceSummary monthlySummary={filteredSummary} filter={currentFilter} />
          </motion.div>
        )}

        {/* Today's Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TodayStatusCard 
            todayAttendance={todayAttendance} 
            agentShift={agentShift} 
            workingTime={workingTime} 
          />
        </motion.div>

        {/* Today's Details */}
        {todayAttendance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TodayDetailsCard todayAttendance={todayAttendance} />
          </motion.div>
        )}

        {/* Location Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LocationStatusCard 
            distance={distance} 
            checkRadius={checkRadius} 
            loading={loading} 
          />
        </motion.div>
      </div>

      {/* Filter Modal */}
      <AttendanceFilter
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        currentFilter={currentFilter}
      />

      {/* Active Leave Warning Modal */}
      <GlobalModal
        visible={activeLeaveModalVisible}
        onClose={() => {
          setActiveLeaveModalVisible(false);
          setActiveLeaveDetails(null);
        }}
        title="Active Leave Found"
        message={
          activeLeaveDetails
            ? `You already have an approved leave from ${new Date(
              activeLeaveDetails.startDate
            ).toLocaleDateString("en-PK")} to ${new Date(
              activeLeaveDetails.endDate
            ).toLocaleDateString("en-PK")}.\n\nLeave Type: ${activeLeaveDetails.leaveType
            }\nReason: ${activeLeaveDetails.reason}\n\nYou cannot request another leave until your current leave ends.`
            : "You have an active approved leave. Please wait until it ends before requesting another leave."
        }
        icon="🚫"
        type="warning"
        buttons={[
          {
            text: "View My Leaves",
            icon: "📋",
            color: "#2196F3",
            onPress: () => {
              setShowLeaveRequests(true);
              setActiveLeaveModalVisible(false);
            },
          },
          {
            text: "OK, Got It",
            icon: "✅",
            color: "#FF9800",
            onPress: () => setActiveLeaveModalVisible(false),
          },
        ]}
      />
    </div>
  );
};

const formatTime = (dateString) => {
  if (!dateString) return "--:--";
  return new Date(dateString).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  });
};

export default AttendanceScreen;
