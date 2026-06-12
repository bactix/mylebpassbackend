/**
 * Build an absolute, client-loadable URL from a stored relative media path
 * (e.g. "uploads/businesses/<id>/profilePicture-123.jpg").
 *
 * Uses PUBLIC_BASE_URL when set (recommended in production), otherwise falls
 * back to http://localhost:<PORT> for local development. Values that are
 * already absolute (http/https) are returned unchanged.
 */
export function toAbsoluteMediaUrl(relativePath?: string | null): string | undefined {
  if (!relativePath) return undefined;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;

  const base = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
  const cleanPath = relativePath.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
}

/** Map an array of stored relative media paths to absolute URLs. */
export function toAbsoluteMediaUrls(paths?: string[] | null): string[] {
  if (!paths || paths.length === 0) return [];
  return paths.map(p => toAbsoluteMediaUrl(p)).filter((u): u is string => Boolean(u));
}
