import { motion } from 'framer-motion';
import { Shield, Bell, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  notificationCount?: number;
  onLogout?: () => void;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
}

const DashboardHeader = ({ 
  notificationCount = 0, 
  onLogout, 
  title = "SenseSafe",
  subtitle = "Admin Dashboard",
  showBackButton = false,
  backTo = "/admin"
}: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.header
      className="gradient-hero text-primary-foreground px-6 py-4 shadow-elevated"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo & Brand */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10 mr-2"
              onClick={() => navigate(backTo)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <p className="text-xs text-primary-foreground/70">{subtitle}</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-primary-foreground hover:bg-white/10"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-white/10 ml-2"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
