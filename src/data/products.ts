// Import all local product images
import img01 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.04 PM.jpeg';
import img02 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.05 PM (1).jpeg';
import img03 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.05 PM.jpeg';
import img04 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.06 PM.jpeg';
import img05 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.07 PM.jpeg';
import img06 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.08 PM (1).jpeg';
import img07 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.08 PM (2).jpeg';
import img08 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.08 PM.jpeg';
import img09 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.10 PM (1).jpeg';
import img10 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.10 PM.jpeg';
import img11 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.11 PM (1).jpeg';
import img12 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.11 PM.jpeg';
import img13 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.17 PM.jpeg';
import img14 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.18 PM (1).jpeg';
import img15 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.18 PM.jpeg';
import img16 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.19 PM (1).jpeg';
import img17 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.19 PM.jpeg';
import img18 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.20 PM (1).jpeg';
import img19 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.20 PM (2).jpeg';
import img20 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.20 PM.jpeg';
import img21 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.21 PM (1).jpeg';
import img22 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.21 PM.jpeg';
import img23 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.22 PM (1).jpeg';
import img24 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.22 PM (2).jpeg';
import img25 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.22 PM.jpeg';
import img26 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.23 PM (1).jpeg';
import img27 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.23 PM.jpeg';
import img28 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.24 PM (1).jpeg';
import img29 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.24 PM.jpeg';
import img30 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.25 PM (1).jpeg';
import img31 from '../assets/product_images/WhatsApp Image 2026-04-24 at 8.31.25 PM.jpeg';
import img32 from '../assets/product_images/WhatsApp Image 2026-05-08 at 1.01.50 AM.jpeg';
import img33 from '../assets/product_images/WhatsApp Image 2026-05-08 at 1.01.51 AM (1).jpeg';
import img34 from '../assets/product_images/WhatsApp Image 2026-05-08 at 1.01.51 AM (2).jpeg';
import img35 from '../assets/product_images/WhatsApp Image 2026-05-08 at 1.01.51 AM.jpeg';

import type { Product } from '../types';

/** Maps every product slug to its local asset images */
export const slugImageMap: Record<string, string[]> = {
    'diamond-solitaire-ring': [img01, img02],
    'gold-chain-necklace': [img03, img04],
    'pearl-drop-earrings': [img05, img06],
    'sapphire-tennis-bracelet': [img07, img08],
    'emerald-pendant': [img09, img10],
    'rose-gold-bangle': [img11, img12],
    'ruby-cocktail-ring': [img13, img14],
    'diamond-stud-earrings': [img15, img16],
    'art-deco-brooch': [img17, img18],
    'gold-hoop-earrings': [img19, img20],
    'platinum-wedding-band': [img21, img22],
    'layered-gold-necklace': [img23, img24],
    'amethyst-drop-earrings': [img25, img26],
    'gold-charm-bracelet': [img27, img28],
    'diamond-eternity-band': [img29, img30],
    'opal-pendant-necklace': [img31, img32],
    'sterling-silver-cuff': [img33, img34],
    'tanzanite-cocktail-ring': [img35, img01],
};

/**
 * Patches a product (or array) coming from the API with local images.
 * If the API already has images, they are kept; otherwise local assets are used.
 */
export function mergeImages<T extends { slug: string; images: string[] }>(product: T): T {
    if (product.images && product.images.length > 0) return product;
    return { ...product, images: slugImageMap[product.slug] ?? [img01] };
}

export function mergeImagesMany<T extends { slug: string; images: string[] }>(products: T[]): T[] {
    return products.map(mergeImages);
}

