// User types
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

// Resume types
export interface Resume {
  id: number;
  userId: number;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  sections: Section[];
  template?: ResumeTemplate;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

// Section types
export interface Section {
  id: number;
  resumeId: number;
  sectionTypeId: number;
  heading: string;
  position: number;
  visible: boolean;
  layoutConfig: any;
  items: SectionItem[];
  sectionType: SectionType;
}

export interface SectionItem {
  id: number;
  sectionId: number;
  position: number;
  dataJson: any;
}

export interface SectionType {
  id: number;
  key: string;
  name: string;
  isSingleton: boolean;
  defaultFields: any;
}

// Template types
export interface Template {
  id: number;
  key: string;
  name: string;
  description?: string;
  previewImage?: string;
  layoutConfig: any;
  themes: Theme[];
}

export interface Theme {
  id: number;
  templateId: number;
  name: string;
  colorScheme: any;
  typography: any;
  spacing: any;
}

export interface ResumeTemplate {
  templateId: number;
  themeId?: number;
  customOverrides: any;
}

export interface DesignConfig {
  templateId: number;
  themeId?: number;
  customOverrides: any;
  template: Template;
  theme?: Theme;
}

// Sharing types
export interface SharingLink {
  id: number;
  resumeId: number;
  slug: string;
  visibility: "private" | "unlisted" | "public";
  expiresAt?: string;
  createdAt: string;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  name: string;
  password: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Form types
export interface CreateResumeForm {
  title: string;
  templateId?: number;
  themeId?: number;
}

export interface UpdateResumeForm {
  title?: string;
  status?: string;
}

export interface CreateSectionForm {
  sectionTypeId: number;
  heading: string;
  position?: number;
}

export interface UpdateSectionForm {
  heading?: string;
  visible?: boolean;
  layoutConfig?: any;
}

export interface CreateSharingLinkForm {
  visibility: "private" | "unlisted" | "public";
  password?: string;
  expiresAt?: string;
}
