import { Navbar } from './Navbar';
import { Footer } from './Footer';

// Auth is now restored synchronously in atoms.ts — no useEffect needed here
export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#fdfaf6] text-[#1a1208]">
            <Navbar />
            <main className="pt-20">{children}</main>
            <Footer />
        </div>
    );
}
