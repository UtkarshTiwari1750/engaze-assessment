import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  // Check if headers are already sent
  if (res.headersSent) {
    return next(error);
  }

  // Check if this is a PDF route
  const isPdfRoute = req.path.includes("/pdf") || res.locals.isBinaryResponse;

  let statusCode = 500;
  let message = "Internal server error";

  // Handle custom app errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      statusCode = 409;
      message = "Resource already exists";
    } else if (error.code === "P2025") {
      statusCode = 404;
      message = "Resource not found";
    }
  }
  // Handle validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.message;
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
  }

  // For PDF routes, return JSON error instead of HTML
  if (isPdfRoute) {
    console.error("PDF route error:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(statusCode).json({
      success: false,
      message: `PDF generation failed: ${message}`,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}
