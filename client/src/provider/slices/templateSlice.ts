import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { templateService } from "@/services/template.service";
import type { Template, DesignConfig } from "@/types";

interface TemplateState {
  templates: Template[];
  currentDesign: DesignConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: TemplateState = {
  templates: [],
  currentDesign: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTemplatesThunk = createAsyncThunk(
  "template/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      return await templateService.getTemplates();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch templates");
    }
  }
);

export const applyTemplateThunk = createAsyncThunk(
  "template/applyTemplate",
  async (
    { resumeId, templateId, themeId }: { resumeId: number; templateId: number; themeId?: number },
    { rejectWithValue }
  ) => {
    try {
      await templateService.applyTemplate(resumeId, templateId, themeId);
      return { templateId, themeId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to apply template");
    }
  }
);

export const updateDesignThunk = createAsyncThunk(
  "template/updateDesign",
  async ({ resumeId, data }: { resumeId: number; data: any }, { rejectWithValue }) => {
    try {
      await templateService.updateDesign(resumeId, data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update design");
    }
  }
);

export const fetchDesignThunk = createAsyncThunk(
  "template/fetchDesign",
  async (resumeId: number, { rejectWithValue }) => {
    try {
      return await templateService.getDesign(resumeId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch design");
    }
  }
);

const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
    setCurrentDesign: (state, action: PayloadAction<DesignConfig | null>) => {
      state.currentDesign = action.payload;
    },
    updateDesignLocal: (state, action: PayloadAction<Partial<DesignConfig>>) => {
      if (state.currentDesign) {
        state.currentDesign = { ...state.currentDesign, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch templates
    builder
      .addCase(fetchTemplatesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplatesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplatesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Apply template
    builder
      .addCase(applyTemplateThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyTemplateThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentDesign) {
          state.currentDesign.templateId = action.payload.templateId;
          if (action.payload.themeId) {
            state.currentDesign.themeId = action.payload.themeId;
          }
        }
      })
      .addCase(applyTemplateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update design
    builder
      .addCase(updateDesignThunk.fulfilled, (state, action) => {
        if (state.currentDesign) {
          state.currentDesign = { ...state.currentDesign, ...action.payload };
        }
      })
      .addCase(updateDesignThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch design
    builder
      .addCase(fetchDesignThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDesign = action.payload;
      })
      .addCase(fetchDesignThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTemplates, setCurrentDesign, updateDesignLocal, clearError } =
  templateSlice.actions;
export default templateSlice.reducer;
