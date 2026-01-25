'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPanggilan, type Panggilan } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';

export default function TambahPanggilan() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<Panggilan>({
    tahun_perkara: new Date().getFullYear(),
    nomor_perkara: '',
    nama_dipanggil: '',
    alamat_asal: '',
    panggilan_1: '',
    panggilan_2: '',
    panggilan_ikrar: '',
    tanggal_sidang: '',
    pip: '',
    link_surat: '',
    keterangan: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const dataToSend = new FormData();
      dataToSend.append('tahun_perkara', String(formData.tahun_perkara));
      dataToSend.append('nomor_perkara', formData.nomor_perkara);
      dataToSend.append('nama_dipanggil', formData.nama_dipanggil);
      dataToSend.append('alamat_asal', formData.alamat_asal || '');
      dataToSend.append('panggilan_1', formData.panggilan_1 || '');
      dataToSend.append('panggilan_2', formData.panggilan_2 || '');
      dataToSend.append('panggilan_ikrar', formData.panggilan_ikrar || '');
      dataToSend.append('tanggal_sidang', formData.tanggal_sidang || '');
      dataToSend.append('pip', formData.pip || '');
      dataToSend.append('keterangan', formData.keterangan || '');

      if (file) {
        dataToSend.append('file_upload', file);
      }

      const result = await createPanggilan(dataToSend);

      if (result.success) {
        setMessage({ type: 'success', text: 'Data berhasil disimpan!' });
        setTimeout(() => router.push('/panggilan'), 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal menyimpan data.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Pastikan API terhubung.' });
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>➕ Tambah Data Panggilan</h2>
        <Link href="/panggilan" className="btn btn-secondary">
          ← Kembali
        </Link>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tahun Perkara *</label>
              <select name="tahun_perkara" value={formData.tahun_perkara} onChange={handleChange} required>
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nomor Perkara *</label>
              <input
                type="text"
                name="nomor_perkara"
                value={formData.nomor_perkara}
                onChange={handleChange}
                placeholder="Contoh: 22/Pdt.G/2025/PA.pnj"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nama Yang Dipanggil *</label>
            <input
              type="text"
              name="nama_dipanggil"
              value={formData.nama_dipanggil}
              onChange={handleChange}
              placeholder="Nama lengkap pihak yang dipanggil"
              required
            />
          </div>

          <div className="form-group">
            <label>Alamat Asal</label>
            <textarea
              name="alamat_asal"
              value={formData.alamat_asal}
              onChange={handleChange}
              placeholder="Alamat lengkap"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tanggal Panggilan I</label>
              <input type="date" name="panggilan_1" value={formData.panggilan_1} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Tanggal Panggilan II</label>
              <input type="date" name="panggilan_2" value={formData.panggilan_2} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tanggal Panggilan Ikrar</label>
              <input type="date" name="panggilan_ikrar" value={formData.panggilan_ikrar} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Tanggal Sidang</label>
              <input type="date" name="tanggal_sidang" value={formData.tanggal_sidang} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>PIP</label>
              <input type="text" name="pip" value={formData.pip} onChange={handleChange} placeholder="PIP" />
            </div>
            <div className="form-group">
              <label>Upload Surat Panggilan</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
                Format: PDF, DOC, Gambar. Max 5MB.
              </small>
            </div>
          </div>

          <div className="form-group">
            <label>Keterangan</label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Keterangan tambahan (opsional)"
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Menyimpan...' : '💾 Simpan Data'}
            </button>
            <Link href="/panggilan" className="btn btn-secondary">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
