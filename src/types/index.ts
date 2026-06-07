export type Product = {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    images: string[];
    rating: number;
    reviewCount: number;
    stock: number;
    category?: { name: string; slug: string };
    reviews?: Review[];
};

export type Review = {
    id: string;
    rating: number;
    comment: string;
    user?: { fullName: string };
    createdAt?: string;
};

export type AuthState = {
    accessToken: string;
    email: string;
    role: 'ADMIN' | 'USER';
};

export type CartItem = {
    id: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
};

export type Banner = {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaLabel?: string;
    ctaLink?: string;
    section: string;
    isActive: boolean;
    sortOrder: number;
};

export type Address = {
    id: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
};

export type Order = {
    id: string;
    total: string;
    status: string;
    createdAt?: string;
    items?: { product: Product; quantity: number; priceAtTime: string }[];
};
