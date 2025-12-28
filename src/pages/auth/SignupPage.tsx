import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const response = await signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (response.success && response.email) {
                navigate('/verify-otp', { state: { email: response.email } });
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -z-10" />

            {/* Abstract Shapes */}
            <div className="absolute top-20 left-20 w-80 h-80 bg-green-400/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl opacity-50" />

            <Card className="w-full max-w-lg shadow-xl border-border/60 bg-white/80 dark:bg-black/80 backdrop-blur-sm scale-95">
                <CardHeader className="space-y-1 text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl ring-4 ring-primary/5">
                            <UserPlus className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <p className="text-sm text-muted-foreground">Join the community response network today</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">

                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" required onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" placeholder="you@example.com" required type="email" onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" placeholder="+91 98765 43210" required onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" required type="password" onChange={handleChange} minLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" required type="password" onChange={handleChange} minLength={6} />
                            </div>
                        </div>

                        <Button className="w-full h-11 text-base shadow-lg shadow-primary/20 mt-2" type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm pt-4 border-t border-border/50">
                        <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 group">
                            Already have an account? <span className="text-primary font-bold group-hover:underline">Login</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
