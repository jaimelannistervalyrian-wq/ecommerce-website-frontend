import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import type { Product } from '../../types';

interface ProductCardProps {
    product: Product;
    onAdd: () => void;
    onWish?: () => void;
    wishlisted?: boolean;
}

export function ProductCard({ product: p, onAdd, onWish, wishlisted }: ProductCardProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
            {/* Image */}
            <div className="relative overflow-hidden bg-[#f5f0ea]">
                <Link to={`/products/${p.id}`}>
                    <img
                        src={imgError ? '' : p.images?.[0]}
                        alt={p.name}
                        onError={() => setImgError(true)}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    {p.salePrice && (
                        <span className="rounded-full bg-[#8b6914] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                            Sale
                        </span>
                    )}
                    {p.stock <= 3 && p.stock > 0 && (
                        <span className="rounded-full bg-[#1a1208] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                            Only {p.stock} left
                        </span>
                    )}
                    {p.stock === 0 && (
                        <span className="rounded-full bg-[#9a8a7a] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Wishlist button */}
                {onWish && (
                    <button
                        onClick={onWish}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white"
                        aria-label="Add to wishlist"
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-[#8b6914] text-[#8b6914]' : 'text-[#4a3f2f]'
                                }`}
                        />
                    </button>
                )}

                {/* Quick add overlay */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <button
                        onClick={onAdd}
                        disabled={p.stock === 0}
                        className="flex w-full items-center justify-center gap-2 bg-[#1a1208]/90 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:bg-[#1a1208] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {p.stock === 0 ? 'Sold Out' : 'Quick Add'}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-4">
                {p.category && (
                    <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#8b6914]">
                        {p.category.name}
                    </p>
                )}
                <Link
                    to={`/products/${p.id}`}
                    className="mb-2 text-sm font-medium leading-snug text-[#1a1208] transition-colors hover:text-[#8b6914]"
                >
                    {p.name}
                </Link>

                {/* Rating */}
                <div className="mb-3 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-[#8b6914] text-[#8b6914]" />
                    <span className="text-xs text-[#6b5c3e]">
                        {p.rating.toFixed(1)} ({p.reviewCount})
                    </span>
                </div>

                {/* Price */}
                <div className="mt-auto flex items-center gap-2">
                    <span className="text-base font-semibold text-[#1a1208]">
                        Rs. {(p.salePrice ?? p.price).toLocaleString()}
                    </span>
                    {p.salePrice && (
                        <span className="text-sm text-[#9a8a7a] line-through">
                            Rs. {p.price.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
