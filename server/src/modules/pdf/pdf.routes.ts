import { Router } from "express";
import { z } from "zod";
import { PDFController } from "./pdf.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";

const router = Router();
const pdfController = new PDFController();

// Validation schemas
const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});

const slugParamSchema = z.object({
  slug: z.string(),
});

const passwordSchema = z.object({
  password: z.string().optional(),
});

// Protected routes
router.get(
  "/resumes/:id/pdf",
  authenticate,
  validateRequest({ params: idParamSchema }),
  pdfController.downloadPDF
);

// Public routes
router.post(
  "/share/:slug/pdf",
  validateRequest({ params: slugParamSchema, body: passwordSchema }),
  pdfController.downloadPublicPDF
);

export default router;
