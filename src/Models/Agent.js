// import mongoose from 'mongoose';

// const agentSchema = new mongoose.Schema({
//   agentName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   agentId: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   shift: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Shift',
//     required: true
//   },
//   email: {
//     type: String,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
//   monthlyTarget: {
//     type: Number,
//     default: 0
//   },
//     // ✅ نئی فیلڈز شامل کریں
//   employeeType: {
//     type: String,
//     enum: ['full-time', 'part-time', 'contract', 'intern'],
//     default: 'full-time'
//   },
//   designation: {
//     type: String,
//     enum: ['agent', 'team-leader', 'supervisor', 'manager'],
//     default: 'agent'
//   },
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.models.Agent || mongoose.model('Agent', agentSchema);

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
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{2}\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid Agent ID! Format: 2 letters followed by 4 digits (e.g., AB1234)`
    }
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
  
  // ✅ Monthly Target Types
  monthlyTargetType: {
    type: String,
    enum: ['digit', 'amount', 'both'],
    default: 'digit'
  },
  
  // Digit Target (e.g., 100 calls, 50 settlements)
  monthlyDigitTarget: {
    type: Number,
    default: 0,
    min: [0, 'Digit target cannot be negative']
  },
  
  // Amount Target (e.g., 500000 revenue, 1000000 sales)
  monthlyAmountTarget: {
    type: Number,
    default: 0,
    min: [0, 'Amount target cannot be negative']
  },
  
  // Currency for amount target
  targetCurrency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR', 'GBP']
  },
  
  // Naye fields
  employeeType: {
    type: String,
    enum: ['Permanent', 'Contract', 'Temporary', 'Probation', 'Intern', 'Part-time', 'Full-time', 'Freelance', 'Consultant', 'Manager'],
    default: 'Permanent'
  },
  designation: {
    type: String,
    trim: true,
    default: 'Sales Agent'
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