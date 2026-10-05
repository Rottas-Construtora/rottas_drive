import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { distinctValues } from "@/lib/utils";

/**
 * Sugestões de cargo/setor já cadastrados, para os inputs não virarem
 * "Engenharia" vs "engenharia". Use `list="cargo-options"` / `list="setor-options"` no Input.
 */
export function CargoSetorDatalists() {
  const { data } = useQuery({
    queryKey: ["cargo-setor-options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("cargo, setor");
      if (error) throw error;
      return {
        cargos: distinctValues(data.map((p) => p.cargo)),
        setores: distinctValues(data.map((p) => p.setor)),
      };
    },
  });

  return (
    <>
      <datalist id="cargo-options">
        {data?.cargos.map((c) => <option key={c} value={c} />)}
      </datalist>
      <datalist id="setor-options">
        {data?.setores.map((s) => <option key={s} value={s} />)}
      </datalist>
    </>
  );
}
