"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, Flame, Trophy, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SimpleStreakWidgetProps {
  studentId?: string;
  className?: string;
}

interface DayData {
  date: string;
  level: number;
  lessons: number;
  minutes: number;
}

export default function SimpleStreakWidget({ studentId, className = "" }: SimpleStreakWidgetProps) {
  const [currentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Generate simple sample data - no async calls to prevent lag
  const monthData = useMemo(() => {
    const data: DayData[] = [];
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date > today) break;
      
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const hasActivity = Math.random() < (isWeekend ? 0.3 : 0.7);
      
      if (hasActivity) {
        const lessons = Math.floor(Math.random() * 3) + 1;
        const minutes = Math.floor(Math.random() * 60) + 20;
        const level = minutes > 60 ? 4 : minutes > 45 ? 3 : minutes > 30 ? 2 : 1;
        
        data.push({ date: dateStr, level, lessons, minutes });
      } else {
        data.push({ date: dateStr, level: 0, lessons: 0, minutes: 0 });
      }
    }
    
    return data;
  }, [currentMonth]);

  // Calculate stats from data
  const stats = useMemo(() => {
    const activeDays = monthData.filter(d => d.level > 0);
    let currentStreak = 0;
    
    // Calculate current streak from today backwards
    for (let i = monthData.length - 1; i >= 0; i--) {
      if (monthData[i].level > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, 12),
      activeDays: activeDays.length
    };
  }, [monthData]);

  const getColorClass = (level: number) => {
    const colors = [
      "bg-gray-800/50",
      "bg-green-900/80",
      "bg-green-700/80", 
      "bg-green-500/80",
      "bg-green-400/90"
    ];
    return colors[level] || colors[0];
  };

  // Create calendar grid
  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid: (DayData & { isCurrentMonth: boolean })[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({
        date: dateStr,
        level: 0,
        lessons: 0,
        minutes: 0,
        isCurrentMonth: false
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthData.find(d => {
        const dayFromDate = parseInt(d.date.split('-')[2]);
        return dayFromDate === day;
      });
      
      if (dayData) {
        grid.push({
          ...dayData,
          isCurrentMonth: true
        });
      } else {
        // Create default day data if not found
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        grid.push({
          date: dateStr,
          level: 0,
          lessons: 0,
          minutes: 0,
          isCurrentMonth: true
        });
      }
    }
    
    // Add days from next month to complete the grid (42 cells = 6 weeks)
    const remainingCells = 42 - grid.length;
    const nextMonth = new Date(year, month + 1, 1);
    for (let day = 1; day <= remainingCells; day++) {
      const dateStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({
        date: dateStr,
        level: 0,
        lessons: 0,
        minutes: 0,
        isCurrentMonth: false
      });
    }
    
    return grid;
  }, [monthData, currentMonth]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className={`bg-gray-800/90 backdrop-blur-sm border-gray-600/50 p-3 ${className}`}>
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white">{monthName}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="h-3 w-3" />
              <span className="font-bold">{stats.currentStreak}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Trophy className="h-3 w-3" />
              <span className="font-bold">{stats.longestStreak}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <Target className="h-3 w-3" />
              <span className="font-bold">{stats.activeDays}</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="space-y-0.5">
          {/* Week headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {weekDays.map((day, index) => (
              <div key={index} className="text-xs text-gray-500 text-center font-medium w-6">
                {day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarGrid.map((day, index) => (
              <div key={index}>
                <div
                  className={`w-6 h-6 rounded-sm border cursor-pointer transition-colors flex items-center justify-center hover:scale-110 text-xs font-medium ${
                    !day.isCurrentMonth 
                      ? 'bg-gray-900/30 border-gray-800/30 text-gray-600'
                      : day.level > 0 
                        ? `${getColorClass(day.level)} text-white border-transparent` 
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
                  }`}
                  onMouseEnter={() => day.isCurrentMonth && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={day.isCurrentMonth && day.date ? `${parseInt(day.date.split('-')[2])}: ${day.level > 0 ? `${day.lessons} lessons, ${day.minutes}min` : 'No activity'}` : ''}
                >
                  {day.date ? parseInt(day.date.split('-')[2]) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-2 h-2 rounded-sm ${getColorClass(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>

        {/* Hover info */}
        {hoveredDay && hoveredDay.level > 0 && (
          <div className="bg-gray-700/80 rounded p-2 text-xs">
            <div className="text-white font-medium mb-1">
              {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-gray-300">
              {hoveredDay.lessons} lessons • {hoveredDay.minutes} minutes
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}