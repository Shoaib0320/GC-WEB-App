//src/Modals/Notification.js
// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error", "announcement"],
      default: "info"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    
    // Recipient Settings
    recipientType: {
      type: String,
      enum: ["all", "specific_users", "specific_agents"],
      required: true
    },
    specificUsers: [{
      type: String, // User IDs as strings
    }],
    specificAgents: [{
      type: String, // Agent IDs as strings
    }],
    
    // Schedule & Expiry
    scheduledAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    
    // Status
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "expired", "cancelled"],
      default: "draft"
    },
    
    // Action (optional)
    actionUrl: {
      type: String
    },
    actionText: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);