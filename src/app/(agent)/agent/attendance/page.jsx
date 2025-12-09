// src/app/(agent)/agent/attendance/page.jsx
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
  Loader2,
  Home,
  CalendarDays,
  Map,
  LogOut,
  LogIn
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
  const { agent, refreshAgentData, isLoggedIn, token, logout, checkTokenValidity, login } = useAgent();
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

  // Navigation function
  const goToDashboard = () => {
    router.push('/agent/dashboard');
  };

  useEffect(() => {
    if (isLoggedIn) {
      const initializePage = async () => {
        try {

          const currentToken = token || localStorage.getItem('agentToken');

          // If token is missing, logout immediately
          if (!currentToken) {
            await logout();
            router.replace('/agent/login');
            return;
          }

          // Check token validity
          let isValid = false;
          try {
            isValid = checkTokenValidity();
          } catch (tokenError) {
            console.error('❌ Token validation error:', tokenError);
            isValid = false;
          }

          if (!isValid) {
            // Try to use saved credentials for auto-login first
            const savedCreds = localStorage.getItem("agentCredentials");
            if (savedCreds) {
              try {
                const { agentId, password } = JSON.parse(savedCreds);
                const autoLoginResult = await login(agentId, password, true);

                if (autoLoginResult.success) {
                  await loadInitialData();
                  setupNotifications();
                  return;
                }
              } catch (autoLoginError) {
                console.error('❌ Auto-login failed:', autoLoginError);
              }
            }

            // If auto-login fails or no credentials, logout
            await logout();
            router.replace('/agent/login');
            return;
          }

          // Token is valid, proceed with data loading
          await loadInitialData();
          setupNotifications();

        } catch (error) {
          console.error('❌ Error initializing attendance page:', error);

          // On initialization error, try to load data anyway if logged in
          if (isLoggedIn) {
            try {
              await loadInitialData();
            } catch (loadError) {
              console.error('❌ Failed to load data after initialization error:', loadError);
            }
          }
        }
      };

      initializePage();
    }
  }, [isLoggedIn, token]);

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
      // Force refresh by clearing cache first in certain situations
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Check if we have old data that might be stale
      const localStatus = await agentAttendanceService.getFromLocal('todaysAttendance');
      if (localStatus) {
        const checkInDate = new Date(localStatus.checkInTime);
        if (checkInDate < todayStart) {
          // Old data - clear it before making API call
          await agentAttendanceService.removeFromLocal('todaysAttendance');
        }
      }

      let status = await agentAttendanceService.getTodayStatus();

      // Additional verification
      if (status && status.checkInTime) {
        const checkInDate = new Date(status.checkInTime);
        if (checkInDate < todayStart) {
          // This is old data, don't use it
          status = null;
          await agentAttendanceService.removeFromLocal('todaysAttendance');
        }
      }

      setTodayAttendance(status);
      if (status && !status.checkOutTime) updateWorkingTime();
    } catch (error) {
      console.error("Error loading today status:", error);
      // On error, clear any potentially stale data
      await agentAttendanceService.removeFromLocal('todaysAttendance');
      setTodayAttendance(null);
      toast.error("Failed to load today's attendance");
    }
  };

  // Refresh function mein bhi clear karen
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear cache before refresh
      await agentAttendanceService.removeFromLocal('todaysAttendance');

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

  const handleCheckIn = async () => {
    if (!agentShift) return toast.error("No shift assigned.");
    if (todayLeave) return toast.info("You have an approved leave today.");

    try {
      setChecking(true);
      const result = await agentAttendanceService.checkIn({
        shiftId: agentShift._id,
        userType: "agent",
      });

      if (result.success) {
        toast.success("Checked in successfully!");
        await loadTodayStatus();
        await loadMonthlySummary();
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

    try {
      setChecking(true);
      const result = await agentAttendanceService.checkOut({
        attendanceId: todayAttendance._id,
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
    agentShift &&
    !checking;

  const canCheckOut = () =>
    todayAttendance &&
    !todayAttendance.checkOutTime &&
    !todayLeave &&
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

  // Show loading while agent context is loading
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 pt-8">Attendance</h1>
              <p className="text-gray-600 text-sm">Track your daily check-ins</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToDashboard}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Dashboard"
              >
                <Home className="h-5 w-5" />
              </button>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Leave Request Modal */}
        <LeaveRequestModal
          visible={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={handleLeaveSubmit}
        />

        {/* Leave Requests Toggle */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Leave Requests</h2>
          <button
            onClick={() => setShowLeaveRequests(!showLeaveRequests)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showLeaveRequests ? 'Hide' : 'View'} Leaves
          </button>
        </div>

        {/* Leave Requests List */}
        <AnimatePresence>
          {showLeaveRequests && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <LeaveRequestsList />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Leave Banner */}
        <AnimatePresence>
          {todayLeave && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Approved Leave Today</p>
                  <p className="text-xs text-yellow-700">
                    {todayLeave.leaveType} • {new Date(todayLeave.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Check In/Out Button - SIMPLIFIED */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4">
            {!todayAttendance ? (
              <button
                onClick={handleCheckIn}
                disabled={!canCheckIn()}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                  canCheckIn()
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {checking ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking In...
                  </div>
                ) : (
                  "Check In Now"
                )}
              </button>
            ) : !todayAttendance.checkOutTime ? (
              <button
                onClick={handleCheckOut}
                disabled={!canCheckOut()}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                  canCheckOut()
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {checking ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking Out...
                  </div>
                ) : (
                  "Check Out Now"
                )}
              </button>
            ) : (
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 mb-1">Attendance Complete</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>Check-in: {formatTime(todayAttendance.checkInTime)}</div>
                  <div>Check-out: {formatTime(todayAttendance.checkOutTime)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterModalVisible(true)}
            className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {getMonthName(currentFilter.month)} {currentFilter.year}
          </button>
          <button
            onClick={handleLeaveRequestClick}
            className="flex-1 bg-blue-600 text-white rounded-lg p-3 text-sm font-medium hover:bg-blue-700"
          >
            Request Leave
          </button>
        </div>

        {/* Monthly Summary */}
        {filteredSummary && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Monthly Summary</h3>
            <AttendanceSummary monthlySummary={filteredSummary} filter={currentFilter} />
          </div>
        )}

        {/* Today's Status */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Today's Status</h3>
          <TodayStatusCard
            todayAttendance={todayAttendance}
            agentShift={agentShift}
            workingTime={workingTime}
          />
        </div>

        {/* Today's Details */}
        {todayAttendance && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Today's Details</h3>
            <TodayDetailsCard todayAttendance={todayAttendance} />
          </div>
        )}

        {/* Location Status */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Location Status</h3>
          <LocationStatusCard
            distance={distance}
            checkRadius={checkRadius}
            loading={loading}
          />
        </div>
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