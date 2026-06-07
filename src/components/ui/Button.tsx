import { type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    fullWidth?: boolean;
}

export function Button({
    variant = 'primary',
    fullWidth = false,
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            className={clsx(
                'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50',
                {
                    'bg-[#1a1208] text-white hover:bg-[#2d2010] active:scale-[0.98]': variant === 'primary',
                    'border border-[#1a1208] text-[#1a1208] hover:bg-[#1a1208] hover:text-white': variant === 'outline',
                    'text-[#1a1208] hover:text-[#8b6914] underline-offset-4 hover:underline': variant === 'ghost',
                },
                fullWidth && 'w-full',
                className,
            )}
        >
            {children}
        </button>
    );
}
