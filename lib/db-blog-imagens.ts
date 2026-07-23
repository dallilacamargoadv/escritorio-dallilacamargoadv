import { createClient } from "@/lib/supabase/server";

const BUCKET = "blog-imagens";

export async function uploadBlogImagem(file: File): Promise<string> {
  const supabase = await createClient();
  const safeName = file.name.replace(/[/\\]/g, "_");
  const storagePath = `posts/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
