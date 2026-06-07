import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, ClipboardList, ImagePlus, Package,
    PencilLine, Plus, Search, ShoppingCart, Trash2, Users, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAtom } from '../store/atoms';
import { api } from '../lib/api';
import { categories } from '../data/products';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Product } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────
type Overview = { ordersCount: number; usersCount: number; productsCount: number; totalRevenue: number };
type OrderItem = { id: string; quantity: number; priceAtTime: string; product: { name: string; images: string[] } };
type AdminOrder = {
    id: string; status: string; total: string; paymentMethod: string; createdAt: string;
    user: { fullName: string; email: string };
    items: OrderItem[];
    shippingAddress?: { line1: string; city: string; state: string; country: string };
};
type AdminUser = {
    id: string; fullName: string; email: string; role: string; createdAt: string;
    _count: { orders: number };
};
type ProductForm = {
    name: string; slug: string; description: string;
    price: string; salePrice: string; stock: string;
    categorySlug: string; isFeatured: boolean; isBestSeller: boolean;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const EMPTY_FORM: ProductForm = {
    name: '', slug: '', description: '',
    price: '', salePrice: '', stock: '10',
    categorySlug: 'rings', isFeatured: false, isBestSeller: false,
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminPage() {
    const [auth] = useAtom(authAtom);
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');

    // Products state
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [modal, setModal] = useState<null | 'create' | Product>(null);
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingUrls, setExistingUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Orders state
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Users state
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    // ── Data loaders ─────────────────────────────────────────────────────────────
    const loadProducts = () => {
        setProductsLoading(true);
        Promise.allSettled([api.get('/products?limit=100'), api.get('/admin/overview')])
            .then(([prod, ov]) => {
                if (prod.status === 'fulfilled') setProducts(prod.value.data.items ?? []);
                if (ov.status === 'fulfilled') setOverview(ov.value.data);
            })
            .finally(() => setProductsLoading(false));
    };

    const loadOrders = () => {
        setOrdersLoading(true);
        api.get('/admin/orders')
            .then((r) => setOrders(r.data ?? []))
            .catch(() => toast.error('Failed to load orders'))
            .finally(() => setOrdersLoading(false));
    };

    const loadUsers = () => {
        setUsersLoading(true);
        api.get('/admin/users')
            .then((r) => setUsers(r.data ?? []))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setUsersLoading(false));
    };

    useEffect(() => { loadProducts(); }, []);
    useEffect(() => {
        if (activeTab === 'orders') loadOrders();
        if (activeTab === 'users') loadUsers();
    }, [activeTab]);

    // ── Product modal helpers ─────────────────────────────────────────────────────
    const openCreate = () => {
        setForm(EMPTY_FORM);
        setPendingFiles([]); setPreviewUrls([]); setExistingUrls([]);
        setModal('create');
    };

    const openEdit = (p: Product) => {
        setForm({
            name: p.name, slug: p.slug, description: p.description,
            price: String(p.price),
            salePrice: p.salePrice ? String(p.salePrice) : '',
            stock: String(p.stock),
            categorySlug: p.category?.slug ?? 'rings',
            isFeatured: (p as any).isFeatured ?? false,
            isBestSeller: (p as any).isBestSeller ?? false,
        });
        setPendingFiles([]); setPreviewUrls([]);
        setExistingUrls(p.images ?? []);
        setModal(p);
    };

    const closeModal = () => {
        setModal(null);
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        setPendingFiles([]); setPreviewUrls([]); setExistingUrls([]);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setPendingFiles((p) => [...p, ...files]);
        setPreviewUrls((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const uploadPending = async (): Promise<string[]> => {
        if (!pendingFiles.length) return [];
        setUploading(true);
        try {
            const fd = new FormData();
            pendingFiles.forEach((f) => fd.append('images', f));
            const res = await api.post<{ urls: string[] }>('/upload/images', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data.urls;
        } finally { setUploading(false); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const newUrls = await uploadPending();
            const payload = {
                name: form.name,
                slug: form.slug || toSlug(form.name),
                description: form.description,
                price: Number(form.price),
                salePrice: form.salePrice ? Number(form.salePrice) : undefined,
                stock: Number(form.stock),
                categorySlug: form.categorySlug,
                isFeatured: form.isFeatured,
                isBestSeller: form.isBestSeller,
                images: [...existingUrls, ...newUrls],
            };
            if (modal === 'create') {
                await api.post('/admin/products', payload);
                toast.success('Product created');
            } else if (modal && typeof modal === 'object') {
                await api.patch(`/admin/products/${(modal as Product).id}`, payload);
                toast.success('Product updated');
            }
            closeModal();
            loadProducts();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Save failed');
        } finally { setSaving(false); }
    };

    const deleteProduct = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Deleted');
            loadProducts();
        } catch { toast.error('Delete failed'); }
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await api.patch(`/admin/orders/${orderId}/status`, { status });
            toast.success(`Order marked as ${status}`);
            loadOrders();
        } catch { toast.error('Failed to update status'); }
    };

    if (!auth) return <Navigate to="/login" replace />;
    if (auth.role !== 'ADMIN') return <Navigate to="/" replace />;

    const isEditing = modal && typeof modal === 'object';
    const totalImages = existingUrls.length + pendingFiles.length;
    const filteredUsers = users.filter(
        (u) =>
            u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()),
    );

    return (
        <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-[5vw]">
            {/* Header */}
            <div className="mb-8">
                <p className="mb-1 text-xs uppercase tracking-[0.3em] text-[#8b6914]">Dashboard</p>
                <h1 className="text-3xl font-bold text-[#1a1208] md:text-4xl">Admin Panel</h1>
            </div>

            {/* Overview cards */}
            {overview && (
                <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        { label: 'Orders', value: overview.ordersCount, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Users', value: overview.usersCount, icon: Users, color: 'text-purple-600 bg-purple-50' },
                        { label: 'Products', value: overview.productsCount, icon: Package, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Revenue', value: `Rs. ${Number(overview.totalRevenue).toLocaleString()}`, icon: BarChart3, color: 'text-green-600 bg-green-50' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="rounded-2xl border border-[#e8e0d4] bg-white p-4">
                            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <p className="text-xl font-bold text-[#1a1208]">{value}</p>
                            <p className="text-xs text-[#9a8a7a]">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-[#e8e0d4] bg-[#faf7f2] p-1 w-fit">
                {([
                    { id: 'products', label: 'Products', icon: Package },
                    { id: 'orders', label: 'Orders', icon: ClipboardList },
                    { id: 'users', label: 'Users', icon: Users },
                ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === id ? 'bg-white text-[#1a1208] shadow-sm' : 'text-[#9a8a7a] hover:text-[#4a3f2f]'
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── PRODUCTS TAB ── */}
            {activeTab === 'products' && (
                <div className="rounded-2xl border border-[#e8e0d4] bg-white">
                    <div className="flex items-center justify-between border-b border-[#e8e0d4] p-4 md:p-5">
                        <div>
                            <h2 className="text-base font-semibold text-[#1a1208]">Products</h2>
                            <p className="text-xs text-[#9a8a7a]">{products.length} total</p>
                        </div>
                        <Button onClick={openCreate} className="gap-2 text-xs">
                            <Plus className="h-4 w-4" /> Add Product
                        </Button>
                    </div>
                    <div className="p-4 md:p-5">
                        {productsLoading ? (
                            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                        ) : products.length === 0 ? (
                            <p className="py-12 text-center text-sm text-[#9a8a7a]">No products yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {products.map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-[#e8e0d4] p-3 hover:bg-[#fdfaf6]">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f5f0ea]">
                                            {p.images?.[0]
                                                ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                                                : <div className="flex h-full w-full items-center justify-center"><Package className="h-4 w-4 text-[#c9a84c]" /></div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-[#1a1208]">{p.name}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                <span className="text-xs text-[#8b6914]">{p.category?.name}</span>
                                                <span className="text-xs text-[#9a8a7a]">·</span>
                                                <span className="text-xs font-medium text-[#1a1208]">Rs. {Number(p.salePrice ?? p.price).toLocaleString()}</span>
                                                {p.salePrice && <span className="text-xs text-[#9a8a7a] line-through">Rs. {Number(p.price).toLocaleString()}</span>}
                                                <span className="text-xs text-[#9a8a7a]">·</span>
                                                <span className={`text-xs ${p.stock === 0 ? 'text-red-500' : p.stock <= 3 ? 'text-amber-600' : 'text-green-600'}`}>
                                                    {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="hidden gap-1 md:flex">
                                            {(p as any).isFeatured && <span className="rounded-full bg-[#8b6914]/10 px-2 py-0.5 text-[10px] font-semibold text-[#8b6914]">Featured</span>}
                                            {(p as any).isBestSeller && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Best Seller</span>}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openEdit(p)} className="flex items-center gap-1 rounded-lg border border-[#e8e0d4] px-2.5 py-1.5 text-xs text-[#4a3f2f] hover:border-[#8b6914] hover:text-[#8b6914]">
                                                <PencilLine className="h-3 w-3" /><span className="hidden sm:inline">Edit</span>
                                            </button>
                                            <button onClick={() => deleteProduct(p.id, p.name)} className="flex items-center gap-1 rounded-lg border border-[#e8e0d4] px-2.5 py-1.5 text-xs text-[#4a3f2f] hover:border-red-400 hover:text-red-500">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
                <div className="rounded-2xl border border-[#e8e0d4] bg-white">
                    <div className="flex items-center justify-between border-b border-[#e8e0d4] p-4 md:p-5">
                        <div>
                            <h2 className="text-base font-semibold text-[#1a1208]">All Orders</h2>
                            <p className="text-xs text-[#9a8a7a]">{orders.length} orders</p>
                        </div>
                        <button onClick={loadOrders} className="rounded-xl border border-[#e8e0d4] px-3 py-1.5 text-xs text-[#4a3f2f] hover:border-[#8b6914] hover:text-[#8b6914]">
                            Refresh
                        </button>
                    </div>
                    <div className="p-4 md:p-5">
                        {ordersLoading ? (
                            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
                        ) : orders.length === 0 ? (
                            <div className="py-16 text-center">
                                <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#e8e0d4]" />
                                <p className="text-sm text-[#9a8a7a]">No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((o) => (
                                    <div key={o.id} className="rounded-xl border border-[#e8e0d4] p-4">
                                        {/* Order header */}
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-mono text-[#9a8a7a]">#{o.id.slice(0, 14).toUpperCase()}</p>
                                                <p className="mt-0.5 text-sm font-semibold text-[#1a1208]">{o.user?.fullName}</p>
                                                <p className="text-xs text-[#9a8a7a]">{o.user?.email}</p>
                                                {o.shippingAddress && (
                                                    <p className="mt-1 text-xs text-[#9a8a7a]">
                                                        📍 {o.shippingAddress.line1}, {o.shippingAddress.city}, {o.shippingAddress.country}
                                                        {(o.shippingAddress as any).phone && <span className="ml-2 font-medium text-[#4a3f2f]">· 📞 {(o.shippingAddress as any).phone}</span>}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {o.status}
                                                </span>
                                                <p className="text-base font-bold text-[#1a1208]">Rs. {Number(o.total).toLocaleString()}</p>
                                                <p className="text-xs text-[#9a8a7a]">{o.paymentMethod} · {new Date(o.createdAt).toLocaleDateString('en-PK')}</p>
                                            </div>
                                        </div>

                                        {/* Products in order */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {o.items?.map((item) => (
                                                <div key={item.id} className="flex items-center gap-2 rounded-lg bg-[#faf7f2] px-2.5 py-1.5">
                                                    {item.product?.images?.[0] && (
                                                        <img src={item.product.images[0]} alt="" className="h-6 w-6 rounded object-cover" />
                                                    )}
                                                    <span className="text-xs text-[#4a3f2f]">{item.product?.name} × {item.quantity}</span>
                                                    <span className="text-xs text-[#9a8a7a]">Rs. {Number(item.priceAtTime).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Status update buttons */}
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-[#9a8a7a]">Update:</span>
                                            {ORDER_STATUSES.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateOrderStatus(o.id, s)}
                                                    disabled={o.status === s}
                                                    className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 ${s === 'CANCELLED'
                                                        ? 'border border-red-200 text-red-500 hover:bg-red-50'
                                                        : 'border border-[#e8e0d4] text-[#4a3f2f] hover:border-[#8b6914] hover:text-[#8b6914]'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === 'users' && (
                <div className="rounded-2xl border border-[#e8e0d4] bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e0d4] p-4 md:p-5">
                        <div>
                            <h2 className="text-base font-semibold text-[#1a1208]">Registered Users</h2>
                            <p className="text-xs text-[#9a8a7a]">{users.length} users</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a8a7a]" />
                            <input
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Search users..."
                                className="rounded-xl border border-[#e8e0d4] bg-white py-2 pl-9 pr-4 text-sm text-[#1a1208] placeholder:text-[#b8a99a] outline-none focus:border-[#8b6914] w-56"
                            />
                        </div>
                    </div>
                    <div className="p-4 md:p-5">
                        {usersLoading ? (
                            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
                        ) : filteredUsers.length === 0 ? (
                            <p className="py-12 text-center text-sm text-[#9a8a7a]">No users found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#e8e0d4]">
                                            {['Name', 'Email', 'Role', 'Orders', 'Joined'].map((h) => (
                                                <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#9a8a7a]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5f0ea]">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-[#fdfaf6]">
                                                <td className="py-3 pr-4 font-medium text-[#1a1208]">{u.fullName}</td>
                                                <td className="py-3 pr-4 text-[#6b5c3e]">{u.email}</td>
                                                <td className="py-3 pr-4">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${u.role === 'ADMIN' ? 'bg-[#8b6914]/10 text-[#8b6914]' : 'bg-[#f5f0ea] text-[#4a3f2f]'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-[#6b5c3e]">{u._count?.orders ?? 0}</td>
                                                <td className="py-3 text-[#9a8a7a]">{new Date(u.createdAt).toLocaleDateString('en-PK')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Product Create/Edit Modal ── */}
            <AnimatePresence>
                {modal !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
                        >
                            {/* Modal header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e0d4] bg-white px-5 py-4">
                                <h3 className="text-base font-semibold text-[#1a1208]">
                                    {modal === 'create' ? 'Add New Product' : `Edit: ${(modal as Product).name}`}
                                </h3>
                                <button onClick={closeModal} className="rounded-lg p-1.5 text-[#9a8a7a] hover:bg-[#f5f0ea] hover:text-[#1a1208]">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                                {/* Images */}
                                <div>
                                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-[#6b5c3e]">Product Images</label>
                                    {totalImages > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {existingUrls.map((url, i) => (
                                                <div key={`ex-${i}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#e8e0d4] bg-[#f5f0ea]">
                                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                                    <button type="button" onClick={() => setExistingUrls((p) => p.filter((_, j) => j !== i))}
                                                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                    <span className="absolute bottom-0 left-0 right-0 bg-black/40 py-0.5 text-center text-[9px] text-white">Saved</span>
                                                </div>
                                            ))}
                                            {previewUrls.map((url, i) => (
                                                <div key={`pend-${i}`} className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-dashed border-[#8b6914] bg-[#f5f0ea]">
                                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                                    <button type="button" onClick={() => {
                                                        URL.revokeObjectURL(previewUrls[i]);
                                                        setPendingFiles((p) => p.filter((_, j) => j !== i));
                                                        setPreviewUrls((p) => p.filter((_, j) => j !== i));
                                                    }} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                    <span className="absolute bottom-0 left-0 right-0 bg-[#8b6914]/80 py-0.5 text-center text-[9px] text-white">New</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-[#e8e0d4] px-4 py-2.5 text-sm text-[#6b5c3e] hover:border-[#8b6914] hover:text-[#8b6914]">
                                        <ImagePlus className="h-4 w-4" />
                                        {totalImages === 0 ? 'Upload Images' : 'Add More'}
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />
                                    <p className="mt-1 text-[11px] text-[#9a8a7a]">JPEG, PNG or WebP · Max 10 MB · Stored on Cloudinary</p>
                                </div>

                                <Input label="Product Name *" required value={form.name} placeholder="e.g. Kundan Earring Set"
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug === toSlug(f.name) || f.slug === '' ? toSlug(e.target.value) : f.slug }))} />

                                <Input label="Slug *" required value={form.slug} placeholder="kundan-earring-set"
                                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium uppercase tracking-[0.15em] text-[#6b5c3e]">Description *</label>
                                    <textarea required value={form.description} rows={3} placeholder="Describe this jewelry piece..."
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                        className="w-full resize-none rounded-xl border border-[#e8e0d4] px-4 py-3 text-sm text-[#1a1208] placeholder:text-[#b8a99a] outline-none focus:border-[#8b6914] focus:ring-2 focus:ring-[#8b6914]/10" />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <Input label="Price (Rs.) *" type="number" required min="0" step="0.01" value={form.price} placeholder="999"
                                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                                    <Input label="Sale Price" type="number" min="0" step="0.01" value={form.salePrice} placeholder="Optional"
                                        onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))} />
                                    <Input label="Stock *" type="number" required min="0" value={form.stock} placeholder="10"
                                        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium uppercase tracking-[0.15em] text-[#6b5c3e]">Category *</label>
                                    <select required value={form.categorySlug} onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                                        className="w-full rounded-xl border border-[#e8e0d4] bg-white px-4 py-3 text-sm text-[#1a1208] outline-none focus:border-[#8b6914]">
                                        {categories.filter((c) => c.slug).map((cat) => (
                                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-6">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="h-4 w-4 accent-[#8b6914]" />
                                        <span className="text-sm text-[#4a3f2f]">Featured</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))} className="h-4 w-4 accent-[#8b6914]" />
                                        <span className="text-sm text-[#4a3f2f]">Best Seller</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 border-t border-[#e8e0d4] pt-4">
                                    <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                    <Button type="submit" disabled={saving || uploading}>
                                        {uploading ? 'Uploading...' : saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
