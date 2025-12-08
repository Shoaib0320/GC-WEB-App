import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },

    // Professional Links
    github: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty
          return /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/.test(v);
        },
        message: 'Please enter a valid GitHub URL',
      },
    },

    linkedin: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty
          return /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/.test(v);
        },
        message: 'Please enter a valid LinkedIn URL',
      },
    },

    // Image Information
    profileImage: {
      type: String,
      required: [true, 'Profile image is required'],
      trim: true,
    },

    imagePublicId: {
      type: String,
      trim: true,
      default: '', // Cloudinary public ID for easy deletion
    },

    backgroundColour: {
      type: String,
      default: '#3B82F6', // Default blue color in hex
      validate: {
        validator: function (v) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Please enter a valid hex color code',
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for active teams
teamSchema.index({ isActive: 1, createdAt: -1 });

// Index for email
teamSchema.index({ email: 1 });

export default mongoose.models.Team || mongoose.model('Team', teamSchema);
