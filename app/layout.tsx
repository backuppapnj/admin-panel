import './globals.css';
import type { Metadata } from 'next';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Admin Panggilan Ghaib - PA Penajam',
  description: 'Sistem Admin Panel untuk mengelola data panggilan sidang',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="h-full">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex flex-col w-full h-full min-h-screen bg-slate-50">
            <div className="flex items-center p-4 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <SidebarTrigger className="mr-4" />
              <h1 className="font-bold text-lg text-slate-800">PA Penajam</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {children}
            </div>
          </main>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
