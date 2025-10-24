import React from "react";
import type { Resume, Section } from "@/types";
import { SectionRenderer } from "@/components/editor/SectionRenderer";
import { ContentEditable } from "@/components/editor/ContentEditable";

interface MinimalTemplateProps {
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

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
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
    "#000000";
  const textColor =
    currentDesign?.customOverrides?.textColor ||
    resume.template?.customOverrides?.textColor ||
    "#171717";
  const fontFamily =
    currentDesign?.customOverrides?.fontFamily ||
    resume.template?.customOverrides?.fontFamily ||
    "Inter";

  return (
    <div className="p-12" style={{ color: textColor, fontFamily }}>
      {/* Minimal Header */}
      <div className="mb-12">
        <ContentEditable
          value={resume.title}
          onChange={() => {}}
          placeholder="Your Name"
          className="text-2xl font-medium mb-4"
          style={{ color: primaryColor }}
        />

        <div className="text-sm text-gray-600">
          <ContentEditable
            value=""
            onChange={() => {}}
            placeholder="email@example.com"
            className="inline-block mr-4"
          />
          <ContentEditable
            value=""
            onChange={() => {}}
            placeholder="(555) 123-4567"
            className="inline-block mr-4"
          />
          <ContentEditable
            value=""
            onChange={() => {}}
            placeholder="City, State"
            className="inline-block"
          />
        </div>
      </div>

      {/* Sections with generous spacing */}
      <div className="space-y-12">
        {sections.map((section) => (
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

      {sections.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Clean slate.</p>
          <p className="text-sm mt-2">Add sections to build your minimal resume.</p>
        </div>
      )}

      <style jsx>{`
        .section-container .text-xl {
          color: ${primaryColor};
          border-bottom: 1px solid #e5e5e5;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
