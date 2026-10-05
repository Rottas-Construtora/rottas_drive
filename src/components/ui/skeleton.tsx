import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

/** Linhas de skeleton para grids de tabela (código + descrição + colunas numéricas). */
function SkeletonTableRows({
  rows = 14,
  colSpan = 1,
  numericCols = 5,
}: {
  rows?: number;
  colSpan?: number;
  numericCols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`sk-${i}`} className="border-b border-border/40">
          <td colSpan={colSpan} className="py-2.5 px-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-14 shrink-0" />
              <Skeleton className={`h-4 shrink-0 ${i % 3 === 0 ? "w-64" : i % 3 === 1 ? "w-44" : "w-56"}`} />
              <div className="flex-1" />
              {Array.from({ length: numericCols }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-20 shrink-0" />
              ))}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export { Skeleton, SkeletonTableRows };
