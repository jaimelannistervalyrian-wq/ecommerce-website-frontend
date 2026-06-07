import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import toast from 'react-hot-toast';
import { authAtom } from '../store/atoms';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="flex min-h-[80vh] items-center justify-center px-6 py-16">
            <div className="w-full max-w-[440px]">
                {/* Brand mark */}
                <div className="mb-8 text-center">
                    <p className="text-2xl font-bold tracking-[0.12em] text-[#1a1208]">SS</p>
                    <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#8b6914]">Jeweleries</p>
                </div>
                <div className="rounded-2xl border border-[#e8e0d4] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <h1 className="mb-1 text-2xl font-bold text-[#1a1208]">{title}</h1>
                    {subtitle && <p className="mb-6 text-sm text-[#6b5c3e]">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </section>
    );
}

export function LoginPage() {
    const [auth, setAuth] = useAtom(authAtom);
    const navigate = useNavigate();
    if (auth) return <Navigate to="/account" replace />;

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            const res = await api.post('/auth/login', {
                email: fd.get('email'),
                password: fd.get('password'),
            });
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('email', res.data.user.email);
            localStorage.setItem('role', res.data.user.role);
            api.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;
            setAuth({ accessToken: res.data.accessToken, email: res.data.user.email, role: res.data.user.role });
            toast.success('Welcome back!');
            navigate('/account');
        } catch {
            toast.error('Invalid email or password');
        }
    };

    return (
        <AuthShell title="Sign In" subtitle="Welcome back to SS Jeweleries">
            <form onSubmit={submit} className="space-y-4">
                <Input name="email" type="email" required label="Email" placeholder="you@example.com" />
                <Input name="password" type="password" required label="Password" placeholder="••••••••" />
                <Button type="submit" fullWidth>Sign In</Button>
            </form>
            <div className="mt-5 flex justify-between text-xs text-[#6b5c3e]">
                <Link to="/forgot-password" className="hover:text-[#8b6914] hover:underline">
                    Forgot password?
                </Link>
                <Link to="/signup" className="hover:text-[#8b6914] hover:underline">
                    Create account
                </Link>
            </div>
        </AuthShell>
    );
}

export function SignupPage() {
    const [auth, setAuth] = useAtom(authAtom);
    const navigate = useNavigate();
    if (auth) return <Navigate to="/account" replace />;

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            const res = await api.post('/auth/signup', {
                fullName: fd.get('fullName'),
                email: fd.get('email'),
                password: fd.get('password'),
            });
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('email', res.data.user.email);
            localStorage.setItem('role', res.data.user.role);
            api.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;
            setAuth({ accessToken: res.data.accessToken, email: res.data.user.email, role: res.data.user.role });
            toast.success('Account created! Welcome to SS Jeweleries.');
            navigate('/account');
        } catch {
            toast.error('Signup failed. Email may already be registered.');
        }
    };

    return (
        <AuthShell title="Create Account" subtitle="Join the SS Jeweleries family">
            <form onSubmit={submit} className="space-y-4">
                <Input name="fullName" required label="Full Name" placeholder="Your full name" />
                <Input name="email" type="email" required label="Email" placeholder="you@example.com" />
                <Input name="password" type="password" required label="Password" placeholder="Min. 8 characters" />
                <Button type="submit" fullWidth>Create Account</Button>
            </form>
            <p className="mt-5 text-center text-xs text-[#6b5c3e]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#8b6914] hover:underline">Sign in</Link>
            </p>
        </AuthShell>
    );
}

export function ForgotPasswordPage() {
    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await api.post('/auth/forgot-password', { email: fd.get('email') });
        toast.success('If that email exists, reset instructions have been sent.');
    };

    return (
        <AuthShell title="Forgot Password" subtitle="We'll send you reset instructions">
            <form onSubmit={submit} className="space-y-4">
                <Input name="email" type="email" required label="Email" placeholder="you@example.com" />
                <Button type="submit" fullWidth>Send Reset Link</Button>
            </form>
            <p className="mt-5 text-center text-xs text-[#6b5c3e]">
                <Link to="/login" className="text-[#8b6914] hover:underline">Back to sign in</Link>
            </p>
        </AuthShell>
    );
}

export function ResetPasswordPage() {
    const navigate = useNavigate();

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            await api.post('/auth/reset-password', {
                email: fd.get('email'),
                newPassword: fd.get('newPassword'),
            });
            toast.success('Password reset successfully');
            navigate('/login');
        } catch {
            toast.error('Failed to reset password');
        }
    };

    return (
        <AuthShell title="Reset Password" subtitle="Enter your new password">
            <form onSubmit={submit} className="space-y-4">
                <Input name="email" type="email" required label="Email" placeholder="you@example.com" />
                <Input name="newPassword" type="password" required label="New Password" placeholder="Min. 8 characters" />
                <Button type="submit" fullWidth>Reset Password</Button>
            </form>
        </AuthShell>
    );
}
