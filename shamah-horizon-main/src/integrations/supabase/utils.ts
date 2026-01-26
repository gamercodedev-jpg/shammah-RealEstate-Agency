import { IMAGES_BUCKET } from "./buckets";

export function publicStorageUrl(path?: string, bucket = IMAGES_BUCKET) {
  if (!path) return undefined;
  // If it's already a full URL, normalize legacy non-public storage URLs
  if (/^https?:\/\//i.test(path)) {
    // Convert: /storage/v1/object/<bucket>/<path>  -> /storage/v1/object/public/<bucket>/<path>
    // (The non-public endpoint requires auth and will 400/401 in the browser.)
    const m = path.match(/^(https?:\/\/[^/]+)\/storage\/v1\/object\/([^/]+)\/(.+)$/i);
    if (m && m[2] && m[2] !== 'public') {
      return `${m[1]}/storage/v1/object/public/${m[2]}/${m[3]}`;
    }
    return path;
  }

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  if (!SUPABASE_URL) return undefined;

  return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodeURIComponent(
    path,
  )}`;
}

export default publicStorageUrl;
