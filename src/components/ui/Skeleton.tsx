export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-2xl bg-[#f0ece8] ${className}`}
        />
    );
}
