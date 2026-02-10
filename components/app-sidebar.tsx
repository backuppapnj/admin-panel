'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Megaphone,
    Gavel,
    CalendarDays,
    FileText,
    Coins,
    LogOut,
    ChevronUp,
    User2
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShineBorder } from '@/components/ui/shine-border';

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
        label: 'Data Itsbat',
        icon: Gavel,
        href: '/itsbat',
        color: 'text-pink-700',
    },
    {
        label: 'Panggilan e-Court',
        icon: Gavel,
        href: '/panggilan-ecourt',
        color: 'text-emerald-500',
    },
    {
        label: 'Agenda Pimpinan',
        icon: CalendarDays,
        href: '/agenda',
        color: 'text-red-500',
    },
    {
        label: 'LHKPN & SPT',
        icon: FileText,
        href: '/lhkpn',
        color: 'text-amber-500',
    },
    {
        label: 'Realisasi Anggaran',
        icon: Coins,
        href: '/anggaran',
        color: 'text-emerald-400',
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-slate-800">
            <SidebarHeader className="bg-slate-950 text-white border-b border-slate-800/50 p-4">
                <div className="flex items-center gap-3 px-1 py-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                        <span className="text-lg font-bold">PA</span>
                    </div>
                    <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                        <span className="font-bold text-sm tracking-wide">PA PENAJAM</span>
                        <span className="text-[10px] text-slate-400 font-medium">Admin Workspace</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-slate-950 text-white">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-slate-500 uppercase text-xs font-bold tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {routes.map((route) => {
                                const isActive = pathname === route.href;
                                return (
                                    <SidebarMenuItem key={route.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={route.label}
                                            className="h-10 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 data-[active=true]:bg-transparent data-[active=true]:text-white"
                                        >
                                            <Link href={route.href} className="flex gap-3 items-center relative overflow-hidden">
                                                {isActive && (
                                                    <ShineBorder
                                                        className="absolute inset-0 w-full h-full opacity-100 pointer-events-none"
                                                        shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                                                        borderWidth={1.5}
                                                    />
                                                )}
                                                <route.icon className={`h-4 w-4 ${route.color}`} />
                                                <span>{route.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-slate-950 border-t border-slate-800/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-slate-800 data-[state=open]:text-white hover:bg-slate-800 hover:text-white"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src="/avatars/admin.png" alt="Admin" />
                                        <AvatarFallback className="rounded-lg bg-indigo-500 text-white">AD</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-white">Admin Pengadilan</span>
                                        <span className="truncate text-xs text-slate-400">admin@pa-penajam.go.id</span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4 text-slate-400" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-slate-900 border-slate-800 text-white"
                            >
                                <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer gap-2">
                                    <User2 className="h-4 w-4 text-slate-400" />
                                    <span>Profile Saya</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-red-900/50 focus:text-red-200 cursor-pointer gap-2 text-red-400">
                                    <LogOut className="h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
