import './globals.css';
import type { Metadata } from 'next';
import { AppSidebar, MobileSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';

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
        <div className="flex h-screen overflow-hidden bg-slate-50">
          {/* Desktop Sidebar */}
          <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
            <AppSidebar />
          </div>

          {/* Main Content Area */}
          <main className="md:pl-72 flex flex-col w-full h-full">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 border-b bg-white">
              <MobileSidebar />
              <h1 className="ml-4 font-bold text-lg">PA Penajam</h1>
            </div>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {children}
            </div>
          </main>

          <Toaster />
        </div>
      </body>
    </html>
  );
}
