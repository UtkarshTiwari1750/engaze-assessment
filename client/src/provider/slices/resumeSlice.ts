import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { resumeService } from "@/services/resume.service";
import type {
  Resume,
  ResumeListItem,
  Section,
  SectionItem,
  CreateResumeForm,
  UpdateResumeForm,
} from "@/types";

interface ResumeState {
  currentResume: Resume | null;
  resumes: ResumeListItem[];
  totalResumes: number;
  loading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  currentResume: null,
  resumes: [],
  totalResumes: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchResumesThunk = createAsyncThunk(
  "resume/fetchResumes",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await resumeService.getResumes(page, limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch resumes");
    }
  }
);

export const fetchResumeThunk = createAsyncThunk(
  "resume/fetchResume",
  async (id: number, { rejectWithValue }) => {
    try {
      return await resumeService.getResume(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch resume");
    }
  }
);

export const createResumeThunk = createAsyncThunk(
  "resume/createResume",
  async (data: CreateResumeForm, { rejectWithValue }) => {
    try {
      return await resumeService.createResume(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create resume");
    }
  }
);

export const updateResumeThunk = createAsyncThunk(
  "resume/updateResume",
  async ({ id, data }: { id: number; data: UpdateResumeForm }, { rejectWithValue }) => {
    try {
      return await resumeService.updateResume(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update resume");
    }
  }
);

export const deleteResumeThunk = createAsyncThunk(
  "resume/deleteResume",
  async (id: number, { rejectWithValue }) => {
    try {
      await resumeService.deleteResume(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete resume");
    }
  }
);

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setCurrentResume: (state, action: PayloadAction<Resume | null>) => {
      state.currentResume = action.payload;
    },
    updateResumeLocal: (state, action: PayloadAction<Partial<Resume>>) => {
      if (state.currentResume) {
        state.currentResume = { ...state.currentResume, ...action.payload };
      }
    },
    addSection: (state, action: PayloadAction<Section>) => {
      if (state.currentResume) {
        state.currentResume.sections.push(action.payload);
        // Sort by position
        state.currentResume.sections.sort((a, b) => a.position - b.position);
      }
    },
    updateSection: (state, action: PayloadAction<Section>) => {
      if (state.currentResume) {
        const index = state.currentResume.sections.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.currentResume.sections[index] = action.payload;
        }
      }
    },
    deleteSection: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.sections = state.currentResume.sections.filter(
          (s) => s.id !== action.payload
        );
      }
    },
    reorderSections: (state, action: PayloadAction<Array<{ id: number; position: number }>>) => {
      if (state.currentResume) {
        action.payload.forEach(({ id, position }) => {
          const section = state.currentResume!.sections.find((s) => s.id === id);
          if (section) {
            section.position = position;
          }
        });
        // Sort by position
        state.currentResume.sections.sort((a, b) => a.position - b.position);
      }
    },
    addItem: (state, action: PayloadAction<{ sectionId: number; item: SectionItem }>) => {
      if (state.currentResume) {
        const section = state.currentResume.sections.find((s) => s.id === action.payload.sectionId);
        if (section) {
          section.items.push(action.payload.item);
          // Sort by position
          section.items.sort((a, b) => a.position - b.position);
        }
      }
    },
    updateItem: (state, action: PayloadAction<{ sectionId: number; item: SectionItem }>) => {
      if (state.currentResume) {
        const section = state.currentResume.sections.find((s) => s.id === action.payload.sectionId);
        if (section) {
          const index = section.items.findIndex((i) => i.id === action.payload.item.id);
          if (index !== -1) {
            section.items[index] = action.payload.item;
          }
        }
      }
    },
    deleteItem: (state, action: PayloadAction<{ sectionId: number; itemId: number }>) => {
      if (state.currentResume) {
        const section = state.currentResume.sections.find((s) => s.id === action.payload.sectionId);
        if (section) {
          section.items = section.items.filter((i) => i.id !== action.payload.itemId);
        }
      }
    },
    reorderItems: (
      state,
      action: PayloadAction<{ sectionId: number; items: Array<{ id: number; position: number }> }>
    ) => {
      if (state.currentResume) {
        const section = state.currentResume.sections.find((s) => s.id === action.payload.sectionId);
        if (section) {
          action.payload.items.forEach(({ id, position }) => {
            const item = section.items.find((i) => i.id === id);
            if (item) {
              item.position = position;
            }
          });
          // Sort by position
          section.items.sort((a, b) => a.position - b.position);
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch resumes
    builder
      .addCase(fetchResumesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResumesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.resumes = action.payload.resumes;
        state.totalResumes = action.payload.total;
      })
      .addCase(fetchResumesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch resume
    builder
      .addCase(fetchResumeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResumeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResume = action.payload;
      })
      .addCase(fetchResumeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create resume
    builder
      .addCase(createResumeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResumeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResume = action.payload;
        // Add to resumes list
        state.resumes.unshift({
          id: action.payload.id,
          title: action.payload.title,
          slug: action.payload.slug,
          status: action.payload.status,
          updatedAt: action.payload.updatedAt,
        });
      })
      .addCase(createResumeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update resume
    builder
      .addCase(updateResumeThunk.fulfilled, (state, action) => {
        state.currentResume = action.payload;
        // Update in resumes list
        const index = state.resumes.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.resumes[index] = {
            id: action.payload.id,
            title: action.payload.title,
            slug: action.payload.slug,
            status: action.payload.status,
            updatedAt: action.payload.updatedAt,
          };
        }
      })
      .addCase(updateResumeThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete resume
    builder
      .addCase(deleteResumeThunk.fulfilled, (state, action) => {
        state.resumes = state.resumes.filter((r) => r.id !== action.payload);
        if (state.currentResume?.id === action.payload) {
          state.currentResume = null;
        }
      })
      .addCase(deleteResumeThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
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
  clearError,
} = resumeSlice.actions;

export default resumeSlice.reducer;
