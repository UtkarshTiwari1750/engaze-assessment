import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { Resume, Section } from "@/types";
import { SectionRenderer } from "./SectionRenderer";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";

interface ResumeCanvasProps {
  resume: Resume;
  currentDesign?: any;
  selectedSectionId: number | null;
  onSelectSection: (sectionId: number) => void;
  onUpdateSection: (sectionId: number, data: any) => void;
  onUpdateItem: (sectionId: number, itemId: number, data: any) => void;
  onDeleteItem: (sectionId: number, itemId: number) => void;
  onAddItem: (sectionId: number, data?: any) => void;
  onReorderSections: (sections: Array<{ id: number; position: number }>) => void;
  onReorderItems: (sectionId: number, items: Array<{ id: number; position: number }>) => void;
  scale?: number;
}

export const ResumeCanvas: React.FC<ResumeCanvasProps> = ({
  resume,
  currentDesign,
  selectedSectionId,
  onSelectSection,
  onUpdateSection,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onReorderSections,
  onReorderItems,
  scale = 1,
}) => {
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);

  const visibleSections = resume.sections.filter((section) => section.visible);
  const templateKey = resume.template?.templateId ? "modern" : "modern"; // Default to modern

  const handleSectionDragStart = (event: any) => {
    const section = visibleSections.find((s) => s.id === event.active.id);
    setDraggedSection(section || null);
  };

  const handleSectionDragEnd = (event: any) => {
    const { active, over } = event;
    setDraggedSection(null);

    if (active.id !== over?.id) {
      const oldIndex = visibleSections.findIndex((section) => section.id === active.id);
      const newIndex = visibleSections.findIndex((section) => section.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSections = arrayMove(visibleSections, oldIndex, newIndex);
        const reorderData = reorderedSections.map((section, index) => ({
          id: section.id,
          position: index + 1,
        }));

        onReorderSections(reorderData);
      }
    }
  };

  const renderTemplate = () => {
    const templateProps = {
      resume,
      currentDesign,
      sections: visibleSections,
      selectedSectionId,
      onSelectSection,
      onUpdateSection,
      onUpdateItem,
      onDeleteItem,
      onAddItem,
      onReorderItems,
    };

    switch (templateKey) {
      case "classic":
        return <ClassicTemplate {...templateProps} />;
      case "minimal":
        return <MinimalTemplate {...templateProps} />;
      default:
        return <ModernTemplate {...templateProps} />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-8">
      <div
        className="max-w-2xl mx-auto bg-white shadow-lg min-h-[11in] relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: "8.5in",
          minHeight: "11in",
        }}
      >
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleSectionDragStart}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext
            items={visibleSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {renderTemplate()}
          </SortableContext>
        </DndContext>

        {/* Drag overlay */}
        {draggedSection && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute bg-white shadow-lg border-2 border-blue-500 rounded p-4 opacity-90">
              <div className="font-semibold">{draggedSection.heading}</div>
              <div className="text-sm text-gray-500">{draggedSection.items.length} items</div>
            </div>
          </div>
        )}
      </div>

      {/* Scale indicator */}
      {scale !== 1 && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};
