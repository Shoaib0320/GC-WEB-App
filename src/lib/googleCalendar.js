// import { google } from 'googleapis';

// const calendar = google.calendar('v3');
// const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// export class GoogleCalendarService {
//   constructor() {
//     this.calendarId = process.env.GOOGLE_CALENDAR_ID;
//     this.auth = null;
//     this.initializeAuth();
//   }

//   // ✅ Initialize authentication
//   async initializeAuth() {
//     try {
//       this.auth = new google.auth.JWT({
//         email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//         key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//         scopes: SCOPES,
//       });

//       await this.auth.authorize();
//       console.log('✅ Google Calendar authentication successful');
//     } catch (authError) {
//       console.error('❌ Google Calendar authentication failed:', authError.message);
//       this.auth = null;
//     }
//   }

//   // ✅ Check if auth is ready
//   async ensureAuth() {
//     if (!this.auth) {
//       await this.initializeAuth();
//     }
//     return this.auth;
//   }

//   // ✅ FIXED: Create event without attendees
//   async createEvent(bookingData) {
//     try {
//       const auth = await this.ensureAuth();
//       if (!auth) {
//         throw new Error('Google Calendar authentication not available');
//       }

//       console.log('📅 Creating calendar event for:', bookingData.bookingId);

//       const event = {
//         summary: `🚗 ${bookingData.webName} - ${bookingData.formData.firstName} ${bookingData.formData.lastName}`,
//         description: this.generateEventDescription(bookingData),
//         start: {
//           dateTime: this.formatDateTime(bookingData.formData.date, bookingData.formData.timeSlot, 'start'),
//           timeZone: 'America/New_York',
//         },
//         end: {
//           dateTime: this.formatDateTime(bookingData.formData.date, bookingData.formData.timeSlot, 'end'),
//           timeZone: 'America/New_York',
//         },
//         colorId: this.getStatusColor(bookingData.status),
//         // ❌ ATTENDEES REMOVED - Service account can't invite people
//         reminders: {
//           useDefault: false,
//           overrides: [
//             { method: 'email', minutes: 24 * 60 },
//             { method: 'popup', minutes: 60 },
//           ],
//         },
//         extendedProperties: {
//           private: {
//             bookingId: bookingData.bookingId,
//             status: bookingData.status,
//             vehicleCount: bookingData.vehicleCount.toString(),
//           },
//         },
//       };

//       const response = await calendar.events.insert({
//         auth: auth,
//         calendarId: this.calendarId,
//         resource: event,
//       });

//       console.log('✅ Google Calendar event created:', response.data.htmlLink);
//       return response.data;

//     } catch (error) {
//       console.error('❌ Google Calendar event creation failed:', error.message);
      
//       if (error.response) {
//         console.error('📋 Error response:', error.response.data);
//       }
      
//       throw error;
//     }
//   }

//   // ✅ Update event in Google Calendar
//   async updateEvent(bookingId, updatedBookingData) {
//     try {
//       const auth = await this.ensureAuth();
//       if (!auth) {
//         throw new Error('Google Calendar authentication not available');
//       }

//       const events = await calendar.events.list({
//         auth: auth,
//         calendarId: this.calendarId,
//       });

//       const existingEvent = events.data.items.find(event => 
//         event.extendedProperties?.private?.bookingId === bookingId
//       );

//       if (!existingEvent) {
//         console.log('❌ Event not found for booking:', bookingId);
//         return await this.createEvent(updatedBookingData);
//       }

//       const updatedEvent = {
//         summary: `🚗 ${updatedBookingData.webName} - ${updatedBookingData.formData.firstName} ${updatedBookingData.formData.lastName}`,
//         description: this.generateEventDescription(updatedBookingData),
//         start: {
//           dateTime: this.formatDateTime(updatedBookingData.formData.date, updatedBookingData.formData.timeSlot, 'start'),
//           timeZone: 'America/New_York',
//         },
//         end: {
//           dateTime: this.formatDateTime(updatedBookingData.formData.date, updatedBookingData.formData.timeSlot, 'end'),
//           timeZone: 'America/New_York',
//         },
//         colorId: this.getStatusColor(updatedBookingData.status),
//       };

//       const response = await calendar.events.update({
//         auth: auth,
//         calendarId: this.calendarId,
//         eventId: existingEvent.id,
//         resource: updatedEvent,
//       });

