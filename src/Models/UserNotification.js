// models/UserNotification.js
import mongoose from "mongoose";

const UserNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent"
    },
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    dismissed: {
      type: Boolean,
      default: false
    },
    dismissedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Composite index for better query performance
UserNotificationSchema.index({ user: 1, notification: 1 }, { unique: true });
UserNotificationSchema.index({ agent: 1, notification: 1 }, { unique: true });
UserNotificationSchema.index({ isRead: 1, createdAt: -1 });
UserNotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.UserNotification || mongoose.model("UserNotification", UserNotificationSchema);