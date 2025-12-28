import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useNavigate } from 'react-router-dom';
import { LogIn, User as UserIcon, Shield, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const UserLoginPage = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Test users from backend database
    const testUsers = [
        { email: 'john@example.com', password: 'password123', name: 'John Doe', role: 'USER' },
        { email: 'jane@example.com', password: 'password123', name: 'Jane Smith', role: 'USER' },
        { email: 'admin@sensesafe.com', password: 'admin123', name: 'Admin User', role: 'ADMIN' },
    ];

    const handleManualLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        await performLogin(email, password);
    };

    const handleQuickLogin = async (user: any) => {
        setIsLoading(true);
        setError('');
        setEmail(user.email);
        setIsOpen(false);
        await performLogin(user.email, user.password);
    };

    const performLogin = async (emailIn: string, passIn: string) => {
        try {
            const response = await loginUser({ email: emailIn, password: passIn });
            if (response.success && response.user) {
                if (response.user.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (error) {
            console.error("Login failed", error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <Card className="w-full max-w-lg shadow-2xl border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                <CardHeader className="text-center pb-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
                        <LogIn className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        SenseSafe Portal
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Unified access for Citizens and Administrators
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 space-y-6">

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Quick Login Dropdown */}
                    <div className="relative">
                        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Quick Select Demo User
                        </Label>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
                            type="button"
                        >
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Select a user to simulate...
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 space-y-1">
                                    {testUsers.map((user, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickLogin(user)}
                                            className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
                                            type="button"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()} Access</p>
                                            </div>
                                            {isLoading && email === user.email && <Check className="ml-auto w-4 h-4 text-green-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        <span className="px-3 text-xs uppercase text-slate-400 font-medium bg-transparent whitespace-nowrap">
                            Or Login Manually
                        </span>
                        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>

                    <form onSubmit={handleManualLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-11"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700" size="lg" disabled={isLoading}>
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
