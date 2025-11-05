import mongoose from "mongoose";

const WeeklyOffSchema = new mongoose.Schema(
  {
    day: { 
      type: String, 
      enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      required: true,
      unique: true
    },
    name: { type: String, required: true }, // e.g., "Sunday", "Weekly Off"
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.WeeklyOff || mongoose.model("WeeklyOff", WeeklyOffSchema);