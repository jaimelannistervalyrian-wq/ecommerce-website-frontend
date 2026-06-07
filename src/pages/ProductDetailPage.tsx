import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Minus, Plus, Shield, ShoppingBag, Star, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartAtom, authAtom } from '../store/atoms';
import { api } from '../lib/api';
import { ProductCard } from '../components/products/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import type { Product } from '../types';

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [, setCart] = useAtom(cartAtom);
    const [auth] = useAtom(authAtom);
    const [product, setProduct] = useState<Product | null>(null);
    const [related, setRelated] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setNotFound(false);
        setActiveImg(0);
        setQty(1);

        api.get(`/products/${id}`)
            .then((r) => setProduct(r.data))
            .catch(() => setNotFound(true));

        api.get(`/products/${id}/related`)
            .then((r) => setRelated(r.data ?? []))
            .catch(() => setRelated([]))
            .finally(() => setLoading(false));
    }, [id]);

    const addToCart = () => {
        if (!product) return;
        setCart((c) => {
            const existing = c.find((i) => i.id === product.id);
            if (existing) return c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
            return [...c, { id: product.id, name: product.name, price: product.salePrice ?? product.price, qty, image: product.images?.[0] }];
        });
        toast.success(`${qty} × ${product.name} added to cart`);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) { toast.error('Please login to leave a review'); return; }
        if (!product) return;
        setSubmittingReview(true);
        try {
            await api.post(`/products/${product.id}/reviews`, { rating: reviewRating, comment: reviewText });
            const refreshed = await api.get(`/products/${product.id}`);
            setProduct(refreshed.data);
            setReviewText('');
            toast.success('Review submitted');
        } catch {
            toast.error('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (notFound) {
        return (
            <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
                <p className="text-2xl font-bold text-[#1a1208]">Product not found</p>
                <p className="mt-2 text-sm text-[#9a8a7a]">This product may have been removed.</p>
                <button onClick={() => navigate('/products')} className="mt-6 rounded-xl bg-[#1a1208] px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white">
                    Back to Collections
                </button>
            </section>
        );
    }

    if (loading || !product) {
        return (
            <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-[5vw]">
                <div className="grid gap-12 lg:grid-cols-2">
                    <Skeleton className="aspect-[4/5]" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </section>
        );
    }

    const displayPrice = product.salePrice ?? product.price;
    const savings = product.salePrice ? product.price - product.salePrice : 0;

    return (
        <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-[5vw]">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-xs text-[#9a8a7a]">
                <Link to="/" className="hover:text-[#8b6914]">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/products" className="hover:text-[#8b6914]">Collections</Link>
                <ChevronRight className="h-3 w-3" />
                {product.category && (
                    <>
                        <Link to={`/products?category=${product.category.slug}`} className="hover:text-[#8b6914]">{product.category.name}</Link>
                        <ChevronRight className="h-3 w-3" />
                    </>
                )}
                <span className="text-[#4a3f2f]">{product.name}</span>
            </nav>

            <div className="grid gap-12 lg:grid-cols-2">
                {/* Images */}
                <div className="flex gap-4">
                    {product.images.length > 1 && (
                        <div className="flex flex-col gap-3">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${activeImg === i ? 'border-[#8b6914]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                    <motion.div key={activeImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-hidden rounded-2xl bg-[#f5f0ea]">
                        {product.images.length > 0 ? (
                            <img src={product.images[activeImg]} alt={product.name} className="aspect-[4/5] w-full object-cover" />
                        ) : (
                            <div className="flex aspect-[4/5] w-full items-center justify-center text-[#c9a84c]">
                                <ShoppingBag className="h-16 w-16 opacity-30" />
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Details */}
                <div className="flex flex-col">
                    {product.category && (
                        <Link to={`/products?category=${product.category.slug}`} className="mb-2 text-xs uppercase tracking-[0.25em] text-[#8b6914] hover:underline">
                            {product.category.name}
                        </Link>
                    )}
                    <h1 className="mb-4 text-3xl font-bold leading-tight text-[#1a1208] md:text-4xl">{product.name}</h1>

                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-[#8b6914] text-[#8b6914]' : 'text-[#e8e0d4]'}`} />
                            ))}
                        </div>
                        <span className="text-sm text-[#6b5c3e]">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
                    </div>

                    <div className="mb-6 flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-[#1a1208]">Rs. {Number(displayPrice).toLocaleString()}</span>
                        {product.salePrice && (
                            <>
                                <span className="text-lg text-[#9a8a7a] line-through">Rs. {Number(product.price).toLocaleString()}</span>
                                <span className="rounded-full bg-[#8b6914]/10 px-2.5 py-0.5 text-xs font-semibold text-[#8b6914]">Save Rs. {Number(savings).toLocaleString()}</span>
                            </>
                        )}
                    </div>

                    <p className="mb-8 text-sm leading-relaxed text-[#6b5c3e]">{product.description}</p>

                    <div className="mb-6">
                        {product.stock > 5 ? <p className="text-xs text-green-600">✓ In Stock</p>
                            : product.stock > 0 ? <p className="text-xs text-amber-600">⚠ Only {product.stock} left</p>
                                : <p className="text-xs text-red-500">✗ Out of Stock</p>}
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <span className="text-xs uppercase tracking-[0.15em] text-[#6b5c3e]">Quantity</span>
                        <div className="flex items-center rounded-xl border border-[#e8e0d4]">
                            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-[#4a3f2f] hover:text-[#8b6914]">
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-[#1a1208]">{qty}</span>
                            <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={product.stock === 0} className="flex h-10 w-10 items-center justify-center text-[#4a3f2f] hover:text-[#8b6914] disabled:opacity-40">
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="mb-8 flex gap-3">
                        <Button onClick={addToCart} disabled={product.stock === 0} fullWidth className="gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                        </Button>
                        <button
                            onClick={() => api.post('/wishlist/toggle', { productId: product.id }).then(() => toast.success('Wishlist updated')).catch(() => toast.error('Please login first'))}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e8e0d4] text-[#4a3f2f] transition-all hover:border-[#8b6914] hover:text-[#8b6914]"
                        >
                            <Heart className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-[#e8e0d4] bg-[#faf7f2] p-5">
                        {[
                            { icon: Shield, text: 'Certified authentic with certificate of origin' },
                            { icon: Truck, text: 'Free insured shipping on all orders' },
                            { icon: Star, text: 'Lifetime warranty on all fine jewelry' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <Icon className="h-4 w-4 shrink-0 text-[#8b6914]" />
                                <span className="text-xs text-[#6b5c3e]">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews + Related */}
            <div className="mt-20 grid gap-12 lg:grid-cols-2">
                <div>
                    <h2 className="mb-6 text-2xl font-bold text-[#1a1208]">Customer Reviews</h2>
                    <form onSubmit={submitReview} className="mb-8 rounded-2xl border border-[#e8e0d4] bg-white p-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#4a3f2f]">Write a Review</h3>
                        <div className="mb-4 flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110">
                                    <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-[#8b6914] text-[#8b6914]' : 'text-[#e8e0d4]'}`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            required rows={3}
                            placeholder="Share your experience..."
                            className="mb-4 w-full resize-none rounded-xl border border-[#e8e0d4] px-4 py-3 text-sm text-[#1a1208] placeholder:text-[#b8a99a] outline-none focus:border-[#8b6914] focus:ring-2 focus:ring-[#8b6914]/10"
                        />
                        <Button type="submit" disabled={submittingReview}>
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </form>
                    <div className="space-y-4">
                        {(product as any).reviews?.length
                            ? (product as any).reviews.map((r: any) => (
                                <div key={r.id} className="rounded-2xl border border-[#e8e0d4] bg-white p-5">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-[#1a1208]">{r.user?.fullName ?? 'Verified Buyer'}</p>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-[#8b6914] text-[#8b6914]' : 'text-[#e8e0d4]'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#6b5c3e]">{r.comment}</p>
                                </div>
                            ))
                            : <p className="text-sm text-[#9a8a7a]">No reviews yet. Be the first to review this piece.</p>
                        }
                    </div>
                </div>

                <div>
                    <h2 className="mb-6 text-2xl font-bold text-[#1a1208]">You May Also Like</h2>
                    {related.length === 0
                        ? <p className="text-sm text-[#9a8a7a]">No related products found.</p>
                        : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {related.slice(0, 4).map((rp) => (
                                    <ProductCard
                                        key={rp.id}
                                        product={rp}
                                        onAdd={() => {
                                            setCart((c) => {
                                                const existing = c.find((i) => i.id === rp.id);
                                                if (existing) return c.map((i) => (i.id === rp.id ? { ...i, qty: i.qty + 1 } : i));
                                                return [...c, { id: rp.id, name: rp.name, price: rp.salePrice ?? rp.price, qty: 1, image: rp.images?.[0] }];
                                            });
                                            toast.success('Added to cart');
                                        }}
                                    />
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </section>
    );
}
