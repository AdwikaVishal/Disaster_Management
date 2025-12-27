import { AlertTriangle, Users, Clock, Bell } from 'lucide-react';
import { Analytics } from '@/types';
import MetricCard from './MetricCard';

interface TopMetricsProps {
  analytics: Analytics;
}

const TopMetrics = ({ analytics }: TopMetricsProps) => {
  const unreadNotifications = analytics.notifications.filter(n => !n.read).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="High Risk Incidents"
        value={analytics.highRiskCount}
        icon={<AlertTriangle className="w-5 h-5" />}
        change={-12}
        changeLabel="vs last week"
        trend="down"
        delay={0}
        variant="danger"
      />
      <MetricCard
        label="People Reported"
        value={analytics.peopleReported}
        icon={<Users className="w-5 h-5" />}
        change={8}
        changeLabel="vs last week"
        trend="up"
        delay={1}
        variant="default"
      />
      <MetricCard
        label="Avg Response Time"
        value={`${analytics.avgApprovalTime} min`}
        icon={<Clock className="w-5 h-5" />}
        change={-5}
        changeLabel="faster than avg"
        trend="down"
        delay={2}
        variant="success"
      />
      <MetricCard
        label="New Notifications"
        value={unreadNotifications}
        icon={<Bell className="w-5 h-5" />}
        change={0}
        changeLabel="pending review"
        trend="neutral"
        delay={3}
        variant={unreadNotifications > 0 ? 'warning' : 'default'}
      />
    </div>
  );
};

export default TopMetrics;
