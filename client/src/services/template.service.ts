import axios from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api.config";
import type { Template, DesignConfig, ApiResponse } from "@/types";

export const templateService = {
  async getTemplates(): Promise<Template[]> {
    const response = await axios.get<ApiResponse<Template[]>>(API_ENDPOINTS.templates.list);
    return response.data.data;
  },

  async getTemplate(id: number): Promise<Template> {
    const response = await axios.get<ApiResponse<Template>>(API_ENDPOINTS.templates.get(id));
    return response.data.data;
  },

  async applyTemplate(resumeId: number, templateId: number, themeId?: number): Promise<void> {
    await axios.post(API_ENDPOINTS.templates.apply(resumeId), {
      templateId,
      themeId,
    });
  },

  async updateDesign(
    resumeId: number,
    data: {
      templateId?: number;
      themeId?: number;
      customOverrides?: any;
    }
  ): Promise<void> {
    await axios.patch(API_ENDPOINTS.templates.design.update(resumeId), data);
  },

  async getDesign(resumeId: number): Promise<DesignConfig> {
    const response = await axios.get<ApiResponse<DesignConfig>>(
      API_ENDPOINTS.templates.design.get(resumeId)
    );
    return response.data.data;
  },
};
