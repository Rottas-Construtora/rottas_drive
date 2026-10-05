import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceMembros, useToggleWorkspaceMembro } from "@/hooks/useWorkspaces";
import { cn, distinctValues } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

const TODOS = "__todos__";
const norm = (v: string | null) => (v ?? "").trim().toLowerCase();

interface WorkspaceMembrosListaProps {
  workspaceId: string;
  /** Só busca quando o container (dialog) está aberto. */
  enabled?: boolean;
}

/** Lista de usuários com switch de acesso ao workspace. Reutilizável em qualquer dialog. */
export function WorkspaceMembrosLista({ workspaceId, enabled = true }: WorkspaceMembrosListaProps) {
  const [search, setSearch] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState(TODOS);
  const [setorFiltro, setSetorFiltro] = useState(TODOS);
  const { data: membros, isLoading } = useWorkspaceMembros(workspaceId, enabled);
  const toggle = useToggleWorkspaceMembro();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const cargos = useMemo(() => distinctValues((membros ?? []).map((m) => m.cargo)), [membros]);
  const setores = useMemo(() => distinctValues((membros ?? []).map((m) => m.setor)), [membros]);

  const q = search.trim().toLowerCase();
  const filtered = (membros ?? []).filter(
    (m) =>
      (!q || [m.nome, m.cargo, m.setor].some((v) => norm(v).includes(q))) &&
      (cargoFiltro === TODOS || norm(m.cargo) === norm(cargoFiltro)) &&
      (setorFiltro === TODOS || norm(m.setor) === norm(setorFiltro))
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nome, cargo ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {cargos.length > 0 && (
          <Select value={cargoFiltro} onValueChange={setCargoFiltro}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os cargos</SelectItem>
              {cargos.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {setores.length > 0 && (
          <Select value={setorFiltro} onValueChange={setSetorFiltro}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os setores</SelectItem>
              {setores.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1 max-h-64 overflow-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-10 ml-auto" />
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((m) => (
            <label
              key={m.user_id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                m.is_gestor ? "cursor-default" : "cursor-pointer hover:bg-muted/50"
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={m.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(m.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.nome || "Sem nome"}</p>
                {m.is_gestor ? (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" />
                    {m.gestor_role === "admin" ? "Admin" : "Editor"} (acesso total)
                  </p>
                ) : (
                  (m.cargo || m.setor) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {[m.cargo, m.setor].filter(Boolean).join(" · ")}
                    </p>
                  )
                )}
              </div>
              <Checkbox
                className="h-5 w-5"
                checked={m.is_gestor || m.is_member}
                disabled={m.is_gestor || toggle.isPending}
                onCheckedChange={(checked) =>
                  toggle.mutate(
                    { workspaceId, userId: m.user_id, isMember: checked === true },
                    {
                      onError: (err: any) =>
                        toast.error("Erro ao atualizar membro: " + err.message),
                    }
                  )
                }
              />
            </label>
          ))
        ) : (
          <EmptyState size="compact" icon={Users} title="Nenhum usuário encontrado" />
        )}
      </div>
    </div>
  );
}
