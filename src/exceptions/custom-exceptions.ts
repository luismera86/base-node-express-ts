import  { NextFunction, Request, Response } from "express";
import { LoggerService } from "../common/utils/logger";
const logger = new LoggerService("Custom Exceptions");
export const customExceptions = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  if (statusCode === 500) {
    logger.error(message);
  }
  logger.error(err);
  res.status(statusCode).json({ status: "error", statusCode, message });
};
