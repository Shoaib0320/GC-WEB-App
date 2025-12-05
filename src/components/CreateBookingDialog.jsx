// src/components/CreateBookingDialog.jsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, Mail, MapPin, Car, Tag, DollarSign, Package, Loader2, Home, Bird } from "lucide-react";
import { promoCodeService } from "@/services/promocodeService";
import { ALL_SERVICES, VENDORS, TIME_SLOTS } from "@/Data/bookingData";
import { toast } from "sonner";
import { useLoaderContext } from '@/context/LoaderContext';

// ✅ Booking Types
const BOOKING_TYPES = {
  VEHICLE: "vehicle",
  CHIMNEY: "chimney", 
  DUCK_CLEANING: "duck-cleaning",
};

const CreateBookingDialog = ({ open, onClose, onSubmit }) => {
  // ✅ Main Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
    date: "",
    timeSlot: "",
    webName: "",
    bookingType: BOOKING_TYPES.VEHICLE,
    vendorName: "",
  });

  // ✅ Dynamic Booking State based on type
  const [bookingDetails, setBookingDetails] = useState({
    serviceType: "",
    package: "",
    additionalServices: [],
    // Chimney specific
    chimneyType: "",
    chimneySize: "",
    location: "",
    // Duck cleaning specific  
    duckCount: "",
    areaSize: "",
    // Vehicle specific
    vehicleType: "",
    variant: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    vehicleLength: "",
    specialRequirements: "",
  });

  // ✅ Promo Code State
  const [promoCodes, setPromoCodes] = useState([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);

  // ✅ Pricing State
  const [pricing, setPricing] = useState({
    totalPrice: 0,
    discountedPrice: 0,
    discountApplied: false,
    discountPercent: 0,
  });

  // ✅ Loader Context
  const { showLoader, hideLoader } = useLoaderContext();

  // ✅ Fetch Promo Codes
  useEffect(() => {
    if (open) {
      fetchPromoCodes();
      resetForm();
    }
  }, [open]);

  const fetchPromoCodes = async () => {
    try {
      setLoadingPromoCodes(true);
      const response = await promoCodeService.getAllPromoCodes({ limit: 100 });
      setPromoCodes(response.data || []);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      toast.error("Failed to fetch promo codes");
    } finally {
      setLoadingPromoCodes(false);
    }
  };

  // ✅ Apply Promo Code
  const applyPromoCode = (promoId) => {
    if (promoId === "none") {
      setSelectedPromoCode(null);
      return;
    }
    
    const promo = promoCodes.find(p => p._id === promoId);
    if (promo) {
      setSelectedPromoCode(promo);
    } else {
      setSelectedPromoCode(null);
    }
  };

  // ✅ Handle Form Input Changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Handle Booking Details Changes
  const handleBookingDetailsChange = (field, value) => {
    setBookingDetails(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset dependent fields when service type changes
      if (field === "serviceType") {
        updated.package = "";
        updated.additionalServices = [];
        updated.variant = "";
        updated.vehicleType = "";
      }
      
      // Reset package when variant changes
      if (field === "variant") {
        updated.package = "";
        updated.additionalServices = [];
      }
      
      if (field === "package") {
        // Auto-set main service name from package
        const selectedPackage = getPackages().find(p => p.id === value);
        if (selectedPackage) {
          console.log("Selected Package:", selectedPackage.name);
        }
      }
      
      return updated;
    });
  };

  // ✅ Get current service category
  const getCurrentServiceCategory = () => {
    return ALL_SERVICES[formData.bookingType.toUpperCase()];
  };

  // ✅ Get available services for current booking type
  const getServices = () => {
    const category = getCurrentServiceCategory();
    return category?.services || [];
  };

  // ✅ Get variants for vehicle service
  const getVariants = () => {
    if (formData.bookingType !== BOOKING_TYPES.VEHICLE) return [];
    const services = getServices();
    const selectedService = services.find(s => s.id === bookingDetails.serviceType);
    return selectedService?.variants || [];
  };

  // ✅ Get packages for selected service (with variant support)
  const getPackages = () => {
    const services = getServices();
    const selectedService = services.find(s => s.id === bookingDetails.serviceType);
    
    if (!selectedService) return [];
    
    // If service has variants, get packages from selected variant
    if (selectedService.variants && selectedService.variants.length > 0) {
      if (!bookingDetails.variant) return [];
      const selectedVariant = selectedService.variants.find(v => v.id === bookingDetails.variant);
      return selectedVariant?.packages || [];
    }
    
    // Otherwise, get packages directly from service
    return selectedService?.packages || [];
  };

  // ✅ Get additional services for selected service (with variant support)
  const getAdditionalServices = () => {
    const services = getServices();
    const selectedService = services.find(s => s.id === bookingDetails.serviceType);
    
    if (!selectedService) return [];
    
    // If service has variants, get additional services from selected variant
    if (selectedService.variants && selectedService.variants.length > 0) {
      if (!bookingDetails.variant) return [];
      const selectedVariant = selectedService.variants.find(v => v.id === bookingDetails.variant);
      return selectedVariant?.additionalServices || [];
    }
    
    // Otherwise, get additional services directly from service
    return selectedService?.additionalServices || [];
  };

  // ✅ Calculate Price based on booking type
  const calculatePrice = () => {
    let totalPrice = 0;

    const selectedPackage = getPackages().find(p => p.id === bookingDetails.package);
    
    if (selectedPackage) {
      let packagePrice = selectedPackage.price;

      // Apply per-foot pricing for vehicles
      if (selectedPackage.pricingType === "perFoot" && bookingDetails.vehicleLength) {
        packagePrice = packagePrice * parseFloat(bookingDetails.vehicleLength || 0);
      }

      totalPrice += packagePrice;
    }

    // Add additional services
    const additionalServices = getAdditionalServices();
    bookingDetails.additionalServices?.forEach(serviceId => {
      const service = additionalServices.find(s => s.id === serviceId);
      if (service) {
        totalPrice += service.price;
      }
    });

    return totalPrice;
  };

  // ✅ Auto-calculate pricing
  useEffect(() => {
    const totalPrice = calculatePrice();
    const discount = selectedPromoCode?.discountPercentage || 0;
    const discounted = totalPrice - (totalPrice * discount) / 100;

    setPricing({
      totalPrice,
      discountedPrice: discounted,
      discountApplied: !!selectedPromoCode,
      discountPercent: discount,
    });
  }, [bookingDetails, selectedPromoCode, formData.bookingType]);

  // ✅ Toggle Additional Service
  const toggleAdditionalService = (serviceId) => {
    const services = bookingDetails.additionalServices || [];
    const isSelected = services.includes(serviceId);

    handleBookingDetailsChange(
      "additionalServices",
      isSelected
        ? services.filter((s) => s !== serviceId)
        : [...services, serviceId]
    );
  };

  // ✅ Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill all required customer fields");
      return;
    }

    if (!formData.webName) {
      toast.error("Please enter the website/source name");
      return;
    }

    if (!formData.vendorName) {
      toast.error("Please select a vendor");
      return;
    }

    if (!formData.date || !formData.timeSlot) {
      toast.error("Please select date and time slot");
      return;
    }

    if (!bookingDetails.serviceType || !bookingDetails.package) {
      toast.error("Please select service type and package");
      return;
    }

    // ✅ Vehicle specific validation
    if (formData.bookingType === BOOKING_TYPES.VEHICLE) {
      if (!bookingDetails.vehicleMake || !bookingDetails.vehicleModel || !bookingDetails.vehicleYear) {
        toast.error("Please fill all vehicle details");
        return;
      }

      // Validate vehicle length for per-foot pricing
      const selectedPackage = getPackages().find(p => p.id === bookingDetails.package);
      if (selectedPackage?.pricingType === "perFoot" && !bookingDetails.vehicleLength) {
        toast.error("Vehicle length is required for per-foot pricing");
        return;
      }
    }

    // ✅ Generate Booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    // ✅ Prepare booking data
    const bookingData = {
      bookingId,
      webName: formData.webName,
      vendorName: formData.vendorName,
      bookingType: formData.bookingType,
      formData: {
        ...formData,
        bookingDetails: {
          ...bookingDetails,
          // Include service name for reference
          serviceName: getServices().find(s => s.id === bookingDetails.serviceType)?.name,
          packageName: getPackages().find(p => p.id === bookingDetails.package)?.name,
        },
      },
      totalPrice: pricing.totalPrice,
      discountedPrice: pricing.discountedPrice,
      discountApplied: pricing.discountApplied,
      discountPercent: pricing.discountPercent,
      promoCode: selectedPromoCode?.promoCode || null,
      promoCodeId: selectedPromoCode?._id || null,
      submittedAt: new Date().toISOString(),
      vehicleCount: formData.bookingType === BOOKING_TYPES.VEHICLE ? 1 : 0,
      serviceCount: 1,
      status: "pending",
    };

    try {
      showLoader("create-booking", "Creating booking...");
      const res = await onSubmit(bookingData);

      if (res && res.success) {
        resetForm();
        if (onClose) onClose();
        toast.success("Booking created successfully!");
      } else if (res && !res.success) {
        toast.error(res.message || "Failed to create booking");
      } else {
        resetForm();
        if (onClose) onClose();
        toast.success("Booking created successfully!");
      }
    } catch (err) {
      console.error("Create booking error:", err);
      toast.error(err?.message || "Failed to create booking");
    } finally {
      hideLoader("create-booking");
    }
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      notes: "",
      date: "",
      timeSlot: "",
      webName: "",
      bookingType: BOOKING_TYPES.VEHICLE,
      vendorName: "",
    });
    setBookingDetails({
      serviceType: "",
      package: "",
      additionalServices: [],
      chimneyType: "",
      chimneySize: "",
      location: "",
      duckCount: "",
      areaSize: "",
      vehicleType: "",
      variant: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      vehicleLength: "",
      specialRequirements: "",
    });
    setSelectedPromoCode(null);
    setPricing({
      totalPrice: 0,
      discountedPrice: 0,
      discountApplied: false,
      discountPercent: 0,
    });
  };

  // ✅ Render Service Specific Fields
  const renderServiceSpecificFields = () => {
    const services = getServices();
    const currentService = services.find(s => s.id === bookingDetails.serviceType);

    switch (formData.bookingType) {
      case BOOKING_TYPES.VEHICLE:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Vehicle Details */}
            <div className="space-y-2">
              <Label>Vehicle Make <span className="text-red-500">*</span></Label>
              <Input
                value={bookingDetails.vehicleMake}
                onChange={(e) => handleBookingDetailsChange("vehicleMake", e.target.value)}
                placeholder="Toyota, Honda, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Model <span className="text-red-500">*</span></Label>
              <Input
                value={bookingDetails.vehicleModel}
                onChange={(e) => handleBookingDetailsChange("vehicleModel", e.target.value)}
                placeholder="Camry, Civic, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Year <span className="text-red-500">*</span></Label>
              <Input
                value={bookingDetails.vehicleYear}
                onChange={(e) => handleBookingDetailsChange("vehicleYear", e.target.value)}
                placeholder="2023"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Color <span className="text-red-500">*</span></Label>
              <Input
                value={bookingDetails.vehicleColor}
                onChange={(e) => handleBookingDetailsChange("vehicleColor", e.target.value)}
                placeholder="Black, White, etc."
                required
              />
            </div>
            
            {/* Vehicle Length for per-foot pricing */}
            {currentService?.packages?.some(p => p.pricingType === "perFoot") && (
              <div className="space-y-2">
                <Label>Vehicle Length (feet) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={bookingDetails.vehicleLength}
                  onChange={(e) => handleBookingDetailsChange("vehicleLength", e.target.value)}
                  placeholder="Enter length in feet"
                  required
                />
              </div>
            )}
          </div>
        );

      case BOOKING_TYPES.CHIMNEY:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentService?.chimneyTypes && (
              <div className="space-y-2">
                <Label>Chimney Type</Label>
                <Select
                  value={bookingDetails.chimneyType}
                  onValueChange={(value) => handleBookingDetailsChange("chimneyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chimney type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentService.chimneyTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentService?.chimneySizes && (
              <div className="space-y-2">
                <Label>Chimney Size</Label>
                <Select
                  value={bookingDetails.chimneySize}
                  onValueChange={(value) => handleBookingDetailsChange("chimneySize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentService.chimneySizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={bookingDetails.location}
                onChange={(e) => handleBookingDetailsChange("location", e.target.value)}
                placeholder="e.g., Kitchen, Living Room, etc."
              />
            </div>
          </div>
        );

      case BOOKING_TYPES.DUCK_CLEANING:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duck Count</Label>
              <Input
                type="number"
                value={bookingDetails.duckCount}
                onChange={(e) => handleBookingDetailsChange("duckCount", e.target.value)}
                placeholder="Number of ducks"
              />
            </div>

            {currentService?.areaSizes && (
              <div className="space-y-2">
                <Label>Area Size</Label>
                <Select
                  value={bookingDetails.areaSize}
                  onValueChange={(value) => handleBookingDetailsChange("areaSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area size" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentService.areaSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ✅ Get Icon Component
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Car": return Car;
      case "Home": return Home;
      case "Bird": return Bird;
      default: return Car;
    }
  };

  const CurrentIcon = getIconComponent(getCurrentServiceCategory()?.icon);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6" />
            Create New Booking
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 📋 CUSTOMER INFORMATION */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="customer@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* BOOKING TYPE & VENDOR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingType">Booking Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.bookingType}
                    onValueChange={(value) => handleInputChange("bookingType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(BOOKING_TYPES).map((type) => {
                        const category = ALL_SERVICES[type.toUpperCase()];
                        const IconComponent = getIconComponent(category?.icon);
                        return (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {category?.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="vendorName"
                    value={formData.vendorName}
                    onChange={(e) => handleInputChange("vendorName", e.target.value)}
                    placeholder="Enter vendor name (e.g., AutoClean Experts, John's Detailing)"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You can type any vendor name
                  </p>
                </div>
              </div>

              <Separator />

              {/* WEB NAME FIELD */}
              <div className="space-y-2">
                <Label htmlFor="webName">Website/Source Name <span className="text-red-500">*</span></Label>
                <Input
                  id="webName"
                  value={formData.webName}
                  onChange={(e) => handleInputChange("webName", e.target.value)}
                  placeholder="e.g., Admin Dashboard, Website, Mobile App"
                  required
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleInputChange("zip", e.target.value)}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📅 APPOINTMENT DETAILS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.timeSlot}
                    onValueChange={(value) => handleInputChange("timeSlot", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot.replace('-', ' AM - ')} PM
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🎯 SERVICE DETAILS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CurrentIcon className="w-5 h-5" />
                {getCurrentServiceCategory()?.name} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Type Selection */}
              <div className="space-y-2">
                <Label>Service Type <span className="text-red-500">*</span></Label>
                <Select
                  value={bookingDetails.serviceType}
                  onValueChange={(value) => handleBookingDetailsChange("serviceType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${getCurrentServiceCategory()?.name.toLowerCase()} service`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getServices().map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Variant Selection (for Car Detailing) */}
              {getVariants().length > 0 && bookingDetails.serviceType && (
                <div className="space-y-2">
                  <Label>Vehicle Variant <span className="text-red-500">*</span></Label>
                  <Select
                    value={bookingDetails.variant}
                    onValueChange={(value) => handleBookingDetailsChange("variant", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {getVariants().map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select your vehicle type for accurate pricing
                  </p>
                </div>
              )}

              {/* Package Selection */}
              {getPackages().length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Package <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={bookingDetails.package}
                    onValueChange={(value) => handleBookingDetailsChange("package", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPackages().map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{pkg.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ${pkg.price}
                              {pkg.pricingType === "perFoot" && "/ft"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {bookingDetails.package && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getPackages().find(p => p.id === bookingDetails.package)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Service Specific Fields */}
              {bookingDetails.serviceType && renderServiceSpecificFields()}

              {/* Additional Services */}
              {getAdditionalServices().length > 0 && (
                <div className="space-y-3 p-4 bg-background rounded-lg border">
                  <Label className="text-sm font-semibold">Additional Services (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getAdditionalServices().map((service) => (
                      <div key={service.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 border">
                        <Checkbox
                          id={service.id}
                          checked={bookingDetails.additionalServices?.includes(service.id)}
                          onCheckedChange={() => toggleAdditionalService(service.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={service.id} className="text-sm font-medium leading-none cursor-pointer">
                            {service.name}
                            <span className="ml-2 text-xs text-muted-foreground">
                              +${service.price}
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              <div className="space-y-2">
                <Label>Special Requirements</Label>
                <Textarea
                  value={bookingDetails.specialRequirements}
                  onChange={(e) => handleBookingDetailsChange("specialRequirements", e.target.value)}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 💰 PRICING & PROMO CODE */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                Pricing & Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PROMO CODE SELECTION */}
              <div className="space-y-2">
                <Label htmlFor="promoCode">Apply Promo Code (Optional)</Label>
                <Select
                  value={selectedPromoCode?._id || ""}
                  onValueChange={applyPromoCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select promo code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Promo Code</SelectItem>
                    {promoCodes.map((promo) => (
                      <SelectItem key={promo._id} value={promo._id}>
                        {promo.promoCode} - {promo.discountPercentage}% off
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* PROMO CODE APPLIED INDICATOR */}
              {selectedPromoCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Tag className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">{selectedPromoCode.promoCode} Applied!</p>
                      <p className="text-sm">{pricing.discountPercent}% discount applied</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PRICE BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Subtotal</Label>
                  <div className="text-2xl font-bold">${pricing.totalPrice.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Auto-calculated from packages & services</p>
                </div>
                
                {pricing.discountApplied && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Discount ({pricing.discountPercent}%)</Label>
                    <div className="text-2xl font-bold text-green-600">
                      -${(pricing.totalPrice - pricing.discountedPrice).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Promo code savings</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Final Price</Label>
                  <div className="text-3xl font-bold text-primary">${pricing.discountedPrice.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {pricing.discountApplied ? 'After discount' : 'Total amount'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📝 ADDITIONAL NOTES */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                placeholder="Add any special instructions or notes..."
              />
            </CardContent>
          </Card>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
            <Button type="submit" size="lg" className="min-w-[150px] bg-blue-600 hover:bg-blue-700">
              Create Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingDialog;