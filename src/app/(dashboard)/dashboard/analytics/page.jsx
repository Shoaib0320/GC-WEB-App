"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarDays,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import PageHeader from "@/components/common/PageHeader";

export default function AnalyticsPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  // 📈 Demo Data
  const bookingsData = [
    { month: "Jan", bookings: 200 },
    { month: "Feb", bookings: 240 },
    { month: "Mar", bookings: 350 },
    { month: "Apr", bookings: 290 },
    { month: "May", bookings: 420 },
    { month: "Jun", bookings: 380 },
    { month: "Jul", bookings: 460 },
    { month: "Aug", bookings: 410 },
    { month: "Sep", bookings: 390 },
    { month: "Oct", bookings: 470 },
  ];

  const userGrowthData = [
    { name: "New Users", value: 420 },
    { name: "Returning Users", value: 280 },
    { name: "Inactive", value: 100 },
  ];

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

  return (
    <div className="space-y-8">
      {/* Header */}

       <PageHeader
              title=" Analytics Dashboard"
              description=" Real-time overview of bookings, users, and performance trends."
              icon={BarChart3}
            />
            
      <Separator />

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Active this month</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">2,540</p>
            <Users className="h-6 w-6 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
            <CardDescription>In the past 30 days</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold">1,128</p>
            <CalendarDays className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Growth Rate</CardTitle>
            <CardDescription>Month-over-month</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold text-green-600">+18%</p>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Server Activity</CardTitle>
            <CardDescription>API requests / hr</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-bold text-yellow-600">8.4k</p>
            <Activity className="h-6 w-6 text-yellow-600" />
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* Charts Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={2}
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Line Chart: Bookings Trend */}
        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
            <CardDescription>Monthly booking overview</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: User Growth */}
        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>User Growth Breakdown</CardTitle>
            <CardDescription>Distribution of user activity</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userGrowthData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {userGrowthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar Chart Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={3}
        variants={fadeUp}
      >
        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Comparison of departments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Support", score: 85 },
                { name: "Sales", score: 90 },
                { name: "Marketing", score: 70 },
                { name: "Development", score: 95 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
