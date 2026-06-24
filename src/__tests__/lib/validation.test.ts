import { createSermonSchema } from "@/lib/validation/sermons";
import { createRsvpSchema } from "@/lib/validation/events";
import { createAnnouncementSchema } from "@/lib/validation/announcements";

// ── createSermonSchema ────────────────────────────────────────────────────────

describe("createSermonSchema", () => {
  const validSermon = {
    title: "Grace and Truth",
    speaker: "Pastor John",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sermon_date: "2024-06-15",
  };

  it("passes for a valid sermon input", () => {
    const result = createSermonSchema.safeParse(validSermon);
    expect(result.success).toBe(true);
  });

  it("fails when title is missing", () => {
    const { title: _omit, ...rest } = validSermon;
    const result = createSermonSchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("title");
    }
  });

  it("fails for an invalid youtube_url format", () => {
    const result = createSermonSchema.safeParse({
      ...validSermon,
      youtube_url: "https://example.com/not-youtube",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("youtube_url");
    }
  });

  it("fails when sermon_date is not in YYYY-MM-DD format", () => {
    const result = createSermonSchema.safeParse({
      ...validSermon,
      sermon_date: "15/06/2024",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("sermon_date");
    }
  });

  it("accepts a valid sermon_date string", () => {
    const result = createSermonSchema.safeParse({
      ...validSermon,
      sermon_date: "2024-01-01",
    });
    expect(result.success).toBe(true);
  });
});

// ── createRsvpSchema ──────────────────────────────────────────────────────────

describe("createRsvpSchema", () => {
  it("passes for valid attending + guest_count", () => {
    const result = createRsvpSchema.safeParse({
      status: "attending",
      guest_count: 2,
    });
    expect(result.success).toBe(true);
  });

  it("fails for an invalid status value", () => {
    const result = createRsvpSchema.safeParse({ status: "coming" });
    expect(result.success).toBe(false);
  });

  it("fails when guest_count exceeds 10", () => {
    const result = createRsvpSchema.safeParse({
      status: "attending",
      guest_count: 11,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("guest_count");
    }
  });

  it("fails when guest_count is less than 1", () => {
    const result = createRsvpSchema.safeParse({
      status: "attending",
      guest_count: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("guest_count");
    }
  });

  it("defaults status to attending and guest_count to 1", () => {
    const result = createRsvpSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("attending");
      expect(result.data.guest_count).toBe(1);
    }
  });
});

// ── createAnnouncementSchema ──────────────────────────────────────────────────

describe("createAnnouncementSchema", () => {
  const validAnnouncement = {
    title: "Sunday Service",
    body: "Join us this Sunday at 10am.",
  };

  it("passes for valid announcement input", () => {
    const result = createAnnouncementSchema.safeParse(validAnnouncement);
    expect(result.success).toBe(true);
  });

  it("fails when title is empty", () => {
    const result = createAnnouncementSchema.safeParse({
      ...validAnnouncement,
      title: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("title");
    }
  });

  it("fails when body is empty", () => {
    const result = createAnnouncementSchema.safeParse({
      ...validAnnouncement,
      body: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("body");
    }
  });
});
