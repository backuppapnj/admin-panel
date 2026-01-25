'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Selamat Datang di Admin Panel</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Sistem ini digunakan untuk mengelola data panggilan sidang Pengadilan Agama Penajam.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link href="/panggilan" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>📋</div>
            <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>Panggilan Ghaib</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Lihat semua data</div>
          </Link>

          <Link href="/panggilan/tambah" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>➕</div>
            <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>Tambah Data</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Input data baru</div>
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>📖 Panduan Penggunaan</h3>
        <ol style={{ paddingLeft: '1.5rem', color: '#64748b' }}>
          <li style={{ marginBottom: '0.5rem' }}>Pastikan koneksi internet aktif</li>
          <li style={{ marginBottom: '0.5rem' }}>Klik menu <strong>Panggilan Ghaib</strong> untuk melihat data</li>
          <li style={{ marginBottom: '0.5rem' }}>Klik <strong>Tambah Data</strong> untuk input data baru</li>
          <li style={{ marginBottom: '0.5rem' }}>Gunakan tombol <strong>Edit</strong> atau <strong>Hapus</strong> untuk mengelola data</li>
        </ol>
      </div>
    </div>
  );
}
