
// services/attendanceService.js
import { useAgent } from '@/context/AgentContext.js';
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
  },
   // =============================
  // NEW FUNCTIONS FOR ATTENDANCE FILTER
  // =============================
  
  /**
   * Get first attendance date for the user
   */
  async getFirstAttendanceDate() {
    try {
      const token = localStorage.getItem('agentToken') || localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found');
        throw new Error('No authentication token found');
      }

      const response = await api.get('/attendance/first-record', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        // Fallback: get from user data
        return await this.getFirstDateFallback();
      }
    } catch (error) {
      console.error('Error getting first attendance date:', error);
      return await this.getFirstDateFallback();
    }
  },

  /**
   * Fallback method to get first date from user creation or attendance history
   */
  async getFirstDateFallback() {
    try {
      // Try to get from attendance history
      const history = await this.getAttendanceHistory(1, 1);
      if (history.records && history.records.length > 0) {
        const sortedRecords = history.records.sort((a, b) => {
          const dateA = new Date(a.date || a.checkInTime || a.createdAt);
          const dateB = new Date(b.date || b.checkInTime || b.createdAt);
          return dateA - dateB;
        });
        
        const firstRecord = sortedRecords[0];
        const sourceDate = firstRecord.date || firstRecord.checkInTime || firstRecord.createdAt;
        const date = new Date(sourceDate);
        
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          date: date.toISOString(),
          readable: date.toLocaleDateString('en-PK', { 
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          source: 'history'
        };
      }

      // Fallback to current year - 1
      const currentDate = new Date();
      return {
        year: currentDate.getFullYear() - 1,
        month: 1,
        date: new Date(currentDate.getFullYear() - 1, 0, 1).toISOString(),
        readable: `January ${currentDate.getFullYear() - 1}`,
        source: 'fallback'
      };
    } catch (error) {
      console.error('Fallback failed:', error);
      const currentDate = new Date();
      return {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        date: currentDate.toISOString(),
        readable: currentDate.toLocaleDateString('en-PK', { 
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        source: 'current_date'
      };
    }
  },

  /**
   * Get available years for filtering
   */
  async getAvailableYears() {
    try {
      const firstDate = await this.getFirstAttendanceDate();
      const currentYear = new Date().getFullYear();
      
      const years = [];
      for (let y = firstDate.year; y <= currentYear; y += 1) {
        years.push(y);
      }
      return years.length > 0 ? years : [currentYear];
    } catch (error) {
      console.error('Error getting available years:', error);
      const currentYear = new Date().getFullYear();
      return [currentYear];
    }
  },

  /**
   * Get available months for a specific year
   */
  async getAvailableMonths(year) {
    try {
      const firstDate = await this.getFirstAttendanceDate();
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const allMonths = [
        { id: 1, name: 'January', short: 'Jan' },
        { id: 2, name: 'February', short: 'Feb' },
        { id: 3, name: 'March', short: 'Mar' },
        { id: 4, name: 'April', short: 'Apr' },
        { id: 5, name: 'May', short: 'May' },
        { id: 6, name: 'June', short: 'Jun' },
        { id: 7, name: 'July', short: 'Jul' },
        { id: 8, name: 'August', short: 'Aug' },
        { id: 9, name: 'September', short: 'Sep' },
        { id: 10, name: 'October', short: 'Oct' },
        { id: 11, name: 'November', short: 'Nov' },
        { id: 12, name: 'December', short: 'Dec' },
      ];

      // Filter logic based on first date and current date
      if (year < firstDate.year) return [];

      if (year > firstDate.year && year < currentYear) return allMonths;

      if (year === firstDate.year && year === currentYear) {
        return allMonths.filter(m => m.id >= firstDate.month && m.id <= currentMonth);
      } else if (year === firstDate.year) {
        return allMonths.filter(m => m.id >= firstDate.month);
      } else if (year === currentYear) {
        return allMonths.filter(m => m.id <= currentMonth);
      }

      return allMonths;
    } catch (error) {
      console.error('Error getting available months:', error);
      return [];
    }
  },

  /**
   * Get attendance summary for specific month/year
   */
  async getFilteredAttendance(month, year) {
    try {
      const response = await api.get(`/attendance/my?month=${month}&year=${year}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          summary: response.data.data?.summary || null,
          records: response.data.data?.records || []
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Failed to get attendance data'
      };
    } catch (error) {
      console.error('Error getting filtered attendance:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },
};
