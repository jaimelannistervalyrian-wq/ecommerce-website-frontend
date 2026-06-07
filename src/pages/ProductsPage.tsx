import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartAtom } from '../store/atoms';
import { api } from '../lib/api';
import { categories } from '../data/products';
import { ProductCard } from '../components/products/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import type { Product } from '../types';

export function ProductsPage() {
    const [, setCart] = useAtom(cartAtom);
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('newest');
    const [inStock, setInStock] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const categoryParam = searchParams.get('category') ?? '';

    useEffect(() => {
        setLoading(true);
        setError(false);
        api
            .get(`/products?search=${encodeURIComponent(query)}&sort=${sort}&category=${categoryParam}&limit=50`)
            .then((r) => setItems(r.data.items ?? []))
            .catch(() => { setError(true); setItems([]); })
            .finally(() => setLoading(false));
    }, [query, sort, categoryParam]);

    const visible = useMemo(
        () => (inStock ? items.filter((p) => p.stock > 0) : items),
        [items, inStock],
    );

    const addToCart = (p: Product) => {
        setCart((c) => {
            const existing = c.find((i) => i.id === p.id);
            if (existing) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
            return [...c, { id: p.id, name: p.name, price: p.salePrice ?? p.price, qty: 1, image: p.images?.[0] }];
        });
        toast.success('Added to cart');
    };

    return (
        <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-[5vw]">
            <div className="mb-10">
                <p className="mb-1 text-xs uppercase tracking-[0.3em] text-[#8b6914]">SS Jeweleries</p>
                <h1 className="text-4xl font-bold text-[#1a1208] md:text-5xl">Our Collections</h1>
            </div>

            {/* Category tabs */}
            <div className="mb-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            if (cat.slug) params.set('category', cat.slug);
                            else params.delete('category');
                            setSearchParams(params);
                        }}
                        className={`rounded-full px-5 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200 ${categoryParam === cat.slug
                                ? 'bg-[#1a1208] text-white'
                                : 'border border-[#e8e0d4] text-[#4a3f2f] hover:border-[#8b6914] hover:text-[#8b6914]'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8a7a]" />
                    <input
                        type="text"
                        placeholder="Search jewelry..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-xl border border-[#e8e0d4] bg-white py-3 pl-11 pr-4 text-sm text-[#1a1208] placeholder:text-[#b8a99a] outline-none focus:border-[#8b6914] focus:ring-2 focus:ring-[#8b6914]/10"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a8a7a] hover:text-[#1a1208]">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-3">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="rounded-xl border border-[#e8e0d4] bg-white px-4 py-3 text-sm text-[#1a1208] outline-none focus:border-[#8b6914]"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                    <button
                        onClick={() => setFiltersOpen((v) => !v)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${filtersOpen || inStock
                                ? 'border-[#8b6914] bg-[#8b6914] text-white'
                                : 'border-[#e8e0d4] text-[#4a3f2f] hover:border-[#8b6914]'
                            }`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                    </button>
                </div>
            </div>

            {filtersOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 rounded-2xl border border-[#e8e0d4] bg-white p-5"
                >
                    <label className="flex cursor-pointer items-center gap-3">
                        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 accent-[#8b6914]" />
                        <span className="text-sm text-[#4a3f2f]">In stock only</span>
                    </label>
                </motion.div>
            )}

            <p className="mb-6 text-sm text-[#9a8a7a]">
                {loading ? 'Loading...' : error ? 'Could not load products' : `${visible.length} piece${visible.length !== 1 ? 's' : ''} found`}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[420px]" />)
                    : visible.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onAdd={() => addToCart(p)}
                            onWish={() =>
                                api.post('/wishlist/toggle', { productId: p.id })
                                    .then(() => toast.success('Wishlist updated'))
                                    .catch(() => toast.error('Please login first'))
                            }
                        />
                    ))
                }
            </div>

            {!loading && visible.length === 0 && !error && (
                <div className="py-24 text-center">
                    <p className="text-lg font-medium text-[#4a3f2f]">No pieces found</p>
                    <p className="mt-2 text-sm text-[#9a8a7a]">Try adjusting your search or filters</p>
                </div>
            )}
        </section>
    );
}
