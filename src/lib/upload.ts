import { supabase } from "@/integrations/supabase/client";

export async function uploadToBucket(bucket: string, file: File, prefix = "") {
  const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${prefix}${prefix ? "/" : ""}${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
