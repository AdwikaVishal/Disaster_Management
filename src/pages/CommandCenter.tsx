import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TopMetrics from '@/components/dashboard/TopMetrics';
import UserList from '@/components/dashboard/UserList';
import RiskGraph from '@/components/dashboard/RiskGraph';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentIncidents from '@/components/dashboard/RecentIncidents';
import { dummyUsers, dummyAnalytics, dummyIncidents } from '@/data/dummyData';
import { User, Analytics, Incident } from '@/types';
import { toast } from 'sonner';

const CommandCenter = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(dummyUsers);
      setAnalytics(dummyAnalytics);
      setIncidents(dummyIncidents);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLogout = () => {
    toast.info('Logging out...', {
      description: 'You will be redirected to the login page.',
    });
  };

  const unreadNotifications = analytics?.notifications.filter(n => !n.read).length || 0;

  return (
    <>
      <Helmet>
        <title>SenseSafe Command Center | Advanced Incident Management</title>
        <meta name="description" content="SenseSafe Command Center for advanced disaster incident monitoring, analytics, and coordinated emergency response management." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <DashboardHeader 
          notificationCount={unreadNotifications} 
          onLogout={handleLogout}
          title="SenseSafe Command Center"
          subtitle="Advanced Incident Management"
          showBackButton={false}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Top Metrics */}
          {analytics && <TopMetrics analytics={analytics} />}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-9 space-y-6">
              {/* Risk Graph */}
              {analytics && (
                <RiskGraph 
                  riskLevels={analytics.riskLevels}
                  totalIncidents={analytics.totalIncidents}
                  resolvedIncidents={analytics.resolvedIncidents}
                />
              )}

              {/* Recent Incidents */}
              <RecentIncidents incidents={incidents} />

              {/* User List */}
              <UserList users={users} loading={loading} />
            </div>

            {/* Right Column - Quick Actions */}
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <QuickActions />

                {/* Alternative Dashboard Access */}
                <motion.div
                  className="mt-6 card-elevated p-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-3">Alternative Views</h3>
                  <button
                    onClick={() => window.open('/admin', '_blank')}
                    className="action-button text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Classic Admin Dashboard</p>
                        <p className="text-xs text-muted-foreground">Traditional interface view</p>
                      </div>
                    </div>
                  </button>
                </motion.div>

                {/* Live Status Indicator */}
                <motion.div
                  className="mt-6 card-elevated p-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping opacity-75" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">System Online</p>
                      <p className="text-xs text-muted-foreground">All services operational</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <motion.footer
          className="border-t border-border mt-8 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 SenseSafe. Disaster Response Management System.
            </p>
          </div>
        </motion.footer>
      </div>
    </>
  );
};

export default CommandCenter;
