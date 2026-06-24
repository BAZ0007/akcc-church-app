import { z } from "zod";

// ── Reusable field definitions ────────────────────────────────────────────────

const youtubeUrlSchema = z
  .string()
  .trim()
  .url("youtube_url must be a valid URL")
  .refine(
    (url) =>
      /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)/.test(
        url
      ),
    { message: "youtube_url must be a YouTube URL" }
  );

const sermonDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "sermon_date must be YYYY-MM-DD");

// ── POST /api/sermons ─────────────────────────────────────────────────────────

export const createSermonSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  speaker: z.string().trim().min(1, "speaker is required").max(100),
  youtube_url: youtubeUrlSchema,
  series: z.string().trim().max(100).optional().nullable(),
  sermon_date: sermonDateSchema,
  description: z.string().trim().max(2000).optional().nullable(),
  published: z.boolean().optional().default(true),
});

export type CreateSermonInput = z.infer<typeof createSermonSchema>;

// ── PATCH /api/sermons/[id] ───────────────────────────────────────────────────

export const updateSermonSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    speaker: z.string().trim().min(1).max(100).optional(),
    youtube_url: youtubeUrlSchema.optional(),
    series: z.string().trim().max(100).nullable().optional(),
    sermon_date: sermonDateSchema.optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    published: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateSermonInput = z.infer<typeof updateSermonSchema>;
