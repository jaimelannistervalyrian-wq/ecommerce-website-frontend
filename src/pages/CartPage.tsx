import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartAtom, authAtom } from '../store/atoms';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function CartPage() {
    const [cart, setCart] = useAtom(cartAtom);
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [placing, setPlacing] = useState(false);
    const [address, setAddress] = useState({
        line1: '', city: '', state: '', postalCode: '', country: '', phone: '',
    });

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shippingFee = subtotal >= 2000 ? 0 : 150;
    const total = subtotal - discount + shippingFee;

    const updateQty = (idx: number, delta: number) => {
        setCart((c) =>
            c.map((item, i) => (i === idx ? { ...item, qty: item.qty + delta } : item))
                .filter((item) => item.qty > 0),
        );
    };

    const removeItem = (idx: number) => {
        setCart((c) => c.filter((_, i) => i !== idx));
        toast.success('Item removed');
    };

    const applyCoupon = () => {
        const code = coupon.trim().toUpperCase();
        if (code === 'SAVE10') {
            setDiscount(subtotal * 0.1);
            setCouponApplied(true);
            toast.success('10% discount applied!');
        } else if (code === 'WELCOME20') {
            setDiscount(subtotal * 0.2);
            setCouponApplied(true);
            toast.success('20% discount applied!');
        } else {
            toast.error('Invalid coupon code');
        }
    };

    const placeOrder = async () => {
        if (!auth) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }
        if (!address.line1 || !address.city || !address.state || !address.postalCode || !address.country || !address.phone) {
            toast.error('Please fill in your complete shipping address and phone number');
            return;
        }
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setPlacing(true);
        try {
            // Step 1: Save shipping address
            const addrRes = await api.post('/users/me/addresses', {
                ...address,
                isDefault: true,
            });
            const addressId = addrRes.data.id;

            // Step 2: Sync frontend cart items to backend DB cart
            // Clear backend cart first, then add all items fresh
            await api.delete('/cart').catch(() => { }); // ignore if endpoint doesn't exist
            for (const item of cart) {
                await api.post('/cart/items', {
                    productId: item.id,
                    quantity: item.qty,
                });
            }

            // Step 3: Place COD order (backend reads from its own cart)
            await api.post('/orders/checkout-cod', {
                addressId,
                couponCode: couponApplied ? coupon.trim().toUpperCase() : undefined,
            });

            // Step 4: Clear frontend cart on success
            setCart([]);
            toast.success('Order placed successfully! 🎉');
            navigate('/account');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Failed to place order. Please try again.';
            toast.error(msg);
        } finally {
            setPlacing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <section className="mx-auto flex min-h-[60vh] max-w-[600px] flex-col items-center justify-center px-6 py-24 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f0ea]">
                    <ShoppingBag className="h-8 w-8 text-[#8b6914]" />
                </div>
                <h1 className="mb-3 text-2xl font-bold text-[#1a1208]">Your cart is empty</h1>
                <p className="mb-8 text-sm text-[#6b5c3e]">Discover our exquisite jewelry collection.</p>
                <Link to="/products" className="rounded-xl bg-[#1a1208] px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2d2010]">
                    Explore Collection
                </Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-[5vw]">
            <h1 className="mb-8 text-3xl font-bold text-[#1a1208] md:text-4xl">Your Cart</h1>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Cart items */}
                <div className="space-y-4">
                    {cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-3 rounded-2xl border border-[#e8e0d4] bg-white p-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f0ea]">
                                {item.image
                                    ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    : <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-5 w-5 text-[#c9a84c]" /></div>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-semibold text-[#1a1208]">{item.name}</p>
                                <p className="text-sm text-[#8b6914]">Rs. {item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center rounded-xl border border-[#e8e0d4]">
                                <button onClick={() => updateQty(idx, -1)} className="flex h-8 w-8 items-center justify-center text-[#4a3f2f] hover:text-[#8b6914]">
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center text-sm font-medium">{item.qty}</span>
                                <button onClick={() => updateQty(idx, 1)} className="flex h-8 w-8 items-center justify-center text-[#4a3f2f] hover:text-[#8b6914]">
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                            <p className="w-24 text-right text-sm font-semibold text-[#1a1208]">
                                Rs. {(item.price * item.qty).toLocaleString()}
                            </p>
                            <button onClick={() => removeItem(idx)} className="text-[#9a8a7a] hover:text-red-500">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}

                    {/* Shipping address */}
                    <div className="rounded-2xl border border-[#e8e0d4] bg-white p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#4a3f2f]">
                            Shipping Address
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Input label="Address Line *" placeholder="House no, Street, Area"
                                    value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} />
                            </div>
                            <Input label="City *" placeholder="Lahore"
                                value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
                            <Input label="State / Province *" placeholder="Punjab"
                                value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
                            <Input label="Postal Code *" placeholder="54000"
                                value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} />
                            <Input label="Country *" placeholder="Pakistan"
                                value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} />
                            <div className="sm:col-span-2">
                                <Input label="Phone Number *" placeholder="+92 300 1234567" type="tel"
                                    value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <aside className="h-fit rounded-2xl border border-[#e8e0d4] bg-white p-5">
                    <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#4a3f2f]">
                        Order Summary
                    </h2>

                    {/* Coupon */}
                    <div className="mb-5 flex gap-2">
                        <input value={coupon} onChange={(e) => setCoupon(e.target.value)}
                            placeholder="Coupon code (SAVE10)" disabled={couponApplied}
                            className="flex-1 rounded-xl border border-[#e8e0d4] px-3 py-2.5 text-sm text-[#1a1208] placeholder:text-[#b8a99a] outline-none focus:border-[#8b6914] disabled:bg-[#faf7f2]" />
                        <button onClick={applyCoupon} disabled={couponApplied}
                            className="rounded-xl border border-[#e8e0d4] px-3 text-xs font-medium uppercase tracking-wider text-[#4a3f2f] hover:border-[#8b6914] hover:text-[#8b6914] disabled:opacity-50">
                            Apply
                        </button>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2.5 border-b border-[#e8e0d4] pb-4">
                        <div className="flex justify-between text-sm text-[#6b5c3e]">
                            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                            <span>Rs. {subtotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span>-Rs. {discount.toFixed(0)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-[#6b5c3e]">
                            <span>Shipping</span>
                            <span>{shippingFee === 0 ? '🎉 Free' : `Rs. ${shippingFee}`}</span>
                        </div>
                    </div>

                    <div className="mt-4 mb-5 flex justify-between">
                        <span className="font-semibold text-[#1a1208]">Total</span>
                        <span className="text-xl font-bold text-[#1a1208]">Rs. {total.toLocaleString()}</span>
                    </div>

                    {shippingFee > 0 && (
                        <p className="mb-4 rounded-xl bg-[#faf7f2] px-3 py-2 text-xs text-[#9a8a7a]">
                            Add Rs. {(2000 - subtotal).toLocaleString()} more for free shipping
                        </p>
                    )}

                    <Button onClick={placeOrder} disabled={placing} fullWidth>
                        {placing ? 'Placing Order...' : 'Place Order (COD)'}
                    </Button>

                    <p className="mt-3 text-center text-xs text-[#9a8a7a]">
                        Cash on Delivery · Free returns within 7 days
                    </p>

                    <button onClick={() => setCart([])}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs text-[#9a8a7a] hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" /> Clear cart
                    </button>
                </aside>
            </div>
        </section>
    );
}
