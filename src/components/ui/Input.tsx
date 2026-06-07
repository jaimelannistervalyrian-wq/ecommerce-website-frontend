import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-medium uppercase tracking-[0.15em] text-[#6b5c3e]">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    {...props}
                    className={clsx(
                        'w-full rounded-xl border border-[#e8e0d4] bg-white px-4 py-3 text-sm text-[#1a1208] placeholder:text-[#b8a99a] outline-none transition-all duration-200 focus:border-[#8b6914] focus:ring-2 focus:ring-[#8b6914]/10',
                        error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
                        className,
                    )}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    },
);

Input.displayName = 'Input';
