// models/UserNotification.js
import mongoose from "mongoose";

const UserNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Simple string ID (user ID or agent ID)
      required: true
    },
    userType: {
      type: String,
      enum: ["user", "agent"],
      required: true
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
    }
  },
  { timestamps: true }
);

// Index for better performance
UserNotificationSchema.index({ userId: 1, isRead: 1 });
UserNotificationSchema.index({ userType: 1, createdAt: -1 });

export default mongoose.models.UserNotification || mongoose.model("UserNotification", UserNotificationSchema);