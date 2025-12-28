import React from 'react';
import { ShieldAlert, Heart, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-background border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight">
                                Sense<span className="text-primary">Safe</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Empowering communities with real-time disaster reporting and intelligent response coordination. Stay safe, together.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="#" className="hover:text-primary transition-colors">Incident Reporting</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Live Maps</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Volunteers</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">AI Prediction</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © {new Date().getFullYear()} SenseSafe. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <a href="#" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="#" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                            <Github className="w-4 h-4" />
                        </a>
                        <a href="#" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                            <Linkedin className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
