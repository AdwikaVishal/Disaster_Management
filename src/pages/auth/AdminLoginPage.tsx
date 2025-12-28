import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { loginAdminStep1 } = useAuth();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await loginAdminStep1(email);
            if (response.success) {
                // Redirect to shared OTP page with admin type
                navigate('/verify-otp', { state: { email: email, type: 'admin-login' } });
            } else {
                setError(response.message || 'Failed to send OTP. Check email.');
            }
        } catch (err: any) {
            setError(err.message || 'Error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0" />

            <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100 shadow-2xl shadow-black/50">
                <CardHeader className="space-y-1 text-center pb-8 border-b border-slate-800">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-500/10 rounded-2xl ring-1 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                            <ShieldAlert className="w-12 h-12 text-red-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
                    <CardDescription className="text-slate-400">Restricted access for authorized personnel only.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/40 text-red-300 border border-red-900/50 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Official Email</Label>
                            <Input
                                id="email"
                                placeholder="admin@sensesafe.gov"
                                required
                                type="email"
                                className="bg-slate-950/50 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-red-500/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-11 transition-all"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (
                                <span className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Request Secure Access
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-800">
                        <Link to="/login" className="text-sm text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2 group">
                            Not an admin? Return to User Login
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Footer info */}
            <div className="absolute bottom-6 text-center w-full text-slate-600 text-xs">
                <p>SenseSafe Emergency Response System • v2.4.0</p>
                <p className="mt-1">Use of this system is monitored and logged.</p>
            </div>
        </div>
    );
};
