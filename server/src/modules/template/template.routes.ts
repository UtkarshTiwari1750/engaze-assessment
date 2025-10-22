import { Router } from "express";
import { z } from "zod";
import { TemplateController } from "./template.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";

const router = Router();
const templateController = new TemplateController();

// Validation schemas
const applyTemplateSchema = z.object({
  templateId: z.number(),
  themeId: z.number().optional(),
});

const updateDesignSchema = z.object({
  templateId: z.number().optional(),
  themeId: z.number().optional(),
  customOverrides: z.any().optional(),
});

const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});

// Public routes
router.get("/templates", templateController.listTemplates);
router.get(
  "/templates/:id",
  validateRequest({ params: idParamSchema }),
  templateController.getTemplate
);

// Protected routes
router.post(
  "/resumes/:id/template",
  authenticate,
  validateRequest({ params: idParamSchema, body: applyTemplateSchema }),
  templateController.applyTemplate
);
router.patch(
  "/resumes/:id/design",
  authenticate,
  validateRequest({ params: idParamSchema, body: updateDesignSchema }),
  templateController.updateDesign
);
router.get(
  "/resumes/:id/design",
  authenticate,
  validateRequest({ params: idParamSchema }),
  templateController.getDesign
);

export default router;
