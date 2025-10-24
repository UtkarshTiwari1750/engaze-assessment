import React from "react";
import { ContentEditable } from "@/components/editor/ContentEditable";
import type { SectionItem } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface SummarySectionProps {
  items: SectionItem[];
  onUpdateItem: (itemId: number, data: any) => void;
  onAddItem?: () => void;
  className?: string;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  items,
  onUpdateItem,
  onAddItem,
  className = "",
}) => {
  const summaryItem = items[0];
  const summaryText = summaryItem?.dataJson?.text || "";

  const debouncedText = useDebounce(summaryText, 500);

  React.useEffect(() => {
    if (summaryItem && debouncedText !== summaryItem.dataJson?.text) {
      onUpdateItem(summaryItem.id, { text: debouncedText });
    }
  }, [debouncedText, summaryItem, onUpdateItem]);

  const handleTextChange = (newText: string) => {
    if (summaryItem) {
      onUpdateItem(summaryItem.id, { text: newText });
    } else if (onAddItem && newText.trim()) {
      // Create new item with the text
      onAddItem({ text: newText });
    }
  };

  return (
    <div className={className}>
      <ContentEditable
        value={summaryText}
        onChange={handleTextChange}
        placeholder="Write a brief professional summary highlighting your key qualifications and career objectives..."
        multiline={true}
        className="text-sm leading-relaxed"
      />
    </div>
  );
};
