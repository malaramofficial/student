'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '../ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const isHomePage = pathname === '/';

    return (
        <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold tracking-tight">
                    राजस्थान बोर्ड AI सहायक
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <ModeToggle />
            </div>
        </header>
    );
}
