import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ValidationError } from "./error.middleware";

interface ValidationOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validateRequest(options: ValidationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.body) {
        req.body = options.body.parse(req.body);
      }

      if (options.params) {
        req.params = options.params.parse(req.params);
      }

      if (options.query) {
        req.query = options.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        next(new ValidationError(messages.join(", ")));
      } else {
        next(error);
      }
    }
  };
}
