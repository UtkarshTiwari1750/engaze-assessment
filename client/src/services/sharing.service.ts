import axios from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api.config";
import type { SharingLink, Resume, CreateSharingLinkForm, ApiResponse } from "@/types";

export const sharingService = {
  async createSharingLink(resumeId: number, data: CreateSharingLinkForm): Promise<SharingLink> {
    const response = await axios.post<ApiResponse<SharingLink>>(
      API_ENDPOINTS.sharing.create(resumeId),
      data
    );
    return response.data.data;
  },

  async getSharingLinks(resumeId: number): Promise<SharingLink[]> {
    const response = await axios.get<ApiResponse<SharingLink[]>>(
      API_ENDPOINTS.sharing.list(resumeId)
    );
    return response.data.data;
  },

  async updateSharingLink(
    linkId: number,
    data: Partial<CreateSharingLinkForm>
  ): Promise<SharingLink> {
    const response = await axios.patch<ApiResponse<SharingLink>>(
      API_ENDPOINTS.sharing.update(linkId),
      data
    );
    return response.data.data;
  },

  async deleteSharingLink(linkId: number): Promise<void> {
    await axios.delete(API_ENDPOINTS.sharing.delete(linkId));
  },

  async getPublicResume(slug: string, password?: string): Promise<Resume> {
    const response = await axios.get<ApiResponse<Resume>>(
      API_ENDPOINTS.sharing.public(slug),
      password ? { data: { password } } : undefined
    );
    return response.data.data;
  },

  async verifyPassword(slug: string, password: string): Promise<boolean> {
    const response = await axios.post<ApiResponse<{ valid: boolean }>>(
      API_ENDPOINTS.sharing.verify(slug),
      { password }
    );
    return response.data.data.valid;
  },

  async downloadPublicPdf(slug: string, password?: string): Promise<void> {
    try {
      const response = await axios.post(
        API_ENDPOINTS.sharing.pdf(slug),
        password ? { password } : {},
        {
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      // Check if response is HTML error instead of PDF
      if (response.headers["content-type"]?.includes("text/html")) {
        throw new Error("Server returned HTML instead of PDF");
      }

      // Verify blob is valid
      const blob = new Blob([response.data], { type: "application/pdf" });
      if (blob.size === 0) {
        throw new Error("PDF file is empty");
      }

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`PDF download failed: ${error.message}`);
      }
      throw new Error("PDF download failed: Unknown error");
    }
  },
};
