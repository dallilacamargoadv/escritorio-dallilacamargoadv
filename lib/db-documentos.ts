import { createClient } from "@/lib/supabase/server";

const BUCKET = "documentos";
const SIGNED_URL_EXPIRES_SECONDS = 60;

export interface Documento {
  id: string;
  caso_id: string;
  nome_arquivo: string;
  storage_path: string;
  tamanho: number;
  tipo_mime: string;
  descricao: string | null;
  created_at: string;
  marco_cliente: string | null;
}

export async function getDocumentosByCaso(casoId: string): Promise<Documento[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("caso_id", casoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Documento[];
}

export async function uploadDocumento({
  casoId,
  file,
  descricao,
  marcoCliente,
}: {
  casoId: string;
  file: File;
  descricao: string | null;
  marcoCliente: string | null;
}): Promise<Documento> {
  const supabase = await createClient();
  const safeName = file.name.replace(/[/\\]/g, "_");
  const storagePath = `casos/${casoId}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("documentos")
    .insert({
      caso_id: casoId,
      nome_arquivo: file.name,
      storage_path: storagePath,
      tamanho: file.size,
      tipo_mime: file.type || "application/octet-stream",
      descricao,
      marco_cliente: marcoCliente,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw error;
  }

  return data as Documento;
}

export async function updateDocumentoMarcoCliente(
  id: string,
  marcoCliente: string | null,
): Promise<Documento> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentos")
    .update({ marco_cliente: marcoCliente })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Documento;
}

export async function deleteDocumento(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: documento, error: fetchError } = await supabase
    .from("documentos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  await supabase.storage.from(BUCKET).remove([documento.storage_path]);

  const { error } = await supabase.from("documentos").delete().eq("id", id);
  if (error) throw error;
}

export async function getDocumentoDownloadUrl(id: string): Promise<string> {
  const supabase = await createClient();
  const { data: documento, error: fetchError } = await supabase
    .from("documentos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(documento.storage_path, SIGNED_URL_EXPIRES_SECONDS);

  if (error) throw error;
  return data.signedUrl;
}
