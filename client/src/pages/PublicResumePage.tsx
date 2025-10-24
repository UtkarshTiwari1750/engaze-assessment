import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sharingService } from "@/services/sharing.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Download, Eye } from "lucide-react";
import { ModernTemplate } from "@/components/templates/ModernTemplate";

export default function PublicResumePage() {
  const { slug } = useParams<{ slug: string }>();
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    data: resume,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-resume", slug],
    queryFn: () => sharingService.getPublicResume(slug!, password),
    enabled: !!slug,
    retry: false,
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }
    refetch();
  };

  // Handle password required error
  if (error && (error as any).response?.status === 401) {
    if (!showPasswordForm) {
      setShowPasswordForm(true);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (showPasswordForm && !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Password Required</CardTitle>
            <CardDescription>
              This resume is password protected. Please enter the password to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Resume
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !showPasswordForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Resume not found or has expired</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Resume not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{resume.title}</h1>
              <p className="text-sm text-gray-600">Public Resume</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await sharingService.downloadPublicPdf(slug!, password);
                    toast.success("PDF downloaded successfully");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to download PDF");
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button>Create Your Own Resume</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Resume Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg min-h-[11in] mx-auto max-w-2xl">
          <ModernTemplate
            resume={resume}
            sections={resume.sections.filter((s) => s.visible)}
            selectedSectionId={null}
            onSelectSection={() => {}}
            onUpdateSection={() => {}}
            onUpdateItem={() => {}}
            onDeleteItem={() => {}}
            onAddItem={() => {}}
            onReorderItems={() => {}}
          />
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create Your Own Resume</CardTitle>
              <CardDescription>
                Build a professional resume like this one with our easy-to-use builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
