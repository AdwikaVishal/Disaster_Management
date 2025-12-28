import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShieldAlert, BarChart3, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button'; // Will create this next

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Community', href: '#community' },
    ];

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
                isScrolled
                    ? 'glass bg-white/80 dark:bg-black/80 border-border/40 py-3'
                    : 'bg-transparent border-transparent py-5'
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <ShieldAlert className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        Sense<span className="text-primary">Safe</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium hover:underline">
                        Log In
                    </Link>
                    <Link to="/signup">
                        <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                            Get Started
                        </button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b border-border"
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-foreground hover:text-primary"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <hr className="border-border" />
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-medium text-center py-2"
                            >
                                Log In
                            </Link>
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
