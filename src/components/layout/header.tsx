'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between gap-2 bg-background/80 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-primary font-headline">
                    Rajasthan AI Scholar
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
                <ModeToggle />
            </div>
        </header>
    );
}
