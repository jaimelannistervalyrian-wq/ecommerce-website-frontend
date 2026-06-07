import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Heart, Menu, ShoppingBag, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cartAtom, authAtom } from '../../store/atoms';
import { api } from '../../lib/api';

export function Navbar() {
    const [cart] = useAtom(cartAtom);
    const [auth, setAuth] = useAtom(authAtom);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        delete api.defaults.headers.common.Authorization;
        setAuth(null);
        toast.success('Signed out successfully');
    };

    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

    const navLinks = [
        { label: 'Collections', to: '/products' },
        { label: 'Wishlist', to: '/wishlist' },
        ...(auth?.role === 'ADMIN' ? [{ label: 'Admin', to: '/admin' }] : []),
    ];

    return (
        <>
            <header
                className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled
                        ? 'bg-white/95 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl'
                        : 'bg-white/80 backdrop-blur-md'
                    }`}
            >
                <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-[5vw]">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex flex-col leading-none"
                    >
                        <span className="text-xl font-bold tracking-[0.12em] text-[#1a1208]">SS</span>
                        <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#8b6914]">
                            Jeweleries
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`text-xs uppercase tracking-[0.2em] transition-colors duration-200 hover:text-[#8b6914] ${location.pathname === link.to ? 'text-[#8b6914]' : 'text-[#4a3f2f]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!auth ? (
                            <Link
                                to="/login"
                                className="text-xs uppercase tracking-[0.2em] text-[#4a3f2f] transition-colors hover:text-[#8b6914]"
                            >
                                Login
                            </Link>
                        ) : (
                            <button
                                onClick={logout}
                                className="text-xs uppercase tracking-[0.2em] text-[#4a3f2f] transition-colors hover:text-[#8b6914]"
                            >
                                Logout
                            </button>
                        )}
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center gap-4">
                        <Link to="/account" className="text-[#4a3f2f] transition-colors hover:text-[#8b6914]">
                            <User className="h-5 w-5" />
                        </Link>
                        <Link
                            to="/wishlist"
                            className="text-[#4a3f2f] transition-colors hover:text-[#8b6914]"
                        >
                            <Heart className="h-5 w-5" />
                        </Link>
                        <Link
                            to="/cart"
                            className="relative text-[#4a3f2f] transition-colors hover:text-[#8b6914]"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#8b6914] text-[9px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {/* Mobile menu toggle */}
                        <button
                            className="text-[#4a3f2f] md:hidden"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 top-20 z-40 border-b border-[#e8e0d4] bg-white px-6 py-6 shadow-lg md:hidden"
                    >
                        <nav className="flex flex-col gap-5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="text-sm uppercase tracking-[0.2em] text-[#4a3f2f] hover:text-[#8b6914]"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!auth ? (
                                <Link
                                    to="/login"
                                    className="text-sm uppercase tracking-[0.2em] text-[#4a3f2f] hover:text-[#8b6914]"
                                >
                                    Login
                                </Link>
                            ) : (
                                <button
                                    onClick={logout}
                                    className="text-left text-sm uppercase tracking-[0.2em] text-[#4a3f2f] hover:text-[#8b6914]"
                                >
                                    Logout
                                </button>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
