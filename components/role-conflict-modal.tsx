"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveRoleConflict, forceLogoutAndClear } from "@/lib/role-conflict-resolver";
import { useRouter } from "next/navigation";

interface RoleConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userId: string;
}

export function RoleConflictModal({ isOpen, onClose, email, userId }: RoleConflictModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelection = async (keepRole: "student" | "teacher") => {
    setLoading(true);
    try {
      const success = await resolveRoleConflict(userId, keepRole);
      
      if (success) {
        // Force logout and redirect to appropriate login page
        await forceLogoutAndClear();
        
        if (keepRole === "student") {
          router.push("/student/login?message=Please login again as a student");
        } else {
          router.push("/teacher/login?message=Please login again as a teacher");
        }
        
        onClose();
      } else {
        alert("Failed to resolve role conflict. Please contact support.");
      }
    } catch (error) {
      console.error("Error resolving role conflict:", error);
      alert("An error occurred. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Role Conflict Detected</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              The email <strong>{email}</strong> is registered as both a student and teacher.
            </p>
            <p>
              To continue, please choose which role you want to keep. The other profile and its data will be permanently deleted.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => handleRoleSelection("student")}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? "Processing..." : "Keep Student Account"}
          </Button>
          
          <Button
            onClick={() => handleRoleSelection("teacher")}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Processing..." : "Keep Teacher Account"}
          </Button>
          
          <Button
            onClick={async () => {
              await forceLogoutAndClear();
              router.push("/");
              onClose();
            }}
            variant="outline"
            disabled={loading}
            className="w-full"
          >
            Cancel & Logout
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <strong>Warning:</strong> This action cannot be undone. All data associated with the deleted role will be permanently lost.
        </div>
      </DialogContent>
    </Dialog>
  );
}