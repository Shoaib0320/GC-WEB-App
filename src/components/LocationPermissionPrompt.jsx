// src/components/LocationPermissionPrompt.jsx
"use client";
import { useEffect, useState } from 'react';
import { MapPin, X, Check, AlertCircle, Info, Navigation } from 'lucide-react';

const LocationPermissionPrompt = ({ 
  visible, 
  onClose, 
  onPermissionGranted, 
  onPermissionDenied 
}) => {
  const [checking, setChecking] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check browser support
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setBrowserSupport(false);
    }
  }, []);

  const requestLocationDirectly = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setChecking(true);
    setError('');

    console.log('📍 Requesting location permission...');

    // Direct location request - yeh trigger karega browser prompt
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Location access granted - Success!', position.coords);
        setChecking(false);
        onPermissionGranted?.(position.coords);
      },
      (error) => {
        console.error('📍 Location permission error:', error);
        setChecking(false);
        
        let errorMessage = 'Location access was denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access in the browser prompt, or enable it in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your device location settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Failed to get location. Please try again.';
            break;
        }
        
        setError(errorMessage);
        onPermissionDenied?.(errorMessage);
      },
      { 
        enableHighAccuracy: true, // High accuracy for better results
        timeout: 15000, // 15 seconds
        maximumAge: 0 // Don't use cached location - always fresh
      }
    );
  };

  const handleAllow = () => {
    requestLocationDirectly();
  };

  const handleDeny = () => {
    onPermissionDenied?.('Location access was denied by user');
  };

  const handleRetry = () => {
    setError('');
    requestLocationDirectly();
  };

  if (!visible) return null;

  if (!browserSupport) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Browser Not Supported
            </h3>
            <p className="text-gray-600 mb-4">
              Your browser does not support location services. Please use Chrome, Firefox, or Safari for best experience.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              OK, Understand
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in-90 zoom-in-90 duration-300">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Navigation className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Enable Location Access
          </h3>
          
          <p className="text-gray-600 mb-4 text-lg">
            We need your location for accurate attendance tracking
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <p className="text-blue-800 flex-1">
                <strong>Click "Allow Location" below</strong>
              </p>
            </div>
            <div className="flex items-start mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <p className="text-blue-800 flex-1">
                <strong>Allow location access</strong> in the browser popup
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <p className="text-blue-800 flex-1">
                <strong>Enable high accuracy</strong> for best results
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm text-left flex-1">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDeny}
              disabled={checking}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <X className="h-5 w-5" />
              Not Now
            </button>
            <button
              onClick={handleAllow}
              disabled={checking}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
            >
              {checking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Requesting...
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5" />
                  Allow Location
                </>
              )}
            </button>
          </div>

          {checking && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                <strong>Check your browser:</strong> Look for a location permission popup at the top of the page or in the address bar.
              </p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Your location is only used for attendance tracking and is never shared.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionPrompt;