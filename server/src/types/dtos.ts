// Auth DTOs
export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
}

// Resume DTOs
export interface CreateResumeDto {
  title: string;
  templateId?: number;
  themeId?: number;
}

export interface UpdateResumeDto {
  title?: string;
  status?: string;
}

export interface ResumeResponseDto {
  id: number;
  userId: number;
  title: string;
  slug: string;
  status: string;
  sections: SectionResponseDto[];
  template?: {
    templateId: number;
    themeId?: number;
    customOverrides: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListItemDto {
  id: number;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

// Section DTOs
export interface CreateSectionDto {
  sectionTypeId: number;
  heading: string;
  position?: number;
}

export interface UpdateSectionDto {
  heading?: string;
  visible?: boolean;
  layoutConfig?: any;
}

export interface ReorderSectionsDto {
  sections: Array<{
    id: number;
    position: number;
  }>;
}

export interface SectionResponseDto {
  id: number;
  sectionTypeId: number;
  heading: string;
  position: number;
  visible: boolean;
  layoutConfig: any;
  items: SectionItemResponseDto[];
  sectionType: {
    key: string;
    name: string;
    isSingleton: boolean;
  };
}

// Section Item DTOs
export interface CreateItemDto {
  dataJson: any;
  position?: number;
}

export interface UpdateItemDto {
  dataJson?: any;
}

export interface ReorderItemsDto {
  items: Array<{
    id: number;
    position: number;
  }>;
}

export interface SectionItemResponseDto {
  id: number;
  position: number;
  dataJson: any;
}

// Template DTOs
export interface TemplateResponseDto {
  id: number;
  key: string;
  name: string;
  description?: string;
  previewImage?: string;
  layoutConfig: any;
  themes: ThemeResponseDto[];
}

export interface ThemeResponseDto {
  id: number;
  templateId: number;
  name: string;
  colorScheme: any;
  typography: any;
  spacing: any;
}

// Design DTOs
export interface UpdateDesignDto {
  templateId?: number;
  themeId?: number;
  customOverrides?: any;
}

export interface DesignResponseDto {
  templateId: number;
  themeId?: number;
  customOverrides: any;
  template: TemplateResponseDto;
  theme?: ThemeResponseDto;
}

// Sharing DTOs
export interface CreateSharingLinkDto {
  visibility: "private" | "unlisted" | "public";
  password?: string;
  expiresAt?: string;
}

export interface UpdateSharingLinkDto {
  visibility?: "private" | "unlisted" | "public";
  password?: string;
  expiresAt?: string;
}

export interface SharingLinkResponseDto {
  id: number;
  resumeId: number;
  slug: string;
  visibility: string;
  expiresAt?: string;
  createdAt: string;
}
