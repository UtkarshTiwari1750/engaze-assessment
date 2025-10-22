import { Router } from "express";
import { z } from "zod";
import { SharingController } from "./sharing.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";

const router = Router();
const sharingController = new SharingController();

// Validation schemas
const createSharingLinkSchema = z.object({
  visibility: z.enum(["private", "unlisted", "public"]),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
});

const updateSharingLinkSchema = z.object({
  visibility: z.enum(["private", "unlisted", "public"]).optional(),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
});

const verifyPasswordSchema = z.object({
  password: z.string(),
});

const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});

const linkParamSchema = z.object({
  linkId: z.string().transform((val) => parseInt(val)),
});

const slugParamSchema = z.object({
  slug: z.string(),
});

// Protected routes (authenticated)
router.post(
  "/resumes/:id/share",
  authenticate,
  validateRequest({ params: idParamSchema, body: createSharingLinkSchema }),
  sharingController.createLink
);
router.get(
  "/resumes/:id/share",
  authenticate,
  validateRequest({ params: idParamSchema }),
  sharingController.listLinks
);
router.patch(
  "/share/:linkId",
  authenticate,
  validateRequest({ params: linkParamSchema, body: updateSharingLinkSchema }),
  sharingController.updateLink
);
router.delete(
  "/share/:linkId",
  authenticate,
  validateRequest({ params: linkParamSchema }),
  sharingController.deleteLink
);

// Public routes (no authentication)
router.get(
  "/share/:slug",
  validateRequest({ params: slugParamSchema }),
  sharingController.getPublicResume
);
router.post(
  "/share/:slug/verify",
  validateRequest({ params: slugParamSchema, body: verifyPasswordSchema }),
  sharingController.verifyPassword
);

export default router;
