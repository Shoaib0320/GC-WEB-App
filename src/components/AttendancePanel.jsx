// /components/AttendancePanel.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";

export default function AttendancePanel() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    fetch("/api/shifts")
      .then(r => r.json())
      .then(j => { if (j.success) setShifts(j.data); })
      .catch(() => {});
    fetchTodayAttendance();
  }, []);

  async function fetchTodayAttendance() {
    try {
      const res = await fetch("/api/attendance/my?limit=50");
      const json = await res.json();
      if (json.success) {
        const recs = json.data;
        const today = new Date();
        const start = new Date(today); start.setHours(0,0,0,0);
        const end = new Date(start); end.setDate(start.getDate()+1);

        const todayRec = recs.find(r => {
          const ci = r.checkInTime ? new Date(r.checkInTime) : null;
          return ci && ci >= start && ci < end;
        });
        setTodayAttendance(todayRec || null);
        if (todayRec) setSelectedShift(todayRec.shift?._id || "");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function askLocation() {
    if (!("geolocation" in navigator)) return setMessage("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMessage("Location permission denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function buildDateForToday(timeStr) {
    if (!timeStr) return null;
    const [hh, mm] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d;
  }

  function canCheckin(shift) {
    if (!shift) return false;
    const shiftStart = buildDateForToday(shift.startTime);
    const shiftEnd = (() => {
      const e = buildDateForToday(shift.endTime);
      if (e <= shiftStart) e.setDate(e.getDate()+1);
      return e;
    })();
    const earliest = new Date(shiftStart.getTime() - 15*60000);
    const nowDate = new Date();
    return nowDate >= earliest && nowDate <= shiftEnd;
  }

  async function handleCheckin() {
    if (!selectedShift) return setMessage("Select shift first");
    setLoading(true); setMessage("");
    if (!location) {
      try {
        await new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            pos => { setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}); resolve(); },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      } catch(e){}
    }

    try {
      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId: selectedShift, location }),
      });
      const json = await res.json();
      setMessage(json.message || "");
      if (json.success) setTodayAttendance(json.data);
    } catch (err) {
      console.error(err);
      setMessage("Server error on check-in");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!todayAttendance) return setMessage("You must check-in first");
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId: todayAttendance._id, location }),
      });
      const json = await res.json();
      setMessage(json.message || "");
      if (json.success) setTodayAttendance(json.data);
    } catch (err) {
      console.error(err);
      setMessage("Server error on check-out");
    } finally {
      setLoading(false);
    }
  }

  const selectedShiftObj = shifts.find(s => s._id === selectedShift);
  const checkinAllowed = canCheckin(selectedShiftObj);
  const checkoutAllowed = todayAttendance && !todayAttendance.checkOutTime;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-gray-900 rounded shadow space-y-4">
      <h3 className="text-xl font-semibold">Attendance</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Select Shift</label>
          <select className="w-full p-2 border rounded" value={selectedShift} onChange={e => setSelectedShift(e.target.value)}>
            <option value="">-- Choose shift --</option>
            {shifts.map(s => <option key={s._id} value={s._id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Current time</label>
          <div className="p-2 border rounded">{now.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleCheckin} disabled={!checkinAllowed || loading} className={`px-4 py-2 rounded ${checkinAllowed ? "bg-green-600 text-white" : "bg-gray-300"}`}>
          Check In
        </button>
        <button onClick={handleCheckout} disabled={!checkoutAllowed || loading} className={`px-4 py-2 rounded ${checkoutAllowed ? "bg-red-500 text-white" : "bg-gray-300"}`}>
          Check Out
        </button>
        <button onClick={askLocation} className="px-3 py-2 border rounded">Set Location</button>
        <a href="/api/attendance/export" target="_blank" rel="noreferrer" className="px-3 py-2 bg-blue-600 text-white rounded">Export CSV</a>
      </div>

      {todayAttendance ? (
        <div className="p-3 border rounded">
          <p><strong>Checked-in:</strong> {todayAttendance.checkInTime ? new Date(todayAttendance.checkInTime).toLocaleString() : "—"}</p>
          <p><strong>Checked-out:</strong> {todayAttendance.checkOutTime ? new Date(todayAttendance.checkOutTime).toLocaleString() : "—"}</p>
          <p><strong>Late:</strong> {todayAttendance.isLate ? `${todayAttendance.lateMinutes} min` : "No"}</p>
          <p><strong>Overtime:</strong> {todayAttendance.isOvertime ? `${todayAttendance.overtimeMinutes} min` : "No"}</p>
        </div>
      ) : <p className="text-sm text-gray-500">No check-in today</p>}

      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
