import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Award, ChevronLeft, ChevronRight, RefreshCw, Shield, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartAtom } from '../store/atoms';
import { api } from '../lib/api';
import { categories } from '../data/products';
import { ProductCard } from '../components/products/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import type { Product } from '../types';

// ── Hero slides using your actual SS Jeweleries brand images ──────────────────
import slide1 from '../assets/hero/slide1.jpeg';
import slide2 from '../assets/hero/slide2.jpeg';
import slide3 from '../assets/hero/slide3.jpeg';
import slide4 from '../assets/hero/slide4.jpeg';

const heroSlides = [
    {
        image: slide1,
        tag: 'New Arrivals 2026',
        title: 'Kundan Earrings',
        subtitle: '& Bindiya',
        desc: 'Handcrafted with love — each piece tells a story of tradition and elegance.',
        cta: 'Shop Earrings',
        link: '/products?category=earrings',
    },
    {
        image: slide2,
        tag: 'SS Jewellery Collection',
        title: 'Bridal',
        subtitle: 'Collection',
        desc: 'Exquisite bridal sets crafted for your most precious moments.',
        cta: 'Explore Bridal',
        link: '/products',
    },
    {
        image: slide3,
        tag: 'Kundan & Gold',
        title: 'Statement',
        subtitle: 'Pieces',
        desc: 'Bold, beautiful, and made to be remembered. Wear your story.',
        cta: 'View Collection',
        link: '/products',
    },
    {
        image: slide4,
        tag: 'Festive Edit',
        title: 'Necklace &',
        subtitle: 'Earring Sets',
        desc: 'Complete sets for every celebration — from Eid to weddings.',
        cta: 'Shop Sets',
        link: '/products?category=necklaces',
    },
];

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    }),
};

