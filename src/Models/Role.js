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
    // unique: true,
    // trim: true,
    // enum: [
    //   'super_admin',
    //   'admin',
    //   'manager',
    //   'sales_manager',
    //   'support',
    //   'hr_manager',
    //   'finance_manager',
    //   'viewer',
    //   'agent',
    //   'employee'
    // ]
  },
  description: {
    type: String,
    trim: true
  },

  // 🔐 All Permission Modules
  permissions: {
    // 👤 User Management
    user: permissionGroupSchema,

    // 🏷️ Category Management
    category: permissionGroupSchema,

    // 🛍️ Product Management
    product: permissionGroupSchema,

    // 🧾 Order Management
    order: {
      ...permissionGroupSchema.obj,
      update_status: { type: Boolean, default: false }
    },

    // 📦 Inventory Management
    inventory: permissionGroupSchema,

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

    // 🧑‍💼 HR Management
    hr: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      payroll: { type: Boolean, default: false },
      attendance: { type: Boolean, default: false },
      leave_approve: { type: Boolean, default: false }
    },

    // 💰 Finance Management
    finance: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      approve_payments: { type: Boolean, default: false },
      export_reports: { type: Boolean, default: false }
    },

    // 🧠 CRM Module
    crm: {
      clients: permissionGroupSchema,
      leads: permissionGroupSchema,
      tickets: permissionGroupSchema
    },

    // 🌐 Website Bookings (your company’s sites)
    website_bookings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      manage_status: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },

    // 📊 Reports (custom module)
    reports: {
      sales: { type: Boolean, default: false },
      finance: { type: Boolean, default: false },
      hr: { type: Boolean, default: false },
      performance: { type: Boolean, default: false },
      export_all: { type: Boolean, default: false }
    },

    // 📊 Progress Tracking (for agents and employees)
    progress: {
      view_own: { type: Boolean, default: false },
      view_all: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    }
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