import React from "react";
import { ContentEditable } from "@/components/editor/ContentEditable";
import type { SectionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ExperienceItemProps {
  item: SectionItem;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ item, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const data = item.dataJson || {
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: [""],
  };

  const updateField = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const updateDescription = (index: number, value: string) => {
    const description = Array.isArray(data.description) ? [...data.description] : [""];
    description[index] = value;
    updateField("description", description);
  };

  const addDescriptionBullet = () => {
    const description = Array.isArray(data.description) ? [...data.description, ""] : [""];
    updateField("description", description);
  };

  const removeDescriptionBullet = (index: number) => {
    const description = [...(data.description || [])];
    description.splice(index, 1);
    updateField("description", description);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 mb-4 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <ContentEditable
              value={data.role || ""}
              onChange={(value) => updateField("role", value)}
              placeholder="Job Title"
              className="font-semibold text-lg"
            />
            <ContentEditable
              value={data.company || ""}
              onChange={(value) => updateField("company", value)}
              placeholder="Company Name"
              className="font-medium text-lg"
            />
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

      <div className="grid grid-cols-2 gap-4 mb-3">
        <ContentEditable
          value={data.location || ""}
          onChange={(value) => updateField("location", value)}
          placeholder="Location"
          className="text-sm text-gray-600"
        />
        <div className="flex items-center space-x-2">
          <ContentEditable
            value={data.startDate || ""}
            onChange={(value) => updateField("startDate", value)}
            placeholder="Start Date"
            className="text-sm text-gray-600"
          />
          <span className="text-gray-400">-</span>
          {data.current ? (
            <span className="text-sm text-gray-600">Present</span>
          ) : (
            <ContentEditable
              value={data.endDate || ""}
              onChange={(value) => updateField("endDate", value)}
              placeholder="End Date"
              className="text-sm text-gray-600"
            />
          )}
          <label className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={data.current || false}
              onChange={(e) => updateField("current", e.target.checked)}
              className="rounded"
            />
            <span>Current</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={addDescriptionBullet}
            className="text-blue-600"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Bullet
          </Button>
        </div>
        {(Array.isArray(data.description) ? data.description : []).map(
          (bullet: string, index: number) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-gray-400 mt-1">•</span>
              <ContentEditable
                value={bullet}
                onChange={(value) => updateDescription(index, value)}
                placeholder="Describe your responsibilities and achievements..."
                multiline={true}
                className="flex-1 text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDescriptionBullet(index)}
                className="text-red-500 hover:text-red-700 mt-1"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

interface ExperienceSectionProps {
  items: SectionItem[];
  onUpdateItem: (itemId: number, data: any) => void;
  onDeleteItem: (itemId: number) => void;
  onAddItem: () => void;
  onReorderItems: (items: Array<{ id: number; position: number }>) => void;
  className?: string;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
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
        <ExperienceItem
          key={item.id}
          item={item}
          onUpdate={(data) => onUpdateItem(item.id, data)}
          onDelete={() => onDeleteItem(item.id)}
        />
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No work experience added yet</p>
        </div>
      )}

      <Button variant="outline" onClick={onAddItem} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>
    </div>
  );
};
