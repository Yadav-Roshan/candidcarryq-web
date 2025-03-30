import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex h-[450px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
      className
    )}>
      {icon && (
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="mb-2 mt-4 text-2xl font-semibold">{title}</h3>
      {description && (
        <p className="mb-6 mt-2 max-w-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
