export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3004";

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    me: "/api/auth/me",
  },

  // Resume endpoints
  resumes: {
    list: "/api/resumes",
    create: "/api/resumes",
    get: (id: number) => `/api/resumes/${id}`,
    update: (id: number) => `/api/resumes/${id}`,
    delete: (id: number) => `/api/resumes/${id}`,
    pdf: (id: number) => `/api/resumes/${id}/pdf`,
  },

  // Section endpoints
  sections: {
    types: "/api/section-types",
    create: (resumeId: number) => `/api/resumes/${resumeId}/sections`,
    update: (resumeId: number, sectionId: number) =>
      `/api/resumes/${resumeId}/sections/${sectionId}`,
    delete: (resumeId: number, sectionId: number) =>
      `/api/resumes/${resumeId}/sections/${sectionId}`,
    reorder: (resumeId: number) => `/api/resumes/${resumeId}/sections/reorder`,
  },

  // Item endpoints
  items: {
    create: (resumeId: number, sectionId: number) =>
      `/api/resumes/${resumeId}/sections/${sectionId}/items`,
    update: (resumeId: number, sectionId: number, itemId: number) =>
      `/api/resumes/${resumeId}/sections/${sectionId}/items/${itemId}`,
    delete: (resumeId: number, sectionId: number, itemId: number) =>
      `/api/resumes/${resumeId}/sections/${sectionId}/items/${itemId}`,
    reorder: (resumeId: number, sectionId: number) =>
      `/api/resumes/${resumeId}/sections/${sectionId}/items/reorder`,
  },

  // Template endpoints
  templates: {
    list: "/api/templates",
    get: (id: number) => `/api/templates/${id}`,
    apply: (resumeId: number) => `/api/resumes/${resumeId}/template`,
    design: {
      get: (resumeId: number) => `/api/resumes/${resumeId}/design`,
      update: (resumeId: number) => `/api/resumes/${resumeId}/design`,
    },
  },

  // Sharing endpoints
  sharing: {
    create: (resumeId: number) => `/api/resumes/${resumeId}/share`,
    list: (resumeId: number) => `/api/resumes/${resumeId}/share`,
    update: (linkId: number) => `/api/share/${linkId}`,
    delete: (linkId: number) => `/api/share/${linkId}`,
    public: (slug: string) => `/api/share/${slug}`,
    verify: (slug: string) => `/api/share/${slug}/verify`,
    pdf: (slug: string) => `/api/share/${slug}/pdf`,
  },
};
