//src/app/(agent%)/agent/attendance/page.jsx
"use client";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner"; // Using sonner for toasts

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
  const { agent, refreshAgentData, isLoggedIn, token } = useAgent();
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

  console.log('Agent Data', agent);
    console.log('Agent Token', token);


  useEffect(() => {
    if (isLoggedIn) {
      loadInitialData();
      setupNotifications();
    }
  }, [agent, isLoggedIn]);

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
      // if (!status) status = await agentAttendanceService.getTodaysAttendance();
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

  // Custom Button Component for internal use
  const CustomButton = ({ title, onPress, disabled, style, ...props }) => (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{
        padding: '12px 16px',
        backgroundColor: theme?.colors?.primary || '#3B82F6',
        border: 'none',
        borderRadius: 8,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      {...props}
    >
      {title}
    </button>
  );

  // Show loading while agent context is loading
  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        flex: 1, 
        backgroundColor: theme?.colors?.background || '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: theme?.colors?.background || '#f5f5f5',
      }}
    >
      {/* Top Buttons */}
      <div style={{ padding: "12px 16px", backgroundColor: "transparent" }}>
        <CustomButton
          title={`📅 ${getMonthName(currentFilter.month)} ${currentFilter.year}`}
          onPress={() => setFilterModalVisible(true)}
          style={{ padding: "10px 0", width: '100%' }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <CustomButton
            title="Request Leave"
            onPress={handleLeaveRequestClick}
            style={{ flex: 1, height: 45 }}
          />
          <CustomButton
            title={showLeaveRequests ? "Hide Leaves" : "My Leaves"}
            onPress={() => setShowLeaveRequests(!showLeaveRequests)}
            style={{ flex: 1, height: 45 }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          paddingBottom: 20,
        }}
      >
        {/* Leave Request Modal */}
        <LeaveRequestModal
          visible={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={handleLeaveSubmit}
        />

        {/* Leave Requests List */}
        {showLeaveRequests && <LeaveRequestsList />}

        {/* Show Today's Leave if exists */}
        {todayLeave && (
          <div
            style={{
              padding: 16,
              backgroundColor: "#FFEBEE",
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ color: "#D32F2F", fontWeight: "bold" }}>
              You have an approved leave today ({todayLeave.leaveType})
            </div>
            <div style={{ color: "#D32F2F" }}>
              From {new Date(todayLeave.startDate).toLocaleDateString()} to{" "}
              {new Date(todayLeave.endDate).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Check In/Out Button */}
        <div style={{ marginBottom: 20 }}>
          {!todayAttendance ? (
            <CustomButton
              title={checking ? "Checking In..." : "Check In Now"}
              onPress={handleCheckIn}
              disabled={!canCheckIn()}
              style={{
                height: 50,
                width: '100%',
                opacity: !canCheckIn() ? 0.6 : 1
              }}
            />
          ) : !todayAttendance.checkOutTime ? (
            <CustomButton
              title={checking ? "Checking Out..." : "Check Out Now"}
              onPress={handleCheckOut}
              disabled={!canCheckOut()}
              style={{
                height: 50,
                width: '100%',
                backgroundColor: "#FF9800",
                opacity: !canCheckOut() ? 0.6 : 1,
              }}
            />
          ) : (
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: theme?.colors?.border || '#e5e5e5',
                backgroundColor: theme?.colors?.card || '#ffffff',
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8, color: theme?.colors?.text || '#333333' }}>
                Today's attendance completed
              </div>
              <div style={{ color: theme?.colors?.textSecondary || '#666666' }}>
                <div>Check-in: {formatTime(todayAttendance.checkInTime)}</div>
                <div>Check-out: {formatTime(todayAttendance.checkOutTime)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        {filteredSummary && <AttendanceSummary monthlySummary={filteredSummary} filter={currentFilter} />}

        {/* Today's Status */}
        <TodayStatusCard todayAttendance={todayAttendance} agentShift={agentShift} workingTime={workingTime} />

        {/* Today's Details */}
        {todayAttendance && <TodayDetailsCard todayAttendance={todayAttendance} />}

        {/* Location Status */}
        <LocationStatusCard distance={distance} checkRadius={checkRadius} loading={loading} />

        {/* Refresh Button */}
        {/* <div style={{ marginTop: 20 }}>
          <CustomButton
            title={refreshing ? "Refreshing..." : "Refresh Data"}
            onPress={onRefresh}
            disabled={refreshing}
            style={{
              width: '100%',
              backgroundColor: '#6B7280',
              opacity: refreshing ? 0.6 : 1
            }}
          />
        </div> */}
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