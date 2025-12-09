import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Timer,
  Loader2
} from "lucide-react";

// Function to get address from latitude and longitude
const getAddressFromCoordinates = async (lat, lng) => {
  if (!lat || !lng) return null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'GlobiumClouds-Attendance-App'
        }
      }
    );
    if (!response.ok) throw new Error('Failed to fetch address');
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
};

const ViewAttendanceModal = ({ isOpen, onClose, attendance, getStatusBadge }) => {
  const [checkInAddress, setCheckInAddress] = useState(null);
  const [checkOutAddress, setCheckOutAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Fetch addresses when modal opens or attendance changes
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isOpen || !attendance) {
        setCheckInAddress(null);
        setCheckOutAddress(null);
        return;
      }

      setLoadingAddresses(true);

      const checkInLat = attendance?.checkInLocation?.lat;
      const checkInLng = attendance?.checkInLocation?.lng;
      const checkOutLat = attendance?.checkOutLocation?.lat;
      const checkOutLng = attendance?.checkOutLocation?.lng;

      const [inAddr, outAddr] = await Promise.all([
        checkInLat && checkInLng ? getAddressFromCoordinates(checkInLat, checkInLng) : null,
        checkOutLat && checkOutLng ? getAddressFromCoordinates(checkOutLat, checkOutLng) : null
      ]);

      setCheckInAddress(inAddr);
      setCheckOutAddress(outAddr);
      setLoadingAddresses(false);
    };

    fetchAddresses();
  }, [isOpen, attendance]);

  const agentName = attendance?.user
    ? `${attendance.user?.firstName || ""} ${attendance.user?.lastName || ""}`
    : attendance?.agent?.agentName || "—";

  const checkInTime = attendance?.checkInTime
    ? new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "—";

  const checkOutTime = attendance?.checkOutTime
    ? new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "—";

  const attendanceDate = attendance?.createdAt
    ? new Date(attendance.createdAt).toLocaleDateString()
    : "—";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>
            Detailed view of {agentName}'s attendance record
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
        {/* Agent Info Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Agent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">{agentName}</p>
                <p className="text-sm text-gray-500">
                  {attendance?.user ? "User" : "Agent"} • {attendance?.user ? attendance.user.email : attendance?.agent?.email || ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Shift</p>
                <p className="font-medium">{attendance?.shift?.name || "No shift assigned"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Details Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              Attendance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{attendanceDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusBadge(attendance?.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Check In</p>
                  <p className="font-medium text-green-800">{checkInTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Check Out</p>
                  <p className="font-medium text-red-800">{checkOutTime}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        {(attendance?.checkInLocation?.lat || attendance?.checkOutLocation?.lat) && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Check In Location */}
              {attendance?.checkInLocation?.lat && attendance?.checkInLocation?.lng && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Check In Location</p>
                      {loadingAddresses ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          <span className="text-sm text-gray-500">Loading address...</span>
                        </div>
                      ) : (
                        <p className="text-sm text-green-800 mt-1">
                          {checkInAddress || `Lat: ${attendance.checkInLocation.lat}, Lng: ${attendance.checkInLocation.lng}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Check Out Location */}
              {attendance?.checkOutLocation?.lat && attendance?.checkOutLocation?.lng && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Check Out Location</p>
                      {loadingAddresses ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          <span className="text-sm text-gray-500">Loading address...</span>
                        </div>
                      ) : (
                        <p className="text-sm text-red-800 mt-1">
                          {checkOutAddress || `Lat: ${attendance.checkOutLocation.lat}, Lng: ${attendance.checkOutLocation.lng}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes Card */}
        {attendance?.notes && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{attendance.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAttendanceModal;
