import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { MapPin, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAtom } from '../store/atoms';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Address } from '../types';

type Tab = 'profile' | 'orders' | 'addresses';

type OrderItem = {
    id: string; quantity: number; priceAtTime: string;
    product: { id: string; name: string; images: string[] };
};
type MyOrder = {
    id: string; status: string; total: string; subtotal: string;
    discountAmount: string; shippingFee: string; paymentMethod: string;
    createdAt: string; items: OrderItem[];
    shippingAddress?: { line1: string; city: string; state: string; country: string };
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export function AccountPage() {
    const [auth] = useAtom(authAtom);
    const [tab, setTab] = useState<Tab>('profile');
    const [profile, setProfile] = useState<{ fullName: string; email: string; role: string } | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<MyOrder[]>([]);

    useEffect(() => {
        if (!auth) return;
        Promise.all([
            api.get('/users/me'),
            api.get('/users/me/addresses'),
            api.get('/orders/me'),
        ])
            .then(([me, addr, ord]) => {
                setProfile(me.data);
                setAddresses(addr.data);
                setOrders(ord.data);
            })
            .catch(() => toast.error('Failed to load account data'));
    }, [auth]);

    const addAddress = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            await api.post('/users/me/addresses', {
                line1: fd.get('line1'), city: fd.get('city'),
                state: fd.get('state'), postalCode: fd.get('postalCode'),
                country: fd.get('country'),
                phone: fd.get('phone') || undefined,
                isDefault: true,
            });
            const addr = await api.get('/users/me/addresses');
            setAddresses(addr.data);
            (e.target as HTMLFormElement).reset();
            toast.success('Address saved');
        } catch { toast.error('Failed to save address'); }
    };

    if (!auth) return <Navigate to="/login" replace />;

    const tabs = [
        { id: 'profile' as Tab, label: 'Profile', icon: User },
        { id: 'orders' as Tab, label: `Orders${orders.length ? ` (${orders.length})` : ''}`, icon: Package },
        { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    ];

    return (
        <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-[5vw]">
            <div className="mb-8">
                <p className="mb-1 text-xs uppercase tracking-[0.3em] text-[#8b6914]">My Account</p>
                <h1 className="text-3xl font-bold text-[#1a1208] md:text-4xl">
                    {profile ? `Hello, ${profile.fullName.split(' ')[0]}` : 'My Account'}
                </h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
                {/* Sidebar */}
                <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${tab === id ? 'bg-[#1a1208] text-white' : 'text-[#4a3f2f] hover:bg-[#f5f0ea]'
                                }`}>
                            <Icon className="h-4 w-4" />{label}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

                    {/* ── Profile ── */}
                    {tab === 'profile' && (
                        <div className="rounded-2xl border border-[#e8e0d4] bg-white p-6">
                            <h2 className="mb-6 text-lg font-semibold text-[#1a1208]">Profile Information</h2>
                            {profile ? (
                                <div className="space-y-5">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0ea]">
                                        <User className="h-7 w-7 text-[#8b6914]" />
                                    </div>
                                    {[
                                        { label: 'Full Name', value: profile.fullName },
                                        { label: 'Email', value: profile.email },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-xs uppercase tracking-[0.15em] text-[#9a8a7a]">{label}</p>
                                            <p className="mt-1 text-base text-[#1a1208]">{value}</p>
                                        </div>
                                    ))}
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.15em] text-[#9a8a7a]">Account Type</p>
                                        <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${profile.role === 'ADMIN' ? 'bg-[#8b6914]/10 text-[#8b6914]' : 'bg-[#f5f0ea] text-[#4a3f2f]'
                                            }`}>{profile.role}</span>
                                    </div>
                                </div>
                            ) : <p className="text-sm text-[#9a8a7a]">Loading...</p>}
                        </div>
                    )}

                    {/* ── Orders ── */}
                    {tab === 'orders' && (
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="rounded-2xl border border-[#e8e0d4] bg-white py-16 text-center">
                                    <Package className="mx-auto mb-3 h-10 w-10 text-[#c9a84c]" />
                                    <p className="text-sm text-[#9a8a7a]">No orders yet</p>
                                </div>
                            ) : orders.map((o) => {
                                const stepIdx = STATUS_STEPS.indexOf(o.status);
                                return (
                                    <div key={o.id} className="rounded-2xl border border-[#e8e0d4] bg-white p-5">
                                        {/* Order header */}
                                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f5f0ea] pb-4">
                                            <div>
                                                <p className="text-[10px] font-mono text-[#9a8a7a]">Order #{o.id.slice(0, 12).toUpperCase()}</p>
                                                <p className="mt-0.5 text-xs text-[#9a8a7a]">{new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {o.status}
                                                </span>
                                                <p className="text-base font-bold text-[#1a1208]">Rs. {Number(o.total).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        {o.status !== 'CANCELLED' && (
                                            <div className="my-4">
                                                <div className="flex items-center justify-between">
                                                    {STATUS_STEPS.map((s, i) => (
                                                        <div key={s} className="flex flex-1 flex-col items-center">
                                                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${i <= stepIdx ? 'bg-[#8b6914] text-white' : 'bg-[#f5f0ea] text-[#9a8a7a]'
                                                                }`}>
                                                                {i < stepIdx ? '✓' : i + 1}
                                                            </div>
                                                            <p className={`mt-1 text-[10px] text-center ${i <= stepIdx ? 'text-[#8b6914] font-medium' : 'text-[#9a8a7a]'}`}>
                                                                {s.charAt(0) + s.slice(1).toLowerCase()}
                                                            </p>
                                                            {i < STATUS_STEPS.length - 1 && (
                                                                <div className={`absolute mt-3.5 h-0.5 w-full ${i < stepIdx ? 'bg-[#8b6914]' : 'bg-[#e8e0d4]'}`} style={{ left: '50%', width: 'calc(100% - 28px)' }} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div className="mt-3 space-y-2">
                                            {o.items?.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f5f0ea]">
                                                        {item.product?.images?.[0]
                                                            ? <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                                                            : <div className="flex h-full w-full items-center justify-center"><Package className="h-4 w-4 text-[#c9a84c]" /></div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate text-sm font-medium text-[#1a1208]">{item.product?.name}</p>
                                                        <p className="text-xs text-[#9a8a7a]">Qty: {item.quantity} · Rs. {Number(item.priceAtTime).toLocaleString()} each</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[#1a1208]">
                                                        Rs. {(Number(item.priceAtTime) * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Totals */}
                                        <div className="mt-4 space-y-1 border-t border-[#f5f0ea] pt-3 text-xs text-[#6b5c3e]">
                                            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {Number(o.subtotal).toLocaleString()}</span></div>
                                            {Number(o.discountAmount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs. {Number(o.discountAmount).toLocaleString()}</span></div>}
                                            <div className="flex justify-between"><span>Shipping</span><span>{Number(o.shippingFee) === 0 ? 'Free' : `Rs. ${Number(o.shippingFee).toLocaleString()}`}</span></div>
                                            <div className="flex justify-between border-t border-[#f5f0ea] pt-1 text-sm font-bold text-[#1a1208]">
                                                <span>Total</span><span>Rs. {Number(o.total).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Delivery address */}
                                        {o.shippingAddress && (
                                            <p className="mt-3 text-xs text-[#9a8a7a]">
                                                📍 {o.shippingAddress.line1}, {o.shippingAddress.city}, {o.shippingAddress.state}, {o.shippingAddress.country}
                                                {(o.shippingAddress as any).phone && <span className="ml-2">· 📞 {(o.shippingAddress as any).phone}</span>}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Addresses ── */}
                    {tab === 'addresses' && (
                        <div className="space-y-5">
                            {addresses.length > 0 && (
                                <div className="rounded-2xl border border-[#e8e0d4] bg-white p-6">
                                    <h2 className="mb-4 text-lg font-semibold text-[#1a1208]">Saved Addresses</h2>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {addresses.map((a) => (
                                            <div key={a.id} className={`rounded-xl border p-4 ${a.isDefault ? 'border-[#8b6914] bg-[#faf7f2]' : 'border-[#e8e0d4]'}`}>
                                                {a.isDefault && <span className="mb-2 inline-block rounded-full bg-[#8b6914]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b6914]">Default</span>}
                                                <p className="text-sm text-[#4a3f2f]">{a.line1}</p>
                                                <p className="text-sm text-[#4a3f2f]">{a.city}, {a.state} {a.postalCode}</p>
                                                <p className="text-sm text-[#4a3f2f]">{a.country}</p>
                                                {a.phone && <p className="mt-1 text-sm text-[#4a3f2f]">📞 {a.phone}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="rounded-2xl border border-[#e8e0d4] bg-white p-6">
                                <h2 className="mb-5 text-lg font-semibold text-[#1a1208]">Add New Address</h2>
                                <form onSubmit={addAddress} className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2"><Input name="line1" required label="Address Line" placeholder="House no, Street, Area" /></div>
                                    <Input name="city" required label="City" placeholder="Lahore" />
                                    <Input name="state" required label="State / Province" placeholder="Punjab" />
                                    <Input name="postalCode" required label="Postal Code" placeholder="54000" />
                                    <Input name="country" required label="Country" placeholder="Pakistan" />
                                    <div className="sm:col-span-2"><Input name="phone" label="Phone Number" placeholder="+92 300 1234567" type="tel" /></div>
                                    <div className="sm:col-span-2"><Button type="submit">Save Address</Button></div>
                                </form>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
