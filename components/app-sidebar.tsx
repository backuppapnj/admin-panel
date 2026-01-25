'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    LayoutDashboard,
    Megaphone,
    Gavel,
    Menu,
    PlusCircle,
    FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/',
        color: 'text-sky-500',
    },
    {
        label: 'Panggilan Ghaib',
        icon: Megaphone,
        href: '/panggilan',
        color: 'text-violet-500',
    },
    {
        label: 'Tambah Panggilan',
        icon: PlusCircle,
        href: '/panggilan/tambah',
        color: 'text-violet-500',
    },
    {
        label: 'Data Itsbat',
        icon: Gavel,
        href: '/itsbat',
        color: 'text-pink-700',
    },
    {
        label: 'Tambah Itsbat',
        icon: PlusCircle,
        href: '/itsbat/tambah',
        color: 'text-pink-700',
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // Prevent hydration errors
    }

    return (
        <div className="flex h-full flex-col space-y-4 py-4 bg-slate-900 text-white min-h-screen border-r border-slate-800">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        🏛️ PA Penajam
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="text-xs text-center text-zinc-500">
                    &copy; 2025 PA Penajam v2.0
                </div>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900 border-none text-white w-72">
                <AppSidebar />
            </SheetContent>
        </Sheet>
    );
}
