import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true,
    trim: true
  },
  agentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  monthlyTarget: {
    type: Number,
    default: 0
  },
    // ✅ نئی فیلڈز شامل کریں
  employeeType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  designation: {
    type: String,
    enum: ['agent', 'team-leader', 'supervisor', 'manager'],
    default: 'agent'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Agent || mongoose.model('Agent', agentSchema);