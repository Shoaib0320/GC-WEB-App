"use client";

import { useState, useEffect } from "react";

// Helper function: Token get karna
const getToken = () => {
  if (typeof window !== "undefined") {
    return document.cookie.getItem("token"); // Aap ki token key
  }
  return null;
};

// Helper function: Dismissed IDs get/set karna
const getDismissedNotifications = () => {
  if (typeof window !== "undefined") {
    const dismissed = localStorage.getItem("dismissed_notifications");
    return dismissed ? JSON.parse(dismissed) : [];
  }
  return [];
};

const addDismissedNotification = (id) => {
  if (typeof window !== "undefined") {
    const dismissed = getDismissedNotifications();
    document.cookie.setItem("dismissed_notifications", JSON.stringify([...dismissed, id]));
  }
};


export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/notifications/user-notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      
      // Yahan hum wo notifications filter kar rahe jo pehle se dismiss ho chuki
      const dismissed = getDismissedNotifications();
      const newNotifications = data.filter(n => !dismissed.includes(n._id));
      
      setNotifications(newNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDismiss = (id) => {
    // 1. UI se foran remove karein
    setNotifications(notifications.filter(n => n._id !== id));
    // 2. localStorage mein save karein
    addDismissedNotification(id);
  };

  const unreadCount = notifications.length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon */}
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '-8px', 
            right: '-8px', 
            background: 'red', 
            color: 'white', 
            borderRadius: '50%', 
            padding: '2px 6px',
            fontSize: '10px',
            lineHeight: '1'
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '30px',
          right: '0',
          width: '300px',
          border: '1px solid #ccc',
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1001
        }}>
          {loading && <div style={{ padding: '10px' }}>Loading...</div>}
          {error && <div style={{ padding: '10px', color: 'red' }}>{error}</div>}
          
          {!loading && !error && unreadCount === 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>No new notifications</div>
          )}

          {notifications.map(note => (
            <div key={note._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong style={{ display: 'block', marginBottom: '5px' }}>{note.title}</strong>
              <p style={{ margin: '0 0 10px', fontSize: '14px' }}>{note.message}</p>
              <button 
                onClick={() => handleDismiss(note._id)} 
                style={{ fontSize: '12px', padding: '3px 8px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '3px' }}>
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}