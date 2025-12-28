import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Activity, Lock, ChevronRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/20 via-transparent to-transparent opacity-50 blur-3xl" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        SenseSafe
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/auth/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link to="/auth/signup">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center pt-20 px-4 max-w-5xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight pb-2">
                        Next-Gen <span className="text-primary">Disaster Response</span>
                    </h1>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-muted-foreground/50">
                        Powered by AI & Blockchain
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl text-muted-foreground max-w-2xl"
                >
                    Real-time incident reporting, fraud detection, and immutable audit trails. Secure, transparent, and faster than ever.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                >
                    <Link to="/dashboard">
                        <Button size="lg" className="h-14 px-8 text-lg gap-2">
                            Live Dashboard <Activity className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/report">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2">
                            Report Incident <ChevronRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Features Grid */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Shield className="w-10 h-10 text-primary" />}
                        title="AI Fraud Detection"
                        description="Our advanced ML models analyze reports in real-time to detect spam and verify authenticity instantly."
                    />
                    <FeatureCard
                        icon={<Lock className="w-10 h-10 text-primary" />}
                        title="Blockchain Audit"
                        description="Every critical action is logged on the Ethereum blockchain, ensuring total transparency and trust."
                    />
                    <FeatureCard
                        icon={<Activity className="w-10 h-10 text-primary" />}
                        title="Risk Prioritization"
                        description="Intelligent algorithms rank incidents by severity, routing help where it's needed most."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all"
        >
            <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">{icon}</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </motion.div>
    );
}
