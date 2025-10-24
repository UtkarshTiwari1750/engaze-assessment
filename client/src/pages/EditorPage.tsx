import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { resumeService } from "@/services/resume.service";
import { templateService } from "@/services/template.service";
import { Button } from "@/components/ui/button";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { SectionList } from "@/components/editor/SectionList";
import { ResumeCanvas } from "@/components/editor/ResumeCanvas";
import { DesignPanel } from "@/components/editor/DesignPanel";
import { SharingDialog } from "@/components/editor/SharingDialog";
import type { RootState, AppDispatch } from "@/provider/store";
import {
  setCurrentResume,
  updateResumeLocal,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
} from "@/provider/slices/resumeSlice";
import { setCurrentDesign, updateDesignLocal } from "@/provider/slices/templateSlice";
import { undo, redo } from "@/provider/slices/historySlice";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const resumeId = parseInt(id || "0");
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [showSharingDialog, setShowSharingDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  const { currentResume } = useSelector((state: RootState) => state.resume);
  const { currentDesign } = useSelector((state: RootState) => state.template);
  const { canUndo, canRedo } = useSelector((state: RootState) => state.history);

  // Fetch resume data
  const {
    data: resume,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: () => resumeService.getResume(resumeId),
    enabled: !!resumeId,
  });

  // Fetch design data
  const { data: design } = useQuery({
    queryKey: ["design", resumeId],
    queryFn: () => templateService.getDesign(resumeId),
    enabled: !!resumeId,
  });

  // Auto-save mutations
  const updateResumeMutation = useMutation({
    mutationFn: (data: any) => resumeService.updateResume(resumeId, data),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved");
      setLastSaved(new Date());
    },
    onError: () => setSaveStatus("error"),
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: any }) =>
      resumeService.updateSection(resumeId, sectionId, data),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved");
      setLastSaved(new Date());
    },
    onError: () => setSaveStatus("error"),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ sectionId, itemId, data }: { sectionId: number; itemId: number; data: any }) =>
      resumeService.updateItem(resumeId, sectionId, itemId, data),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved");
      setLastSaved(new Date());
    },
    onError: () => setSaveStatus("error"),
  });

  const createItemMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: any }) =>
      resumeService.createItem(resumeId, sectionId, { dataJson: data || {} }),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: (item, variables) => {
      dispatch(addItem({ sectionId: variables.sectionId, item }));
      setSaveStatus("saved");
      setLastSaved(new Date());
    },
    onError: () => setSaveStatus("error"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ sectionId, itemId }: { sectionId: number; itemId: number }) =>
      resumeService.deleteItem(resumeId, sectionId, itemId),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: (_, variables) => {
      dispatch(deleteItem({ sectionId: variables.sectionId, itemId: variables.itemId }));
      setSaveStatus("saved");
      setLastSaved(new Date());
    },
    onError: () => setSaveStatus("error"),
  });

  const createSectionMutation = useMutation({
    mutationFn: ({ sectionTypeId, heading }: { sectionTypeId: number; heading: string }) =>
      resumeService.createSection(resumeId, { sectionTypeId, heading }),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: (section) => {
      dispatch(addSection(section));
      setSaveStatus("saved");
      setLastSaved(new Date());
      toast.success("Section added successfully");
    },
    onError: () => {
      setSaveStatus("error");
      toast.error("Failed to add section");
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: number) => resumeService.deleteSection(resumeId, sectionId),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: (_, sectionId) => {
      dispatch(deleteSection(sectionId));
      setSaveStatus("saved");
      setLastSaved(new Date());
    },
    onError: () => setSaveStatus("error"),
  });

  // Load resume into Redux on mount
  useEffect(() => {
    if (resume) {
      dispatch(setCurrentResume(resume));
    }
  }, [resume, dispatch]);

  // Load design into Redux
  useEffect(() => {
    if (design) {
      dispatch(setCurrentDesign(design));
    }
  }, [design, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              dispatch(redo());
            } else {
              dispatch(undo());
            }
            break;
          case "y":
            e.preventDefault();
            dispatch(redo());
            break;
          case "s":
            e.preventDefault();
            // Manual save trigger
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  // Handlers
  const handleUpdateResume = (data: any) => {
    dispatch(updateResumeLocal(data));
    updateResumeMutation.mutate(data);
  };

  const handleUpdateSection = (sectionId: number, data: any) => {
    dispatch(updateSection({ id: sectionId, ...data }));
    updateSectionMutation.mutate({ sectionId, data });
  };

  const handleUpdateItem = (sectionId: number, itemId: number, data: any) => {
    dispatch(updateItem({ sectionId, item: { id: itemId, dataJson: data } }));
    updateItemMutation.mutate({ sectionId, itemId, data: { dataJson: data } });
  };

  const handleDeleteItem = (sectionId: number, itemId: number) => {
    deleteItemMutation.mutate({ sectionId, itemId });
  };

  const handleAddItem = (sectionId: number, data?: any) => {
    createItemMutation.mutate({ sectionId, data });
  };

  const handleReorderSections = (sections: Array<{ id: number; position: number }>) => {
    dispatch(reorderSections(sections));
    resumeService.reorderSections(resumeId, sections);
  };

  const handleReorderItems = (
    sectionId: number,
    items: Array<{ id: number; position: number }>
  ) => {
    dispatch(reorderItems({ sectionId, items }));
    resumeService.reorderItems(resumeId, sectionId, items);
  };

  const handleAddSection = (sectionTypeId: number, heading: string) => {
    resumeService
      .createSection(resumeId, { sectionTypeId, heading })
      .then((section) => {
        dispatch(addSection(section));
        toast.success("Section added successfully");
      })
      .catch(() => {
        toast.error("Failed to add section");
      });
  };

  const handleDeleteSection = (sectionId: number) => {
    dispatch(deleteSection(sectionId));
    resumeService.deleteSection(resumeId, sectionId);
  };

  const handleUpdateDesign = (data: any) => {
    dispatch(updateDesignLocal(data));
    templateService.updateDesign(resumeId, data);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("resume_builder_token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentResume.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to download PDF");
      }
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading resume editor...</p>
        </div>
      </div>
    );
  }

  if (error || !resume || !currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load resume</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toolbar */}
      <EditorToolbar
        resume={currentResume}
        onUpdateResume={handleUpdateResume}
        onOpenSharing={() => setShowSharingDialog(true)}
        onDownloadPDF={handleDownloadPDF}
        onOpenTemplateSelector={() => {}}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
      />

      {/* Editor Layout */}
      <div className="flex flex-1 h-[calc(100vh-73px)]">
        {/* Left Sidebar - Sections */}
        <div className="w-64 bg-white border-r">
          <SectionList
            sections={currentResume.sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onReorderSections={handleReorderSections}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onAddSection={handleAddSection}
          />
        </div>

        {/* Main Canvas */}
        <ResumeCanvas
          resume={currentResume}
          currentDesign={currentDesign}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onUpdateSection={handleUpdateSection}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
          onReorderSections={handleReorderSections}
          onReorderItems={handleReorderItems}
        />

        {/* Right Sidebar - Design */}
        <div className="w-64">
          <DesignPanel
            resumeId={resumeId}
            currentDesign={currentDesign}
            onUpdateDesign={handleUpdateDesign}
          />
        </div>
      </div>

      {/* Sharing Dialog */}
      <SharingDialog
        isOpen={showSharingDialog}
        onClose={() => setShowSharingDialog(false)}
        resumeId={resumeId}
      />
    </div>
  );
}
