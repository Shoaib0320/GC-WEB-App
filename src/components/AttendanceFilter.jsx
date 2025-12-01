// src/components/AttendanceFilter.jsx
import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAgent } from '@/context/AgentContext';
import { agentAttendanceService } from '@/services/agentAttendenceService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calendar, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AttendanceFilter = ({ visible, onClose, onApply, currentFilter }) => {
  const { theme } = useContext(ThemeContext);
  const { agent, token } = useAgent();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [firstAttendanceDate, setFirstAttendanceDate] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [yearPage, setYearPage] = useState(0);
  const yearsPerPage = 4;

  useEffect(() => {
    if (visible) {
      loadFilterData();
    }
  }, [visible]);

  const loadFilterData = async () => {
    try {
      setLoading(true);
      
      // Use the service function
      const firstDate = await agentAttendanceService.getFirstAttendanceDate();
      setFirstAttendanceDate(firstDate);
      
      const years = await agentAttendanceService.getAvailableYears();
      setAvailableYears(years);
      
      const months = await agentAttendanceService.getAvailableMonths(selectedYear);
      setAvailableMonths(months);
      
    } catch (error) {
      console.error('Failed to load filter data:', error);
      // Set default values
      const currentDate = new Date();
      setFirstAttendanceDate({
        year: currentDate.getFullYear() - 1,
        month: 1,
        readable: `January ${currentDate.getFullYear() - 1}`,
        source: 'error_fallback'
      });
      setAvailableYears([currentYear]);
      setAvailableMonths(getMonthsForCurrentYear());
    } finally {
      setLoading(false);
    }
  };

  // Helper function for fallback months
  const getMonthsForCurrentYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const allMonths = [
      { id: 1, name: 'January', short: 'Jan' },
      { id: 2, name: 'February', short: 'Feb' },
      { id: 3, name: 'March', short: 'Mar' },
      { id: 4, name: 'April', short: 'Apr' },
      { id: 5, name: 'May', short: 'May' },
      { id: 6, name: 'June', short: 'Jun' },
      { id: 7, name: 'July', short: 'Jul' },
      { id: 8, name: 'August', short: 'Aug' },
      { id: 9, name: 'September', short: 'Sep' },
      { id: 10, name: 'October', short: 'Oct' },
      { id: 11, name: 'November', short: 'Nov' },
      { id: 12, name: 'December', short: 'Dec' },
    ];
    
    return allMonths.filter(m => m.id <= currentMonth);
  };

  // When year changes, update months
  useEffect(() => {
    const updateMonthsForYear = async () => {
      if (selectedYear) {
        const months = await agentAttendanceService.getAvailableMonths(selectedYear);
        setAvailableMonths(months);
        
        // If current month not in available months, select first available
        if (months.length > 0 && !months.find(m => m.id === selectedMonth)) {
          setSelectedMonth(months[0].id);
        }
      }
    };
    
    updateMonthsForYear();
  }, [selectedYear]);

  useEffect(() => {
    if (currentFilter) {
      setSelectedYear(currentFilter.year || currentYear);
      setSelectedMonth(currentFilter.month || currentMonth);
    }
  }, [currentFilter, currentYear, currentMonth]);

  const handleApply = async () => {
    try {
      // You can optionally fetch the data here to verify before applying
      const result = await agentAttendanceService.getFilteredAttendance(selectedMonth, selectedYear);
      
      if (result.success) {
        onApply({ 
          year: selectedYear, 
          month: selectedMonth,
          data: result.data // Pass the fetched data if needed
        });
      } else {
        // Still apply filter even if fetch fails
        onApply({ year: selectedYear, month: selectedMonth });
      }
      onClose();
    } catch (error) {
      console.error('Error applying filter:', error);
      onApply({ year: selectedYear, month: selectedMonth });
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    onApply({ year: currentYear, month: currentMonth });
    onClose();
  };

  // Pagination logic
  const totalYearPages = Math.ceil(availableYears.length / yearsPerPage);
  const startYearIndex = yearPage * yearsPerPage;
  const endYearIndex = startYearIndex + yearsPerPage;
  const paginatedYears = availableYears.slice(startYearIndex, endYearIndex);

  const nextYearPage = () => {
    if (yearPage < totalYearPages - 1) {
      setYearPage(yearPage + 1);
    }
  };

  const prevYearPage = () => {
    if (yearPage > 0) {
      setYearPage(yearPage - 1);
    }
  };

  const selectedMonthName = availableMonths.find(m => m.id === selectedMonth)?.name || 
                           new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('en-US', { month: 'long' });

  if (!visible) return null;

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Attendance
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select month and year to view attendance records
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-200px)] px-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Loading attendance history...
                </p>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {firstAttendanceDate && (
                  <Card className="bg-muted/50 border-none shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Attendance data available from{' '}
                          <span className="font-semibold">
                            {firstAttendanceDate.readable || 
                              `${getMonthName(firstAttendanceDate.month)} ${firstAttendanceDate.year}`}
                          </span>
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Select Year</label>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{availableYears.length} years available</span>
                      </div>
                    </div>
                    
                    {availableYears.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevYearPage}
                            disabled={yearPage === 0}
                            className="h-8 w-8"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            {paginatedYears.map(year => (
                              <Button
                                key={year}
                                variant={selectedYear === year ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-10",
                                  selectedYear === year && "font-bold"
                                )}
                                onClick={() => {
                                  setSelectedYear(year);
                                  setYearPage(Math.floor(availableYears.indexOf(year) / yearsPerPage));
                                }}
                              >
                                {year}
                              </Button>
                            ))}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextYearPage}
                            disabled={yearPage >= totalYearPages - 1}
                            className="h-8 w-8"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {totalYearPages > 1 && (
                          <div className="flex justify-center items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Page {yearPage + 1} of {totalYearPages}
                            </span>
                            <div className="flex gap-1">
                              {Array.from({ length: totalYearPages }).map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setYearPage(idx)}
                                  className={cn(
                                    "h-2 w-2 rounded-full transition-all",
                                    idx === yearPage ? "bg-primary w-4" : "bg-muted hover:bg-muted-foreground"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Card className="bg-muted/20 border-dashed">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            No years available
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Select Month</label>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{availableMonths.length} months available</span>
                      </div>
                    </div>
                    
                    {availableMonths.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableMonths.map(month => (
                          <Button
                            key={month.id}
                            variant={selectedMonth === month.id ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-12 flex-col gap-1 py-2",
                              selectedMonth === month.id && "font-bold"
                            )}
                            onClick={() => setSelectedMonth(month.id)}
                          >
                            <span className="text-xs opacity-80">
                              {month.short || month.name.substring(0, 3)}
                            </span>
                            <span className="text-xs opacity-60">
                              {month.id}
                            </span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-muted/20 border-dashed">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            No months available for selected year
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {availableMonths.length > 0 && (
                  <Card className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <p className="text-xs text-muted-foreground">Selected Period</p>
                        <p className="text-xl font-bold text-primary">
                          {selectedMonthName} {selectedYear}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('en-PK', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2 px-6 py-4 border-t bg-background/95 backdrop-blur-sm sticky bottom-0">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 flex-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleApply}
            disabled={availableMonths.length === 0}
            className="gap-2 flex-1"
          >
            <Filter className="h-4 w-4" />
            Apply Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get month name
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
};

export default AttendanceFilter;