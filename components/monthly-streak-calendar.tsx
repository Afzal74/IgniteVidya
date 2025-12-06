"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Flame,
  Trophy,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getStudentActivityCalendar,
  getStudentStreakStats,
  DayActivity,
  StreakStats,
} from "@/lib/auth";

interface MonthlyStreakCalendarProps {
  studentId?: string;
  className?: string;
}

export default function MonthlyStreakCalendar({
  studentId,
  className = "",
}: MonthlyStreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activityData, setActivityData] = useState<DayActivity[]>([]);
  const [streakStats, setStreakStats] = useState<StreakStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    thisWeekDays: 0,
    thisMonthDays: 0,
  });
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);
  const [availableMonths, setAvailableMonths] = useState<Date[]>([]);

  useEffect(() => {
    loadData();
  }, [studentId, currentMonth]);

  const loadData = async () => {
    if (studentId) {
      try {
        const [activities, stats] = await Promise.all([
          getStudentActivityCalendar(studentId, 90), // Only last 3 months
          getStudentStreakStats(studentId),
        ]);

        if (activities.length > 0) {
          setActivityData(activities);
          setStreakStats(stats);

          // Find months with data
          const monthsWithData = [
            ...new Set(
              activities
                .filter((a) => a.level > 0)
                .map((a) => new Date(a.date).toISOString().slice(0, 7))
            ),
          ].map((monthStr) => new Date(monthStr + "-01"));

          setAvailableMonths(monthsWithData);
          return;
        }
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    }

    // Generate sample data for current month only
    const sampleData = generateCurrentMonthData();
    setActivityData(sampleData);
    setStreakStats({
      currentStreak: 7,
      longestStreak: 15,
      totalActiveDays: 23,
      thisWeekDays: 5,
      thisMonthDays: 18,
    });
    setAvailableMonths([
      new Date(),
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ]);
  };

  const generateCurrentMonthData = (): DayActivity[] => {
    const data: DayActivity[] = [];
    const today = new Date();
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      if (d > today) break; // Don't show future dates

      const dateStr = d.toISOString().split("T")[0];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const activityChance = isWeekend ? 0.4 : 0.8;
      const hasActivity = Math.random() < activityChance;

      if (hasActivity) {
        const lessons = Math.floor(Math.random() * 3) + 1;
        const timeSpent = Math.floor(Math.random() * 60) + 20;
        let level: 0 | 1 | 2 | 3 | 4 = 1;

        if (timeSpent > 60) level = 4;
        else if (timeSpent > 45) level = 3;
        else if (timeSpent > 30) level = 2;

        data.push({
          date: dateStr,
          level,
          lessonsCompleted: lessons,
          timeSpent,
          quizzesCompleted: Math.floor(Math.random() * 2),
          subjects: ["Math", "Science", "English"].slice(
            0,
            Math.floor(Math.random() * 2) + 1
          ),
        });
      } else {
        data.push({
          date: dateStr,
          level: 0,
          lessonsCompleted: 0,
          timeSpent: 0,
          quizzesCompleted: 0,
          subjects: [],
        });
      }
    }

    return data;
  };

  const getActivityColor = (level: number) => {
    const colors = [
      "bg-gray-800/50 border-gray-700/50",
      "bg-green-900/80 border-green-800/80",
      "bg-green-700/80 border-green-600/80",
      "bg-green-500/80 border-green-400/80",
      "bg-green-400/90 border-green-300/90",
    ];
    return colors[level] || colors[0];
  };

  const getMonthCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const calendar: (DayActivity | null)[][] = [];
    let currentWeek: (DayActivity | null)[] = [];

    for (
      let d = new Date(startDate);
      d <= lastDay || currentWeek.length < 7;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const isCurrentMonth = d.getMonth() === month;
      const dayActivity = activityData.find((a) => a.date === dateStr);

      if (isCurrentMonth && dayActivity) {
        currentWeek.push(dayActivity);
      } else if (isCurrentMonth) {
        currentWeek.push({
          date: dateStr,
          level: 0,
          lessonsCompleted: 0,
          timeSpent: 0,
          quizzesCompleted: 0,
          subjects: [],
        });
      } else {
        currentWeek.push(null); // Empty cell for other months
      }

      if (currentWeek.length === 7) {
        calendar.push(currentWeek);
        currentWeek = [];
      }
    }

    return calendar;
  };

  const canNavigateToMonth = (direction: "prev" | "next") => {
    const targetMonth = new Date(currentMonth);
    if (direction === "prev") {
      targetMonth.setMonth(targetMonth.getMonth() - 1);
    } else {
      targetMonth.setMonth(targetMonth.getMonth() + 1);
    }

    if (direction === "next" && targetMonth > new Date()) return false;

    return availableMonths.some(
      (month) =>
        month.getFullYear() === targetMonth.getFullYear() &&
        month.getMonth() === targetMonth.getMonth()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (!canNavigateToMonth(direction)) return;

    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const calendar = getMonthCalendar();
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card
      className={`bg-gray-800/90 backdrop-blur-sm border-gray-600/50 p-4 ${className}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white">
              Learning Activity
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="h-3 w-3" />
              <span className="font-bold">{streakStats.currentStreak}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Trophy className="h-3 w-3" />
              <span className="font-bold">{streakStats.longestStreak}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <Target className="h-3 w-3" />
              <span className="font-bold">{streakStats.thisMonthDays}</span>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            disabled={!canNavigateToMonth("prev")}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h3 className="text-sm font-medium text-white">{monthName}</h3>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            disabled={!canNavigateToMonth("next")}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {calendar.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <div key={dayIndex} className="relative">
                  {day ? (
                    <motion.div
                      className={`w-8 h-8 rounded border cursor-pointer transition-all flex items-center justify-center ${getActivityColor(
                        day.level
                      )}`}
                      whileHover={{ scale: 1.1 }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <span className="text-xs text-white font-medium">
                        {new Date(day.date).getDate()}
                      </span>
                    </motion.div>
                  ) : (
                    <div className="w-8 h-8" /> // Empty space for other months
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Activity Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded border ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>

        {/* Hovered day details */}
        {hoveredDay && hoveredDay.level > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700/80 rounded-lg p-3 border border-gray-600/50"
          >
            <div className="font-medium text-white mb-2">
              {new Date(hoveredDay.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="text-blue-400 font-bold">
                  {hoveredDay.lessonsCompleted}
                </div>
                <div className="text-gray-400">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">
                  {hoveredDay.timeSpent}m
                </div>
                <div className="text-gray-400">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold">
                  {hoveredDay.quizzesCompleted}
                </div>
                <div className="text-gray-400">Quizzes</div>
              </div>
            </div>
            {hoveredDay.subjects.length > 0 && (
              <div className="mt-2 text-xs text-gray-300">
                {hoveredDay.subjects.join(", ")}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
