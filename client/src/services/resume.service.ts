import axios from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api.config";
import type {
  Resume,
  ResumeListItem,
  Section,
  SectionItem,
  SectionType,
  CreateResumeForm,
  UpdateResumeForm,
  CreateSectionForm,
  UpdateSectionForm,
  ApiResponse,
} from "@/types";

export const resumeService = {
  // Resume operations
  async getResumes(page = 1, limit = 10): Promise<{ resumes: ResumeListItem[]; total: number }> {
    const response = await axios.get<ApiResponse<{ resumes: ResumeListItem[]; total: number }>>(
      API_ENDPOINTS.resumes.list,
      { params: { page, limit } }
    );
    return response.data.data;
  },

  async getResume(id: number): Promise<Resume> {
    const response = await axios.get<ApiResponse<Resume>>(API_ENDPOINTS.resumes.get(id));
    return response.data.data;
  },

  async createResume(data: CreateResumeForm): Promise<Resume> {
    const response = await axios.post<ApiResponse<Resume>>(API_ENDPOINTS.resumes.create, data);
    return response.data.data;
  },

  async updateResume(id: number, data: UpdateResumeForm): Promise<Resume> {
    const response = await axios.patch<ApiResponse<Resume>>(API_ENDPOINTS.resumes.update(id), data);
    return response.data.data;
  },

  async deleteResume(id: number): Promise<void> {
    await axios.delete(API_ENDPOINTS.resumes.delete(id));
  },

  // Section operations
  async getSectionTypes(): Promise<SectionType[]> {
    const response = await axios.get<ApiResponse<SectionType[]>>(API_ENDPOINTS.sections.types);
    return response.data.data;
  },

  async createSection(resumeId: number, data: CreateSectionForm): Promise<Section> {
    const response = await axios.post<ApiResponse<Section>>(
      API_ENDPOINTS.sections.create(resumeId),
      data
    );
    return response.data.data;
  },

  async updateSection(
    resumeId: number,
    sectionId: number,
    data: UpdateSectionForm
  ): Promise<Section> {
    const response = await axios.patch<ApiResponse<Section>>(
      API_ENDPOINTS.sections.update(resumeId, sectionId),
      data
    );
    return response.data.data;
  },

  async deleteSection(resumeId: number, sectionId: number): Promise<void> {
    await axios.delete(API_ENDPOINTS.sections.delete(resumeId, sectionId));
  },

  async reorderSections(
    resumeId: number,
    sections: Array<{ id: number; position: number }>
  ): Promise<void> {
    await axios.put(API_ENDPOINTS.sections.reorder(resumeId), { sections });
  },

  // Item operations
  async createItem(
    resumeId: number,
    sectionId: number,
    data: { dataJson: any; position?: number }
  ): Promise<SectionItem> {
    const response = await axios.post<ApiResponse<SectionItem>>(
      API_ENDPOINTS.items.create(resumeId, sectionId),
      data
    );
    return response.data.data;
  },

  async updateItem(
    resumeId: number,
    sectionId: number,
    itemId: number,
    data: { dataJson?: any }
  ): Promise<SectionItem> {
    const response = await axios.patch<ApiResponse<SectionItem>>(
      API_ENDPOINTS.items.update(resumeId, sectionId, itemId),
      data
    );
    return response.data.data;
  },

  async deleteItem(resumeId: number, sectionId: number, itemId: number): Promise<void> {
    await axios.delete(API_ENDPOINTS.items.delete(resumeId, sectionId, itemId));
  },

  async reorderItems(
    resumeId: number,
    sectionId: number,
    items: Array<{ id: number; position: number }>
  ): Promise<void> {
    await axios.put(API_ENDPOINTS.items.reorder(resumeId, sectionId), { items });
  },
};
