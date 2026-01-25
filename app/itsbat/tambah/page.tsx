'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createItsbat, type ItsbatNikah } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';

export default function TambahItsbat() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState<ItsbatNikah>({
        tahun_perkara: new Date().getFullYear(),
        nomor_perkara: '',
        pemohon_1: '',
        pemohon_2: '',
        tanggal_pengumuman: '',
        tanggal_sidang: '',
        link_detail: ''
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
            dataToSend.append('pemohon_1', formData.pemohon_1);
            dataToSend.append('pemohon_2', formData.pemohon_2);
            dataToSend.append('tanggal_pengumuman', formData.tanggal_pengumuman || '');
            dataToSend.append('tanggal_sidang', formData.tanggal_sidang || '');

            if (file) {
                dataToSend.append('file_upload', file);
            }

            const result = await createItsbat(dataToSend);

            if (result.success) {
                setMessage({ type: 'success', text: 'Data berhasil disimpan!' });
                setTimeout(() => router.push('/itsbat'), 1500);
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
                <h2>➕ Tambah Data Itsbat Nikah</h2>
                <Link href="/itsbat" className="btn btn-secondary">
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
                                placeholder="Contoh: 123/Pdt.P/2025/PA.Pnj"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Pemohon I (Suami) *</label>
                        <input
                            type="text"
                            name="pemohon_1"
                            value={formData.pemohon_1}
                            onChange={handleChange}
                            placeholder="Nama Lengkap Suami"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Pemohon II (Istri) *</label>
                        <input
                            type="text"
                            name="pemohon_2"
                            value={formData.pemohon_2}
                            onChange={handleChange}
                            placeholder="Nama Lengkap Istri"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tanggal Pengumuman</label>
                            <input type="date" name="tanggal_pengumuman" value={formData.tanggal_pengumuman} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Tanggal Sidang *</label>
                            <input type="date" name="tanggal_sidang" value={formData.tanggal_sidang} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Upload File (PDF/Gambar) - Optional</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
                            File akan diupload ke Google Drive. Format: PDF, DOC, Gambar. Max 5MB.
                        </small>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? 'Menyimpan...' : '💾 Simpan Data'}
                        </button>
                        <Link href="/itsbat" className="btn btn-secondary">Batal</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
