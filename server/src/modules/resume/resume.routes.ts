import { Router } from "express";
import { z } from "zod";
import { ResumeController } from "./resume.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";

const router = Router();
const resumeController = new ResumeController();

// Validation schemas
const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  templateId: z.number().optional(),
  themeId: z.number().optional(),
});

const updateResumeSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

const createSectionSchema = z.object({
  sectionTypeId: z.number(),
  heading: z.string().min(1, "Heading is required"),
  position: z.number().optional(),
});

const updateSectionSchema = z.object({
  heading: z.string().min(1).optional(),
  visible: z.boolean().optional(),
  layoutConfig: z.any().optional(),
});

const reorderSectionsSchema = z.object({
  sections: z.array(
    z.object({
      id: z.number(),
      position: z.number(),
    })
  ),
});

const createItemSchema = z.object({
  dataJson: z.any(),
  position: z.number().optional(),
});

const updateItemSchema = z.object({
  dataJson: z.any().optional(),
});

const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      position: z.number(),
    })
  ),
});

const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});

const sectionParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
  sectionId: z.string().transform((val) => parseInt(val)),
});

const itemParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
  sectionId: z.string().transform((val) => parseInt(val)),
  itemId: z.string().transform((val) => parseInt(val)),
});

// Apply authentication to all routes
router.use(authenticate);

// Resume routes
router.get("/resumes", resumeController.listResumes);
router.post(
  "/resumes",
  validateRequest({ body: createResumeSchema }),
  resumeController.createResume
);
router.get("/resumes/:id", validateRequest({ params: idParamSchema }), resumeController.getResume);
router.patch(
  "/resumes/:id",
  validateRequest({ params: idParamSchema, body: updateResumeSchema }),
  resumeController.updateResume
);
router.delete(
  "/resumes/:id",
  validateRequest({ params: idParamSchema }),
  resumeController.deleteResume
);

// Section routes
router.get("/section-types", resumeController.getSectionTypes);
router.post(
  "/resumes/:id/sections",
  validateRequest({ params: idParamSchema, body: createSectionSchema }),
  resumeController.createSection
);
router.patch(
  "/resumes/:id/sections/:sectionId",
  validateRequest({ params: sectionParamSchema, body: updateSectionSchema }),
  resumeController.updateSection
);
router.delete(
  "/resumes/:id/sections/:sectionId",
  validateRequest({ params: sectionParamSchema }),
  resumeController.deleteSection
);
router.put(
  "/resumes/:id/sections/reorder",
  validateRequest({ params: idParamSchema, body: reorderSectionsSchema }),
  resumeController.reorderSections
);

// Item routes
router.post(
  "/resumes/:id/sections/:sectionId/items",
  validateRequest({ params: sectionParamSchema, body: createItemSchema }),
  resumeController.createItem
);
router.patch(
  "/resumes/:id/sections/:sectionId/items/:itemId",
  validateRequest({ params: itemParamSchema, body: updateItemSchema }),
  resumeController.updateItem
);
router.delete(
  "/resumes/:id/sections/:sectionId/items/:itemId",
  validateRequest({ params: itemParamSchema }),
  resumeController.deleteItem
);
router.put(
  "/resumes/:id/sections/:sectionId/items/reorder",
  validateRequest({ params: sectionParamSchema, body: reorderItemsSchema }),
  resumeController.reorderItems
);

export default router;
