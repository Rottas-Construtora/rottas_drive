import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Botões de ação (CTA) */
  children?: ReactNode;
  /** "compact" para dialogs, popovers e tabelas */
  size?: "default" | "compact";
  className?: string;
}

/** Folha de papel "fantasma" atrás do ícone — lembra uma pilha de documentos/plantas. */
function Sheet({ rotate, x, delay }: { rotate: number; x: number; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 rounded-2xl border border-muted-foreground/15 bg-card shadow-md"
      initial={reduce ? false : { rotate: 0, x: 0, opacity: 0 }}
      animate={{ rotate, x, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, delay }}
    >
      <div className="absolute left-3 right-5 top-4 h-1.5 rounded-full bg-primary/30" />
      <div className="absolute left-3 right-8 top-[30px] h-1 rounded-full bg-muted-foreground/15" />
      <div className="absolute left-3 right-6 top-[40px] h-1 rounded-full bg-muted-foreground/15" />
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  size = "default",
  className,
}: EmptyStateProps) {
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-4",
        className,
      )}
    >
      <div className={cn("relative flex items-center justify-center", compact ? "h-20 w-28 mb-3" : "h-36 w-52 mb-6")}>
        {/* Grade pontilhada estilo prancha técnica, desvanecendo nas bordas */}
        <div
          aria-hidden
          className="absolute inset-0 text-muted-foreground/40"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: compact ? "10px 10px" : "14px 14px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />

        <div className={cn("relative", compact ? "h-12 w-12" : "h-[76px] w-[76px]")}>
          {!compact && (
            <>
              <Sheet rotate={-12} x={-30} delay={0.05} />
              <Sheet rotate={9} x={28} delay={0.12} />
            </>
          )}
          <div
            className={cn(
              "relative h-full w-full flex items-center justify-center border border-primary/20 bg-card shadow-lg ring-4 ring-primary/10",
              compact ? "rounded-xl" : "rounded-2xl",
            )}
          >
            <Icon className={cn("text-primary", compact ? "h-5 w-5" : "h-8 w-8")} strokeWidth={1.75} />
          </div>
        </div>
      </div>

      <h3 className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-lg")}>{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-sm mt-1", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}
      {children && (
        <div className={cn("flex flex-wrap items-center justify-center gap-2", compact ? "mt-3" : "mt-6")}>
          {children}
        </div>
      )}
    </div>
  );
}
