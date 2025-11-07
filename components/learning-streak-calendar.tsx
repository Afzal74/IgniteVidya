"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Flame, Target, Clock, BookOpen, Trophy, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStudentActivityCalendar, getStudentStreakStats, DayActivity, StreakStats } from "@/lib/auth";

// DayActivity interface is now imported from lib/auth.ts

interface LearningStreakCalendarProps {
  studentId?: string;
  className?: string;
}

export default function LearningStreakCalendar({ studentId, className = "" }: LearningStreakCalendarProps) {
  const [activityData, setActivityData] = useState<DayActivity[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  // Load real or sample data for the past year
  useEffect(() => {
    const loadActivityData = async () => {
      if (studentId) {
        try {
          // Try to load real activity data
          const realActivityData = await getStudentActivityCalendar(studentId);
          const streakStats = await getStudentStreakStats(studentId);
          
          if (realActivityData.length > 0) {
            // Use real data
            setActivityData(realActivityData);
            setCurrentStreak(streakStats.currentStreak);
            setLongestStreak(streakStats.longestStreak);
            setTotalActiveDays(streakStats.totalActiveDays);
            return;
          }
        } catch (error) {
          console.error('Error loading real activity data:', error);
        }
      }
      
      // Fall back to sample data
      const sampleData = generateSampleActivityData();
      setActivityData(sampleData);
      calculateSampleStreaks(sampleData);
    };

    const generateSampleActivityData = () => {
      const data: DayActivity[] = [];
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Generate realistic activity patterns
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isRecent = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) < 30;
        
        // Higher activity on weekdays and recent days
        let activityChance = isWeekend ? 0.3 : 0.7;
        if (isRecent) activityChance += 0.2;
        
        const hasActivity = Math.random() < activityChance;
        
        if (hasActivity) {
          const lessonsCompleted = Math.floor(Math.random() * 5) + 1;
          const timeSpent = Math.floor(Math.random() * 120) + 15; // 15-135 minutes
          const quizzesCompleted = Math.floor(Math.random() * 3);
          
          // Determine activity level based on engagement
          let level: 0 | 1 | 2 | 3 | 4 = 1;
          if (timeSpent > 90 || lessonsCompleted > 3) level = 4;
          else if (timeSpent > 60 || lessonsCompleted > 2) level = 3;
          else if (timeSpent > 30 || lessonsCompleted > 1) level = 2;
          
          const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Science']
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1);
          
          data.push({
            date: dateStr,
            level,
            lessonsCompleted,
            timeSpent,
            quizzesCompleted,
            subjects
          });
        } else {
          data.push({
            date: dateStr,
            level: 0,
            lessonsCompleted: 0,
            timeSpent: 0,
            quizzesCompleted: 0,
            subjects: []
          });
        }
      }
      
      return data;
    };

    const calculateSampleStreaks = (data: DayActivity[]) => {
      let current = 0;
      let longest = 0;
      let temp = 0;
      let activeDays = 0;
      
      // Calculate current streak (from today backwards)
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].level > 0) {
          current++;
          activeDays++;
        } else {
          break;
        }
      }
      
      // Calculate longest streak and total active days
      for (const day of data) {
        if (day.level > 0) {
          temp++;
          longest = Math.max(longest, temp);
        } else {
          temp = 0;
        }
      }
      
      setCurrentStreak(current);
      setLongestStreak(longest);
      setTotalActiveDays(activeDays);
    };

    loadActivityData();
  }, [studentId]);

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return "bg-gray-800 border-gray-700";
      case 1: return "bg-green-900 border-green-800";
      case 2: return "bg-green-700 border-green-600";
      case 3: return "bg-green-500 border-green-400";
      case 4: return "bg-green-400 border-green-300";
      default: return "bg-gray-800 border-gray-700";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeeksInYear = () => {
    const weeks: DayActivity[][] = [];
    let currentWeek: DayActivity[] = [];
    
    activityData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      if (index === 0) {
        // Fill empty days at the start of the first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({
            date: '',
            level: 0,
            lessonsCompleted: 0,
            timeSpent: 0,
            quizzesCompleted: 0,
            subjects: []
          });
        }
      }
      
      currentWeek.push(day);
      
      if (dayOfWeek === 6 || index === activityData.length - 1) {
        // Fill empty days at the end of the last week
        while (currentWeek.length < 7) {
          currentWeek.push({
            date: '',
            level: 0,
            lessonsCompleted: 0,
            timeSpent: 0,
            quizzesCompleted: 0,
            subjects: []
          });
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const weeks = getWeeksInYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <TooltipProvider>
      <Card className={`bg-gray-800/90 backdrop-blur-sm border-gray-600/50 p-6 ${className}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Learning Activity</h3>
                <p className="text-sm text-gray-400">Your daily learning commitment</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold">{currentStreak}</span>
                </div>
                <div className="text-xs text-gray-400">Current</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Trophy className="h-4 w-4" />
                  <span className="font-bold">{longestStreak}</span>
                </div>
                <div className="text-xs text-gray-400">Best</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-blue-400">
                  <Target className="h-4 w-4" />
                  <span className="font-bold">{totalActiveDays}</span>
                </div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-3">
            {/* Month labels */}
            <div className="flex justify-between text-xs text-gray-400 px-4">
              {months.map((month, index) => (
                <span key={month} className={index % 2 === 0 ? 'opacity-100' : 'opacity-60'}>
                  {month}
                </span>
              ))}
            </div>

            {/* Calendar */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pr-2">
                {days.map((day, index) => (
                  <div key={day} className="h-3 flex items-center">
                    {index % 2 === 1 && (
                      <span className="text-xs text-gray-500 w-8">{day}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Activity grid */}
              <div className="flex gap-1 overflow-x-auto">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <Tooltip key={`${weekIndex}-${dayIndex}`}>
                        <TooltipTrigger asChild>
                          <motion.div
                            className={`w-3 h-3 rounded-sm border cursor-pointer transition-all ${
                              day.date ? getActivityColor(day.level) : 'bg-transparent border-transparent'
                            }`}
                            whileHover={{ scale: day.date ? 1.2 : 1 }}
                            onClick={() => day.date && setSelectedDay(day)}
                            onMouseEnter={() => day.date && setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        </TooltipTrigger>
                        {day.date && (
                          <TooltipContent side="top" className="bg-gray-900 border-gray-700">
                            <div className="text-sm">
                              <div className="font-medium text-white">{formatDate(day.date)}</div>
                              {day.level > 0 ? (
                                <div className="text-gray-300 mt-1 space-y-1">
                                  <div>{day.lessonsCompleted} lessons completed</div>
                                  <div>{day.timeSpent} minutes studied</div>
                                  {day.quizzesCompleted > 0 && (
                                    <div>{day.quizzesCompleted} quizzes taken</div>
                                  )}
                                  <div className="text-xs text-gray-400">
                                    {day.subjects.join(', ')}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 mt-1">No activity</div>
                              )}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Learn how we count contributions</span>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-sm border ${getActivityColor(level)}`}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDay && selectedDay.level > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">{formatDate(selectedDay.date)}</h4>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{selectedDay.lessonsCompleted}</div>
                    <div className="text-xs text-gray-400">Lessons</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{selectedDay.timeSpent}m</div>
                    <div className="text-xs text-gray-400">Time Spent</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{selectedDay.quizzesCompleted}</div>
                    <div className="text-xs text-gray-400">Quizzes</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{selectedDay.subjects.length}</div>
                    <div className="text-xs text-gray-400">Subjects</div>
                  </div>
                </div>
              </div>
              
              {selectedDay.subjects.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-2">Subjects studied:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedDay.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
}