import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { resumeService } from "@/services/resume.service";
import type { Section, SectionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableSectionItemProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
        isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:bg-gray-50",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-gray-400"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{section.heading}</div>
        <div className="text-xs text-gray-500">
          {section.items?.length || 0} {(section.items?.length || 0) === 1 ? "item" : "items"}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="h-6 w-6 p-0"
        >
          {section.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 text-gray-400" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (sectionTypeId: number, heading: string) => void;
}

const AddSectionDialog: React.FC<AddSectionDialogProps> = ({ isOpen, onClose, onAddSection }) => {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [heading, setHeading] = useState("");

  const { data: sectionTypes } = useQuery({
    queryKey: ["section-types"],
    queryFn: resumeService.getSectionTypes,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypeId && heading.trim()) {
      onAddSection(selectedTypeId, heading.trim());
      setSelectedTypeId(null);
      setHeading("");
      onClose();
    }
  };

  const handleTypeSelect = (type: SectionType) => {
    setSelectedTypeId(type.id);
    setHeading(type.name);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Section</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Type</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {sectionTypes?.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    "p-2 text-left text-sm rounded border transition-colors",
                    selectedTypeId === type.id
                      ? "bg-blue-50 border-blue-300 text-blue-900"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter section heading"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedTypeId || !heading.trim()}>
              Add Section
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SectionListProps {
  sections: Section[];
  selectedSectionId: number | null;
  onSelectSection: (sectionId: number) => void;
  onReorderSections: (sections: Array<{ id: number; position: number }>) => void;
  onUpdateSection: (sectionId: number, data: any) => void;
  onDeleteSection: (sectionId: number) => void;
  onAddSection: (sectionTypeId: number, heading: string) => void;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorderSections,
  onUpdateSection,
  onDeleteSection,
  onAddSection,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);

      const reorderedSections = arrayMove(sections, oldIndex, newIndex);
      const reorderData = reorderedSections.map((section, index) => ({
        id: section.id,
        position: index + 1,
      }));

      onReorderSections(reorderData);
    }
  };

  const handleToggleVisibility = (sectionId: number, currentVisibility: boolean) => {
    onUpdateSection(sectionId, { visible: !currentVisibility });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900 mb-4">Sections</h3>
        <Button onClick={() => setShowAddDialog(true)} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onSelect={() => onSelectSection(section.id)}
                  onToggleVisibility={() => handleToggleVisibility(section.id, section.visible)}
                  onDelete={() => onDeleteSection(section.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No sections added yet</p>
            <p className="text-xs mt-1">Click "Add Section" to get started</p>
          </div>
        )}
      </div>

      <AddSectionDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAddSection={onAddSection}
      />
    </div>
  );
};
