import React from "react";
import { ContentEditable } from "@/components/editor/ContentEditable";
import type { SectionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProjectItemProps {
  item: SectionItem;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ item, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const data = item.dataJson || {};

  const updateField = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const addTechnology = () => {
    const technologies = [...(data.technologies || []), ""];
    updateField("technologies", technologies);
  };

  const updateTechnology = (index: number, value: string) => {
    const technologies = [...(data.technologies || [])];
    technologies[index] = value;
    updateField("technologies", technologies);
  };

  const removeTechnology = (index: number) => {
    const technologies = [...(data.technologies || [])];
    technologies.splice(index, 1);
    updateField("technologies", technologies);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 mb-4 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <ContentEditable
              value={data.name || ""}
              onChange={(value) => updateField("name", value)}
              placeholder="Project Name"
              className="font-semibold text-lg mb-1"
            />
            <div className="grid grid-cols-2 gap-4">
              <ContentEditable
                value={data.url || ""}
                onChange={(value) => updateField("url", value)}
                placeholder="Project URL (optional)"
                className="text-sm text-blue-600"
              />
              <ContentEditable
                value={data.role || ""}
                onChange={(value) => updateField("role", value)}
                placeholder="Your Role"
                className="text-sm text-gray-600"
              />
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <ContentEditable
          value={data.description || ""}
          onChange={(value) => updateField("description", value)}
          placeholder="Describe the project, your contributions, and key achievements..."
          multiline={true}
          className="text-sm border rounded p-2 min-h-[60px]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Technologies</label>
          <Button variant="ghost" size="sm" onClick={addTechnology} className="text-blue-600">
            <Plus className="h-3 w-3 mr-1" />
            Add Tech
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(data.technologies || []).map((tech: string, index: number) => (
            <div
              key={index}
              className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
            >
              <ContentEditable
                value={tech}
                onChange={(value) => updateTechnology(index, value)}
                placeholder="Technology"
                className="bg-transparent min-w-[60px]"
              />
              <button
                onClick={() => removeTechnology(index)}
                className="ml-2 text-blue-600 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {(data.technologies || []).length === 0 && (
          <p className="text-gray-500 text-sm italic">No technologies added yet</p>
        )}
      </div>
    </div>
  );
};

interface ProjectsSectionProps {
  items: SectionItem[];
  onUpdateItem: (itemId: number, data: any) => void;
  onDeleteItem: (itemId: number) => void;
  onAddItem: () => void;
  onReorderItems: (items: Array<{ id: number; position: number }>) => void;
  className?: string;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onReorderItems,
  className = "",
}) => {
  return (
    <div className={className}>
      {items.map((item) => (
        <ProjectItem
          key={item.id}
          item={item}
          onUpdate={(data) => onUpdateItem(item.id, data)}
          onDelete={() => onDeleteItem(item.id)}
        />
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No projects added yet</p>
        </div>
      )}

      <Button variant="outline" onClick={onAddItem} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
};