export const fallbackProducts: Product[] = [
    {
        id: '1',
        slug: 'diamond-solitaire-ring',
        name: 'Diamond Solitaire Ring',
        description: 'A timeless solitaire ring featuring a brilliant-cut diamond set in 18k white gold. The perfect symbol of eternal love and refined elegance.',
        price: 2499,
        salePrice: 1999,
        images: [img01, img02],
        rating: 4.9,
        reviewCount: 142,
        stock: 5,
        category: { name: 'Rings', slug: 'rings' },
    },
    {
        id: '2',
        slug: 'gold-chain-necklace',
        name: 'Gold Chain Necklace',
        description: 'Handcrafted 22k gold chain necklace with a delicate interlocking design. A statement piece that elevates any ensemble.',
        price: 1850,
        images: [img03, img04],
        rating: 4.8,
        reviewCount: 98,
        stock: 8,
        category: { name: 'Necklaces', slug: 'necklaces' },
    },
    {
        id: '3',
        slug: 'pearl-drop-earrings',
        name: 'Pearl Drop Earrings',
        description: 'South Sea pearl drop earrings set in sterling silver. Lustrous, elegant, and effortlessly sophisticated.',
        price: 650,
        images: [img05, img06],
        rating: 4.7,
        reviewCount: 76,
        stock: 12,
        category: { name: 'Earrings', slug: 'earrings' },
    },
    {
        id: '4',
        slug: 'sapphire-tennis-bracelet',
        name: 'Sapphire Tennis Bracelet',
        description: 'A stunning tennis bracelet featuring alternating sapphires and diamonds in a 14k white gold setting.',
        price: 3200,
        salePrice: 2750,
        images: [img07, img08],
        rating: 5.0,
        reviewCount: 54,
        stock: 3,
        category: { name: 'Bracelets', slug: 'bracelets' },
    },
    {
        id: '5',
        slug: 'emerald-pendant',
        name: 'Emerald Pendant',
        description: 'Colombian emerald pendant in 18k yellow gold with a delicate diamond halo. Vivid color, exceptional clarity.',
        price: 1750,
        images: [img09, img10],
        rating: 4.8,
        reviewCount: 63,
        stock: 6,
        category: { name: 'Necklaces', slug: 'necklaces' },
    },
    {
        id: '6',
        slug: 'rose-gold-bangle',
        name: 'Rose Gold Bangle',
        description: 'Sleek 18k rose gold bangle with a brushed finish. Minimalist luxury for the modern woman.',
        price: 980,
        images: [img11, img12],
        rating: 4.6,
        reviewCount: 89,
        stock: 15,
        category: { name: 'Bracelets', slug: 'bracelets' },
    },
    {
        id: '7',
        slug: 'ruby-cocktail-ring',
        name: 'Ruby Cocktail Ring',
        description: 'Bold Burmese ruby cocktail ring surrounded by pavé diamonds in 18k gold. A true collector\'s piece.',
        price: 4200,
        images: [img13, img14],
        rating: 4.9,
        reviewCount: 37,
        stock: 2,
        category: { name: 'Rings', slug: 'rings' },
    },
    {
        id: '8',
        slug: 'diamond-stud-earrings',
        name: 'Diamond Stud Earrings',
        description: 'Classic round brilliant diamond studs in 18k white gold four-prong settings. Timeless and versatile.',
        price: 1200,
        salePrice: 999,
        images: [img15, img16],
        rating: 4.9,
        reviewCount: 211,
        stock: 20,
        category: { name: 'Earrings', slug: 'earrings' },
    },
    {
        id: '9',
        slug: 'vintage-brooch',
        name: 'Art Deco Brooch',
        description: 'Inspired by the Art Deco era, this platinum brooch features geometric diamond patterns with sapphire accents.',
        price: 2100,
        images: [img17, img18],
        rating: 4.7,
        reviewCount: 29,
        stock: 4,
        category: { name: 'Accessories', slug: 'accessories' },
    },
    {
        id: '10',
        slug: 'gold-hoop-earrings',
        name: 'Gold Hoop Earrings',
        description: 'Polished 14k yellow gold hoop earrings with a seamless finish. Effortlessly chic for day or night.',
        price: 480,
        images: [img19, img20],
        rating: 4.5,
        reviewCount: 134,
        stock: 25,
        category: { name: 'Earrings', slug: 'earrings' },
    },
    {
        id: '11',
        slug: 'platinum-wedding-band',
        name: 'Platinum Wedding Band',
        description: 'A classic comfort-fit platinum wedding band with a satin finish. Crafted for a lifetime of wear.',
        price: 1600,
        images: [img21, img22],
        rating: 5.0,
        reviewCount: 88,
        stock: 10,
        category: { name: 'Rings', slug: 'rings' },
    },
    {
        id: '12',
        slug: 'layered-gold-necklace',
        name: 'Layered Gold Necklace',
        description: 'A delicate multi-strand 18k gold necklace with subtle diamond-cut links. Perfect for layering.',
        price: 720,
        images: [img23, img24],
        rating: 4.6,
        reviewCount: 67,
        stock: 18,
        category: { name: 'Necklaces', slug: 'necklaces' },
    },
    {
        id: '13',
        slug: 'amethyst-drop-earrings',
        name: 'Amethyst Drop Earrings',
        description: 'Vivid purple amethyst drops in sterling silver with a rhodium finish. Elegant and eye-catching.',
        price: 390,
        images: [img25, img26],
        rating: 4.4,
        reviewCount: 45,
        stock: 14,
        category: { name: 'Earrings', slug: 'earrings' },
    },
    {
        id: '14',
        slug: 'charm-bracelet',
        name: 'Gold Charm Bracelet',
        description: 'Customizable 14k gold charm bracelet with a lobster clasp. Add charms to tell your story.',
        price: 850,
        salePrice: 699,
        images: [img27, img28],
        rating: 4.7,
        reviewCount: 102,
        stock: 9,
        category: { name: 'Bracelets', slug: 'bracelets' },
    },
    {
        id: '15',
        slug: 'diamond-eternity-band',
        name: 'Diamond Eternity Band',
        description: 'Full eternity band with round brilliant diamonds set in 18k white gold. Symbolizing endless love.',
        price: 3800,
        images: [img29, img30],
        rating: 5.0,
        reviewCount: 56,
        stock: 4,
        category: { name: 'Rings', slug: 'rings' },
    },
    {
        id: '16',
        slug: 'opal-pendant-necklace',
        name: 'Opal Pendant Necklace',
        description: 'Australian opal pendant with a play-of-color effect, set in 14k rose gold on a delicate chain.',
        price: 560,
        images: [img31, img32],
        rating: 4.6,
        reviewCount: 41,
        stock: 7,
        category: { name: 'Necklaces', slug: 'necklaces' },
    },
    {
        id: '17',
        slug: 'silver-cuff-bracelet',
        name: 'Sterling Silver Cuff',
        description: 'Bold sterling silver cuff bracelet with a hammered texture. A modern statement for any wrist.',
        price: 320,
        images: [img33, img34],
        rating: 4.3,
        reviewCount: 73,
        stock: 22,
        category: { name: 'Bracelets', slug: 'bracelets' },
    },
    {
        id: '18',
        slug: 'tanzanite-ring',
        name: 'Tanzanite Cocktail Ring',
        description: 'Rare tanzanite center stone with a diamond halo in 18k white gold. One of a kind, just like you.',
        price: 5200,
        images: [img35, img01],
        rating: 4.9,
        reviewCount: 22,
        stock: 1,
        category: { name: 'Rings', slug: 'rings' },
    },
];

export const categories = [
    { name: 'All', slug: '' },
    { name: 'Rings', slug: 'rings' },
    { name: 'Necklaces', slug: 'necklaces' },
    { name: 'Earrings', slug: 'earrings' },
    { name: 'Bracelets', slug: 'bracelets' },
    { name: 'Accessories', slug: 'accessories' },
];
