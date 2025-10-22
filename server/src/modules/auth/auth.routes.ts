import { Router } from "express";
import { z } from "zod";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";

const router = Router();
const authController = new AuthController();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Routes
router.post("/register", validateRequest({ body: registerSchema }), authController.register);
router.post("/login", validateRequest({ body: loginSchema }), authController.login);
router.get("/me", authenticate, authController.me);

export default router;
