"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Users, UserPlus, Search } from "lucide-react";
import GlobalData from "@/components/common/GlobalData";
import { userService } from "@/services/userService";

export default function UsersPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  const users = [
    {
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      name: "Sarah Smith",
      email: "sarah@example.com",
      role: "Editor",
      status: "Active",
    },
    {
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Viewer",
      status: "Pending",
    },
    {
      name: "Anna Brown",
      email: "anna@example.com",
      role: "Moderator",
      status: "Inactive",
    },
  ];

  // Columns for DataTable / GlobalData
  const columns = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Role", key: "role" },
    {
      label: "Status",
      key: "status",
      render: (u) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            u.status === "Active"
              ? "bg-green-100 text-green-700"
              : u.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {u.status}
        </span>
      ),
    },
  ];

  // Tab state: 'all' or 'active'
  const [activeTab, setActiveTab] = useState("all");

  // Fetchers for GlobalData. GlobalData supports serverSide mode; pass params if needed.
  const fetchAllUsers = async (params) => {
    // when GlobalData calls with serverSide true it will pass params; keep them
    return await userService.getAll(params || {});
  };

  const fetchActiveUsers = async (params) => {
    // If your API accepts a status param, adapt accordingly. Here we send { status: 'Active' }
    const merged = { ...(params || {}), status: "Active" };
    return await userService.getAll(merged);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <PageHeader
        title=" Users Management"
        description=" Manage all users, roles, and permissions from here."
        icon={Users}
      />

      {/* Search & Filters */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search users..." className="pl-9" />
        </div>
        <Button variant="outline">Filter</Button>
      </motion.div>

      <Separator />

      {/* User Cards Summary */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={2}
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered in system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,245</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Logged in this week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">1,003</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Pending Users</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">57</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Deactivated</CardTitle>
            <CardDescription>Suspended accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">22</p>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* User List - Tabs and GlobalData instances */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={3}
        variants={fadeUp}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === "active" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Active Users
            </button>
          </div>
        </div>

        <div>
          {activeTab === "all" ? (
            <GlobalData
              title="All Users"
              icon={Users}
              fetcher={fetchAllUsers}
              columns={columns}
              serverSide={true}
              rowsPerPage={10}
              searchEnabled={true}
            />
          ) : (
            <GlobalData
              title="Active Users"
              icon={Users}
              fetcher={fetchActiveUsers}
              columns={columns}
              serverSide={true}
              rowsPerPage={10}
              searchEnabled={true}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
