import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export interface StudentProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  grade: number;
  section?: string;
  roll_number?: string;
  school_name: string;
  parent_email?: string;
  phone_number?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  school_name: string;
  role: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export type UserProfile = StudentProfile | TeacherProfile;
export type UserType = "student" | "teacher" | null;

// Type guard functions
export const isStudentProfile = (
  profile: UserProfile
): profile is StudentProfile => {
  return "grade" in profile;
};

export const isTeacherProfile = (
  profile: UserProfile
): profile is TeacherProfile => {
  return "role" in profile;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // First try to get the session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user;
    }

    // Fallback to getUser
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Get user profile and determine type with retry mechanism
export const getUserProfile = async (retryCount: number = 0): Promise<{
  user: User | null;
  profile: UserProfile | null;
  userType: UserType;
}> => {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, profile: null, userType: null };
  }

  console.log("getUserProfile - checking for user:", user.id, user.email, "retry:", retryCount);

  // Check if user is a student (try both user_id and email)
  let studentProfile = null;

  // First try by user_id
  const { data: studentByUserId, error: studentUserIdError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  console.log("Student profile by user_id:", {
    studentByUserId,
    studentUserIdError,
  });

  if (studentByUserId) {
    studentProfile = studentByUserId;
  } else {
    // Try by email if user_id doesn't work
    const { data: studentByEmail, error: studentEmailError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("email", user.email)
      .single();

    console.log("Student profile by email:", {
      studentByEmail,
      studentEmailError,
    });

    if (studentByEmail) {
      // Update the user_id to match current user
      await supabase
        .from("student_profiles")
        .update({ user_id: user.id })
        .eq("email", user.email);

      studentProfile = studentByEmail;
    }
  }

  // If no profile found and this is the first attempt, retry after a short delay
  if (!studentProfile && retryCount < 2) {
    console.log("No profile found, retrying in 1 second...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getUserProfile(retryCount + 1);
  }

  if (studentProfile) {
    console.log("Found student profile, returning student user type");
    return {
      user,
      profile: studentProfile as StudentProfile,
      userType: "student",
    };
  }

  // Check if user is a teacher
  const { data: teacherProfile, error: teacherError } = await supabase
    .from("teacher_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  console.log("Teacher profile check:", { teacherProfile, teacherError });

  if (teacherProfile) {
    return {
      user,
      profile: teacherProfile as TeacherProfile,
      userType: "teacher",
    };
  }

  // User exists but no profile found
  console.log("No profile found for user");
  return { user, profile: null, userType: null };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

// Get student dashboard data
export const getStudentDashboardData = async (userId: string) => {
  try {
    console.log("Fetching dashboard data for user:", userId);

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    console.log("Profile fetch result:", { profile, profileError });

    if (profileError) {
      console.warn("Profile error:", profileError);
      // Don't throw error, continue with empty profile
    }

    // Get student progress (with error handling)
    let progress = [];
    try {
      const { data: progressData, error: progressError } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", userId);

      if (progressError) {
        console.warn("Progress error:", progressError);
      } else {
        progress = progressData || [];
      }
    } catch (err) {
      console.warn("Progress fetch failed:", err);
    }

    // Get student achievements (with error handling)
    let achievements = [];
    try {
      const { data: achievementsData, error: achievementsError } =
        await supabase
          .from("student_achievements")
          .select("*")
          .eq("student_id", userId)
          .order("earned_date", { ascending: false })
          .limit(10);

      if (achievementsError) {
        console.warn("Achievements error:", achievementsError);
      } else {
        achievements = achievementsData || [];
      }
    } catch (err) {
      console.warn("Achievements fetch failed:", err);
    }

    // Get recent quiz results (with error handling)
    let quizResults = [];
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("student_quiz_results")
        .select("*")
        .eq("student_id", userId)
        .order("completed_at", { ascending: false })
        .limit(5);

      if (quizError) {
        console.warn("Quiz results error:", quizError);
      } else {
        quizResults = quizData || [];
      }
    } catch (err) {
      console.warn("Quiz results fetch failed:", err);
    }

    console.log("Dashboard data fetched:", {
      profile: !!profile,
      progressCount: progress.length,
      achievementsCount: achievements.length,
      quizResultsCount: quizResults.length,
    });

    return {
      profile: profile || null,
      progress: progress || [],
      achievements: achievements || [],
      quizResults: quizResults || [],
    };
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    // Return empty data instead of throwing error
    return {
      profile: null,
      progress: [],
      achievements: [],
      quizResults: [],
    };
  }
};

// Update student progress
export const updateStudentProgress = async (
  userId: string,
  subject: string,
  updates: Partial<{
    completed_lessons: number;
    total_lessons: number;
    average_score: number;
    weekly_hours: number;
    difficulty_level: string;
  }>
) => {
  const { data, error } = await supabase
    .from("student_progress")
    .upsert({
      student_id: userId,
      subject,
      ...updates,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data;
};

// Add student achievement
export const addStudentAchievement = async (
  userId: string,
  achievement: {
    achievement_title: string;
    achievement_description: string;
    achievement_icon: string;
    points: number;
    rarity: "common" | "rare" | "epic" | "legendary";
  }
) => {
  const { data, error } = await supabase
    .from("student_achievements")
    .insert({
      student_id: userId,
      ...achievement,
    })
    .select();

  if (error) throw error;
  return data;
};

// Add quiz result
export const addQuizResult = async (
  userId: string,
  quizResult: {
    quiz_title: string;
    subject: string;
    score: number;
    total_questions: number;
    time_spent: number;
    difficulty: "easy" | "medium" | "hard";
  }
) => {
  const { data, error } = await supabase
    .from("student_quiz_results")
    .insert({
      student_id: userId,
      ...quizResult,
    })
    .select();

  if (error) throw error;
  return data;
};

// Activity data interfaces
export interface DayActivity {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  lessonsCompleted: number;
  timeSpent: number;
  quizzesCompleted: number;
  subjects: string[];
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  thisWeekDays: number;
  thisMonthDays: number;
}

// Get student activity calendar data
export const getStudentActivityCalendar = async (
  userId: string,
  daysBack: number = 365
): Promise<DayActivity[]> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_student_activity_calendar",
      {
        p_student_id: userId,
        p_days_back: daysBack,
      }
    );

    if (error) {
      console.error("Error fetching activity calendar:", error);
      return [];
    }

    return (
      data?.map((activity: any) => ({
        date: activity.activity_date,
        level: activity.activity_level,
        lessonsCompleted: activity.lessons_completed,
        timeSpent: activity.time_spent_minutes,
        quizzesCompleted: activity.quizzes_completed,
        subjects: activity.subjects_studied || [],
      })) || []
    );
  } catch (error) {
    console.error("Error in getStudentActivityCalendar:", error);
    return [];
  }
};

// Get student streak statistics
export const getStudentStreakStats = async (
  userId: string
): Promise<StreakStats> => {
  try {
    const { data, error } = await supabase.rpc("get_student_streak_stats", {
      p_student_id: userId,
    });

    if (error) {
      console.error("Error fetching streak stats:", error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        thisWeekDays: 0,
        thisMonthDays: 0,
      };
    }

    const stats = data?.[0];
    return {
      currentStreak: stats?.current_streak || 0,
      longestStreak: stats?.longest_streak || 0,
      totalActiveDays: stats?.total_active_days || 0,
      thisWeekDays: stats?.this_week_days || 0,
      thisMonthDays: stats?.this_month_days || 0,
    };
  } catch (error) {
    console.error("Error in getStudentStreakStats:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      thisWeekDays: 0,
      thisMonthDays: 0,
    };
  }
};

// Record student activity
export const recordStudentActivity = async (
  userId: string,
  activityDate: string = new Date().toISOString().split("T")[0],
  lessonsCompleted: number = 0,
  timeSpentMinutes: number = 0,
  quizzesCompleted: number = 0,
  subjectsStudied: string[] = []
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc("record_student_activity", {
      p_student_id: userId,
      p_activity_date: activityDate,
      p_lessons_completed: lessonsCompleted,
      p_time_spent_minutes: timeSpentMinutes,
      p_quizzes_completed: quizzesCompleted,
      p_subjects_studied: subjectsStudied,
    });

    if (error) {
      console.error("Error recording activity:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in recordStudentActivity:", error);
    return false;
  }
};
