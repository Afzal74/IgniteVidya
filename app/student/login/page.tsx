"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Validate all required fields
        if (!firstName || !lastName || !grade || !schoolName) {
          throw new Error("Please fill in all required fields");
        }

        // Check if email is already registered as a teacher
        const { data: existingTeacher } = await supabase
          .from("teacher_profiles")
          .select("email, user_id")
          .eq("email", email)
          .single();

        if (existingTeacher) {
          throw new Error(
            "This email is already registered as a teacher. Please use a different email or login as a teacher."
          );
        }

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: "student",
              grade: parseInt(grade),
            },
            emailRedirectTo: window.location.origin + "/dashboard",
          },
        });
        if (error) throw error;

        if (data.user) {
          const userId = data.user.id;

          // Wait a moment for the user to be fully created
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Create student profile with error handling for schema cache issues
          const profileData = {
            user_id: userId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            grade: parseInt(grade),
            section: section || null,
            roll_number: rollNumber || null,
            school_name: schoolName,
            parent_email: parentEmail || null,
            phone_number: phoneNumber || null,
            date_of_birth: dateOfBirth || null,
          };

          // Use the safe student profile creation function
          const { data: profileResult, error: profileError } =
            await supabase.rpc("create_student_with_safe_achievements", {
              p_user_id: data.user.id,
              p_email: email,
              p_first_name: firstName,
              p_last_name: lastName,
              p_grade: parseInt(grade),
              p_section: section || null,
              p_roll_number: rollNumber || null,
              p_school_name: schoolName || null,
              p_parent_email: parentEmail || null,
              p_phone_number: phoneNumber || null,
              p_date_of_birth: dateOfBirth || null,
            });

          if (profileError || !profileResult?.success) {
            throw new Error(
              profileResult?.error ||
                profileError?.message ||
                "Failed to create student profile"
            );
          }

          console.log("Profile created successfully:", profileResult);

          // The universal function already created initial progress and achievements
          // No need for manual creation

          // Handle different signup scenarios
          if (data.user) {
            // For development, automatically confirm email
            const { data: confirmResult } = await supabase.rpc(
              "confirm_student_email",
              {
                p_email: email,
              }
            );

            if (confirmResult?.success) {
              alert(
                "Account created and confirmed successfully! You can now sign in."
              );
            } else if (data.user.email_confirmed_at) {
              alert("Account created successfully! You can now sign in.");
            } else {
              alert(
                "Account created! Please check your email to confirm your account before signing in."
              );
            }
          } else {
            alert(
              "Account created! You may need to confirm your email before signing in."
            );
          }
          setIsSignUp(false);
          // Clear form
          setFirstName("");
          setLastName("");
          setGrade("");
          setSection("");
          setRollNumber("");
          setSchoolName("");
          setParentEmail("");
          setPhoneNumber("");
          setDateOfBirth("");
          setEmail("");
          setPassword("");
        }
      } else {
        // First check if this email is registered as a teacher
        const { data: teacherCheck } = await supabase
          .from("teacher_profiles")
          .select("email, user_id")
          .eq("email", email)
          .single();

        if (teacherCheck) {
          throw new Error(
            "This email is registered as a teacher. Please use the teacher login page."
          );
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          console.log("Login Debug - User ID:", data.user.id);
          console.log("Login Debug - Email:", email);

          // Verify the user has a student profile (try both user_id and email)
          let studentProfile = null;

          // First try by user_id
          const { data: profileByUserId, error: userIdError } = await supabase
            .from("student_profiles")
            .select("id, user_id, email")
            .eq("user_id", data.user.id)
            .single();

          console.log("Login Debug - Profile by user_id:", profileByUserId);
          console.log("Login Debug - User ID error:", userIdError);

          if (profileByUserId) {
            studentProfile = profileByUserId;
          } else {
            // If not found by user_id, try by email
            const { data: profileByEmail, error: emailError } = await supabase
              .from("student_profiles")
              .select("id, user_id, email")
              .eq("email", email)
              .single();

            console.log("Login Debug - Profile by email:", profileByEmail);
            console.log("Login Debug - Email error:", emailError);

            if (profileByEmail) {
              // Update the user_id in the profile to match current user
              const { error: updateError } = await supabase
                .from("student_profiles")
                .update({ user_id: data.user.id })
                .eq("email", email);

              console.log("Login Debug - Update error:", updateError);
              studentProfile = profileByEmail;
            }
          }

          if (!studentProfile) {
            // Auto-create student profile directly with simple INSERT
            console.log(
              "Login Debug - No profile found, creating one directly..."
            );

            try {
              // Create profile directly
              const { data: newProfile, error: profileError } = await supabase
                .from("student_profiles")
                .insert({
                  user_id: data.user.id,
                  email: email,
                  first_name: "Student",
                  last_name: "User",
                  grade: 6,
                  school_name: "School",
                  section: "A",
                  roll_number: "001",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (profileError) {
                console.log("Profile creation error:", profileError);
                // Profile might already exist, try to get it
                const { data: existingProfile } = await supabase
                  .from("student_profiles")
                  .select("*")
                  .eq("email", email)
                  .single();

                if (existingProfile) {
                  // Update user_id if needed
                  await supabase
                    .from("student_profiles")
                    .update({ user_id: data.user.id })
                    .eq("email", email);
                  console.log("Login Debug - Used existing profile");
                } else {
                  throw new Error("Could not create or find profile");
                }
              } else {
                console.log("Login Debug - Created new profile:", newProfile);
              }

              // Create basic progress data
              await supabase.from("student_progress").insert([
                {
                  student_id: data.user.id,
                  subject: "Mathematics",
                  grade: 6,
                  completed_lessons: 0,
                  total_lessons: 15,
                  average_score: 0,
                  weekly_hours: 0,
                  difficulty_level: "beginner",
                },
                {
                  student_id: data.user.id,
                  subject: "Science",
                  grade: 6,
                  completed_lessons: 0,
                  total_lessons: 12,
                  average_score: 0,
                  weekly_hours: 0,
                  difficulty_level: "beginner",
                },
                {
                  student_id: data.user.id,
                  subject: "English",
                  grade: 6,
                  completed_lessons: 0,
                  total_lessons: 12,
                  average_score: 0,
                  weekly_hours: 0,
                  difficulty_level: "beginner",
                },
              ]);

              // Create welcome achievement
              await supabase.from("student_achievements").insert({
                student_id: data.user.id,
                achievement_name: "Welcome!",
                achievement_description:
                  "Successfully joined the learning platform",
                points_earned: 10,
                achievement_type: "milestone",
                earned_at: new Date().toISOString(),
              });

              console.log("Login Debug - Profile setup complete");
            } catch (error) {
              console.log("Login Debug - Profile creation failed:", error);
              // Don't throw error, just continue - profile might exist
            }

            // Give extra time for profile to be available
            console.log("Login Debug - Waiting for profile to be available...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          console.log("Login Debug - Redirecting to dashboard...");
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-9 px-3 text-sm rounded border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-15">
        <div className="h-full w-full bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Back Button */}
      <div className="w-full max-w-lg relative z-10 mb-2">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-zinc-200 dark:bg-zinc-800 p-5 rounded-lg border-2 border-zinc-900 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-zinc-900 dark:text-white font-bold text-lg">
              🎓 {isSignUp ? "Create Student Account" : "Welcome back"}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              {isSignUp ? "Join the learning community" : "Sign in to continue"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      Grade *
                    </label>
                    <Select value={grade} onValueChange={setGrade} required>
                      <SelectTrigger className="h-9 text-sm border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] text-zinc-900 dark:text-white font-medium rounded">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-zinc-900 dark:border-zinc-100">
                        {Array.from({ length: 7 }, (_, i) => i + 6).map((g) => (
                          <SelectItem key={g} value={g.toString()}>
                            Grade {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      Section
                    </label>
                    <input
                      id="section"
                      type="text"
                      placeholder="A"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      Roll No.
                    </label>
                    <input
                      id="rollNumber"
                      type="text"
                      placeholder="01"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      School *
                    </label>
                    <input
                      id="schoolName"
                      type="text"
                      placeholder="School name"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      Parent Email
                    </label>
                    <input
                      id="parentEmail"
                      type="email"
                      placeholder="parent@email.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                      Phone
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="student@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-zinc-900 dark:text-white text-xs font-semibold mb-1 block">
                Password *
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-300 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 mt-2 rounded border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-white shadow-[3px_3px_0px_0px_rgba(34,197,94,1)] text-white dark:text-zinc-900 font-bold text-sm cursor-pointer hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : isSignUp
                ? "Create Account →"
                : "Let's go →"}
            </button>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-medium py-1 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>

            <div className="text-center pt-3 border-t border-zinc-300 dark:border-zinc-700">
              <span className="text-xs text-zinc-500">Teacher? </span>
              <button
                type="button"
                onClick={() => router.push("/teacher/login")}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Login here
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
