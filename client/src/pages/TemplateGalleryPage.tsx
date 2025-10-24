import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { templateService } from "@/services/template.service";
import { resumeService } from "@/services/resume.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function TemplateGalleryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: templateService.getTemplates,
  });

  const applyTemplateMutation = useMutation({
    mutationFn: ({ templateId, themeId }: { templateId: number; themeId?: number }) => {
      if (resumeId) {
        return templateService.applyTemplate(parseInt(resumeId), templateId, themeId);
      } else {
        return resumeService.createResume({
          title: "New Resume",
          templateId,
          themeId,
        });
      }
    },
    onSuccess: (data) => {
      if (resumeId) {
        toast.success("Template applied successfully");
        navigate(`/editor/${resumeId}`);
      } else {
        toast.success("Resume created with template");
        navigate(`/editor/${(data as any).id}`);
      }
    },
    onError: () => {
      toast.error("Failed to apply template");
    },
  });

  const handleUseTemplate = (templateId: number, themeId?: number) => {
    applyTemplateMutation.mutate({ templateId, themeId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load templates</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link to="/dashboard">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Template Gallery</h1>
              <p className="text-sm text-gray-600">Choose a template for your resume</p>
            </div>
          </div>
        </div>
      </header>

      {/* Templates Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-[8.5/11] bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-2xl font-bold">{template.name}</div>
                      <div className="text-sm">Preview</div>
                    </div>
                  )}
                </div>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Available Themes ({template.themes.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.themes.slice(0, 3).map((theme) => (
                        <span
                          key={theme.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {theme.name}
                        </span>
                      ))}
                      {template.themes.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{template.themes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleUseTemplate(template.id, template.themes[0]?.id)}
                    disabled={applyTemplateMutation.isPending}
                  >
                    {applyTemplateMutation.isPending ? "Applying..." : "Use This Template"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No templates available</p>
          </div>
        )}
      </main>
    </div>
  );
}
