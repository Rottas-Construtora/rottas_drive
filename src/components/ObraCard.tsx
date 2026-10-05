import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Trash2, Pencil, MoreVertical, Shield } from "lucide-react";
import { Obra, useDeleteObra } from "@/hooks/useObras";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditObraDialog } from "./EditObraDialog";
import { ObraPermissoesDialog } from "./ObraPermissoesDialog";
import { useAuthContext } from "@/components/AuthProvider";
import { useSignedUrl } from "@/lib/storage";

interface ObraCardProps {
  obra: Obra;
}

// Capa de coleção sem foto: tom pastel fixo por coleção, código grande e ícone apagado no canto (igual ao Rottas Control).
const CAPAS = [
  "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
];
const capaCls = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return CAPAS[Math.abs(h) % CAPAS.length];
};

export function ObraCard({ obra }: ObraCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permsOpen, setPermsOpen] = useState(false);
  const deleteObra = useDeleteObra();
  const { canEdit } = useAuthContext();
  const { url: signedFoto } = useSignedUrl(obra.foto_url);

  const handleDelete = async () => {
    try {
      await deleteObra.mutateAsync(obra.id);
      toast.success("Coleção excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir coleção");
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all overflow-hidden">
        <Link to={`/obra/${obra.id}`} className="block aspect-[4/3] overflow-hidden bg-muted cursor-pointer">
          {obra.foto_url && signedFoto ? (
            <img
              src={signedFoto}
              alt={obra.nome}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`relative h-full w-full flex items-center justify-center overflow-hidden ${capaCls(obra.id)}`}>
              <span className="text-6xl font-extrabold tabular-nums tracking-tight">
                {obra.codigo}
              </span>
              <Building2
                className="absolute -bottom-3 -right-3 h-24 w-24 opacity-15 group-hover:scale-110 transition-transform duration-300"
                strokeWidth={1.5}
              />
            </div>
          )}
        </Link>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/obra/${obra.id}`} className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate hover:text-primary transition-colors">
                {obra.nome}
              </h3>
            </Link>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setPermsOpen(true)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Permissões da coleção
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 min-w-0">
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">{obra.codigo}</span>
            {obra.endereco && (
              <p className="text-sm text-muted-foreground truncate">{obra.endereco}</p>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Coleção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir a coleção "{obra.nome}" e todos os seus arquivos e pastas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditObraDialog open={editOpen} onOpenChange={setEditOpen} obra={obra} />
      <ObraPermissoesDialog open={permsOpen} onOpenChange={setPermsOpen} obra={obra} />
    </>
  );
}
