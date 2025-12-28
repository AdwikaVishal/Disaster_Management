import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/Label';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifySignupOtp, loginAdminStep2 } = useAuth();

    const email = location.state?.email || '';
    const type = location.state?.type || 'signup'; // 'signup' or 'admin-login'

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!email) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Invalid Request</h2>
                    <p className="text-muted-foreground mb-4">No email found to verify.</p>
                    <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </div>
        );
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let response;
            if (type === 'admin-login') {
                response = await loginAdminStep2(email, otp);
            } else {
                response = await verifySignupOtp(email, otp);
            }

            if (response.success) {
                // Redirect based on type
                if (type === 'admin-login') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(response.message || 'Invalid OTP');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -z-10" />
            {/* Dark theme support for Admin flow */}
            {type === 'admin-login' && (
                <div className="absolute inset-0 bg-slate-950 -z-20" />
            )}

            <Card className={`w-full max-w-md shadow-xl border-border/60 ${type === 'admin-login' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white/80 dark:bg-black/80'} backdrop-blur-sm`}>
                <CardHeader className="space-y-1 text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-xl ring-4 ${type === 'admin-login' ? 'bg-red-500/10 ring-red-500/5' : 'bg-green-500/10 ring-green-500/5'}`}>
                            {type === 'admin-login' ? (
                                <Lock className="w-8 h-8 text-red-500" />
                            ) : (
                                <ShieldCheck className="w-8 h-8 text-green-500" />
                            )}
                        </div>
                    </div>
                    <CardTitle className={`text-2xl font-bold ${type === 'admin-login' ? 'text-white' : ''}`}>
                        {type === 'admin-login' ? 'Admin Access Verification' : 'Verify Account'}
                    </CardTitle>
                    <CardDescription className={type === 'admin-login' ? 'text-slate-400' : ''}>
                        We sent a 6-digit code to <span className={`font-semibold ${type === 'admin-login' ? 'text-white' : 'text-foreground'}`}>{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">

                        {error && (
                            <div className={`p-3 text-sm rounded-md border ${type === 'admin-login' ? 'bg-red-900/40 text-red-300 border-red-900/50' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="otp" className={type === 'admin-login' ? 'text-slate-300' : ''}>Enter Verification Code</Label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-3 h-5 w-5 ${type === 'admin-login' ? 'text-slate-500' : 'text-muted-foreground'}`} />
                                <Input
                                    id="otp"
                                    placeholder="••••••"
                                    required
                                    className={`pl-10 tracking-widest text-lg ${type === 'admin-login' ? 'bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-red-500/50' : ''}`}
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            className={`w-full h-11 text-base shadow-lg mt-2 ${type === 'admin-login' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'}`}
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : type === 'admin-login' ? 'Authenticate' : 'Verify Email'}
                        </Button>

                        <div className="text-center text-sm pt-2">
                            <button
                                type="button"
                                className={type === 'admin-login' ? 'text-slate-400 hover:text-slate-200' : 'text-primary hover:underline'}
                                onClick={() => navigate(type === 'admin-login' ? '/admin/login' : '/signup')}
                            >
                                {type === 'admin-login' ? 'Wrong email? Back to Login' : 'Wrong email? Signup again'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
