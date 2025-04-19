import e, { NextFunction, Request, Response } from "express";

export const customExceptions = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  res.status(statusCode).json({ status: "error", statusCode, message });
};
