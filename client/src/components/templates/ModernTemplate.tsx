import React from "react";
import type { Resume, Section } from "@/types";
import { SectionRenderer } from "@/components/editor/SectionRenderer";
import { ContentEditable } from "@/components/editor/ContentEditable";

interface ModernTemplateProps {
  resume: Resume;
  currentDesign?: any;
  sections: Section[];
  selectedSectionId: number | null;
  onSelectSection: (sectionId: number) => void;
  onUpdateSection: (sectionId: number, data: any) => void;
  onUpdateItem: (sectionId: number, itemId: number, data: any) => void;
  onDeleteItem: (sectionId: number, itemId: number) => void;
  onAddItem: (sectionId: number, data?: any) => void;
  onReorderItems: (sectionId: number, items: Array<{ id: number; position: number }>) => void;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({
  resume,
  currentDesign,
  sections,
  selectedSectionId,
  onSelectSection,
  onUpdateSection,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onReorderItems,
}) => {
  // Get design configuration (colors, fonts, etc.)
  const primaryColor =
    currentDesign?.customOverrides?.primaryColor ||
    resume.template?.customOverrides?.primaryColor ||
    "#2563eb";
  const textColor =
    currentDesign?.customOverrides?.textColor ||
    resume.template?.customOverrides?.textColor ||
    "#1f2937";
  const fontFamily =
    currentDesign?.customOverrides?.fontFamily ||
    resume.template?.customOverrides?.fontFamily ||
    "Inter";

  return (
    <div className="p-8" style={{ color: textColor, fontFamily }}>
      {/* Header */}
      <div className="text-center mb-8 pb-6" style={{ borderBottom: `2px solid ${primaryColor}` }}>
        <ContentEditable
          value={resume.title}
          onChange={() => {}} // Handle resume title update
          placeholder="Your Name"
          className="text-3xl font-bold mb-2"
          style={{ color: primaryColor }}
        />

        {/* Contact info placeholder */}
        <div className="text-sm text-gray-600 space-y-1">
          <ContentEditable
            value=""
            onChange={() => {}}
            placeholder="Email • Phone • Location • LinkedIn"
            className="text-center"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="section-container">
            <SectionRenderer
              section={section}
              onUpdateSection={onUpdateSection}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onAddItem={onAddItem}
              onReorderItems={onReorderItems}
              isSelected={selectedSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
            />
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No sections added yet. Use the sidebar to add sections to your resume.</p>
        </div>
      )}

      <style jsx>{`
        .section-container .text-xl {
          color: ${primaryColor};
          border-bottom-color: ${primaryColor};
        }
      `}</style>
    </div>
  );
};