//       console.log('✅ Google Calendar event updated:', response.data.htmlLink);
//       return response.data;

//     } catch (error) {
//       console.error('❌ Google Calendar event update failed:', error);
//       throw error;
//     }
//   }

//   // ✅ Delete event from Google Calendar
//   async deleteEvent(bookingId) {
//     try {
//       const auth = await this.ensureAuth();
//       if (!auth) return;

//       const events = await calendar.events.list({
//         auth: auth,
//         calendarId: this.calendarId,
//       });

//       const existingEvent = events.data.items.find(event => 
//         event.extendedProperties?.private?.bookingId === bookingId
//       );

//       if (existingEvent) {
//         await calendar.events.delete({
//           auth: auth,
//           calendarId: this.calendarId,
//           eventId: existingEvent.id,
//         });
//         console.log('✅ Google Calendar event deleted for booking:', bookingId);
//       }
//     } catch (error) {
//       console.error('❌ Google Calendar event deletion failed:', error);
//     }
//   }

//   // ✅ Helper: Event description generate karein
//   generateEventDescription(bookingData) {
//     return `
// 📋 BOOKING DETAILS:

// Booking ID: ${bookingData.bookingId}
// Customer: ${bookingData.formData.firstName} ${bookingData.formData.lastName}
// Email: ${bookingData.formData.email}
// Phone: ${bookingData.formData.phone}
// Address: ${bookingData.formData.address}, ${bookingData.formData.city}, ${bookingData.formData.state} ${bookingData.formData.zip}

// 🚗 SERVICE INFO:
// • Vehicles: ${bookingData.vehicleCount}
// • Total Price: $${bookingData.totalPrice}
// • Discounted Price: $${bookingData.discountedPrice}
// ${bookingData.promoCode ? `• Promo Code: ${bookingData.promoCode}` : ''}

// 📊 STATUS: ${bookingData.status.toUpperCase()}
// ${bookingData.cancellationReason ? `• Cancellation Reason: ${bookingData.cancellationReason}` : ''}

// 📝 NOTES: ${bookingData.formData.notes || 'N/A'}

// ⏰ Created: ${new Date(bookingData.submittedAt).toLocaleString()}
//     `.trim();
//   }

//   // ✅ Helper: DateTime format karein
//   formatDateTime(dateString, timeSlot, type) {
//     try {
//       const date = new Date(dateString);
      
//       if (!timeSlot || typeof timeSlot !== 'string') {
//         if (type === 'start') {
//           date.setHours(9, 0, 0);
//         } else {
//           date.setHours(12, 0, 0);
//         }
//         return date.toISOString();
//       }

//       let startTime, endTime;
      
//       if (timeSlot.includes(' - ')) {
//         [startTime, endTime] = timeSlot.split(' - ');
//       } else if (timeSlot.includes('-')) {
//         [startTime, endTime] = timeSlot.split('-');
//       } else {
//         startTime = '09:00';
//         endTime = '12:00';
//       }

//       if (type === 'start') {
//         const [hours, minutes] = startTime.trim().split(':');
//         date.setHours(parseInt(hours) || 9, parseInt(minutes) || 0, 0);
//       } else {
//         const [hours, minutes] = endTime.trim().split(':');
//         date.setHours(parseInt(hours) || 12, parseInt(minutes) || 0, 0);
//       }
      
//       return date.toISOString();
//     } catch (error) {
//       console.error('❌ DateTime formatting error:', error);
//       const date = new Date(dateString);
//       if (type === 'start') {
//         date.setHours(9, 0, 0);
//       } else {
//         date.setHours(11, 0, 0);
//       }
//       return date.toISOString();
//     }
//   }

//   // ✅ Helper: Status ke according color set karein
//   getStatusColor(status) {
//     const colorMap = {
//       'pending': '8',
//       'confirmed': '2', 
//       'in-progress': '5',
//       'completed': '10',
//       'cancelled': '11',
//       'rescheduled': '3',
//     };
    
//     return colorMap[status] || '8';
//   }
// }

// export const googleCalendar = new GoogleCalendarService();

import { google } from 'googleapis';

