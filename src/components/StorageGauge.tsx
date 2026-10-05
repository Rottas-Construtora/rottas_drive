import { useStorageUsage } from "@/hooks/useStorageUsage";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { getWorkspaceIcon } from "@/components/workspaceIcons";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const formatUsage = (gb: number) => {
  if (gb < 1) {
    const mb = gb * 1024;
    return `${mb.toFixed(1)} MB`;
  }
  return `${gb.toFixed(2)} GB`;
};

const GB = 1024 * 1024 * 1024;

export function StorageGauge() {
  const { data, isLoading } = useStorageUsage();
  const { data: workspaces } = useWorkspaces();

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center">
        <div className="w-32 h-16 bg-muted rounded-t-full animate-pulse" />
      </div>
    );
  }

  const usedGB = data?.usedGB || 0;
  const maxGB = data?.maxGB || 100;
  const percentage = Math.min((usedGB / maxGB) * 100, 100);

  // Calculate the arc for the gauge
  const radius = 60;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;

  // Determine color based on usage
  const getColor = (pct: number) => {
    if (pct < 50) return "hsl(var(--primary))";
    if (pct < 75) return "hsl(45, 93%, 47%)"; // Yellow/amber
    return "hsl(0, 84%, 60%)"; // Red
  };

  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const usedBytes = data?.usedBytes || 0;
  const porWorkspace = (workspaces ?? [])
    .map((ws) => ({ ...ws, bytes: data?.bytesPorWorkspace[ws.id] || 0 }))
    .sort((a, b) => b.bytes - a.bytes);

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="p-4 flex flex-col items-center border-t border-border cursor-default">
          <div className="relative w-36 h-20">
            <svg className="w-full h-full" viewBox="0 0 140 80" fill="none">
              {/* Background arc */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
              />
              {/* Colored progress arc */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                stroke={getColor(percentage)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="text-lg font-bold">{formatUsage(usedGB)}</span>
              <span className="text-xs text-muted-foreground">de {maxGB} GB</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground mt-1">Armazenamento</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="end" sideOffset={12} className="w-80 p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/40">
          <p className="text-sm font-semibold">Armazenamento por workspace</p>
          <p className="text-xs text-muted-foreground">
            {formatUsage(usedGB)} usados de {maxGB} GB
          </p>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2 space-y-1">
          {porWorkspace.length === 0 && (
            <li className="px-2 py-3 text-xs text-muted-foreground text-center">Nenhum workspace</li>
          )}
          {porWorkspace.map((ws) => {
            const accent = ws.cor || "hsl(var(--primary))";
            const Icon = getWorkspaceIcon(ws.icone);
            const share = usedBytes ? (ws.bytes / usedBytes) * 100 : 0;
            return (
              <li key={ws.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
                <div
                  className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accent}26` }}
                >
                  <Icon className="h-4 w-4" style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium truncate">{ws.nome}</span>
                    <span className="text-xs font-semibold tabular-nums shrink-0">{formatUsage(ws.bytes / GB)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${share}%`, backgroundColor: accent }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
