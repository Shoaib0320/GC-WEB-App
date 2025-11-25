"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell, BellRing,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Loader,
  CheckCheck,
  Filter,
  Search,
  X
} from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { agentNotificationService } from "@/services/agentNotificationService";

export default function AgentNotificationPage() {
  const { isLoggedIn, agent, isLoading: contextLoading } = useAgent();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isLoggedIn && agent) {
      loadNotifications();
    }
  }, [isLoggedIn, agent]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Always show mock data for all agents
      const notificationsData = [
        {
          _id: 'mock-1',
          status: 'pending',
          title: 'New Car Detailing Booking Pending',
          message: 'BMW X5 interior and exterior detailing scheduled for tomorrow at 10 AM.',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          data: { vehicle: 'BMW X5', service: 'Full Detail', price: 250 }
        },
        {
          _id: 'mock-2',
          status: 'complete',
          title: 'Service Reminder Completed',
          message: 'Toyota Camry ceramic coating maintenance check completed.',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          data: { vehicle: 'Toyota Camry', service: 'Ceramic Coating Maintenance' }
        },
        {
          _id: 'mock-3',
          status: 'complete',
          title: 'Payment Received',
          message: 'Payment of $180 received for Honda Civic interior detailing.',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          data: { vehicle: 'Honda Civic', amount: 180, service: 'Interior Detail' }
        },
        {
          _id: 'mock-4',
          status: 'cancel',
          title: 'Booking Cancelled',
          message: 'Mercedes-Benz C-Class booking at 2 PM has been cancelled.',
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          data: { vehicle: 'Mercedes-Benz C-Class', time: '2 PM' }
        },
        {
          _id: 'mock-5',
          status: 'complete',
          title: 'Lead Converted',
          message: 'Lead for Audi A4 exterior wash has been confirmed and scheduled.',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          data: { vehicle: 'Audi A4', service: 'Exterior Wash', price: 75 }
        },
        {
          _id: 'mock-6',
          status: 'pending',
          title: 'New Booking Request',
          message: 'Nissan Altima owner requested full detailing package for this weekend.',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          data: { vehicle: 'Nissan Altima', service: 'Full Package', price: 350 }
        },
        {
          _id: 'mock-7',
          status: 'complete',
          title: 'Monthly Performance Update',
          message: 'Great job! You\'ve completed 28 bookings this month with 92% customer satisfaction.',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          data: { bookings: 28, satisfaction: '92%', month: 'November' }
        },
        {
          _id: 'mock-8',
          status: 'complete',
          title: 'Commission Paid',
          message: 'Your commission of $425 for October has been deposited to your account.',
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          data: { amount: 425, month: 'October', type: 'Commission' }
        },
        {
          _id: 'mock-9',
          status: 'pending',
          title: 'Equipment Maintenance Required',
          message: 'Steam cleaner needs servicing. Please schedule maintenance within 7 days.',
          isRead: false,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          data: { equipment: 'Steam Cleaner', urgency: 'Medium', days: 7 }
        },
        {
          _id: 'mock-10',
          status: 'complete',
          title: 'Repeat Customer Booking',
          message: 'Sarah Johnson (Honda Civic) booked quarterly maintenance service.',
          isRead: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          data: { customer: 'Sarah Johnson', vehicle: 'Honda Civic', service: 'Quarterly Maintenance', price: 120 }
        },
        {
          _id: 'mock-11',
          status: 'pending',
          title: 'New Service Training Available',
          message: 'Advanced ceramic coating training session available next Tuesday.',
          isRead: false,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          data: { training: 'Advanced Ceramic Coating', date: 'Next Tuesday', duration: '4 hours' }
        },
        {
          _id: 'mock-12',
          status: 'cancel',
          title: 'Weather Alert - Service Cancelled',
          message: 'Heavy rain expected tomorrow. Outdoor services have been cancelled.',
          isRead: false,
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          data: { weather: 'Heavy Rain', impact: 'Outdoor Services', suggestion: 'Reschedule' }
        }
      ];

      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(notificationId);
      // Simulate API delay for mock data
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAsRead('all');
      // Simulate API delay for mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const getNotificationIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'cancel':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = (status) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Pending</Badge>;
      case 'cancel':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Info</Badge>;
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-700 font-medium text-base">Loading notifications...</p>
          <p className="text-slate-500 text-xs mt-2">Preparing your updates</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <p className="text-slate-700 font-medium">Please login to view notifications.</p>

        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filter notifications based on current filter and search
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead);

    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2  space-y-3 sm:space-y-9 xl:p-10 text-left">
      {/* Header */}
      <motion.div
        // initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-lg border border-white/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-xl mr-3 sm:mr-4">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-slate-600 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">
                Stay updated with your latest activities and alerts
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            {unreadCount > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={markAllAsRead}
                  disabled={markingAsRead === 'all'}
                  variant="outline"
                  size="sm"
                  className="bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-xl font-semibold shadow-sm w-full sm:w-auto"
                >
                  {markingAsRead === 'all' ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark All Read ({unreadCount})
                    </>
                  )}
                </Button>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="bg-white/50 border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-xl font-semibold shadow-sm w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                All ({notifications.length})
              </Button>
              <Button
                onClick={() => setFilter('unread')}
                variant={filter === 'unread' ? 'default' : 'outline'}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'unread'
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                    : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                onClick={() => setFilter('read')}
                variant={filter === 'read' ? 'default' : 'outline'}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'read'
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                    : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={3}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between flex-1">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Notifications
                  </p>
                  <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                    {notifications.length}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg flex items-center justify-center flex-shrink-0">
                  <BellRing className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between flex-1">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Unread
                  </p>
                  <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                    {unreadCount}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between flex-1">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Read
                  </p>
                  <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                    {notifications.length - unreadCount}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={4}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
      >
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 sm:pb-6">
          <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-slate-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
              </h3>
              <p className="text-slate-600">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'You\'ll see your notifications here when you have any updates.'
                }
              </p>
              {(searchTerm || filter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  variant="outline"
                  className="mt-4 bg-white/50 border-slate-300 hover:bg-slate-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 ${
                    notification.isRead
                      ? 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-100/50'
                      : 'bg-blue-50/50 border-blue-200/50 hover:bg-blue-100/50'
                  } shadow-sm hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                          <div className="flex items-center space-x-2">
                            {getNotificationBadge(notification.status)}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <span className="text-sm text-slate-500 font-medium">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <h4 className={`text-sm sm:text-base font-semibold mb-2 ${
                          notification.isRead ? 'text-slate-900' : 'text-slate-900'
                        }`}>
                          {notification.title}
                        </h4>

                        <p className={`text-sm leading-relaxed ${
                          notification.isRead ? 'text-slate-600' : 'text-slate-700'
                        }`}>
                          {notification.message}
                        </p>

                        {notification.data && (
                          <div className="mt-3 p-3 bg-white/50 rounded-lg border text-xs">
                            <pre className="whitespace-pre-wrap text-slate-600">
                              {JSON.stringify(notification.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => markAsRead(notification._id)}
                          disabled={markingAsRead === notification._id}
                          size="sm"
                          variant="outline"
                          className="ml-3 flex-shrink-0 bg-white/50 border-slate-300 hover:bg-slate-50 rounded-xl"
                        >
                          {markingAsRead === notification._id ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </motion.div>
    </div>
  );
}
