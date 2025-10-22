import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { resumeService } from "@/services/resume.service";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const resumeId = parseInt(id || "0");

  const {
    data: resume,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: () => resumeService.getResume(resumeId),
    enabled: !!resumeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading resume editor...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load resume</p>
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
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{resume.title}</h1>
              <p className="text-sm text-gray-600">Resume Editor</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Preview</Button>
              <Button variant="outline">Share</Button>
              <Button>Download PDF</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Sections */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {resume.sections.map((section) => (
                <div key={section.id} className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <div className="font-medium text-sm">{section.heading}</div>
                  <div className="text-xs text-gray-500">{section.items.length} items</div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              Add Section
            </Button>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-2xl mx-auto bg-white shadow-lg min-h-[11in] p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{resume.title}</h1>
              <p className="text-gray-600 mt-2">Resume content will be rendered here</p>
            </div>

            {resume.sections.map((section) => (
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">
                  {section.heading}
                </h2>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div key={item.id} className="p-2 border rounded">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(item.dataJson, null, 2)}
                      </pre>
                    </div>
                  ))}
                  {section.items.length === 0 && (
                    <p className="text-gray-500 italic">No items in this section</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Design */}
        <div className="w-64 bg-white border-l overflow-y-auto">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Design</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <Button variant="outline" className="w-full">
                  Change Template
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                <div className="grid grid-cols-4 gap-2">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500"].map((color) => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded ${color} cursor-pointer border-2 border-gray-200`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
