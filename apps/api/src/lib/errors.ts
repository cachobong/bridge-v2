import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = (message = "Authentication required") => new AppError(401, "unauthorized", message);
export const forbidden = (message = "Permission denied") => new AppError(403, "forbidden", message);
export const notFound = (message = "Not found") => new AppError(404, "not_found", message);
export const conflict = (message: string) => new AppError(409, "conflict", message);
export const badRequest = (message: string) => new AppError(400, "bad_request", message);

// Maps a PostgREST error to an AppError. Unknown errors become 500.
export function fromDbError(error: { code?: string; message: string }): AppError {
  if (error.code === "23505") return conflict("A record with the same unique value already exists");
  if (error.code === "23514" || error.code === "22P02") return badRequest(error.message);
  return new AppError(500, "db_error", error.message);
}

export const handleError: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: { code: err.code, message: err.message } }, err.status);
  }
  if (err instanceof HTTPException) {
    return c.json({ error: { code: "http_error", message: err.message } }, err.status);
  }
  console.error(err);
  return c.json({ error: { code: "internal_error", message: "Internal server error" } }, 500);
};
