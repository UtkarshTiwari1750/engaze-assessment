import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sharingService } from "@/services/sharing.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Eye, EyeOff, Lock, Globe, Users, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { CreateSharingLinkForm } from "@/types";

interface SharingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: number;
}

export const SharingDialog: React.FC<SharingDialogProps> = ({ isOpen, onClose, resumeId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLinkData, setNewLinkData] = useState<CreateSharingLinkForm>({
    visibility: "unlisted",
    password: "",
    expiresAt: "",
  });

  const queryClient = useQueryClient();

  const { data: sharingLinks, isLoading } = useQuery({
    queryKey: ["sharing-links", resumeId],
    queryFn: () => sharingService.getSharingLinks(resumeId),
    enabled: isOpen,
  });

  const createLinkMutation = useMutation({
    mutationFn: (data: CreateSharingLinkForm) => sharingService.createSharingLink(resumeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sharing-links", resumeId] });
      setShowCreateForm(false);
      setNewLinkData({ visibility: "unlisted", password: "", expiresAt: "" });
      toast.success("Sharing link created successfully");
    },
    onError: () => {
      toast.error("Failed to create sharing link");
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: number) => sharingService.deleteSharingLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sharing-links", resumeId] });
      toast.success("Sharing link deleted");
    },
    onError: () => {
      toast.error("Failed to delete sharing link");
    },
  });

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    createLinkMutation.mutate(newLinkData);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "unlisted":
        return <Users className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "Public";
      case "unlisted":
        return "Unlisted";
      default:
        return "Private";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Resume</DialogTitle>
          <DialogDescription>
            Create shareable links to let others view your resume
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Links */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Sharing Links</h4>
              <Button onClick={() => setShowCreateForm(true)} size="sm" disabled={showCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Link
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading sharing links...</div>
            ) : sharingLinks && sharingLinks.length > 0 ? (
              <div className="space-y-3">
                {sharingLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getVisibilityIcon(link.visibility)}
                      <div>
                        <div className="font-medium text-sm">
                          {getVisibilityLabel(link.visibility)} Link
                        </div>
                        <div className="text-xs text-gray-500">
                          Created {new Date(link.createdAt).toLocaleDateString()}
                          {link.expiresAt && (
                            <span> • Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(link.slug)}>
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/share/${link.slug}`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLinkMutation.mutate(link.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sharing links created yet</p>
                <p className="text-sm mt-1">Create a link to share your resume</p>
              </div>
            )}
          </div>

          {/* Create New Link Form */}
          {showCreateForm && (
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Create New Sharing Link</h4>

              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <select
                    id="visibility"
                    value={newLinkData.visibility}
                    onChange={(e) =>
                      setNewLinkData({
                        ...newLinkData,
                        visibility: e.target.value as any,
                      })
                    }
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="private">Private - Only you can access</option>
                    <option value="unlisted">Unlisted - Anyone with link can access</option>
                    <option value="public">Public - Discoverable by search engines</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="password">Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newLinkData.password}
                    onChange={(e) =>
                      setNewLinkData({
                        ...newLinkData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Leave empty for no password"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newLinkData.expiresAt}
                    onChange={(e) =>
                      setNewLinkData({
                        ...newLinkData,
                        expiresAt: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLinkMutation.isPending}>
                    {createLinkMutation.isPending ? "Creating..." : "Create Link"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
