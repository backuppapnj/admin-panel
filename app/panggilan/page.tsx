'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllPanggilan, deletePanggilan, type Panggilan } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import Pagination from '@/components/Pagination';

export default function PanggilanList() {
  const [data, setData] = useState<Panggilan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTahun, setFilterTahun] = useState<number | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  // Load data
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getAllPanggilan(filterTahun, page);
      if (result.success && result.data) {
        setData(result.data);
        setPagination({
          current_page: result.current_page || 1,
          last_page: result.last_page || 1,
          total: result.total || 0
        });
      } else {
        setData([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memuat data. Pastikan API terhubung.' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(1);
  }, [filterTahun]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deletePanggilan(deleteId);
      setMessage({ type: 'success', text: 'Data berhasil dihapus!' });
      setDeleteId(null);
      loadData(pagination.current_page);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal menghapus data.' });
    }
  };

  // Format date
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="page-header">
        <h2>📋 Panggilan Ghaib</h2>
        <Link href="/panggilan/tambah" className="btn btn-primary">
          ➕ Tambah Data
        </Link>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="card">
        <div className="filter-bar">
          <select
            value={filterTahun || ''}
            onChange={(e) => setFilterTahun(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Semua Tahun</option>
            {getYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={() => loadData(pagination.current_page)}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div className="loading">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="loading">Tidak ada data.</div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nomor Perkara</th>
                    <th>Nama</th>
                    <th>Alamat</th>
                    <th>Panggilan I</th>
                    <th>Tanggal Sidang</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(pagination.current_page - 1) * 10 + index + 1}</td>
                      <td>{item.nomor_perkara}</td>
                      <td>{item.nama_dipanggil}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.alamat_asal || '-'}
                      </td>
                      <td>{formatDate(item.panggilan_1)}</td>
                      <td>{formatDate(item.tanggal_sidang)}</td>
                      <td>
                        <div className="actions">
                          <Link href={`/panggilan/${item.id}/edit`} className="btn btn-primary btn-sm">Edit</Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteId(item.id!)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              onPageChange={loadData}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Konfirmasi Hapus</h3>
            <p>Apakah Anda yakin ingin menghapus data ini?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
