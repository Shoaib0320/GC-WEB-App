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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesPage() {
	const { currency, setCurrency, format: formatCurrency } = useCurrency();

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
		{ label: "Discount %", key: "discountPercentage", render: (it) => `${it.discountPercentage}%` },
		{ label: "Bookings", key: "totalBookings", render: (it) => it.totalBookings },
		{ label: "Revenue", key: "totalRevenue", render: (it) => formatCurrency(it.totalRevenue) },
		{ label: "Used / Max", key: "usedCount", render: (it) => `${it.usedCount}/${it.maxUsage ?? '-'}` },
		{ label: "Utilization %", key: "utilizationRate", render: (it) => `${Math.round(it.utilizationRate ?? 0)}%` },
		{ label: "Active", key: "isActive", render: (it) => it.isActive ? 'Yes' : 'No' },
	];

	const promoFetcher = async () => {
		const r = await promoCodeService.getPromoCodesAnalytics({ timeFrame: "all" });
		const payload = r?.data?.data || r?.data || r;
		return payload?.promoCodes || [];
	};

	// Generate months and years based on your business start date
	const getMonths = () => {
		const businessStartDate = new Date('2023-01-01'); // Change this to your actual business start date
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

	// ✅ FIXED: Filter promoCodes with actual bookings for top performers
	const promoCodesWithBookings = (periodData?.promoCodes || []).filter(p => p.totalBookings > 0);
	
	// ✅ FIXED: Get top performers by revenue (only those with bookings)
	const topPerformersByRevenue = promoCodesWithBookings
		.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
		.slice(0, 5);

	return (
		<div className="space-y-6 p-2 bg-white">
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

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="border">
					<CardHeader>
						<CardTitle>Period Overview - {currentMonthLabel}</CardTitle>
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
									<div className="font-semibold text-lg">
										{formatCurrency(periodStats.totalRevenue || 0)}
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">Bookings</div>
									<div className="font-semibold">
										{periodStats.totalBookings ?? 0}
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">Used Count</div>
									<div className="font-semibold">
										{periodStats.totalUsedCount ?? 0}
									</div>
								</div>

								{/* Comparison: selected month vs same month previous year */}
								<div>
									<div className="text-sm text-muted-foreground mb-2">Month Comparison</div>
									<div className="flex items-center gap-4">
										<div className="flex-1">
											{/* Simple two-bar chart (SVG) */}
											{(revenueCurrent === 0 && revenuePrev === 0) ? (
												<div className="text-sm text-muted-foreground">No revenue data for selected month or previous year.</div>
											) : (
												<div className="w-full">
													{/* Chart.js bar chart with tooltips */}
													{(() => {
														const chartData = {
															labels: [`${selectedYear - 1}`, `${selectedYear}`],
															datasets: [
																{
																	label: 'Revenue',
																	data: [revenuePrev, revenueCurrent],
																	backgroundColor: ['#c7d2fe', '#60a5fa'],
																	borderRadius: 6,
																	barThickness: 28,
																},
															],
														};

														const options = {
															responsive: true,
															maintainAspectRatio: false,
															plugins: {
																legend: { display: false },
																title: { display: true, text: `Revenue comparison — ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}` },
																tooltip: {
																	callbacks: {
																		label: (context) => {
																			const val = context.parsed.y ?? context.parsed ?? 0;
																			return `${context.dataset.label || ''}: ${formatCurrency(val)}`;
																		}
																	}
																},
															},
															scales: {
																y: {
																	beginAtZero: true,
																	ticks: {
																		callback: (value) => formatCurrency(value),
																	}
																}
															}
														};

														return (
															<div className="w-full h-48">
																<Bar options={options} data={chartData} />
															</div>
														);
													})()}

													{/* Numbers and percent change */}
													<div className="mt-2 flex items-center gap-4">
														<div>
															<div className="text-xs text-muted-foreground">Prev {selectedYear - 1} Revenue</div>
															<div className="font-medium">{formatCurrency(revenuePrev)}</div>
														</div>
														<div>
															<div className="text-xs text-muted-foreground">{selectedYear} Revenue</div>
															<div className="font-medium">{formatCurrency(revenueCurrent)}</div>
														</div>
														<div>
															<div className="text-xs text-muted-foreground">Change</div>
															<div className={`font-medium ${revenueDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
																{revenueDiff >= 0 ? '+' : ''}{revenuePct ? revenuePct.toFixed(1) : '0.0'}%
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Top performers */}
								<div>
									<div className="text-sm text-muted-foreground mb-2">
										Top performers (by revenue)
									</div>
									<ul className="space-y-2">
										{/* ✅ FIXED: Use topPerformersByRevenue instead of all promoCodes */}
										{topPerformersByRevenue.map((p) => (
											<li key={p.promoCodeId} className="flex justify-between items-center py-1">
												<span className="text-sm">{p.promoCode}</span>
												<span className="font-medium">
													{formatCurrency(p.totalRevenue || 0)}
												</span>
											</li>
										))}
										{topPerformersByRevenue.length === 0 && (
											<li className="text-sm text-muted-foreground text-center py-2">
												No bookings in selected period
											</li>
										)}
									</ul>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="border">
					<CardHeader>
						<CardTitle>All Promo Codes</CardTitle>
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
			</div>
		</div>
	);
}