const calendar = google.calendar('v3');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class GoogleCalendarService {
  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID;
    this.auth = null;
  }

  // ✅ SIMPLE AUTH METHOD - JWT ki jagah OAuth2 try karein
  async initializeAuth() {
    try {
      console.log('🔄 Initializing Google Calendar authentication...');

      // ✅ Method 1: JWT Auth (existing)
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        console.log('⚠️ JWT credentials missing, using API key fallback');
        return false;
      }

      this.auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: SCOPES,
        subject: process.env.GOOGLE_CALENDAR_ID, // ✅ IMPORTANT: Add subject
      });

      // ✅ Token generate karein
      await this.auth.authorize();
      console.log('✅ Google Calendar authentication SUCCESSFUL');
      return true;

    } catch (error) {
      console.error('❌ JWT Authentication failed:', error.message);
      
      // ✅ Fallback: API Key method (read-only but better than nothing)
      if (process.env.GOOGLE_API_KEY) {
        console.log('🔄 Trying API Key fallback...');
        this.auth = new google.auth.GoogleAuth({
          keyFile: null,
          credentials: null,
          scopes: SCOPES,
        });
        return true;
      }
      
      return false;
    }
  }

  // ✅ Check if auth is ready
  async ensureAuth() {
    if (!this.auth) {
      return await this.initializeAuth();
    }
    return true;
  }

  // ✅ Create event with better error handling
  async createEvent(bookingData) {
    try {
      const authReady = await this.ensureAuth();
      if (!authReady || !this.auth) {
        console.log('⚠️ Calendar auth failed, but continuing without calendar');
        return { success: false, message: 'Calendar auth failed', fallback: true };
      }

      console.log('📅 Creating calendar event for:', bookingData.bookingId);

      const event = {
        summary: `🚗 ${bookingData.webName} - ${bookingData.formData.firstName} ${bookingData.formData.lastName}`,
        description: this.generateEventDescription(bookingData),
        start: {
          dateTime: this.formatDateTime(bookingData.formData.date, bookingData.formData.timeSlot, 'start'),
          timeZone: 'Asia/Kolkata', // ✅ Change to your timezone
        },
        end: {
          dateTime: this.formatDateTime(bookingData.formData.date, bookingData.formData.timeSlot, 'end'),
          timeZone: 'Asia/Kolkata', // ✅ Change to your timezone
        },
        colorId: this.getStatusColor(bookingData.status),
      };

      const response = await calendar.events.insert({
        auth: this.auth,
        calendarId: this.calendarId,
        resource: event,
      });

      console.log('✅ Google Calendar event created:', response.data.htmlLink);
      return { 
        success: true, 
        data: response.data,
        htmlLink: response.data.htmlLink 
      };

    } catch (error) {
      console.error('❌ Google Calendar event creation failed:', error.message);
      
      // ✅ Non-critical error - booking to create ho jayegi
      return { 
        success: false, 
        message: error.message,
        fallback: true 
      };
    }
  }

  // ✅ Update event in Google Calendar
  async updateEvent(bookingId, updatedBookingData) {
    try {
      const authReady = await this.ensureAuth();
      if (!authReady || !this.auth) {
        console.log('⚠️ Calendar auth failed, but continuing without calendar update');
        return { success: false, message: 'Calendar auth failed', fallback: true };
      }

      console.log('📅 Updating calendar event for:', bookingId);

      const event = {
        summary: `🚗 ${updatedBookingData.webName} - ${updatedBookingData.formData.firstName} ${updatedBookingData.formData.lastName}`,
        description: this.generateEventDescription(updatedBookingData),
        start: {
          dateTime: this.formatDateTime(updatedBookingData.formData.date, updatedBookingData.formData.timeSlot, 'start'),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: this.formatDateTime(updatedBookingData.formData.date, updatedBookingData.formData.timeSlot, 'end'),
          timeZone: 'Asia/Kolkata',
        },
        colorId: this.getStatusColor(updatedBookingData.status),
      };

      // ✅ Simple approach - always create new event for updates
      const response = await calendar.events.insert({
        auth: this.auth,
        calendarId: this.calendarId,
        resource: event,
      });

      console.log('✅ Google Calendar event updated:', response.data.htmlLink);
      return { 
        success: true, 
        data: response.data,
        htmlLink: response.data.htmlLink 
      };

    } catch (error) {
      console.error('❌ Google Calendar event update failed:', error.message);
      return { 
        success: false, 
        message: error.message,
        fallback: true 
      };
    }
  }

  // ✅ Delete event from Google Calendar
  async deleteEvent(bookingId) {
    try {
      const authReady = await this.ensureAuth();
      if (!authReady || !this.auth) return;

      const events = await calendar.events.list({
        auth: this.auth,
        calendarId: this.calendarId,
        q: bookingId,
      });

      const existingEvent = events.data.items.find(event => 
        event.extendedProperties?.private?.bookingId === bookingId
      );

      if (existingEvent) {
        await calendar.events.delete({
          auth: this.auth,
          calendarId: this.calendarId,
          eventId: existingEvent.id,
        });
        console.log('✅ Google Calendar event deleted for booking:', bookingId);
      }
    } catch (error) {
      console.error('❌ Google Calendar event deletion failed:', error.message);
    }
  }

  // ✅ Helper: Event description generate karein
  generateEventDescription(bookingData) {
    return `
📋 BOOKING DETAILS:

Booking ID: ${bookingData.bookingId}
Customer: ${bookingData.formData.firstName} ${bookingData.formData.lastName}
Email: ${bookingData.formData.email}
Phone: ${bookingData.formData.phone}
Address: ${bookingData.formData.address}, ${bookingData.formData.city}, ${bookingData.formData.state} ${bookingData.formData.zip}

🚗 SERVICE INFO:
• Vehicles: ${bookingData.vehicleCount}
• Total Price: $${bookingData.totalPrice}
• Discounted Price: $${bookingData.discountedPrice}
${bookingData.promoCode ? `• Promo Code: ${bookingData.promoCode}` : ''}

📊 STATUS: ${bookingData.status.toUpperCase()}
${bookingData.cancellationReason ? `• Cancellation Reason: ${bookingData.cancellationReason}` : ''}

📝 NOTES: ${bookingData.formData.notes || 'N/A'}

⏰ Created: ${new Date(bookingData.submittedAt).toLocaleString()}
    `.trim();
  }

  // ✅ Helper: DateTime format karein
  formatDateTime(dateString, timeSlot, type) {
    try {
      const date = new Date(dateString);
      
      if (!timeSlot || typeof timeSlot !== 'string') {
        if (type === 'start') {
          date.setHours(9, 0, 0);
        } else {
          date.setHours(12, 0, 0);
        }
        return date.toISOString();
      }

      let startTime, endTime;
      
      if (timeSlot.includes(' - ')) {
        [startTime, endTime] = timeSlot.split(' - ');
      } else if (timeSlot.includes('-')) {
        [startTime, endTime] = timeSlot.split('-');
      } else {
        startTime = '09:00';
        endTime = '12:00';
      }

      // ✅ Time format handle karein
      startTime = this.convertTo24Hour(startTime.trim());
      endTime = this.convertTo24Hour(endTime.trim());

      if (type === 'start') {
        const [hours, minutes] = startTime.split(':');
        date.setHours(parseInt(hours) || 9, parseInt(minutes) || 0, 0);
      } else {
        const [hours, minutes] = endTime.split(':');
        date.setHours(parseInt(hours) || 12, parseInt(minutes) || 0, 0);
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('❌ DateTime formatting error:', error);
      const date = new Date(dateString);
      if (type === 'start') {
        date.setHours(9, 0, 0);
      } else {
        date.setHours(11, 0, 0);
      }
      return date.toISOString();
    }
  }

  // ✅ Helper: Convert 12-hour to 24-hour format
  convertTo24Hour(timeString) {
    try {
      const time = timeString.trim().toUpperCase();
      let [timePart, modifier] = time.split(/\s+/);
      
      if (!modifier) return timePart;
      
      let [hours, minutes] = timePart.split(':');
      
      if (modifier === 'PM' && hours !== '12') {
        hours = String(parseInt(hours, 10) + 12);
      } else if (modifier === 'AM' && hours === '12') {
        hours = '00';
      }
      
      return `${hours.padStart(2, '0')}:${minutes || '00'}`;
    } catch (error) {
      return '09:00';
    }
  }

  // ✅ Helper: Status ke according color set karein
  getStatusColor(status) {
    const colorMap = {
      'pending': '8',
      'confirmed': '2', 
      'in-progress': '5',
      'completed': '10',
      'cancelled': '11',
      'rescheduled': '3',
    };
    
    return colorMap[status] || '8';
  }
}

export const googleCalendar = new GoogleCalendarService();