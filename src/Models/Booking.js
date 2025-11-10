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

// Vehicle Booking Schema
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

// Form Data Schema
const FormDataSchema = new mongoose.Schema({
  vehicleBookings: [VehicleBookingSchema],
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
    formData: { type: FormDataSchema, required: true },
    totalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discountApplied: { type: Boolean, default: false },
    discountPercent: { type: Number },
    promoCode: { type: String }, // Promo code string
    promoCodeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'PromoCode' // Promo code reference
    },
    submittedAt: { type: String, required: true },
    vehicleCount: { type: Number, required: true },
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

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

export default Booking;
