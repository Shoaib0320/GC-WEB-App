// src/app/(dashboard)/dashboard/sales/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { promoCodeService } from "@/services/promocodeService";
import GlobalData from "@/components/common/GlobalData";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import useCurrency from "@/lib/useCurrency";
import { cn } from "@/lib/utils";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesPage() {
	const { currency, setCurrency, format: formatCurrency } = useCurrency();
	const { hasPermission } = useAuth();

	// Permission flags
	const canViewSales = hasPermission('sales', 'view') || hasPermission('analytics', 'view') || hasPermission('sales_analytics', 'view') || hasPermission('promoCode', 'view');
	const canViewAnalytics = hasPermission('sales', 'analytics') || hasPermission('sales_analytics', 'view') || hasPermission('analytics', 'view') || hasPermission('reports', 'sales');
	const promoPerms = {
		view: hasPermission('promoCode', 'view'),
		create: hasPermission('promoCode', 'create'),
		edit: hasPermission('promoCode', 'edit'),
		delete: hasPermission('promoCode', 'delete')
	};

	const [overview, setOverview] = useState(null);
	const [periodData, setPeriodData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Date states
	const [date, setDate] = useState({
		from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
		to: new Date()
	});
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [previousPeriodData, setPreviousPeriodData] = useState(null);

	useEffect(() => {
		let mounted = true;
		async function load() {
			setLoading(true);
			try {
				// Load all-time data
				const resAll = await promoCodeService.getPromoCodesAnalytics({ timeFrame: "all" });

				// Load period-specific data based on current selection
				const resPeriod = await promoCodeService.getPromoCodesAnalytics({
					timeFrame: "custom",
					startDate: date.from.toISOString().split('T')[0],
					endDate: date.to.toISOString().split('T')[0]
				});

				// Also request same month previous year for comparison
				const prevStart = new Date(date.from);
				const prevEnd = new Date(date.to);
				prevStart.setFullYear(prevStart.getFullYear() - 1);
				prevEnd.setFullYear(prevEnd.getFullYear() - 1);

				let resPrev = null;
				try {
					resPrev = await promoCodeService.getPromoCodesAnalytics({
						timeFrame: "custom",
						startDate: prevStart.toISOString().split('T')[0],
						endDate: prevEnd.toISOString().split('T')[0]
					});
				} catch (e) {
					// If previous year data is not available, we silently continue
					resPrev = null;
				}

				if (!mounted) return;

				setOverview(resAll?.data?.data || resAll?.data || resAll || null);
				setPeriodData(resPeriod?.data?.data || resPeriod?.data || resPeriod || null);
				setPreviousPeriodData(resPrev?.data?.data || resPrev?.data || resPrev || null);
			} catch (err) {
				console.error("Error loading promo analytics", err);
				setError("Failed to load sales overview");
			} finally {
				if (mounted) setLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, [date, selectedMonth, selectedYear]);

	const columns = [
		{ label: "Code", key: "promoCode", render: (it) => it.promoCode },
		{ label: "Agent", key: "agent", render: (it) => it.agent?.agentName || it.agent?.email || "-" },
		{ label: "Agent ID", key: "agentId", render: (it) => it.agent?.agentId || "-" },
		{ label: "Bookings", key: "totalBookings", render: (it) => it.totalBookings },
		{ label: "Revenue", key: "totalRevenue", render: (it) => formatCurrency(it.totalRevenue) },
		{ label: "Used / Max", key: "usedCount", render: (it) => `${it.usedCount}/${it.maxUsage ?? '-'}` },
		{ label: "Utilization %", key: "utilizationRate", render: (it) => `${Math.round(it.utilizationRate ?? 0)}%` },
		{ label: "Active", key: "isActive", render: (it) => it.isActive ? 'Yes' : 'No' },
	];

	const promoFetcher = async () => {
		const r = await promoCodeService.getPromoCodesAnalytics({ timeFrame: "all" });
		const payload = r?.data?.data || r?.data || r;
		console.log('Promo Codes Payload', payload);

		return payload?.promoCodes || [];
	};

	// Generate months and years based on your business start date
	const getMonths = () => {
		const businessStartDate = new Date('2023-01-01');
		const currentDate = new Date();
		const months = [];

		for (let year = businessStartDate.getFullYear(); year <= currentDate.getFullYear(); year++) {
			const startMonth = year === businessStartDate.getFullYear() ? businessStartDate.getMonth() : 0;
			const endMonth = year === currentDate.getFullYear() ? currentDate.getMonth() : 11;

			for (let month = startMonth; month <= endMonth; month++) {
				months.push({
					value: `${year}-${month}`,
					label: `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`,
					year,
					month
				});
			}
		}

		return months.reverse();
	};

	const handleMonthChange = (value) => {
		const [year, month] = value.split('-').map(Number);
		setSelectedMonth(month);
		setSelectedYear(year);

		// Set date range to selected month
		const startDate = new Date(year, month, 1);
		const endDate = new Date(year, month + 1, 0);

		setDate({
			from: startDate,
			to: endDate > new Date() ? new Date() : endDate
		});
	};

	const quickDateRanges = [
		{
			label: "Today",
			value: "today",
			getRange: () => {
				const today = new Date();
				return { from: today, to: today };
			}
		},
		{
			label: "Last 7 Days",
			value: "7days",
			getRange: () => {
				const today = new Date();
				const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
				return { from: lastWeek, to: today };
			}
		},
		{
			label: "Last 30 Days",
			value: "30days",
			getRange: () => {
				const today = new Date();
				const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
				return { from: lastMonth, to: today };
			}
		},
		{
			label: "This Month",
			value: "month",
			getRange: () => {
				const today = new Date();
				const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
				return { from: firstDay, to: today };
			}
		},
		{
			label: "Last Month",
			value: "lastMonth",
			getRange: () => {
				const today = new Date();
				const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
				const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
				return { from: firstDayLastMonth, to: lastDayLastMonth };
			}
		},
	];

														const handleQuickRange = (value) => {
															const range = quickDateRanges.find(r => r.value === value)?.getRange();
															if (range) {
																setDate(range);

																// Update month/year based on the range
																if (value === "month" || value === "lastMonth") {
																	const targetDate = value === "lastMonth" ?
																		new Date(new Date().getFullYear(), new Date().getMonth() - 1) :
																		new Date();
																	setSelectedMonth(targetDate.getMonth());
																	setSelectedYear(targetDate.getFullYear());
																}
															}
														};

														const currentMonthLabel = new Date(selectedYear, selectedMonth).toLocaleString('default', {
															month: 'long',
															year: 'numeric'
														});

														// Calculate period stats
														const periodStats = periodData?.totalStats || {};
														const prevStats = previousPeriodData?.totalStats || {};
														const allTimeStats = overview?.totalStats || {};

														// Comparison metrics (current vs previous year same month)
														const revenueCurrent = periodStats.totalRevenue || 0;
														const revenuePrev = prevStats.totalRevenue || 0;
														const bookingsCurrent = periodStats.totalBookings || 0;
														const bookingsPrev = prevStats.totalBookings || 0;

														const revenueDiff = revenueCurrent - revenuePrev;
														const revenuePct = revenuePrev > 0 ? (revenueDiff / revenuePrev) * 100 : (revenueCurrent > 0 ? 100 : 0);

														// Filter promoCodes with actual bookings for top performers
														const promoCodesWithBookings = (periodData?.promoCodes || []).filter(p => p.totalBookings > 0);

														// Get top performers by revenue (only those with bookings)
														const topPerformersByRevenue = promoCodesWithBookings
															.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
															.slice(0, 5);

														if (!canViewSales) {
															return (
																<div className="p-6">
																	<div className="max-w-xl mx-auto bg-white border rounded-lg p-6 text-center">
																		<h2 className="text-lg font-semibold">Access Denied</h2>
																		<p className="text-sm text-muted-foreground mt-2">You don't have permission to view Sales data. Contact your administrator if you need access.</p>
																	</div>
																</div>
															);
														}

														return (
															<div className="space-y-6 p-2 md:p-4 bg-white">
																<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
																	<h1 className="text-2xl font-bold">Sales Overview</h1>

																	{/* Date Pickers */}
																	<div className="flex flex-col sm:flex-row gap-3">
																		{/* Quick Date Range Selector */}
																		<Select onValueChange={handleQuickRange}>
																			<SelectTrigger className="w-full sm:w-[180px]">
																				<SelectValue placeholder="Quick Range" />
																			</SelectTrigger>
																			<SelectContent>
																				{quickDateRanges.map((range) => (
																					<SelectItem key={range.value} value={range.value}>
																						{range.label}
																					</SelectItem>
																				))}
																			</SelectContent>
																		</Select>

																		{/* Month Selector */}
																		<Select value={`${selectedYear}-${selectedMonth}`} onValueChange={handleMonthChange}>
																			<SelectTrigger className="w-full sm:w-[200px]">
																				<SelectValue>
																					{currentMonthLabel}
																				</SelectValue>
																			</SelectTrigger>
																			<SelectContent>
																				{getMonths().map((month) => (
																					<SelectItem key={month.value} value={month.value}>
																						{month.label}
																					</SelectItem>
																				))}
																			</SelectContent>
																		</Select>

																		{/* Custom Date Range Picker */}
																		<Popover>
																			<PopoverTrigger asChild>
																				<Button
																					variant="outline"
																					className={cn(
																						"w-full sm:w-[300px] justify-start text-left font-normal",
																						!date && "text-muted-foreground"
																					)}
																				>
																					<CalendarIcon className="mr-2 h-4 w-4" />
																					{date?.from ? (
																						date.to ? (
																							<>
																								{format(date.from, "LLL dd, y")} -{" "}
																								{format(date.to, "LLL dd, y")}
																							</>
																						) : (
																							format(date.from, "LLL dd, y")
																						)
																					) : (
																						<span>Pick a date range</span>
																					)}
																				</Button>
																			</PopoverTrigger>
																			<PopoverContent className="w-auto p-0" align="end">
																				<Calendar
																					initialFocus
																					mode="range"
																					defaultMonth={date?.from}
																					selected={date}
																					onSelect={(newDate) => {
																						if (newDate?.from && newDate?.to) {
																							setDate(newDate);
																							// Update month/year based on selected date
																							setSelectedMonth(newDate.from.getMonth());
																							setSelectedYear(newDate.from.getFullYear());
																						}
																					}}
																					numberOfMonths={2}
																					disabled={(date) => date > new Date()}
																				/>
																			</PopoverContent>
																		</Popover>
																	</div>
																</div>

																{error && (
																	<div className="text-sm text-red-600">{error}</div>
																)}

																{/* Period-specific Cards Section */}
																<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
																	<Card className="p-4 border">
																		<CardHeader className="p-0 pb-4">
																			<CardTitle className="text-sm text-slate-500">
																				Period Revenue ({format(date.from, "MMM dd")} - {format(date.to, "MMM dd")})
																			</CardTitle>
																		</CardHeader>
																		<CardContent className="p-0">
																			<div className="text-2xl font-bold">
																				{loading ? "Loading..." : formatCurrency(periodStats.totalRevenue || 0)}
																			</div>
																			<div className="mt-1 text-xs text-slate-500">
																				Revenue from selected period
																			</div>
																		</CardContent>
																	</Card>

																	<Card className="p-4 border">
																		<CardHeader className="p-0 pb-4">
																			<CardTitle className="text-sm text-slate-500">
																				Period Bookings ({format(date.from, "MMM dd")} - {format(date.to, "MMM dd")})
																			</CardTitle>
																		</CardHeader>
																		<CardContent className="p-0">
																			<div className="text-2xl font-bold">
																				{loading ? "..." : (periodStats.totalBookings ?? 0)}
																			</div>
																			<div className="mt-1 text-xs text-slate-500">
																				Bookings in selected period
																			</div>
																		</CardContent>
																	</Card>

																	<Card className="p-4 border">
																		<CardHeader className="p-0 pb-4">
																			<CardTitle className="text-sm text-slate-500">Total Promo Codes</CardTitle>
																		</CardHeader>
																		<CardContent className="p-0">
																			<div className="text-2xl font-bold">
																				{loading ? "..." : (allTimeStats.totalPromoCodes ?? 0)}
																			</div>
																			<div className="mt-1 text-xs text-slate-500">
																				Created in the system
																			</div>
																		</CardContent>
																	</Card>

																	<Card className="p-4 border">
																		<CardHeader className="p-0 pb-4">
																			<CardTitle className="text-sm text-slate-500">Active Promo Codes</CardTitle>
																		</CardHeader>
																		<CardContent className="p-0">
																			<div className="text-2xl font-bold">
																				{loading ? "..." : (allTimeStats.activePromoCodes ?? 0)}
																			</div>
																			<div className="mt-1 text-xs text-slate-500">
																				Currently active
																			</div>
																		</CardContent>
																	</Card>
																</div>

																{/* Revenue Comparison Chart - Full Width (gated by analytics permission) */}
																{canViewAnalytics ? (
																	<Card className="border">
																		<CardHeader className="px-4 sm:px-6">
																			<CardTitle className="text-base sm:text-lg">Revenue Comparison - {currentMonthLabel}</CardTitle>
																		</CardHeader>
																		<CardContent className="px-4 sm:px-6">
																			{loading ? (
																				<div className="text-center py-8">Loading comparison data...</div>
																			) : (revenueCurrent === 0 && revenuePrev === 0) ? (
																				<div className="text-sm text-muted-foreground text-center py-8">
																					No revenue data for selected month or previous year.
																				</div>
																			) : (
																				<div className="space-y-4">
																					{/* Chart Container with proper responsive height */}
																					<div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
																						<Bar
																							options={{
																								responsive: true,
																								maintainAspectRatio: false,
																								plugins: {
																									legend: { display: false },
																									title: {
																										display: true,
																										text: `Revenue Comparison - ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}`,
																										font: { size: window.innerWidth < 640 ? 12 : 16, weight: 'bold' },
																										padding: { top: 10, bottom: 20 }
																									},
																									tooltip: {
																										callbacks: {
																											label: (context) => {
																												const val = context.parsed.y ?? context.parsed ?? 0;
																												return `Revenue: ${formatCurrency(val)}`;
																											}
																										},
																										bodyFont: { size: window.innerWidth < 640 ? 11 : 13 }
																									},
																								},
																								scales: {
																									y: {
																										beginAtZero: true,
																										ticks: {
																											callback: (value) => {
																												if (window.innerWidth < 640) {
																													return formatCurrency(value).replace(/\B(?=(\d{3})+(?!\d))/g, "");
																												}
																												return formatCurrency(value);
																											},
																											font: { size: window.innerWidth < 640 ? 10 : 12 }
																										}
																									},
																									x: { ticks: { font: { size: window.innerWidth < 640 ? 11 : 13 } } }
																								}
																							}}
																							data={{
																								labels: [`${selectedYear - 1}`, `${selectedYear}`],
																								datasets: [
																									{
																										label: 'Revenue',
																										data: [revenuePrev, revenueCurrent],
																										backgroundColor: ['#c7d2fe', '#60a5fa'],
																										borderRadius: window.innerWidth < 640 ? 4 : 6,
																										barThickness: window.innerWidth < 640 ? 40 : window.innerWidth < 1024 ? 50 : 60,
																									},
																								],
																							}}
																						/>
																					</div>

																					{/* Stats Below Chart */}
																					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t">
																						<div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
																							<div className="text-xs sm:text-sm text-muted-foreground mb-1">
																								{selectedYear - 1} Revenue
																							</div>
																							<div className="text-base sm:text-lg font-semibold break-words">
																								{formatCurrency(revenuePrev)}
																							</div>
																						</div>
																						<div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
																							<div className="text-xs sm:text-sm text-muted-foreground mb-1">
																								{selectedYear} Revenue
																							</div>
																							<div className="text-base sm:text-lg font-semibold break-words">
																								{formatCurrency(revenueCurrent)}
																							</div>
																						</div>
																						<div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
																							<div className="text-xs sm:text-sm text-muted-foreground mb-1">Change</div>
																							<div className={`text-base sm:text-lg font-semibold ${revenueDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
																								{revenueDiff >= 0 ? '+' : ''}{revenuePct ? revenuePct.toFixed(1) : '0.0'}%
																							</div>
																						</div>
																					</div>
																				</div>
																			)}
																		</CardContent>
																	</Card>
																) : (
																	<Card className="border">
																		<CardHeader>
																			<CardTitle>Revenue Comparison</CardTitle>
																		</CardHeader>
																		<CardContent>
																			<div className="text-sm text-muted-foreground">You don't have permission to view analytics for Sales.</div>
																		</CardContent>
																	</Card>
																)}

																{/* Period Overview and All Promo Codes */}
																<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
																	<Card className="border">
																		<CardHeader>
																			<CardTitle>Period Details</CardTitle>
																		</CardHeader>
																		<CardContent>
																			{loading ? (
																				<div>Loading period data...</div>
																			) : (
																				<div className="space-y-4">
																					<div className="flex items-center justify-between">
																						<div className="text-sm text-muted-foreground">Date Range</div>
																						<div className="font-medium text-sm">
																							{format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
																						</div>
																					</div>

																					<div className="flex items-center justify-between">
																						<div className="text-sm text-muted-foreground">Revenue</div>
																						<div className="font-semibold text-lg">{formatCurrency(periodStats.totalRevenue || 0)}</div>
																					</div>

																					<div className="flex items-center justify-between">
																						<div className="text-sm text-muted-foreground">Bookings</div>
																						<div className="font-semibold">{periodStats.totalBookings ?? 0}</div>
																					</div>

																					<div className="flex items-center justify-between">
																						<div className="text-sm text-muted-foreground">Used Count</div>
																						<div className="font-semibold">{periodStats.totalUsedCount ?? 0}</div>
																					</div>

																					{/* Top performers */}
																					<div className="pt-4 border-t">
																						<div className="text-sm font-medium mb-3">Top Performers (by Revenue)</div>
																						<ul className="space-y-2">
																							{topPerformersByRevenue.map((p) => (
																								<li key={p.promoCodeId} className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-50">
																									<span className="text-sm font-medium">{p.promoCode}</span>
																									<span className="font-semibold text-blue-600">{formatCurrency(p.totalRevenue || 0)}</span>
																								</li>
																							))}
																							{topPerformersByRevenue.length === 0 && (
																								<li className="text-sm text-muted-foreground text-center py-4">No bookings in selected period</li>
																							)}
																						</ul>
																					</div>
																				</div>
																			)}
																		</CardContent>
																	</Card>

																	{/* Promo Codes list - gated by promo view permission */}
																	{promoPerms.view ? (
																		<Card className="border">
																			<CardHeader className="flex items-center justify-between">
																				<CardTitle>All Promo Codes</CardTitle>
																				<div className="ml-auto">
																					{promoPerms.create && (
																						<Link href="/dashboard/promo-codes">
																							<Button size="sm">Manage Promo Codes</Button>
																						</Link>
																					)}
																				</div>
																			</CardHeader>
																			<CardContent>
																				<GlobalData
																					title="Promo Codes"
																					fetcher={promoFetcher}
																					serverSide={false}
																					columns={columns}
																					rowsPerPage={5}
																					searchEnabled={true}
																				/>
																			</CardContent>
																		</Card>
																	) : (
																		<Card className="border">
																			<CardHeader>
																				<CardTitle>Promo Codes</CardTitle>
																			</CardHeader>
																			<CardContent>
																				<div className="text-sm text-muted-foreground">You don't have permission to view or manage promo codes.</div>
																			</CardContent>
																		</Card>
																	)}
																</div>
															</div>
														);
}