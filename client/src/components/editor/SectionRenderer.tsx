import React from "react";
import type { Section } from "@/types";
import { SummarySection } from "@/components/sections/SummarySection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContentEditable } from "./ContentEditable";
import { SECTION_TYPES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface DefaultSectionProps {
  items: any[];
  onUpdateItem: (itemId: number, data: any) => void;
  onDeleteItem: (itemId: number) => void;
  onAddItem: (data?: any) => void;
  sectionKey: string;
}

const DefaultSection: React.FC<DefaultSectionProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  sectionKey,
}) => {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 mb-4 bg-white">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <ContentEditable
                value={item.dataJson?.title || item.dataJson?.name || ""}
                onChange={(value) => onUpdateItem(item.id, { ...item.dataJson, title: value })}
                placeholder="Title"
                className="font-semibold text-lg mb-2"
              />
              <ContentEditable
                value={item.dataJson?.content || item.dataJson?.description || ""}
                onChange={(value) => onUpdateItem(item.id, { ...item.dataJson, content: value })}
                placeholder="Content"
                multiline={true}
                className="text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteItem(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No items in this {sectionKey} section yet</p>
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => onAddItem({ title: "", content: "" })}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {sectionKey} Item
      </Button>
    </div>
  );
};

interface SectionRendererProps {
  section: Section;
  onUpdateSection: (sectionId: number, data: any) => void;
  onUpdateItem: (sectionId: number, itemId: number, data: any) => void;
  onDeleteItem: (sectionId: number, itemId: number) => void;
  onAddItem: (sectionId: number, data?: any) => void;
  onReorderItems: (sectionId: number, items: Array<{ id: number; position: number }>) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  onUpdateSection,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onReorderItems,
  isSelected = false,
  onSelect,
  className = "",
}) => {
  const handleHeadingChange = (newHeading: string) => {
    onUpdateSection(section.id, { heading: newHeading });
  };

  const handleItemUpdate = (itemId: number, data: any) => {
    onUpdateItem(section.id, itemId, data);
  };

  const handleItemDelete = (itemId: number) => {
    onDeleteItem(section.id, itemId);
  };

  const handleAddItem = (data?: any) => {
    const defaultData = getDefaultItemData(section.sectionType.key);
    onAddItem(section.id, data || defaultData);
  };

  const handleReorderItems = (items: Array<{ id: number; position: number }>) => {
    onReorderItems(section.id, items);
  };

  const getDefaultItemData = (sectionKey: string) => {
    switch (sectionKey) {
      case SECTION_TYPES.SUMMARY:
        return { text: "" };
      case SECTION_TYPES.EXPERIENCE:
        return {
          company: "",
          role: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: [""],
        };
      case SECTION_TYPES.EDUCATION:
        return {
          school: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          gpa: "",
          honors: "",
        };
      case SECTION_TYPES.SKILLS:
        return {
          categories: [{ name: "Technical Skills", skills: [""] }],
        };
      case SECTION_TYPES.PROJECTS:
        return {
          name: "",
          url: "",
          role: "",
          description: "",
          technologies: [],
        };
      default:
        return {};
    }
  };

  const renderSectionContent = () => {
    if (!section.sectionType) {
      return <div>Section type not loaded</div>;
    }

    const sectionKey = section.sectionType?.key || "custom";

    if (!sectionKey) {
      return (
        <DefaultSection
          items={section.items}
          onUpdateItem={handleItemUpdate}
          onDeleteItem={handleItemDelete}
          onAddItem={handleAddItem}
          sectionKey="custom"
        />
      );
    }

    switch (sectionKey) {
      case SECTION_TYPES.SUMMARY:
        return (
          <SummarySection
            items={section.items}
            onUpdateItem={handleItemUpdate}
            onAddItem={handleAddItem}
          />
        );

      case SECTION_TYPES.EXPERIENCE:
        return (
          <ExperienceSection
            items={section.items}
            onUpdateItem={handleItemUpdate}
            onDeleteItem={handleItemDelete}
            onAddItem={handleAddItem}
            onReorderItems={handleReorderItems}
          />
        );

      case SECTION_TYPES.EDUCATION:
        return (
          <EducationSection
            items={section.items}
            onUpdateItem={handleItemUpdate}
            onDeleteItem={handleItemDelete}
            onAddItem={handleAddItem}
            onReorderItems={handleReorderItems}
          />
        );

      case SECTION_TYPES.SKILLS:
        return (
          <SkillsSection
            items={section.items}
            onUpdateItem={handleItemUpdate}
            onAddItem={handleAddItem}
          />
        );

      case SECTION_TYPES.PROJECTS:
        return (
          <ProjectsSection
            items={section.items}
            onUpdateItem={handleItemUpdate}
            onDeleteItem={handleItemDelete}
            onAddItem={handleAddItem}
            onReorderItems={handleReorderItems}
          />
        );

      default:
        return (
          <DefaultSection
            items={section.items}
            onUpdateItem={handleItemUpdate}
            onDeleteItem={handleItemDelete}
            onAddItem={handleAddItem}
            sectionKey={sectionKey}
          />
        );
    }
  };

  return (
    <div
      className={`mb-6 ${isSelected ? "ring-2 ring-blue-500 ring-opacity-50" : ""} ${className}`}
      onClick={onSelect}
    >
      <div className="mb-4">
        <ContentEditable
          value={section.heading}
          onChange={handleHeadingChange}
          placeholder="Section Heading"
          className="text-xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2"
        />
      </div>

      <div className="ml-4">{renderSectionContent()}</div>
    </div>
  );
};
