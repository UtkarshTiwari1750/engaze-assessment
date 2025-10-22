import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { resumeService } from "@/services/resume.service";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createResumeThunk } from "@/provider/slices/resumeSlice";
import type { AppDispatch } from "@/provider/store";
import { toast } from "sonner";
import { Plus, FileText, Calendar, MoreHorizontal } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: resumesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => resumeService.getResumes(),
  });

  const handleCreateResume = async () => {
    try {
      const result = await dispatch(
        createResumeThunk({
          title: "Untitled Resume",
        })
      );

      if (createResumeThunk.fulfilled.match(result)) {
        navigate(`/editor/${result.payload.id}`);
      }
    } catch (error: any) {
      toast.error("Failed to create resume");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load resumes</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const resumes = resumesData?.resumes || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/templates">
                <Button variant="outline">Browse Templates</Button>
              </Link>
              <Button onClick={handleLogout} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Resumes</h2>
              <p className="text-gray-600">Manage and edit your resume collection</p>
            </div>
            <Button onClick={handleCreateResume} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Resume</span>
            </Button>
          </div>
        </div>

        {/* Resumes Grid */}
        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first resume</p>
            <div className="mt-6">
              <Button onClick={handleCreateResume} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Resume</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{resume.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resume.status === "published"
                          ? "bg-green-100 text-green-800"
                          : resume.status === "archived"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                    </span>
                    <Link to={`/editor/${resume.id}`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
