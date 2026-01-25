import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

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
      <body>
        <div className="layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <h1>🏛️ PA Penajam</h1>
            <p className="subtitle">Admin Panel</p>

            <nav>
              <ul className="nav-menu">
                <li>
                  <Link href="/">📊 Dashboard</Link>
                </li>
                <li>
                  <Link href="/panggilan">📋 Panggilan Ghaib</Link>
                </li>
                <li>
                  <Link href="/panggilan/tambah">➕ Tambah Data</Link>
                </li>
                <br />
                <li style={{ borderTop: '1px solid #ffffff33', paddingTop: '10px' }}>
                  <Link href="/itsbat">📋 Data Itsbat</Link>
                </li>
                <li>
                  <Link href="/itsbat/tambah">➕ Tambah Itsbat</Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
