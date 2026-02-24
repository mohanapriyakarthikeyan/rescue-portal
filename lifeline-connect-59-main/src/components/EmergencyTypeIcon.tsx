import { Flame, Droplets, Building2, Stethoscope, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmergencyType = 'flood' | 'fire' | 'earthquake' | 'medical' | 'trapped' | 'other';

interface EmergencyTypeIconProps {
  type: EmergencyType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const config: Record<EmergencyType, { icon: typeof Flame; label: string; color: string }> = {
  flood: { icon: Droplets, label: 'Flood', color: 'text-blue-500' },
  fire: { icon: Flame, label: 'Fire', color: 'text-orange-500' },
  earthquake: { icon: Building2, label: 'Earthquake', color: 'text-amber-600' },
  medical: { icon: Stethoscope, label: 'Medical', color: 'text-red-500' },
  trapped: { icon: Lock, label: 'Trapped', color: 'text-purple-500' },
  other: { icon: AlertTriangle, label: 'Other', color: 'text-gray-500' },
};

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function EmergencyTypeIcon({ type, size = 'md', showLabel = false, className }: EmergencyTypeIconProps) {
  const { icon: Icon, label, color } = config[type];
  
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Icon className={cn(sizeClasses[size], color)} />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
