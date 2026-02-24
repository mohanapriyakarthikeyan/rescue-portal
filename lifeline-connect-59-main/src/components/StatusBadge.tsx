import { cn } from '@/lib/utils';

type Status = 'pending' | 'in_progress' | 'rescued' | 'cancelled';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/20 text-warning-foreground border-warning/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-primary/20 text-primary border-primary/30',
  },
  rescued: {
    label: 'Rescued',
    className: 'bg-success/20 text-success border-success/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground border-muted-foreground/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        config.className,
        className
      )}
    >
      <span className={cn(
        'w-2 h-2 rounded-full mr-2',
        status === 'pending' && 'bg-warning animate-pulse',
        status === 'in_progress' && 'bg-primary animate-pulse',
        status === 'rescued' && 'bg-success',
        status === 'cancelled' && 'bg-muted-foreground'
      )} />
      {config.label}
    </span>
  );
}
