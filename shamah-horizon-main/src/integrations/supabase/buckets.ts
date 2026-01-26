export const IMAGES_BUCKET =
  (import.meta.env.VITE_SUPABASE_IMAGES_BUCKET as string | undefined) ||
  "property-images";

export const MEDIA_BUCKET =
  (import.meta.env.VITE_SUPABASE_MEDIA_BUCKET as string | undefined) ||
  "property-media";
