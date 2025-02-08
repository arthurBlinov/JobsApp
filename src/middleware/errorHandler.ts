import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
  });
};

export const unauthorizedError = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error("Unauthorized access");
  res.status(401); 
  next(error);
};

export const forbiddenError = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error("Forbidden: You don't have permission to access this resource");
  res.status(403); 
  next(error);
};

export const validationError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err.name === "ValidationError") {
    res.status(400).json({
      message: "Validation Error",
      details: err.message,
    });
  } else {
    next(err); 
  }
};

export const dbConnectionError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err.name === "MongoNetworkError") {
    res.status(503).json({
      message: "Database connection error",
      details: err.message,
    });
  } else {
    next(err); 
  }
};
