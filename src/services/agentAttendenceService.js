
// services/attendanceService.js
import { AUTO_CHECKOUT_CONFIG } from '../config/autoCheckoutConfig.js';
import api from '../lib/api';

export const agentAttendanceService = {
  // =============================
  // HELPER: localStorage methods (Browser environment)
  // =============================
  async saveToLocal(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      console.log(`✅ "${key}" saved to storage`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving "${key}" to storage:`, error);
      return false;
    }
  },

  async getFromLocal(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`❌ Error getting "${key}" from storage:`, error);
      return null;
    }
  },

  // =============================
  // ATTENDANCE OPERATIONS
  // =============================
  async checkIn(checkInData) {
    try {
      const response = await api.post('/attendance/checkin', checkInData);
      const todayStatus = response.data.data;
      // Save today's attendance locally
      await this.saveToLocal('todaysAttendance', todayStatus);
      return todayStatus;
    } catch (error) {
      console.error('❌ Check-in error:', error.response?.data || error.message);
      throw error;
    }
  },

  async checkOut(checkOutData) {
    console.log('Check out data', checkOutData);
    try {
      const response = await api.post('/attendance/checkout', checkOutData);
      const todayStatus = response.data.data;
      // Update local storage
      await this.saveToLocal('todaysAttendance', todayStatus);
      return todayStatus;
    } catch (error) {
      console.error('❌ Check-out error:', error.response?.data || error.message);
      throw error;
    }
  },
  // ///
  // async getTodayStatus() {
  //   try {
  //     // Try local cache first
  //     const localToday = await this.getFromLocal('todaysAttendance');
  //     if (localToday) return localToday;

  //     // Fallback to API
  //     const todayResponse = await api.get('/attendance/today');
  //     if (todayResponse.data.success && todayResponse.data.data) {
  //       await this.saveToLocal('todaysAttendance', todayResponse.data.data);
  //       return todayResponse.data.data;
  //     }

  //     // If not found, fallback to manual filtering
  //     const historyResponse = await api.get('/attendance/my?limit=100');
  //     const today = new Date();
  //     const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  //     const todayEnd = new Date(todayStart);
  //     todayEnd.setDate(todayEnd.getDate() + 1);

  //     const todayRecord = historyResponse.data.data.find(record => {
  //       if (!record.checkInTime) return false;
  //       const recordDate = new Date(record.checkInTime);
  //       return recordDate >= todayStart && recordDate < todayEnd;
  //     });

  //     if (todayRecord) {
  //       await this.saveToLocal('todaysAttendance', todayRecord);
  //       return todayRecord;
  //     }

  //     return null;
  //   } catch (error) {
  //     console.error('❌ Today status error:', error.response?.data || error.message);
  //     return null;
  //   }
  // },

  async getTodayStatus() {
  try {
    // Clear old local storage data first
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Try API first - always get fresh data
    const todayResponse = await api.get('/attendance/today');
    
    if (todayResponse.data.success && todayResponse.data.data) {
      const freshData = todayResponse.data.data;
      // Verify it's actually from today
      const checkInDate = new Date(freshData.checkInTime);
      if (checkInDate >= todayStart) {
        await this.saveToLocal('todaysAttendance', freshData);
        return freshData;
      } else {
        // Old data from different day - clear it
        await this.removeFromLocal('todaysAttendance');
        return null;
      }
    }

    // If API fails, check local storage but verify date
    const localToday = await this.getFromLocal('todaysAttendance');
    if (localToday) {
      const checkInDate = new Date(localToday.checkInTime);
      if (checkInDate >= todayStart) {
        return localToday;
      } else {
        // Old data - clear it
        await this.removeFromLocal('todaysAttendance');
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Today status error:', error.response?.data || error.message);
    
    // On error, clear potentially stale local data
    await this.removeFromLocal('todaysAttendance');
    return null;
  }
},

// Add this helper method
async removeFromLocal(key) {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ "${key}" removed from storage`);
    return true;
  } catch (error) {
    console.error(`❌ Error removing "${key}" from storage:`, error);
    return false;
  }
},

  async getAttendanceHistory(limit = 50, page = 1) {
    try {
      const response = await api.get(`/attendance/my?limit=${limit}&page=${page}`);
      return {
        records: response.data.data || [],
        success: response.data.success,
        total: response.data.data?.length || 0
      };
    } catch (error) {
      console.error('❌ History error:', error.response?.data || error.message);
      return { records: [], success: false, error: error.message };
    }
  },

  async getMonthlySummary(month = null, year = null) {
    try {
      const currentDate = new Date();
      const currentMonth = month || currentDate.getMonth() + 1;
      const currentYear = year || currentDate.getFullYear();

      const response = await api.get(`/attendance/my?month=${currentMonth}&year=${currentYear}`);

      if (response.data.success) {
        return response.data.data;
      }

      return {
        month: currentMonth,
        year: currentYear,
        present: 0,
        completed: 0,
        late: 0,
        overtime: 0,
        absent: 0,
        totalDays: new Date(currentYear, currentMonth, 0).getDate(),
        records: []
      };
    } catch (error) {
      console.error('❌ Monthly summary error:', error.response?.data || error.message);
      const now = new Date();
      return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        present: 0,
        completed: 0,
        late: 0,
        overtime: 0,
        absent: 0,
        totalDays: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
        records: []
      };
    }
  },

  // =============================
  // AUTO CHECKOUT / LOCATION
  // =============================
  async autoCheckoutOnLocationExit(locationData) {
    try {
      const response = await api.post('/attendance/frontend-auto-checkout', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        reason: 'Auto checkout: Left office location',
        location: 'Auto-detected location exit'
      });
      // Update local today's attendance
      const todayStatus = await this.getFromLocal('todaysAttendance');
      if (todayStatus) todayStatus.checkOutTime = new Date().toISOString();
      await this.saveToLocal('todaysAttendance', todayStatus);
      return response.data;
    } catch (error) {
      console.error('❌ Auto checkout error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  async checkLocationWithinOffice(currentLocation, officeLocation, radius) {
    try {
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );

      const isWithinRadius = distance <= radius;

      return {
        isWithinRadius,
        distance: parseFloat(distance.toFixed(2)),
        shouldCheckout: !isWithinRadius
      };
    } catch (error) {
      console.error('❌ Location check error:', error);
      return { isWithinRadius: false, distance: 0, shouldCheckout: false, error: error.message };
    }
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // meters
  },

  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  async getOfficeLocationFromStorage() {
    return await this.getFromLocal('officeLocation');
  },

  async getCheckRadiusFromStorage() {
    const radius = await this.getFromLocal('checkRadius');
    return radius || AUTO_CHECKOUT_CONFIG.CHECKOUT_RADIUS;
  },

  async setCheckRadiusInStorage(radiusInMeters) {
    return await this.saveToLocal('checkRadius', radiusInMeters);
  },

  async getCurrentCheckoutRadius() {
    return await this.getCheckRadiusFromStorage();
  },

  // =============================
  // BACKGROUND LOCATION HANDLER
  // =============================
  async handleBackgroundLocationUpdate(locationData) {
    try {
      const officeLocation = await this.getOfficeLocationFromStorage();
      const checkRadius = await this.getCheckRadiusFromStorage();
      const locationCheck = await this.checkLocationWithinOffice(locationData, officeLocation, checkRadius);
      const attendanceStatus = await this.getTodayStatus();

      const shiftEnded = await this.isShiftEnded();

      const allConditionsMet =
        shiftEnded &&
        locationCheck.shouldCheckout &&
        attendanceStatus?.checkInTime &&
        !attendanceStatus?.checkOutTime;

      if (allConditionsMet) {
        const checkoutResult = await this.autoCheckoutOnLocationExit(locationData);
        return { success: true, action: 'auto_checkout_triggered', checkoutResult };
      }

      return { success: true, action: 'no_action_required' };
    } catch (error) {
      console.error('❌ BACKGROUND LOCATION HANDLER ERROR', error);
      return { success: false, action: 'error', error: error.message };
    }
  },

  // =============================
  // SHIFT CHECK
  // =============================
  async isShiftEnded() {
    try {
      let userDataString = await this.getFromLocal('userData') || await this.getFromLocal('agentData');
      if (!userDataString) return false;

      const userData = typeof userDataString === 'string' ? JSON.parse(userDataString) : userDataString;
      const shiftEndTime = userData?.shift?.endTime;
      if (!shiftEndTime) return false;

      const [endHour, endMinute] = shiftEndTime.split(':').map(Number);
      const now = new Date();
      return (now.getHours() * 60 + now.getMinutes()) >= (endHour * 60 + endMinute);
    } catch (error) {
      console.error('❌ Error checking shift end time:', error);
      return false;
    }
  }
};
