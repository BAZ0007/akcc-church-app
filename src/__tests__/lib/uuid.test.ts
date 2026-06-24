import { isValidUUID } from "@/lib/validation/uuid";

describe("isValidUUID", () => {
  it("returns true for a valid UUID v4", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("returns true for a UUID with uppercase hex", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("returns false for an empty string", () => {
    expect(isValidUUID("")).toBe(false);
  });

  it("returns false for a random string", () => {
    expect(isValidUUID("not-a-uuid")).toBe(false);
  });

  it("returns false for a UUID with a wrong character (Z)", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-44665544000Z")).toBe(false);
  });

  it("returns false for a UUID missing a segment", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
  });

  it("returns false for a UUID with an extra segment", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000-extra")).toBe(false);
  });
});
