import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

const MetricCard = ({
  label,
  value,
  icon,
  change,
  changeLabel,
  trend = 'neutral',
  delay = 0,
  variant = 'default',
}: MetricCardProps) => {
  const variantStyles = {
    default: 'border-border hover:border-primary/30',
    danger: 'border-destructive/20 hover:border-destructive/40 bg-destructive/5',
    success: 'border-success/20 hover:border-success/40 bg-success/5',
    warning: 'border-warning/20 hover:border-warning/40 bg-warning/5',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    danger: 'bg-destructive/15 text-destructive',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
  };

  return (
    <motion.div
      className={cn('metric-card cursor-pointer', variantStyles[variant])}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-lg', iconStyles[variant])}>
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' && 'bg-success/15 text-success',
              trend === 'down' && 'bg-destructive/15 text-destructive',
              trend === 'neutral' && 'bg-muted text-muted-foreground'
            )}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {changeLabel && (
          <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
