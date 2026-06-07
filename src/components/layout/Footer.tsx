import { Link } from 'react-router-dom';
import { Share2, Mail, Phone } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-[#e8e0d4] bg-[#faf7f2] pt-16 pb-8">
            <div className="mx-auto max-w-[1440px] px-6 md:px-[5vw]">
                <div className="grid gap-12 md:grid-cols-4">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="mb-4">
                            <p className="text-xl font-bold tracking-[0.12em] text-[#1a1208]">SS</p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#8b6914]">
                                Jeweleries
                            </p>
                        </div>
                        <p className="text-sm leading-relaxed text-[#6b5c3e]">
                            Crafting timeless pieces that celebrate life's most precious moments. Every jewel tells a story.
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e0d4] text-[#6b5c3e] transition-colors hover:border-[#8b6914] hover:text-[#8b6914]"
                                aria-label="Instagram"
                            >
                                <Share2 className="h-4 w-4" />
                            </a>
                            <a
                                href="mailto:hello@ssjeweleries.com"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e0d4] text-[#6b5c3e] transition-colors hover:border-[#8b6914] hover:text-[#8b6914]"
                                aria-label="Email"
                            >
                                <Mail className="h-4 w-4" />
                            </a>
                            <a
                                href="tel:+1234567890"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e0d4] text-[#6b5c3e] transition-colors hover:border-[#8b6914] hover:text-[#8b6914]"
                                aria-label="Phone"
                            >
                                <Phone className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Collections */}
                    <div>
                        <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1208]">
                            Collections
                        </h4>
                        <ul className="space-y-3">
                            {['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Accessories'].map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/products?category=${cat.toLowerCase()}`}
                                        className="text-sm text-[#6b5c3e] transition-colors hover:text-[#8b6914]"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1208]">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'About Us', to: '#' },
                                { label: 'Our Story', to: '#' },
                                { label: 'Sustainability', to: '#' },
                                { label: 'Careers', to: '#' },
                                { label: 'Press', to: '#' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="text-sm text-[#6b5c3e] transition-colors hover:text-[#8b6914]"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1208]">
                            Support
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Shipping & Returns', to: '#' },
                                { label: 'Ring Size Guide', to: '#' },
                                { label: 'Care Instructions', to: '#' },
                                { label: 'FAQ', to: '#' },
                                { label: 'Contact Us', to: '#' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="text-sm text-[#6b5c3e] transition-colors hover:text-[#8b6914]"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#e8e0d4] pt-8 md:flex-row">
                    <p className="text-xs text-[#9a8a7a]">
                        © {new Date().getFullYear()} SS Jeweleries. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="#" className="text-xs text-[#9a8a7a] hover:text-[#8b6914]">
                            Privacy Policy
                        </Link>
                        <Link to="#" className="text-xs text-[#9a8a7a] hover:text-[#8b6914]">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
