"use client";

import { useState, useEffect } from "react";

// Helper function: Token get karna
const getToken = () => {
  if (typeof window !== "undefined") {
    return document.cookie.getItem("token"); // Aap ki token key
  }
  return null;
};

export default function NotificationsAdminPage() {
  // Modal (Dialog) ko control karne ke liye
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Table ka data
  const [allNotifications, setAllNotifications] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  // Form (jo modal ke andar hai) ka data
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [targetUsers, setTargetUsers] = useState(""); // Comma-separated IDs

  // Form states
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Page load hotay hi table ke liye data fetch karna
  const fetchAllNotifications = async () => {
    setLoadingTable(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Admin token not found. Please log in again.");
      setLoadingTable(false);
      return;
    }
    
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch notifications");
      setAllNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  // Ye page load honay par ek baar chalega
  useEffect(() => {
    fetchAllNotifications();
  }, []);

  // 2. Form submit logic (jab modal se send kareinge)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setError(null);
    setSuccess(null);

    let usersArray = [];
    if (targetType === "specific") {
      usersArray = targetUsers.split(',').map(id => id.trim()).filter(id => id);
      if (usersArray.length === 0) {
        setError("Specific users ke liye kam se kam ek ID zaroori hai.");
        setLoadingForm(false);
        return;
      }
    }

    const token = getToken();
    if (!token) {
      setError("Token not found.");
      setLoadingForm(false);
      return;
    }

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          message,
          type: 'announcement',
          targetType,
          targetUsers: usersArray,
          targetModel: 'User'
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending");

      setSuccess("Notification Sent!");
      // Form reset karein
      setTitle("");
      setMessage("");
      setTargetUsers("");
      // 2 second baad modal band karein
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(null);
      }, 2000);
      // Table ko refresh karein
      fetchAllNotifications();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Notifications Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Create Notification
        </button>
      </div>

      {/* --- Notification Table --- */}
      <h3>Sent Notifications History</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loadingTable ? (
        <p>Loading notifications...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Message</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Target</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {allNotifications.map(note => (
              <tr key={note._id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{note.title}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{note.message}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{note.targetType}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {new Date(note.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- Create Notification Modal (Dialog) --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Create New Notification</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required style={{ width: '100%', padding: '8px', minHeight: '100px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Target</label>
                <select value={targetType} onChange={(e) => setTargetType(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                  <option value="all">All Users</option>
                  <option value="specific">Specific Users</option>
                </select>
              </div>
              {targetType === 'specific' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>User IDs (comma separated)</label>
                  <input type="text" value={targetUsers} onChange={(e) => setTargetUsers(e.target.value)} placeholder="id1, id2, id3" style={{ width: '100%', padding: '8px' }} />
                </div>
              )}
              
              <button type="submit" disabled={loadingForm} style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {loadingForm ? "Sending..." : "Send Notification"}
              </button>
              {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}