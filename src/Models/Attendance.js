// src/Models/Attendance.js
import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },

    date: { type: Date, required: true }, // Specific date for attendance
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },

    checkInLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    checkOutLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    status: { 
      type: String, 
      enum: [
        "present", 
        "absent", 
        "late", 
        "half_day", 
        "holiday", 
        "weekly_off", 
        "approved_leave", 
        "pending_leave"
      ], 
      default: "present" 
    },

    isLate: { type: Boolean, default: false },
    lateMinutes: { type: Number, default: 0 },

    isOvertime: { type: Boolean, default: false },
    overtimeMinutes: { type: Number, default: 0 },

    isEarlyCheckout: { type: Boolean, default: false },
    earlyCheckoutMinutes: { type: Number, default: 0 },

    totalWorkingMinutes: { type: Number, default: 0 },

    leaveReason: { type: String, default: "" },
    leaveType: { type: String, enum: ["sick", "casual", "emergency", "other"], default: "casual" },
    
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for faster queries
AttendanceSchema.index({ agent: 1, date: 1 });
AttendanceSchema.index({ user: 1, date: 1 });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);