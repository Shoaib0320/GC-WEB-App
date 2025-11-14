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
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  monthlyTarget: {
    type: Number,
    default: 0, // default 0 rakho
    min: 0
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