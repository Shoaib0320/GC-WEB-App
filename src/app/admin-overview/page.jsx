// async function fetchData() {
//       try {
//         const [bookingsRes, messagesRes] = await Promise.all([
//           fetch("/api/booking"),
//           fetch("/api/contact"),
//         ]);

//         const bookingsData = await bookingsRes.json();
//         const messagesData = await messagesRes.json();

//         setBookings(bookingsData?.data || []);
//         setMessages(messagesData?.data || []);
//       } catch (err) {
//         console.error("Dashboard Fetch Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   useEffect(() => {
//     async function fetchData() {
//       showLoader("admin-overview", "Loading admin overview...");
//       try {
//         const [bookingsRes, messagesRes] = await Promise.all([
//           fetch("/api/booking"),
//           fetch("/api/contact"),
//         ]);

//         const bookingsData = await bookingsRes.json();
//         const messagesData = await messagesRes.json();

//         setBookings(bookingsData?.data || []);
//         setMessages(messagesData?.data || []);
//       } catch (err) {
//         console.error("Dashboard Fetch Error:", err);
//       } finally {
//         hideLoader("admin-overview");
//       }
//     }

//     fetchData();
//   }, [showLoader, hideLoader]);



import { useEffect, useState } from 'react';
import { useLoaderContext } from '../context/LoaderContext';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { showLoader, hideLoader } = useLoaderContext();

  useEffect(() => {
    async function fetchData() {
      if (!isDataLoaded) {
        showLoader("admin-overview", "Loading admin overview...");
      }
      
      try {
        const [bookingsRes, messagesRes] = await Promise.all([
          fetch("/api/booking"),
          fetch("/api/contact"),
        ]);

        const bookingsData = await bookingsRes.json();
        const messagesData = await messagesRes.json();

        setBookings(bookingsData?.data || []);
        setMessages(messagesData?.data || []);
        setIsDataLoaded(true);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        hideLoader("admin-overview");
      }
    }

    fetchData();
  }, [showLoader, hideLoader, isDataLoaded]);

  // Rest of your component
  return (
    <div>
      <h1>Bookings: {bookings.length}</h1>
      <h1>Messages: {messages.length}</h1>
    </div>
  );
};

export default AdminDashboard;