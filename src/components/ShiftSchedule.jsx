// src/components/ShiftSchedule.jsx
"use client";
import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';
import { AgentContext } from '../context/AgentContext';
import { useLoaderContext } from '../context/LoaderContext';

const ShiftSchedule = () => {
    const { agent } = useContext(AgentContext);
    const { showLoader, hideLoader } = useLoaderContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedule, setSchedule] = useState([]);

    // Days mapping
    const daysMap = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
        'Thu': 4, 'Fri': 5, 'Sat': 6
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // Parse shift days
    const parseShiftDays = (days) => {
        if (!days || !Array.isArray(days)) return [];

        const workingDays = new Set();

        days.forEach(day => {
            if (day.includes('-')) {
                const [start, end] = day.split('-');
                const startIndex = daysMap[start];
                const endIndex = daysMap[end];

                if (startIndex !== undefined && endIndex !== undefined) {
                    for (let i = startIndex; i <= endIndex; i++) {
                        workingDays.add(i);
                    }
                }
            } else {
                const dayIndex = daysMap[day];
                if (dayIndex !== undefined) {
                    workingDays.add(dayIndex);
                }
            }
        });

        return Array.from(workingDays).sort();
    };

    // Generate weekly schedule based on currentDate
    const generateWeeklySchedule = () => {
        if (!agent?.shift) return;

        const targetDate = new Date(currentDate);
        const targetDay = targetDate.getDay();

        // Calculate start of week (Sunday) for the target date
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(targetDate.getDate() - targetDay);

        const scheduleData = [];
        const workingDays = parseShiftDays(agent.shift.days);
        const today = new Date();

        // Generate 7 days of the week
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            const dayOfWeek = date.getDay();
            const isWorkingDay = workingDays.includes(dayOfWeek);
            const isToday = date.toDateString() === today.toDateString();

            scheduleData.push({
                date: new Date(date),
                dayName: dayNames[dayOfWeek],
                dateNumber: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                isWorkingDay,
                shiftTiming: isWorkingDay ? `${agent.shift.startTime} - ${agent.shift.endTime}` : 'Off',
                isToday,
                isCurrentMonth: date.getMonth() === currentDate.getMonth()
            });
        }

        setSchedule(scheduleData);
    };

    // Navigation functions
    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    useEffect(() => {
        generateWeeklySchedule();
    }, [agent, currentDate]);

    // Animation variants
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    // Get display month and year
    const getDisplayMonthYear = () => {
        if (schedule.length === 0) {
            const now = new Date();
            return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        }

        // Check if all days are in same month
        const firstDayMonth = schedule[0].month;
        const allSameMonth = schedule.every(day => day.month === firstDayMonth);
        
        if (allSameMonth) {
            return `${monthNames[firstDayMonth]} ${schedule[0].year}`;
        } else {
            // Show range if week spans multiple months
            const firstDay = schedule[0];
            const lastDay = schedule[6];
            return `${monthNames[firstDay.month].substring(0, 3)} - ${monthNames[lastDay.month].substring(0, 3)} ${firstDay.year}`;
        }
    };

    // Check if current week is the current week
    const isCurrentWeek = () => {
        const today = new Date();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay());

        const displayedWeekStart = new Date(schedule[0]?.date);

        return currentWeekStart.toDateString() === displayedWeekStart.toDateString();
    };

    if (!agent?.shift) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 w-full max-w-md mx-auto">
                <div className="text-center py-8">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Shift Assigned</h3>
                    <p className="text-slate-500">Please contact administrator to assign your shift schedule.</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden w-full max-w-sm sm:max-w-md mx-auto"
        >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Work Schedule</h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Your weekly shift plan</p>
                        </div>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <button
                        onClick={goToPreviousWeek}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                        aria-label="Previous week"
                    >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                    </button>

                    <div className="flex flex-col items-center flex-1 mx-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 text-center">
                            {getDisplayMonthYear()}
                        </h2>
                        {!isCurrentWeek() && (
                            <button
                                onClick={goToToday}
                                className="mt-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors duration-200"
                            >
                                Back to Today
                            </button>
                        )}
                    </div>

                    <button
                        onClick={goToNextWeek}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                        aria-label="Next week"
                    >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="p-4 sm:p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
                    {schedule.map((day, index) => (
                        <div key={`header-${index}`} className="text-center">
                            <div className={`text-xs font-semibold uppercase tracking-wide ${day.isWorkingDay ? 'text-slate-700' : 'text-slate-400'
                                }`}>
                                {day.dayName.substring(0, 3)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
                    {schedule.map((day, index) => (
                        <motion.div
                            key={day.date.toString() + currentDate.getTime()}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <div className={`
                                relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 cursor-default
                                ${day.isToday
                                    ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-200 transform scale-105'
                                    : day.isWorkingDay
                                        ? 'bg-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105'
                                        : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                }
                            `}>
                                {day.dateNumber}
                                
                                {/* Month indicator for cross-month weeks */}
                                {!day.isCurrentMonth && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center">
                                        <span className="text-[8px] text-amber-700 font-bold">!</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Today indicator */}
                            {day.isToday && (
                                <motion.div 
                                    className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                            
                            {/* Working day indicator */}
                            {!day.isToday && day.isWorkingDay && (
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5" />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Shift Info Section */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-semibold text-slate-800">Shift Timing</h4>
                                <p className="text-xs text-slate-600">{agent.shift.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="flex items-center justify-around mb-4">
                        <div className="text-center">
                            <div className="text-2xl sm:text-2xl font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                {agent.shift.startTime}
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">Start Time</p>
                        </div>
                        
                        <div className="flex items-center mx-2 sm:mx-4">
                            <div className="w-6 h-px bg-slate-300"></div>
                            <MapPin className="h-4 w-4 text-slate-400 mx-1" />
                            <div className="w-6 h-px bg-slate-300"></div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-2xl sm:text-2xl font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                {agent.shift.endTime}
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">End Time</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-xs font-medium text-slate-700">
                                    {schedule.filter(day => day.isWorkingDay).length} Work
                                </span>
                            </div>
                        </div>
                        <div className="h-4 w-px bg-slate-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                <span className="text-xs font-medium text-slate-700">
                                    {schedule.filter(day => !day.isWorkingDay).length} Off
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Status */}
                <div className="mt-4 flex items-center justify-center">
                    <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                        <p className="text-xs text-slate-600 text-center">
                            This week: <span className="font-semibold text-slate-800">
                                {schedule.filter(day => day.isWorkingDay).length} working days
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ShiftSchedule;