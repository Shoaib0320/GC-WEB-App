// src/Models/Role.js
import mongoose from 'mongoose';

const permissionGroupSchema = new mongoose.Schema({
  view: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  export: { type: Boolean, default: false },

  approve: { type: Boolean, default: false },
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
  },
  description: {
    type: String,
    trim: true
  },

  // 🔐 All Permission Modules - UPDATED
  permissions: {
    // 👤 User Management
    user: permissionGroupSchema,

    // 📈 Analytics & Reports
    analytics: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    },

    // ⚙️ System Settings
    settings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      manage_roles: { type: Boolean, default: false }
    },

    // 🏷️ NEW: Sales Management
    sales: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false } // Sales-specific analytics
    },

    // 🏷️ NEW: Sales Analytics (Separate module for detailed analytics)
    sales_analytics: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      manage: { type: Boolean, default: false }
    },

    // 👥 Agent Management
    agent: permissionGroupSchema,

    // 🕐 Shift Management
    shift: permissionGroupSchema,

    // 📅 Booking Management
    booking: {
      ...permissionGroupSchema.obj,
      update_status: { type: Boolean, default: false }
    },

    // 🎫 Promo Code Management
    promoCode: permissionGroupSchema,

    // 🔔 Notification Management
    notification: permissionGroupSchema,

    // 📊 Attendance Management
    attendance: {
      ...permissionGroupSchema.obj,
      manage_leave: { type: Boolean, default: false }
    },

    // 🏖️ Leave Request Management
    leaveRequest: permissionGroupSchema,

    // 🎄 Holiday Management
    holiday: permissionGroupSchema,

    // 📅 Weekly Off Management
    weeklyOff: permissionGroupSchema,

    // 📞 Contact Management
    contact: permissionGroupSchema,

    // 🛡️ Role Management
    role: {
      ...permissionGroupSchema.obj,
      manage_roles: { type: Boolean, default: false }
    },

    // 🌐 Website Bookings
    website_bookings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      manage_status: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },

    // 📊 Reports
    reports: {
      sales: { type: Boolean, default: false },
      finance: { type: Boolean, default: false },
      hr: { type: Boolean, default: false },
      performance: { type: Boolean, default: false },
      export_all: { type: Boolean, default: false }
    },

    // 📈 Progress Tracking
    progress: {
      view_own: { type: Boolean, default: false },
      view_all: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    },

    // 👥 Team Management
    team: permissionGroupSchema,

    // 📁 Project Management
    project: permissionGroupSchema
  },

  // 🌟 General Info
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

export default mongoose.models.Role || mongoose.model('Role', roleSchema);