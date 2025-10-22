export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: "resume_builder_token",
  RESUME_DRAFT: "resume_draft_",
  USER_PREFERENCES: "user_preferences",
} as const;

export const DEBOUNCE_DELAYS = {
  AUTO_SAVE: 1000,
  SEARCH: 300,
} as const;

export const MAX_UNDO_HISTORY = 50;

export const DEFAULT_TEMPLATE_ID = 1;
export const DEFAULT_THEME_ID = 1;

export const SECTION_TYPES = {
  SUMMARY: "summary",
  EXPERIENCE: "experience",
  EDUCATION: "education",
  SKILLS: "skills",
  PROJECTS: "projects",
  CERTIFICATIONS: "certifications",
  AWARDS: "awards",
  VOLUNTEER: "volunteer",
  LANGUAGES: "languages",
  CUSTOM: "custom",
} as const;

export const RESUME_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const SHARING_VISIBILITY = {
  PRIVATE: "private",
  UNLISTED: "unlisted",
  PUBLIC: "public",
} as const;
