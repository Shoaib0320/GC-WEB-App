// src/components/CreateBookingDialog.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { X, Calendar, Clock, User, Phone, Mail, MapPin, Car, Plus, Trash2, Tag, DollarSign, Package, Loader2 } from "lucide-react";
import { promoCodeService } from "@/services/promocodeService";
import { serviceTypes, vehicleTypes as allVehicleTypes } from "@/Data/bookingData";
import { toast } from "sonner";

const CreateBookingDialog = ({ open, onClose, onSubmit }) => {
  // ✅ Customer Information
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
    webName: "", // ✅ Added webName field
  });

  // ✅ Multiple Vehicles State
  const [vehicleBookings, setVehicleBookings] = useState([
    {
      id: `vehicle-${Date.now()}`,
      serviceType: "", // serviceTypes se (car, boat, rv, etc.)
      vehicleType: "", // vehicle type based on service
      variant: "", // variant if service has variants (sedan, suv, truck, van)
      mainService: "", // ✅ Added mainService field (required by backend)
      package: "", // selected package
      additionalServices: [], // array of selected additional service IDs
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      vehicleLength: "", // for boats, RVs, jet-skis
    },
  ]);

  // ✅ Promo Code State
  const [promoCodes, setPromoCodes] = useState([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [promoCodeSearch, setPromoCodeSearch] = useState("");
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);

  // ✅ Pricing State
  const [pricing, setPricing] = useState({
    totalPrice: 0,
    discountedPrice: 0,
    discountApplied: false,
    discountPercent: 0,
  });

  // ✅ SUBMITTING STATE - YEH ADD KARNA THA
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch Promo Codes on mount
  useEffect(() => {
    if (open) {
      fetchPromoCodes();
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

  // ✅ Apply Promo Code function - YEH BHI ADD KARNA THA
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

  // ✅ Add Vehicle
  const addVehicle = () => {
    setVehicleBookings([
      ...vehicleBookings,
      {
        id: `vehicle-${Date.now()}`,
        serviceType: "",
        vehicleType: "",
        variant: "",
        mainService: "", // ✅ Added
        package: "",
        additionalServices: [],
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        vehicleColor: "",
        vehicleLength: "",
      },
    ]);
  };

  // ✅ Remove Vehicle
  const removeVehicle = (id) => {
    if (vehicleBookings.length === 1) {
      toast.error("At least one vehicle is required");
      return;
    }
    setVehicleBookings(vehicleBookings.filter((v) => v.id !== id));
  };

  // ✅ Update Vehicle Field
  const updateVehicleField = (id, field, value) => {
    setVehicleBookings(
      vehicleBookings.map((v) => {
        if (v.id !== id) return v;

        const updated = { ...v, [field]: value };

        // Reset dependent fields when service type changes
        if (field === "serviceType") {
          updated.vehicleType = "";
          updated.variant = "";
          updated.mainService = ""; // ✅ Reset mainService
          updated.package = "";
          updated.additionalServices = [];
        }

        // Reset variant and package when vehicle type changes
        if (field === "vehicleType") {
          updated.variant = "";
          updated.mainService = ""; // ✅ Reset mainService
          updated.package = "";
          updated.additionalServices = [];
        }

        // Reset package when variant changes
        if (field === "variant") {
          updated.mainService = ""; // ✅ Reset mainService
          updated.package = "";
          updated.additionalServices = [];
        }

        // ✅ Auto-set mainService when package is selected
        if (field === "package") {
          const packages = getPackages(v);
          const selectedPkg = packages.find(p => p.id === value);
          if (selectedPkg) {
            updated.mainService = selectedPkg.name; // Use package name as mainService
          }
        }

        return updated;
      })
    );
  };

  // ✅ Toggle Additional Service
  const toggleAdditionalService = (vehicleId, serviceId) => {
    setVehicleBookings(
      vehicleBookings.map((v) => {
        if (v.id !== vehicleId) return v;

        const services = v.additionalServices || [];
        const isSelected = services.includes(serviceId);

        return {
          ...v,
          additionalServices: isSelected
            ? services.filter((s) => s !== serviceId)
            : [...services, serviceId],
        };
      })
    );
  };

  // ✅ Get available vehicle types for a service
  const getAvailableVehicleTypes = (serviceTypeId) => {
    const service = serviceTypes.find((s) => s.id === serviceTypeId);
    if (!service) return [];
    return service.vehicleTypes || [];
  };

  // ✅ Get variants for a service
  const getVariants = (serviceTypeId) => {
    const service = serviceTypes.find((s) => s.id === serviceTypeId);
    if (!service) return [];
    return service.variants || [];
  };

  // ✅ Get packages for a vehicle
  const getPackages = (vehicle) => {
    const service = serviceTypes.find((s) => s.id === vehicle.serviceType);
    if (!service) return [];

    // If service has variants, get packages from the selected variant
    if (service.variants && service.variants.length > 0 && vehicle.variant) {
      const variant = service.variants.find((v) => v.id === vehicle.variant);
      return variant?.packages || [];
    }

    // Otherwise, get packages from the service directly
    return service.packages || [];
  };

  // ✅ Get additional services for a vehicle
  const getAdditionalServices = (vehicle) => {
    const service = serviceTypes.find((s) => s.id === vehicle.serviceType);
    if (!service) return [];

    // If service has variants, get additional services from the selected variant
    if (service.variants && service.variants.length > 0 && vehicle.variant) {
      const variant = service.variants.find((v) => v.id === vehicle.variant);
      return variant?.additionalServices || [];
    }

    // Otherwise, get additional services from the service directly
    return service.additionalServices || [];
  };

  // ✅ Calculate Vehicle Price
  const calculateVehiclePrice = (vehicle) => {
    let totalPrice = 0;

    // Get package price
    const packages = getPackages(vehicle);
    const selectedPackage = packages.find((p) => p.id === vehicle.package);

    if (selectedPackage) {
      let packagePrice = selectedPackage.price;

      // If pricing is per foot, multiply by vehicle length
      if (selectedPackage.pricingType === "perFoot" && vehicle.vehicleLength) {
        packagePrice = packagePrice * parseFloat(vehicle.vehicleLength || 0);
      }

      totalPrice += packagePrice;
    }

    // Add additional services prices
    const additionalServices = getAdditionalServices(vehicle);
    vehicle.additionalServices?.forEach((serviceId) => {
      const service = additionalServices.find((s) => s.id === serviceId);
      if (service) {
        totalPrice += service.price;
      }
    });

    return totalPrice;
  };

  // ✅ Calculate Total Price for All Vehicles
  const calculateTotalBookingPrice = () => {
    let total = 0;
    vehicleBookings.forEach((vehicle) => {
      total += calculateVehiclePrice(vehicle);
    });
    return total;
  };

  // ✅ Auto-calculate pricing whenever vehicles change
  useEffect(() => {
    const totalPrice = calculateTotalBookingPrice();
    const discount = selectedPromoCode?.discountPercentage || 0;
    const discounted = totalPrice - (totalPrice * discount) / 100;

    setPricing({
      totalPrice,
      discountedPrice: discounted,
      discountApplied: !!selectedPromoCode,
      discountPercent: discount,
    });
  }, [vehicleBookings, selectedPromoCode]);

  // ✅ Apply Promo Code
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

    if (!formData.date || !formData.timeSlot) {
      toast.error("Please select date and time slot");
      return;
    }

    // ✅ Validate at least one vehicle
    const hasValidVehicle = vehicleBookings.some(
      (v) => v.vehicleMake && v.vehicleModel && v.vehicleYear && v.serviceType && v.package && v.mainService
    );

    if (!hasValidVehicle) {
      toast.error("Please add at least one vehicle with required details (Service, Package, Make, Model, Year)");
      return;
    }

    // ✅ Validate vehicle length for per-foot pricing
    for (const vehicle of vehicleBookings) {
      const packages = getPackages(vehicle);
      const selectedPkg = packages.find(p => p.id === vehicle.package);
      
      if (selectedPkg?.pricingType === "perFoot" && !vehicle.vehicleLength) {
        toast.error(`Vehicle length is required for ${vehicle.vehicleMake || 'this vehicle'} (per-foot pricing)`);
        return;
      }
    }

    // ✅ Generate Booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    const bookingData = {
      bookingId,
      webName: formData.webName || "Admin Dashboard", // ✅ Use webName from form or default
      formData: {
        ...formData,
        vehicleBookings,
      },
      totalPrice: pricing.totalPrice,
      discountedPrice: pricing.discountedPrice,
      discountApplied: pricing.discountApplied,
      discountPercent: pricing.discountPercent,
      promoCode: selectedPromoCode?.promoCode || null, // ✅ Promo Code Name
      promoCodeId: selectedPromoCode?._id || null, // ✅ Promo Code ID
      submittedAt: new Date().toISOString(),
      vehicleCount: vehicleBookings.length,
      status: "pending",
    };

    // ✅ Show submitting loader until parent saves the booking
    try {
      setSubmitting(true);
      // Await parent handler which should return the response
      const res = await onSubmit(bookingData);

      // If parent returns a response object, check success
      if (res && res.success) {
        resetForm();
        // Parent typically closes the dialog; if not, close here
        if (onClose) onClose();
      } else if (res && !res.success) {
        toast.error(res.message || "Failed to create booking");
      } else {
        // If parent didn't return anything assume success (backwards compatible)
        resetForm();
        if (onClose) onClose();
      }
    } catch (err) {
      console.error("Create booking error:", err);
      toast.error(err?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

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
      webName: "", // ✅ Reset webName
    });
    setVehicleBookings([
      {
        id: `vehicle-${Date.now()}`,
        serviceType: "",
        vehicleType: "",
        variant: "",
        mainService: "", // ✅ Reset mainService
        package: "",
        additionalServices: [],
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        vehicleColor: "",
        vehicleLength: "",
      },
    ]);
    setSelectedPromoCode(null);
    setPricing({
      totalPrice: 0,
      discountedPrice: 0,
      discountApplied: false,
      discountPercent: 0,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ✅ FIXED: Remove manual positioning and use proper DialogContent styling */}
      <DialogContent className="max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto mx-auto my-8">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6" />
            Create New Booking
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* Loading overlay while submitting */}
        {submitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/50 rounded-lg">
            <Loader2 className="w-14 h-14 animate-spin text-primary" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* 📋 CUSTOMER INFORMATION */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
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
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
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

              {/* WEB NAME FIELD */}
              <div className="space-y-2">
                <Label htmlFor="webName">
                  Website/Source Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="webName"
                  value={formData.webName}
                  onChange={(e) => handleInputChange("webName", e.target.value)}
                  placeholder="e.g., Admin Dashboard, Website, Mobile App"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Source from where this booking was created
                </p>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Appointment Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">
                    Time Slot <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.timeSlot}
                    onValueChange={(value) => handleInputChange("timeSlot", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00-11:00">09:00 AM - 11:00 AM</SelectItem>
                      <SelectItem value="11:00-13:00">11:00 AM - 01:00 PM</SelectItem>
                      <SelectItem value="13:00-15:00">01:00 PM - 03:00 PM</SelectItem>
                      <SelectItem value="15:00-17:00">03:00 PM - 05:00 PM</SelectItem>
                      <SelectItem value="17:00-19:00">05:00 PM - 07:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🚗 VEHICLE BOOKINGS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="w-5 h-5" />
                  Vehicle Bookings ({vehicleBookings.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVehicle}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleBookings.map((vehicle, index) => {
                const availableVehicleTypes = getAvailableVehicleTypes(vehicle.serviceType);
                const variants = getVariants(vehicle.serviceType);
                const packages = getPackages(vehicle);
                const additionalServices = getAdditionalServices(vehicle);

                return (
                  <div key={vehicle.id} className="border rounded-lg p-4 space-y-4 relative bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Vehicle #{index + 1}
                      </h4>
                      {vehicleBookings.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVehicle(vehicle.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* SERVICE SELECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background rounded-lg border">
                      <div className="space-y-2">
                        <Label>
                          Service Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={vehicle.serviceType}
                          onValueChange={(value) =>
                            updateVehicleField(vehicle.id, "serviceType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {vehicle.serviceType && availableVehicleTypes.length > 0 && (
                        <div className="space-y-2">
                          <Label>Vehicle Type</Label>
                          <Select
                            value={vehicle.vehicleType}
                            onValueChange={(value) =>
                              updateVehicleField(vehicle.id, "vehicleType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableVehicleTypes.map((vType) => {
                                const vehicleTypeObj = allVehicleTypes.find((v) => v.id === vType);
                                return (
                                  <SelectItem key={vType} value={vType}>
                                    {vehicleTypeObj?.name || vType}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {vehicle.serviceType && variants.length > 0 && (
                        <div className="space-y-2">
                          <Label>Variant</Label>
                          <Select
                            value={vehicle.variant}
                            onValueChange={(value) =>
                              updateVehicleField(vehicle.id, "variant", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                            <SelectContent>
                              {variants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* PACKAGE SELECTION */}
                    {packages.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Package <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={vehicle.package}
                          onValueChange={(value) =>
                            updateVehicleField(vehicle.id, "package", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select package" />
                          </SelectTrigger>
                          <SelectContent>
                            {packages.map((pkg) => (
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
                        {vehicle.package && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {packages.find((p) => p.id === vehicle.package)?.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* ADDITIONAL SERVICES */}
                    {additionalServices.length > 0 && (
                      <div className="space-y-3 p-4 bg-background rounded-lg border">
                        <Label className="text-sm font-semibold">Additional Services (Optional)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {additionalServices.map((service) => (
                            <div
                              key={service.id}
                              className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 border"
                            >
                              <Checkbox
                                id={`${vehicle.id}-${service.id}`}
                                checked={vehicle.additionalServices?.includes(service.id)}
                                onCheckedChange={() =>
                                  toggleAdditionalService(vehicle.id, service.id)
                                }
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`${vehicle.id}-${service.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {service.name}
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    +${service.price}
                                  </span>
                                </label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* VEHICLE DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Vehicle Make <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={vehicle.vehicleMake}
                          onChange={(e) =>
                            updateVehicleField(vehicle.id, "vehicleMake", e.target.value)
                          }
                          placeholder="Toyota, Honda, etc."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Vehicle Model <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={vehicle.vehicleModel}
                          onChange={(e) =>
                            updateVehicleField(vehicle.id, "vehicleModel", e.target.value)
                          }
                          placeholder="Camry, Civic, etc."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Vehicle Year <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={vehicle.vehicleYear}
                          onChange={(e) =>
                            updateVehicleField(vehicle.id, "vehicleYear", e.target.value)
                          }
                          placeholder="2023"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Vehicle Color <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={vehicle.vehicleColor}
                          onChange={(e) =>
                            updateVehicleField(vehicle.id, "vehicleColor", e.target.value)
                          }
                          placeholder="Black, White, etc."
                          required
                        />
                      </div>
                      {/* Show length field for boats, RVs, jet-skis */}
                      {(vehicle.serviceType === "boat" ||
                        vehicle.serviceType === "rv" ||
                        vehicle.serviceType === "jet-ski") && (
                        <div className="space-y-2">
                          <Label>
                            Vehicle Length (feet)
                            {(() => {
                              const packages = getPackages(vehicle);
                              const selectedPkg = packages.find(p => p.id === vehicle.package);
                              return selectedPkg?.pricingType === "perFoot" && (
                                <span className="text-red-500"> *</span>
                              );
                            })()}
                          </Label>
                          <Input
                            type="number"
                            value={vehicle.vehicleLength}
                            onChange={(e) =>
                              updateVehicleField(vehicle.id, "vehicleLength", e.target.value)
                            }
                            placeholder="Enter length in feet"
                            required={(() => {
                              const packages = getPackages(vehicle);
                              const selectedPkg = packages.find(p => p.id === vehicle.package);
                              return selectedPkg?.pricingType === "perFoot";
                            })()}
                          />
                          {vehicle.package && (() => {
                            const packages = getPackages(vehicle);
                            const selectedPkg = packages.find(p => p.id === vehicle.package);
                            if (selectedPkg?.pricingType === "perFoot") {
                              return (
                                <p className="text-xs text-muted-foreground">
                                  Required for per-foot pricing calculation
                                </p>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 💰 PRICING & PROMO CODE */}
          <Card>
            <CardHeader>
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
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Tag className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">
                        {selectedPromoCode.promoCode} Applied!
                      </p>
                      <p className="text-sm">
                        {pricing.discountPercent}% discount applied
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PRICE BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Subtotal</Label>
                  <div className="text-2xl font-bold">
                    ${pricing.totalPrice.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from packages & services
                  </p>
                </div>
                
                {pricing.discountApplied && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Discount ({pricing.discountPercent}%)</Label>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      -${(pricing.totalPrice - pricing.discountedPrice).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Promo code savings
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Final Price</Label>
                  <div className="text-3xl font-bold text-primary">
                    ${pricing.discountedPrice.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pricing.discountApplied ? 'After discount' : 'Total amount'}
                  </p>
                </div>
              </div>

              {/* VEHICLE BREAKDOWN */}
              {vehicleBookings.length > 0 && vehicleBookings.some(v => v.package) && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                  <Label className="text-sm font-semibold mb-3 block">Price Breakdown by Vehicle</Label>
                  <div className="space-y-2">
                    {vehicleBookings.map((vehicle, index) => {
                      const vehiclePrice = calculateVehiclePrice(vehicle);
                      if (vehiclePrice === 0) return null;

                      const packages = getPackages(vehicle);
                      const selectedPackage = packages.find((p) => p.id === vehicle.package);

                      return (
                        <div key={vehicle.id} className="flex items-center justify-between text-sm py-2 border-b last:border-b-0">
                          <div className="flex-1">
                            <p className="font-medium">
                              Vehicle #{index + 1}: {vehicle.vehicleMake || 'Unknown'} {vehicle.vehicleModel || ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedPackage?.name}
                              {vehicle.additionalServices?.length > 0 && 
                                ` + ${vehicle.additionalServices.length} add-on(s)`
                              }
                            </p>
                          </div>
                          <div className="font-semibold">
                            ${vehiclePrice.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 📝 ADDITIONAL NOTES */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                placeholder="Add any special instructions or notes..."
              />
            </CardContent>
          </Card>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="min-w-[150px]" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Create Booking"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingDialog;




