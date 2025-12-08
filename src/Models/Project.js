import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    fullDescription: {
      type: String,
      trim: true,
      default: '',
    },

    // Category & Type
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Web Application', 'Mobile App', 'Desktop App', 'API/Backend', 'E-Commerce', 'CMS', 'Dashboard', 'Landing Page', 'Portfolio', 'Other'],
      default: 'Web Application',
    },
    projectType: {
      type: String,
      enum: ['Client Project', 'Personal Project', 'Open Source', 'Freelance', 'Company Project'],
      default: 'Client Project',
    },

    // Tech Stack
    technologies: [{
      type: String,
      trim: true,
    }],
    frameworks: [{
      type: String,
      trim: true,
    }],
    databases: [{
      type: String,
      trim: true,
    }],
    tools: [{
      type: String,
      trim: true,
    }],

    // Images
    thumbnail: {
      url: {
        type: String,
        required: [true, 'Thumbnail is required'],
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        default: '',
      },
      caption: {
        type: String,
        default: '',
      },
      order: {
        type: Number,
        default: 0,
      },
    }],

    // Links
    liveUrl: {
      type: String,
      trim: true,
      default: '',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    demoVideoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    documentationUrl: {
      type: String,
      trim: true,
      default: '',
    },

    // Project Details
    client: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      country: {
        type: String,
        trim: true,
        default: '',
      },
    },
    duration: {
      type: String,
      trim: true,
      default: '', // e.g., "3 months", "6 weeks"
    },
    completedAt: {
      type: Date,
    },
    teamSize: {
      type: Number,
      default: 1,
    },

    // Features
    features: [{
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    }],

    // Display Settings
    displayOrder: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // SEO
    metaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
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

// Generate slug before saving
projectSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Indexes
projectSchema.index({ isActive: 1, displayOrder: 1 });
projectSchema.index({ isFeatured: 1, isActive: 1 });
projectSchema.index({ category: 1, isActive: 1 });
projectSchema.index({ slug: 1 });
projectSchema.index({ technologies: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
