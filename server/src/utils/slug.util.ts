import crypto from "crypto";

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `${baseSlug}-${randomSuffix}`;
}

export function generateRandomSlug(length: number = 8): string {
  return crypto.randomBytes(length).toString("hex");
}
