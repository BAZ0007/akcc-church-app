import { z } from "zod";

// ── POST /api/announcements ───────────────────────────────────────────────────

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  body: z.string().trim().min(1, "body is required").max(5000),
  pinned: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  expires_at: z
    .string()
    .trim()
    .datetime({ offset: true, message: "expires_at must be an ISO 8601 datetime" })
    .optional()
    .nullable(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

// ── PATCH /api/announcements/[id] ────────────────────────────────────────────

export const updateAnnouncementSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().min(1).max(5000).optional(),
    pinned: z.boolean().optional(),
    published: z.boolean().optional(),
    expires_at: z
      .string()
      .trim()
      .datetime({ offset: true })
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