// ── Hero Slider ───────────────────────────────────────────────────────────────
function HeroSlider() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const go = (idx: number) => {
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
    };

    const prev = () => go((current - 1 + heroSlides.length) % heroSlides.length);
    const next = () => go((current + 1) % heroSlides.length);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setDirection(1);
            setCurrent((c) => (c + 1) % heroSlides.length);
        }, 5000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const slide = heroSlides[current];

    return (
        <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-[#1a0f00]">
            {/* Background image */}
            <AnimatePresence mode="sync" initial={false}>
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: direction * 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 80 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0"
                >
                    <img src={slide.image} alt="" className="h-full w-full object-cover" />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 flex h-full items-center">
                <div className="mx-auto w-full max-w-[1440px] px-6 md:px-[5vw]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="max-w-2xl"
                        >
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-[#c9a84c]"
                            >
                                ✦ {slide.tag}
                            </motion.p>

                            <h1 className="mb-2 text-6xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
                                {slide.title}
                            </h1>
                            <h1 className="mb-6 text-6xl font-bold leading-[1.05] tracking-tight text-[#c9a84c] md:text-7xl lg:text-8xl">
                                {slide.subtitle}
                            </h1>

                            <p className="mb-10 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
                                {slide.desc}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to={slide.link}
                                    className="group inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a0f00] transition-all duration-300 hover:bg-white hover:gap-3"
                                >
                                    {slide.cta}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    to="/products"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10"
                                >
                                    All Collections
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation arrows */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 md:left-8"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 md:right-8"
                aria-label="Next slide"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {heroSlides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => go(i)}
                        className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-[#c9a84c]' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Slide counter */}
            <div className="absolute bottom-8 right-6 z-20 text-xs font-medium text-white/50 md:right-[5vw]">
                {String(current + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
            </div>
        </section>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function HomePage() {
    const [, setCart] = useAtom(cartAtom);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const [timer, setTimer] = useState('00:00:00');

    const saleEnd = new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString();

    useEffect(() => {
        api.get('/products?limit=8&sort=newest')
            .then((r) => setProducts(r.data.items ?? []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(saleEnd).getTime() - Date.now();
            const h = Math.max(0, Math.floor(diff / 3600000));
            const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
            const s = Math.max(0, Math.floor((diff % 60000) / 1000));
            setTimer(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [saleEnd]);

    const addToCart = (p: Product) => {
        setCart((c) => {
            const existing = c.find((i) => i.id === p.id);
            if (existing) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
            return [...c, { id: p.id, name: p.name, price: p.salePrice ?? p.price, qty: 1, image: p.images?.[0] }];
        });
        toast.success('Added to cart');
    };

    const filtered = activeCategory
        ? products.filter((p) => p.category?.slug === activeCategory)
        : products;

    return (
        <>
            {/* ── Hero Slider ── */}
            <HeroSlider />

            {/* ── Trust Badges ── */}
            <section className="border-y border-[#e8e0d4] bg-white">
                <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-[5vw]">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { icon: Truck, label: 'Free Delivery', sub: 'On orders over Rs. 2000' },
                            { icon: Shield, label: 'Authentic Pieces', sub: 'Every item verified' },
                            { icon: RefreshCw, label: 'Easy Returns', sub: '7-day return policy' },
                            { icon: Award, label: 'Premium Quality', sub: 'Handcrafted with care' },
                        ].map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f0ea]">
                                    <Icon className="h-4 w-4 text-[#8b6914]" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#1a1208]">{label}</p>
                                    <p className="text-[11px] text-[#9a8a7a]">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Category Pills ── */}
            <section className="mx-auto max-w-[1440px] px-6 pt-14 md:px-[5vw]">
                <div className="mb-2 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#8b6914]">Browse by</p>
                    <h2 className="text-3xl font-bold text-[#1a1208]">Category</h2>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => setActiveCategory(cat.slug)}
                            className={`rounded-full px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200 ${activeCategory === cat.slug
                                    ? 'bg-[#1a1208] text-white shadow-lg'
                                    : 'border border-[#e8e0d4] text-[#4a3f2f] hover:border-[#8b6914] hover:text-[#8b6914]'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Featured Products ── */}
            <section className="mx-auto max-w-[1440px] px-6 py-10 md:px-[5vw]">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.25em] text-[#8b6914]">Curated for you</p>
                        <h2 className="text-3xl font-bold text-[#1a1208] md:text-4xl">Featured Pieces</h2>
                    </div>
                    <Link to="/products" className="hidden items-center gap-1 text-xs uppercase tracking-[0.2em] text-[#4a3f2f] transition-colors hover:text-[#8b6914] md:flex">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[420px]" />)
                        : filtered.length === 0
                            ? <div className="col-span-full py-16 text-center"><p className="text-sm text-[#9a8a7a]">No products yet.</p></div>
                            : filtered.slice(0, 8).map((p, i) => (
                                <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                    <ProductCard
                                        product={p}
                                        onAdd={() => addToCart(p)}
                                        onWish={() => api.post('/wishlist/toggle', { productId: p.id }).then(() => toast.success('Wishlist updated')).catch(() => toast.error('Please login first'))}
                                    />
                                </motion.div>
                            ))
                    }
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#4a3f2f] hover:text-[#8b6914]">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </section>

            {/* ── Flash Sale Banner ── */}
            <section className="mx-auto max-w-[1440px] px-6 py-6 md:px-[5vw]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-3xl bg-[#1a0f00] px-8 py-14 text-center"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#8b6914/25_0%,_transparent_70%)]" />
                    {/* Decorative corners */}
                    <div className="absolute left-6 top-6 text-[#c9a84c]/20 text-6xl font-serif">✦</div>
                    <div className="absolute right-6 bottom-6 text-[#c9a84c]/20 text-6xl font-serif">✦</div>
                    <div className="relative z-10">
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-[#c9a84c]">Limited Time Offer</p>
                        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Exclusive Sale Ends In</h2>
                        <div className="mb-8 flex items-center justify-center gap-6">
                            {timer.split(':').map((unit, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                                        <span className="text-3xl font-bold tabular-nums text-[#c9a84c]">{unit}</span>
                                    </div>
                                    <span className="mt-1.5 text-[10px] uppercase tracking-widest text-white/40">{['Hours', 'Mins', 'Secs'][i]}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a0f00] transition-colors hover:bg-white">
                            Shop Sale <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── Testimonials ── */}
            <section className="mx-auto max-w-[1440px] px-6 py-14 md:px-[5vw]">
                <div className="mb-10 text-center">
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#8b6914]">What our clients say</p>
                    <h2 className="text-3xl font-bold text-[#1a1208]">Stories of Love</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        { quote: 'The Kundan set I ordered for my wedding was absolutely breathtaking. Everyone was asking where I got it!', name: 'Ayesha R.', role: 'Verified Buyer', stars: 5 },
                        { quote: 'SS Jeweleries delivered beyond my expectations. The packaging was premium and the earrings are stunning.', name: 'Fatima K.', role: 'Verified Buyer', stars: 5 },
                        { quote: 'Fast delivery and the quality is amazing. The bindiya matched perfectly with my bridal look.', name: 'Sana M.', role: 'Verified Buyer', stars: 5 },
                    ].map((t, i) => (
                        <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="rounded-2xl border border-[#e8e0d4] bg-white p-6">
                            <div className="mb-4 flex gap-0.5">{Array.from({ length: t.stars }).map((_, j) => <span key={j} className="text-[#c9a84c]">★</span>)}</div>
                            <p className="mb-5 text-sm leading-relaxed text-[#4a3f2f]">"{t.quote}"</p>
                            <div>
                                <p className="text-sm font-semibold text-[#1a1208]">{t.name}</p>
                                <p className="text-xs text-[#9a8a7a]">{t.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Newsletter ── */}
            <section className="bg-[#f5f0ea] py-20">
                <div className="mx-auto max-w-[600px] px-6 text-center">
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#8b6914]">Stay Connected</p>
                    <h3 className="mb-3 text-3xl font-bold text-[#1a1208]">Join the SS Family</h3>
                    <p className="mb-8 text-sm text-[#6b5c3e]">Be the first to know about new collections, exclusive offers, and festive deals.</p>
                    <form onSubmit={(e) => { e.preventDefault(); toast.success("You're on the list! 🎉"); (e.target as HTMLFormElement).reset(); }} className="flex gap-3">
                        <input type="email" required placeholder="Your email address"
                            className="flex-1 rounded-full border border-[#e8e0d4] bg-white px-5 py-3 text-sm text-[#1a1208] placeholder:text-[#b8a99a] outline-none focus:border-[#8b6914]" />
                        <button type="submit" className="rounded-full bg-[#1a1208] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#8b6914]">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
}
