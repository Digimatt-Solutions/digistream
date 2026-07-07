import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// avatar_url column can store either a full URL or a storage path in the private "avatars" bucket.
// This hook resolves the display URL, generating a signed URL for storage paths.
export function useAvatarUrl(pathOrUrl?: string | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      if (!pathOrUrl) { setUrl(undefined); return; }
      if (/^https?:\/\//i.test(pathOrUrl)) { setUrl(pathOrUrl); return; }
      const { data } = await supabase.storage.from("avatars").createSignedUrl(pathOrUrl, 60 * 60 * 24 * 7);
      if (!cancelled) setUrl(data?.signedUrl);
    }
    resolve();
    return () => { cancelled = true; };
  }, [pathOrUrl]);
  return url;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}
