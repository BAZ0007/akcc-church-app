import { z } from "zod";

// ── POST /api/events ──────────────────────────────────────────────────────────

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1, "title is required").max(200),
    description: z.string().trim().max(2000).optional().nullable(),
    location: z.string().trim().min(1, "location is required").max(300),
    starts_at: z
      .string()
      .trim()
      .datetime({ offset: true, message: "starts_at must be an ISO 8601 datetime" }),
    ends_at: z
      .string()
      .trim()
      .datetime({ offset: true, message: "ends_at must be an ISO 8601 datetime" })
      .optional()
      .nullable(),
    capacity: z
      .number()
      .int()
      .positive("capacity must be a positive integer")
      .optional()
      .nullable(),
    published: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      if (data.ends_at == null) return true;
      return new Date(data.ends_at) > new Date(data.starts_at);
    },
    { message: "ends_at must be after starts_at", path: ["ends_at"] }
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ── PATCH /api/events/[id] ────────────────────────────────────────────────────

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    location: z.string().trim().min(1).max(300).optional(),
    starts_at: z
      .string()
      .trim()
      .datetime({ offset: true })
      .optional(),
    ends_at: z
      .string()
      .trim()
      .datetime({ offset: true })
      .nullable()
      .optional(),
    capacity: z.number().int().positive().nullable().optional(),
    published: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) => {
      if (!data.starts_at || !data.ends_at) return true;
      return new Date(data.ends_at) > new Date(data.starts_at);
    },
    { message: "ends_at must be after starts_at", path: ["ends_at"] }
  );

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ── POST /api/events/[id]/rsvp ────────────────────────────────────────────────

export const createRsvpSchema = z.object({
  status: z
    .enum(["attending", "not_attending", "maybe"])
    .optional()
    .default("attending"),
  guest_count: z
    .number()
    .int()
    .min(1, "guest_count must be at least 1")
    .max(10, "guest_count cannot exceed 10")
    .optional()
    .default(1),
  note: z.string().trim().max(500).optional().nullable(),
});

export type CreateRsvpInput = z.infer<typeof createRsvpSchema>;
