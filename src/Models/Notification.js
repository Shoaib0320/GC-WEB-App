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
      enum: ["all", "specific_users", "specific_agents", "role_based"],
      required: true
    },
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    specificAgents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent"
    }],
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
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
    },
    
    // Analytics
    totalRecipients: {
      type: Number,
      default: 0
    },
    readCount: {
      type: Number,
      default: 0
    },
    
    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for better performance
NotificationSchema.index({ status: 1, scheduledAt: 1 });
NotificationSchema.index({ recipientType: 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);