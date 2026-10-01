import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { ZodType } from "zod";

// zValidator with the API error format.
export function validate<T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: { code: "validation_error", message: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") } },
        400,
      );
    }
  });
}
