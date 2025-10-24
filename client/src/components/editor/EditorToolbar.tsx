import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/provider/store";
import { undo, redo } from "@/provider/slices/historySlice";
import { Button } from "@/components/ui/button";
import { ContentEditable } from "./ContentEditable";
import {
  Undo2,
  Redo2,
  Save,
  Share,
  Download,
  Palette,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Resume } from "@/types";

interface EditorToolbarProps {
  resume: Resume;
  onUpdateResume: (data: any) => void;
  onOpenSharing: () => void;
  onDownloadPDF: () => void;
  onOpenTemplateSelector: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  resume,
  onUpdateResume,
  onOpenSharing,
  onDownloadPDF,
  onOpenTemplateSelector,
  saveStatus,
  lastSaved,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { canUndo, canRedo } = useSelector((state: RootState) => state.history);

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdateResume({ title: newTitle });
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Clock className="h-4 w-4 animate-spin" />;
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Saved";
      case "error":
        return "Save failed";
      default:
        return "Not saved";
    }
  };

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
      {/* Left side - Title and save status */}
      <div className="flex items-center space-x-4">
        <ContentEditable
          value={resume.title}
          onChange={handleTitleChange}
          placeholder="Untitled Resume"
          className="text-lg font-semibold min-w-[200px]"
        />

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {getSaveStatusIcon()}
          <span>{getSaveStatusText()}</span>
          {saveStatus === "saved" && <span className="text-green-600 text-xs">Auto-saved</span>}
        </div>
      </div>

      {/* Center - Undo/Redo */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onOpenTemplateSelector} title="Change Template">
          <Palette className="h-4 w-4 mr-2" />
          Template
        </Button>

        <Button variant="ghost" size="sm" onClick={onOpenSharing} title="Share Resume">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>

        <Button variant="default" size="sm" onClick={onDownloadPDF} title="Download PDF">
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
    </div>
  );
};
