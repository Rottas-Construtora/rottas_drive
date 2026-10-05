import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStorageUsage() {
  return useQuery({
    queryKey: ["storage-usage"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("arquivos")
        .select("tamanho, obras(workspace_id)");

      if (error) throw error;

      const bytesPorWorkspace: Record<string, number> = {};
      let totalBytes = 0;
      for (const file of data ?? []) {
        const bytes = file.tamanho || 0;
        totalBytes += bytes;
        const wsId = (file.obras as { workspace_id: string } | null)?.workspace_id;
        if (wsId) bytesPorWorkspace[wsId] = (bytesPorWorkspace[wsId] || 0) + bytes;
      }
      const totalGB = totalBytes / (1024 * 1024 * 1024);

      return {
        usedBytes: totalBytes,
        usedGB: totalGB,
        maxGB: 100,
        percentage: (totalGB / 100) * 100,
        bytesPorWorkspace,
      };
    },
  });
}
