import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartAtom, authAtom } from '../store/atoms';
import { api } from '../lib/api';
import { ProductCard } from '../components/products/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import type { Product } from '../types';

export function WishlistPage() {
    const [auth] = useAtom(authAtom);
    const [, setCart] = useAtom(cartAtom);
    const [items, setItems] = useState<{ id: string; product: Product }[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        if (!auth) return;
        api
            .get('/wishlist')
            .then((r) => setItems(r.data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [auth]);

    if (!auth) return <Navigate to="/login" replace />;

    const addToCart = (p: Product) => {
        setCart((c) => {
            const existing = c.find((i) => i.id === p.id);
            if (existing) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
            return [...c, { id: p.id, name: p.name, price: p.salePrice ?? p.price, qty: 1, image: p.images?.[0] }];
        });
        toast.success('Added to cart');
    };

    const removeFromWishlist = async (productId: string) => {
        await api.post('/wishlist/toggle', { productId });
        setItems((prev) => prev.filter((w) => w.product.id !== productId));
        toast.success('Removed from wishlist');
    };

    return (
        <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-[5vw]">
            <div className="mb-10">
                <p className="mb-1 text-xs uppercase tracking-[0.3em] text-[#8b6914]">Your saved pieces</p>
                <h1 className="text-4xl font-bold text-[#1a1208]">Wishlist</h1>
            </div>

            {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[420px]" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center py-24 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f0ea]">
                        <Heart className="h-8 w-8 text-[#8b6914]" />
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-[#1a1208]">Your wishlist is empty</h2>
                    <p className="text-sm text-[#6b5c3e]">Save pieces you love and come back to them anytime.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((w) => (
                        <ProductCard
                            key={w.product.id}
                            product={w.product}
                            onAdd={() => addToCart(w.product)}
                            onWish={() => removeFromWishlist(w.product.id)}
                            wishlisted
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
