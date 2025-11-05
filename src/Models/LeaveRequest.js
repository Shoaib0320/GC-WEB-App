import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
    leaveType: { 
      type: String, 
      enum: ["sick", "casual", "emergency", "other"], 
      required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    comments: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", LeaveRequestSchema);