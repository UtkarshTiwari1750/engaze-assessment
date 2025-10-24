import React from "react";
import type { Resume, Section } from "@/types";
import { SectionRenderer } from "@/components/editor/SectionRenderer";
import { ContentEditable } from "@/components/editor/ContentEditable";

interface ClassicTemplateProps {
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

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
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
  const primaryColor =
    currentDesign?.customOverrides?.primaryColor ||
    resume.template?.customOverrides?.primaryColor ||
    "#1e3a8a";
  const textColor =
    currentDesign?.customOverrides?.textColor ||
    resume.template?.customOverrides?.textColor ||
    "#1f2937";
  const fontFamily =
    currentDesign?.customOverrides?.fontFamily ||
    resume.template?.customOverrides?.fontFamily ||
    "Georgia";

  // Split sections into sidebar and main content
  const sidebarSections = sections.filter((s) =>
    ["skills", "languages", "certifications"].includes(s.sectionType.key)
  );
  const mainSections = sections.filter(
    (s) => !["skills", "languages", "certifications"].includes(s.sectionType.key)
  );

  return (
    <div className="flex min-h-full" style={{ color: textColor, fontFamily }}>
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-50 p-6">
        {/* Contact Info */}
        <div className="mb-6">
          <ContentEditable
            value={resume.title}
            onChange={() => {}}
            placeholder="Your Name"
            className="text-xl font-bold mb-3"
            style={{ color: primaryColor }}
          />
          <div className="text-sm space-y-1">
            <ContentEditable value="" onChange={() => {}} placeholder="Email" className="block" />
            <ContentEditable value="" onChange={() => {}} placeholder="Phone" className="block" />
            <ContentEditable
              value=""
              onChange={() => {}}
              placeholder="Location"
              className="block"
            />
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.id}>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {mainSections.map((section) => (
            <div key={section.id}>
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

        {mainSections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Add sections to see your resume content here.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .section-container .text-xl {
          color: ${primaryColor};
        }
      `}</style>
    </div>
  );
};
