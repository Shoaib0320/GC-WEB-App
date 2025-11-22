import mongoose from "mongoose";

// Booking Status Enum
export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
};

// Booking Types Enum
export const BookingType = {
  VEHICLE: "vehicle",
  CHIMNEY: "chimney",
  DUCK_CLEANING: "duck-cleaning",
  // Add more types as needed
};

// Package Schema
const PackageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Mixed, required: true },
  pricingType: { type: String },
});

// Additional Service Schema
const AdditionalServiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Mixed, required: true },
});

// Variant Schema
const VariantSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  packages: [PackageSchema],
  additionalServices: [AdditionalServiceSchema],
});

// Service Schema
const ServiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  packages: [PackageSchema],
  variants: [VariantSchema],
  additionalServices: [AdditionalServiceSchema],
});

// Main Service Schema
const MainServiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  packages: [PackageSchema],
});

// Vehicle Booking Schema (Specific to vehicle bookings)
const VehicleBookingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  serviceType: { type: String, required: true },
  variant: { type: String },
  mainService: { type: String, required: true },
  package: { type: String, required: true },
  additionalServices: [{ type: String }],
  vehicleType: { type: String },
  vehicleMake: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleYear: { type: String, required: true },
  vehicleColor: { type: String, required: true },
  vehicleLength: { type: String },
});

// Chimney Cleaning Schema
const ChimneyBookingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  serviceType: { type: String, required: true },
  chimneyType: { type: String, required: true },
  package: { type: String, required: true },
  additionalServices: [{ type: String }],
  chimneySize: { type: String },
  location: { type: String },
  specialRequirements: { type: String },
});

// Duck Cleaning Schema
const DuckCleaningBookingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  serviceType: { type: String, required: true },
  package: { type: String, required: true },
  additionalServices: [{ type: String }],
  duckCount: { type: Number },
  areaSize: { type: String },
  specialRequirements: { type: String },
});

// Generic Booking Details Schema (for any booking type)
const GenericBookingDetailsSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  package: { type: String, required: true },
  additionalServices: [{ type: String }],
  // Add any common fields that might be needed across all booking types
  specialRequirements: { type: String },
});

// Form Data Schema (Now supports multiple booking types)
const FormDataSchema = new mongoose.Schema({
  // Keep vehicleBookings for backward compatibility
  vehicleBookings: [VehicleBookingSchema],
  
  // New flexible booking details - can hold any type of booking
  bookingDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Common customer information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  notes: { type: String },
});

// Main Booking Schema
const BookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    webName: { type: String, required: true },
    
    // Vendor information for each booking
    vendorName: { type: String },
    
    // Booking type to distinguish between different services
    bookingType: {
      type: String,
      enum: Object.values(BookingType),
      default: BookingType.VEHICLE,
      required: true
    },
    
    formData: { type: FormDataSchema, required: true },
    totalPrice: { type: Number, required: true },
    
    // ✅ FIXED: discountedPrice ko optional bana diya
    discountedPrice: { 
      type: Number, 
      default: function() {
        return this.totalPrice; // Agar discount nahi hai to totalPrice hi discountedPrice hoga
      }
    },
    
    discountApplied: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 },
    
    // Human-readable promo code string (kept for backward compatibility)
    promoCode: { type: String },

    // Reference to PromoCode document
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode',
      default: null,
      index: true,
    },
    
    submittedAt: { type: String, required: true },
    vehicleCount: { type: Number, default: 0 }, // Made optional with default
    serviceCount: { type: Number, default: 1 }, // Generic count for any service
    
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for better query performance
BookingSchema.index({ bookingType: 1, vendorName: 1 });
BookingSchema.index({ vendorName: 1, status: 1 });

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

export default Booking;