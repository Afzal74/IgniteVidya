"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

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
          .select("email")
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
          .select("email")
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/25 to-blue-400/25 dark:from-green-400/10 dark:to-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/25 to-pink-400/25 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <Card className="w-full max-w-2xl relative z-10 border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center gap-2">
            🎓 {isSignUp ? "Create Student Account" : "Student Login"}
          </CardTitle>
          <CardDescription className="text-zinc-600 dark:text-zinc-400">
            {isSignUp
              ? "Join the learning community and track your progress"
              : "Sign in to access your dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Select value={grade} onValueChange={setGrade} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (gradeNum) => (
                            <SelectItem
                              key={gradeNum}
                              value={gradeNum.toString()}
                            >
                              Grade {gradeNum}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      type="text"
                      placeholder="A, B, C..."
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      type="text"
                      placeholder="123"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    type="text"
                    placeholder="ABC High School"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Parent Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="parent@email.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Button>

            <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Are you a teacher?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/teacher/login")}
                className="text-sm"
              >
                Teacher Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
