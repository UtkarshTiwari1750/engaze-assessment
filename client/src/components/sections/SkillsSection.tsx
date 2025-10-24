import React from "react";
import { ContentEditable } from "@/components/editor/ContentEditable";
import type { SectionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";

interface SkillsSectionProps {
  items: SectionItem[];
  onUpdateItem: (itemId: number, data: any) => void;
  onAddItem: () => void;
  className?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  items,
  onUpdateItem,
  onAddItem,
  className = "",
}) => {
  const skillsItem = items[0];
  const skillsData = skillsItem?.dataJson || { categories: [{ name: "", skills: [] }] };

  const updateSkillsData = (newData: any) => {
    if (skillsItem) {
      onUpdateItem(skillsItem.id, newData);
    } else {
      onAddItem({ categories: [{ name: "", skills: [] }] });
    }
  };

  const addCategory = () => {
    const categories = [...skillsData.categories, { name: "", skills: [""] }];
    updateSkillsData({ categories });
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const categories = [...skillsData.categories];
    categories[index] = { ...categories[index], [field]: value };
    updateSkillsData({ categories });
  };

  const removeCategory = (index: number) => {
    const categories = [...skillsData.categories];
    categories.splice(index, 1);
    updateSkillsData({ categories });
  };

  const addSkill = (categoryIndex: number) => {
    const categories = [...skillsData.categories];
    categories[categoryIndex].skills.push("");
    updateSkillsData({ categories });
  };

  const updateSkill = (categoryIndex: number, skillIndex: number, value: string) => {
    const categories = [...skillsData.categories];
    categories[categoryIndex].skills[skillIndex] = value;
    updateSkillsData({ categories });
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const categories = [...skillsData.categories];
    categories[categoryIndex].skills.splice(skillIndex, 1);
    updateSkillsData({ categories });
  };

  return (
    <div className={className}>
      {skillsData.categories.map((category: any, categoryIndex: number) => (
        <div key={categoryIndex} className="border rounded-lg p-4 mb-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <ContentEditable
              value={category.name || ""}
              onChange={(value) => updateCategory(categoryIndex, "name", value)}
              placeholder="Category Name (e.g., Technical Skills)"
              className="font-semibold text-lg flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCategory(categoryIndex)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Skills</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addSkill(categoryIndex)}
                className="text-blue-600"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill: string, skillIndex: number) => (
                <div
                  key={skillIndex}
                  className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                >
                  <ContentEditable
                    value={skill}
                    onChange={(value) => updateSkill(categoryIndex, skillIndex, value)}
                    placeholder="Skill name"
                    className="bg-transparent min-w-[60px]"
                  />
                  <button
                    onClick={() => removeSkill(categoryIndex, skillIndex)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {category.skills.length === 0 && (
              <p className="text-gray-500 text-sm italic">No skills added yet</p>
            )}
          </div>
        </div>
      ))}

      {skillsData.categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No skill categories added yet</p>
        </div>
      )}

      <Button variant="outline" onClick={addCategory} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />
        Add Skill Category
      </Button>
    </div>
  );
};
