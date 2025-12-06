"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/protected-route";
import { isStudentProfile } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, AlertTriangle } from "lucide-react";

interface GradeAccessGuardProps {
  requiredGrade: number;
  children: React.ReactNode;
  className?: string;
}

export default function GradeAccessGuard({ 
  requiredGrade, 
  children, 
  className = "" 
}: GradeAccessGuardProps) {
  const { user, profile, userType, loading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    // Allow teachers to access all grades
    if (userType === "teacher") {
      setHasAccess(true);
      return;
    }

    // Check student grade access
    if (userType === "student" && profile && isStudentProfile(profile)) {
      const studentGrade = profile.grade;
      setHasAccess(studentGrade === requiredGrade);
    } else {
      setHasAccess(false);
    }
  }, [user, profile, userType, loading, requiredGrade]);

  if (loading || hasAccess === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    const studentGrade = profile && isStudentProfile(profile) ? profile.grade : null;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600/50 p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Grade Level Mismatch</span>
            </div>
          </div>

          <div className="space-y-4 text-gray-300">
            <p>
              This content is designed for <span className="font-semibold text-blue-400">Grade {requiredGrade}</span> students.
            </p>
            
            {studentGrade && (
              <p>
                You are currently enrolled in <span className="font-semibold text-green-400">Grade {studentGrade}</span>.
              </p>
            )}
            
            <div className="bg-gray-700/50 rounded-lg p-4 text-sm">
              <p className="text-gray-400 mb-2">Why is this restricted?</p>
              <ul className="text-left space-y-1 text-gray-300">
                <li>• Content is tailored to specific grade levels</li>
                <li>• Ensures age-appropriate learning materials</li>
                <li>• Maintains proper curriculum progression</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            
            {studentGrade && (
              <Button
                onClick={() => router.push(`/grade/${studentGrade}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Grade {studentGrade} Content
              </Button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Need to access different grade content? Contact your teacher or administrator.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}