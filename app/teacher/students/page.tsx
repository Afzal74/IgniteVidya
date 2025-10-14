"use client";

import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Users, Upload, Download, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

export default function StudentsPage() {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    roll_number: "",
    grade: "",
    email: "",
    parent_contact: "",
  });
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/teacher/login");
    } else {
      setUser(user);
      fetchStudents(user.id);
    }
    setLoading(false);
  };

  const fetchStudents = async (teacherId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("grade", { ascending: true })
      .order("roll_number", { ascending: true });

    if (!error && data) {
      // Sort by roll number numerically (in case roll numbers are like "1", "2", "10" instead of "01", "02", "10")
      const sorted = data.sort((a, b) => {
        // First sort by grade
        if (a.grade !== b.grade) {
          return parseInt(a.grade) - parseInt(b.grade);
        }
        // Then sort by roll number numerically
        const rollA = parseInt(a.roll_number) || 0;
        const rollB = parseInt(b.roll_number) || 0;
        return rollA - rollB;
      });
      setStudents(sorted);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("students").insert({
      teacher_id: user.id,
      ...formData,
    });

    if (error) {
      alert("Error adding student: " + error.message);
    } else {
      setIsAddDialogOpen(false);
      setFormData({
        first_name: "",
        last_name: "",
        roll_number: "",
        grade: "",
        email: "",
        parent_contact: "",
      });
      fetchStudents(user.id);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const { error } = await supabase.from("students").delete().eq("id", id);

    if (!error) {
      fetchStudents(user.id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate and transform data
      const studentsToAdd = jsonData
        .map((row: any) => ({
          teacher_id: user.id,
          first_name: row["First Name"] || row["first_name"] || "",
          last_name: row["Last Name"] || row["last_name"] || "",
          roll_number: String(row["Roll Number"] || row["roll_number"] || ""),
          grade: String(row["Grade"] || row["grade"] || ""),
          email: row["Email"] || row["email"] || "",
          parent_contact: row["Parent Contact"] || row["parent_contact"] || "",
        }))
        .filter((s) => s.first_name && s.last_name && s.roll_number && s.grade);

      if (studentsToAdd.length === 0) {
        alert(
          "No valid student data found in the file. Please check the format."
        );
        setImporting(false);
        return;
      }

      // Insert students
      const { error } = await supabase.from("students").insert(studentsToAdd);

      if (error) {
        alert("Error importing students: " + error.message);
      } else {
        alert(`Successfully imported ${studentsToAdd.length} students!`);
        setIsImportDialogOpen(false);
        fetchStudents(user.id);
      }
    } catch (err: any) {
      alert("Error reading file: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "First Name": "John",
        "Last Name": "Doe",
        "Roll Number": "1",
        Grade: "6",
        Email: "john@example.com",
        "Parent Contact": "+91 98765 43210",
      },
      {
        "First Name": "Jane",
        "Last Name": "Smith",
        "Roll Number": "2",
        Grade: "6",
        Email: "jane@example.com",
        "Parent Contact": "+91 98765 43211",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_import_template.xlsx");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/dashboard')}
            className="mb-6 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                My Students
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Manage and track your students
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-zinc-200 dark:border-zinc-800"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">
                      Import Students from Excel
                    </DialogTitle>
                    <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                      Upload an Excel file with student data
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                        <strong>Required columns:</strong>
                      </p>
                      <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 ml-4 list-disc">
                        <li>First Name</li>
                        <li>Last Name</li>
                        <li>Roll Number</li>
                        <li>Grade</li>
                        <li>Email (optional)</li>
                        <li>Parent Contact (optional)</li>
                      </ul>
                    </div>
                    <Button
                      variant="outline"
                      onClick={downloadTemplate}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="excel-file">Upload Excel File</Label>
                      <Input
                        id="excel-file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={importing}
                      />
                    </div>
                    {importing && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Importing students...
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">
                      Add New Student
                    </DialogTitle>
                    <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                      Enter student details to add them to your class
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              first_name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              last_name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="roll_number">Roll Number</Label>
                        <Input
                          id="roll_number"
                          value={formData.roll_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              roll_number: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Select
                          value={formData.grade}
                          onValueChange={(value) =>
                            setFormData({ ...formData, grade: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">Grade 6</SelectItem>
                            <SelectItem value="7">Grade 7</SelectItem>
                            <SelectItem value="8">Grade 8</SelectItem>
                            <SelectItem value="9">Grade 9</SelectItem>
                            <SelectItem value="10">Grade 10</SelectItem>
                            <SelectItem value="11">Grade 11</SelectItem>
                            <SelectItem value="12">Grade 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_contact">
                        Parent Contact (Optional)
                      </Label>
                      <Input
                        id="parent_contact"
                        value={formData.parent_contact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parent_contact: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-black dark:bg-white text-white dark:text-black"
                    >
                      Add Student
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Students List */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">
                Student List
              </CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400">
                Total Students: {students.length} • Sorted by Grade & Roll
                Number
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No students added yet
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                    Click "Add Student" to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Parent Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.roll_number}
                          </TableCell>
                          <TableCell>
                            {student.first_name} {student.last_name}
                          </TableCell>
                          <TableCell>Grade {student.grade}</TableCell>
                          <TableCell>{student.email || "-"}</TableCell>
                          <TableCell>{student.parent_contact || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
