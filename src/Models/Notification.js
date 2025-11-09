// src/Models/Notification.js
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
    targetType: {
      type: String,
      enum: ["all", "user", "agent", "specific"],
      required: true
    },
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      refPath: "targetModel"
    }],
    targetModel: {
      type: String,
      enum: ["User", "Agent"],
      required: function() {
        return this.targetType === "specific";
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin user
      // required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);