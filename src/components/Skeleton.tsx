export function SkeletonCard() {
  return (
    <div className="kpi-card space-y-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="skeleton h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return <div className="skeleton h-64 w-full rounded-xl" />;
}

export function EmptyState({ message = 'No data available', icon }: { message?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      {icon || (
        <svg className="h-16 w-16 mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
}
