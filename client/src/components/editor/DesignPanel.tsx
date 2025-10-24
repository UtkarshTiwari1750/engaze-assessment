import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { templateService } from "@/services/template.service";
import { Button } from "@/components/ui/button";
import { Palette, Type, Layout, ChevronDown, ChevronRight } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import type { DesignConfig } from "@/types";

interface ColorPickerWithDoneProps {
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

const ColorPickerWithDone: React.FC<ColorPickerWithDoneProps> = ({
  color,
  onColorChange,
  onClose,
}) => {
  const [tempColor, setTempColor] = useState(color);

  const handleDone = () => {
    onColorChange(tempColor);
    onClose();
  };

  return (
    <>
      <HexColorPicker color={tempColor} onChange={setTempColor} />
      <div className="flex space-x-2 mt-2">
        <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button size="sm" onClick={handleDone} className="flex-1">
          Done
        </Button>
      </div>
    </>
  );
};

interface DesignPanelProps {
  resumeId: number;
  currentDesign: DesignConfig | null;
  onUpdateDesign: (data: any) => void;
}

export const DesignPanel: React.FC<DesignPanelProps> = ({
  resumeId,
  currentDesign,
  onUpdateDesign,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["template", "colors"])
  );
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: templateService.getTemplates,
  });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleTemplateChange = (templateId: number, themeId?: number) => {
    onUpdateDesign({ templateId, themeId });
  };

  const handleColorChange = (colorKey: string, color: string) => {
    const customOverrides = {
      ...currentDesign?.customOverrides,
      [colorKey]: color,
    };
    onUpdateDesign({ customOverrides });
  };

  const currentTemplate = templates?.find((t) => t.id === currentDesign?.templateId);
  const currentTheme = currentTemplate?.themes.find((t) => t.id === currentDesign?.themeId);

  return (
    <div className="h-full flex flex-col bg-white border-l">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900">Design</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Template Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection("template")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span className="font-medium">Template</span>
            </div>
            {expandedSections.has("template") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {expandedSections.has("template") && (
            <div className="px-4 pb-4 space-y-3">
              {templates?.map((template) => (
                <div key={template.id} className="space-y-2">
                  <button
                    onClick={() => handleTemplateChange(template.id)}
                    className={`w-full p-2 text-left rounded border transition-colors ${
                      currentDesign?.templateId === template.id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </button>

                  {currentDesign?.templateId === template.id && template.themes.length > 0 && (
                    <div className="ml-4 space-y-1">
                      <div className="text-xs font-medium text-gray-700">Themes</div>
                      {template.themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleTemplateChange(template.id, theme.id)}
                          className={`w-full p-2 text-left text-xs rounded border ${
                            currentDesign?.themeId === theme.id
                              ? "bg-blue-50 border-blue-300"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection("colors")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="font-medium">Colors</span>
            </div>
            {expandedSections.has("colors") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {expandedSections.has("colors") && (
            <div className="px-4 pb-4 space-y-4">
              {[
                { key: "primaryColor", label: "Primary Color", default: "#2563eb" },
                { key: "textColor", label: "Text Color", default: "#1f2937" },
                { key: "accentColor", label: "Accent Color", default: "#0ea5e9" },
              ].map(({ key, label, default: defaultColor }) => {
                const currentColor =
                  currentDesign?.customOverrides?.[key] ||
                  currentTheme?.colorScheme?.[key] ||
                  defaultColor;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <button
                        onClick={() => setActiveColorPicker(activeColorPicker === key ? null : key)}
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: currentColor }}
                      />
                    </div>

                    {activeColorPicker === key && (
                      <div className="relative">
                        <div className="absolute top-0 right-0 z-10 bg-white border rounded-lg shadow-lg p-3">
                          <ColorPickerWithDone
                            color={currentColor}
                            onColorChange={(color) => handleColorChange(key, color)}
                            onClose={() => setActiveColorPicker(null)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Typography Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection("typography")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span className="font-medium">Typography</span>
            </div>
            {expandedSections.has("typography") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {expandedSections.has("typography") && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={currentDesign?.customOverrides?.fontFamily || "Inter"}
                  onChange={(e) => handleColorChange("fontFamily", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="Inter">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
