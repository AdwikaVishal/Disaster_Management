import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    MapPin,
    Users,
    BrainCircuit,
    ArrowRight,
    Siren,
    Activity,
    CheckCircle2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3" />

                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live Disaster Response System Active
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
                            Stay Safe. Report Faster. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                Respond Smarter.
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            A community-driven platform empowering citizens and responders with real-time tracking, AI risk assessment, and rapid emergency coordination.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup">
                                <button className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2 group">
                                    Get Started
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link to="/login">
                                <button className="h-12 px-8 rounded-full bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-all border border-border">
                                    Log In
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Hero Image Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden glass aspect-[16/9] flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                        <div className="text-center p-10">
                            <MapPin className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
                            <p className="text-xl font-medium text-muted-foreground">Interactive Live Map Dashboard Preview</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SenseSafe?</h2>
                        <p className="text-muted-foreground text-lg">
                            Our platform combines cutting-edge technology with community power to save lives.
                        </p>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: Siren,
                                title: "Instant Reporting",
                                desc: "Report incidents in seconds with auto-location and media uploads."
                            },
                            {
                                icon: MapPin,
                                title: "Real-time Mapping",
                                desc: "Live heatmaps and incident tracking for total situational awareness."
                            },
                            {
                                icon: Users,
                                title: "Volunteer Network",
                                desc: "Connect with local volunteers ready to assist in emergencies."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Secure Verification",
                                desc: "Admin-verified reports to prevent misinformation and panic."
                            },
                            {
                                icon: BrainCircuit,
                                title: "AI Risk Scoring",
                                desc: "Smart algorithms prioritize incidents based on severity and impact."
                            },
                            {
                                icon: Activity,
                                title: "Live Alerts",
                                desc: "Receive instant notifications for dangers in your vicinity."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={item}
                                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted-foreground text-lg">
                            Simple steps to ensure rapid response and safety.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

                        {[
                            { step: "01", title: "Report Incident", desc: "User submits an incident report with details and evidence." },
                            { step: "02", title: "Verify & Alert", desc: "System verifies the report and alerts nearby users and responders." },
                            { step: "03", title: "Coordinate Response", desc: "Volunteers and authorities coordinate to resolve the issue." },
                        ].map((item, idx) => (
                            <div key={idx} className="relative flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center z-10 mb-6 shadow-sm">
                                    <span className="text-3xl font-bold text-primary">{item.step}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust/Testimonials */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Trusted by Communities Everywhere</h2>
                            <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                                "SenseSafe has revolutionized how our neighborhood handles emergencies. The speed of reporting and response is unmatched."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-background/20" />
                                <div>
                                    <p className="font-semibold">Sarah Jenkins</p>
                                    <p className="text-sm opacity-75">Community Leader</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Active Users", value: "10k+" },
                                { label: "Incidents Resolved", value: "500+" },
                                { label: "Avg Response Time", value: "< 15m" },
                                { label: "Volunteers", value: "1.2k" },
                            ].map((stat, idx) => (
                                <div key={idx} className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                    <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                    <p className="text-sm opacity-80">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};
