import { supabase } from "./supabase";

export interface RoleConflict {
  userId: string;
  email: string;
  hasStudentProfile: boolean;
  hasTeacherProfile: boolean;
  studentProfileId?: string;
  teacherProfileId?: string;
}

// Check if a user has role conflicts
export const checkRoleConflict = async (userId: string): Promise<RoleConflict | null> => {
  const [studentResult, teacherResult] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("id, email")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("teacher_profiles")
      .select("id, email")
      .eq("user_id", userId)
      .single()
  ]);

  const hasStudentProfile = !!studentResult.data;
  const hasTeacherProfile = !!teacherResult.data;

  if (hasStudentProfile && hasTeacherProfile) {
    return {
      userId,
      email: studentResult.data?.email || teacherResult.data?.email || "",
      hasStudentProfile,
      hasTeacherProfile,
      studentProfileId: studentResult.data?.id,
      teacherProfileId: teacherResult.data?.id,
    };
  }

  return null;
};

// Check role conflict by email
export const checkRoleConflictByEmail = async (email: string): Promise<RoleConflict | null> => {
  const [studentResult, teacherResult] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("id, user_id, email")
      .eq("email", email)
      .single(),
    supabase
      .from("teacher_profiles")
      .select("id, user_id, email")
      .eq("email", email)
      .single()
  ]);

  const hasStudentProfile = !!studentResult.data;
  const hasTeacherProfile = !!teacherResult.data;

  if (hasStudentProfile && hasTeacherProfile) {
    return {
      userId: studentResult.data?.user_id || teacherResult.data?.user_id || "",
      email,
      hasStudentProfile,
      hasTeacherProfile,
      studentProfileId: studentResult.data?.id,
      teacherProfileId: teacherResult.data?.id,
    };
  }

  return null;
};

// Resolve role conflict by removing one profile
export const resolveRoleConflict = async (
  userId: string,
  keepRole: "student" | "teacher"
): Promise<boolean> => {
  try {
    if (keepRole === "student") {
      // Remove teacher profile
      const { error } = await supabase
        .from("teacher_profiles")
        .delete()
        .eq("user_id", userId);
      
      if (error) throw error;
    } else {
      // Remove student profile and related data
      await Promise.all([
        supabase.from("student_achievements").delete().eq("student_id", userId),
        supabase.from("student_progress").delete().eq("student_id", userId),
        supabase.from("student_quiz_results").delete().eq("student_id", userId),
        supabase.from("student_activities").delete().eq("student_id", userId),
        supabase.from("student_profiles").delete().eq("user_id", userId),
      ]);
    }

    return true;
  } catch (error) {
    console.error("Error resolving role conflict:", error);
    return false;
  }
};

// Force logout and clear session
export const forceLogoutAndClear = async (): Promise<void> => {
  await supabase.auth.signOut();
  // Clear any local storage or session storage if needed
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
};