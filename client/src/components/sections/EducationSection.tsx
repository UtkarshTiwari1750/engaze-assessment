import React from "react";
import { ContentEditable } from "@/components/editor/ContentEditable";
import type { SectionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface EducationItemProps {
  item: SectionItem;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

const EducationItem: React.FC<EducationItemProps> = ({ item, onUpdate, onDelete }) => {
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
              value={data.school || ""}
              onChange={(value) => updateField("school", value)}
              placeholder="School/University Name"
              className="font-semibold text-lg mb-1"
            />
            <div className="grid grid-cols-2 gap-4">
              <ContentEditable
                value={data.degree || ""}
                onChange={(value) => updateField("degree", value)}
                placeholder="Degree"
                className="font-medium"
              />
              <ContentEditable
                value={data.field || ""}
                onChange={(value) => updateField("field", value)}
                placeholder="Field of Study"
                className="font-medium"
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

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <ContentEditable
            value={data.startDate || ""}
            onChange={(value) => updateField("startDate", value)}
            placeholder="Start Date"
            className="text-sm text-gray-600"
          />
          <span className="text-gray-400">-</span>
          <ContentEditable
            value={data.endDate || ""}
            onChange={(value) => updateField("endDate", value)}
            placeholder="End Date"
            className="text-sm text-gray-600"
          />
        </div>
        <ContentEditable
          value={data.gpa || ""}
          onChange={(value) => updateField("gpa", value)}
          placeholder="GPA (optional)"
          className="text-sm text-gray-600"
        />
        <ContentEditable
          value={data.honors || ""}
          onChange={(value) => updateField("honors", value)}
          placeholder="Honors (optional)"
          className="text-sm text-gray-600"
        />
      </div>
    </div>
  );
};

interface EducationSectionProps {
  items: SectionItem[];
  onUpdateItem: (itemId: number, data: any) => void;
  onDeleteItem: (itemId: number) => void;
  onAddItem: () => void;
  onReorderItems: (items: Array<{ id: number; position: number }>) => void;
  className?: string;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
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
        <EducationItem
          key={item.id}
          item={item}
          onUpdate={(data) => onUpdateItem(item.id, data)}
          onDelete={() => onDeleteItem(item.id)}
        />
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No education added yet</p>
        </div>
      )}

      <Button variant="outline" onClick={onAddItem} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
};
