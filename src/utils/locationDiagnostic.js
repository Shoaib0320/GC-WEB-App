/**
 * Location Diagnostic Utility
 * Tests location fetching in isolation to identify issues
 */

export const runLocationDiagnostic = async () => {
  console.log('🔍 Starting Location Diagnostic...');

  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {}
  };

  // Test 1: Check Geolocation Support
  console.log('📋 Test 1: Geolocation Support');
  results.tests.geolocationSupport = {
    supported: !!navigator.geolocation,
    message: navigator.geolocation ? '✅ Geolocation supported' : '❌ Geolocation not supported'
  };
  console.log(results.tests.geolocationSupport.message);

  if (!navigator.geolocation) {
    results.summary.overall = 'FAILED';
    results.summary.reason = 'Geolocation not supported by browser';
    return results;
  }

  // Test 2: Check Permissions
  console.log('📋 Test 2: Permission Check');
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    results.tests.permissions = {
      state: permission.state,
      message: `Permission state: ${permission.state}`
    };
    console.log(results.tests.permissions.message);

    if (permission.state === 'denied') {
      results.summary.overall = 'FAILED';
      results.summary.reason = 'Location permission denied';
      return results;
    }
  } catch (error) {
    results.tests.permissions = {
      error: error.message,
      message: '❌ Permission check failed'
    };
    console.log(results.tests.permissions.message);
  }

  // Test 3: Single Location Fetch
  console.log('📋 Test 3: Single Location Fetch');
  try {
    const location = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        }
      );
    });

    results.tests.singleFetch = {
      success: true,
      location,
      message: `✅ Location fetched: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} (${location.accuracy.toFixed(0)}m accuracy)`
    };
    console.log(results.tests.singleFetch.message);
  } catch (error) {
    results.tests.singleFetch = {
      success: false,
      error: error.message,
      message: `❌ Single fetch failed: ${error.message}`
    };
    console.log(results.tests.singleFetch.message);
    results.summary.overall = 'FAILED';
    results.summary.reason = `Location fetch failed: ${error.message}`;
    return results;
  }

  // Test 4: Address Lookup
  console.log('📋 Test 4: Address Lookup');
  try {
    const location = results.tests.singleFetch.location;
    const address = await Promise.race([
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`, {
        headers: { 'User-Agent': 'AgentApp/1.0' }
      }).then(res => res.json()).then(data => data.display_name || 'Address not found'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Address lookup timeout')), 5000))
    ]);

    results.tests.addressLookup = {
      success: true,
      address,
      message: `✅ Address found: ${address}`
    };
    console.log(results.tests.addressLookup.message);
  } catch (error) {
    results.tests.addressLookup = {
      success: false,
      error: error.message,
      message: `⚠️ Address lookup failed: ${error.message}`
    };
    console.log(results.tests.addressLookup.message);
  }

  // Test 5: Watch Position Test
  console.log('📋 Test 5: Watch Position Test');
  try {
    const watchResults = await new Promise((resolve, reject) => {
      let updateCount = 0;
      const maxUpdates = 3;
      const timeout = setTimeout(() => {
        if (updateCount > 0) {
          resolve({ updates: updateCount, message: `✅ Watch received ${updateCount} updates` });
        } else {
          reject(new Error('No updates received within 15 seconds'));
        }
      }, 15000);

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateCount++;
          console.log(`📍 Watch update ${updateCount}: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)} (${position.coords.accuracy.toFixed(0)}m)`);

          if (updateCount >= maxUpdates) {
            navigator.geolocation.clearWatch(watchId);
            clearTimeout(timeout);
            resolve({ updates: updateCount, message: `✅ Watch working: ${updateCount} updates received` });
          }
        },
        (error) => {
          navigator.geolocation.clearWatch(watchId);
          clearTimeout(timeout);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });

    results.tests.watchPosition = {
      success: true,
      ...watchResults
    };
    console.log(results.tests.watchPosition.message);
  } catch (error) {
    results.tests.watchPosition = {
      success: false,
      error: error.message,
      message: `❌ Watch position failed: ${error.message}`
    };
    console.log(results.tests.watchPosition.message);
  }

  // Summary
  const allTests = Object.values(results.tests);
  const passedTests = allTests.filter(test => test.success !== false).length;
  const totalTests = allTests.length;

  results.summary = {
    overall: passedTests === totalTests ? 'PASSED' : 'PARTIAL',
    passed: passedTests,
    total: totalTests,
    message: `${passedTests}/${totalTests} tests passed`
  };

  console.log(`📊 Diagnostic Complete: ${results.summary.message}`);
  return results;
};

// Helper function to run diagnostic and log results
export const logLocationDiagnostic = async () => {
  try {
    const results = await runLocationDiagnostic();
    console.table(results.tests);
    console.log('📋 Summary:', results.summary);
    return results;
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    return { error: error.message };
  }
};

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  window.runLocationDiagnostic = runLocationDiagnostic;
  window.logLocationDiagnostic = logLocationDiagnostic;
}
