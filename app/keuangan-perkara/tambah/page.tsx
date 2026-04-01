'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    createKeuanganPerkara, NAMA_BULAN_KEUANGAN, type KeuanganPerkara,
} from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function TambahKeuanganPerkara() {
    const router = useRouter();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<KeuanganPerkara>({
        tahun: new Date().getFullYear(),
        bulan: 1,
        saldo_awal: null,
        penerimaan: null,
        pengeluaran: null,
        url_detail: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Kirim FormData agar bisa menyertakan file upload
            const fd = new FormData();
            fd.append('tahun', String(formData.tahun));
            fd.append('bulan', String(formData.bulan));
            if (formData.saldo_awal != null) fd.append('saldo_awal', String(formData.saldo_awal));
            if (formData.penerimaan != null) fd.append('penerimaan', String(formData.penerimaan));
            if (formData.pengeluaran != null) fd.append('pengeluaran', String(formData.pengeluaran));
            if (formData.url_detail) fd.append('url_detail', formData.url_detail);
            if (file) fd.append('file_upload', file);

            const result = await createKeuanganPerkara(fd);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil disimpan!' });
                setTimeout(() => router.push('/keuangan-perkara'), 1200);
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Gagal menyimpan data.' });
            }
        } catch (error: any) {
            console.error('Save error:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: error?.message || 'Terjadi kesalahan. Pastikan API terhubung.' 
            });
        }
        setSaving(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/keuangan-perkara">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Tambah Keuangan Perkara</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Formulir Data Keuangan Perkara</CardTitle>
                    <CardDescription>Isi data penerimaan dan pengeluaran per bulan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Tahun & Bulan */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Tahun *</Label>
                                <Select
                                    value={String(formData.tahun)}
                                    onValueChange={v => setFormData(p => ({ ...p, tahun: parseInt(v) }))}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {getYearOptions(2019).map(y => (
                                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Bulan *</Label>
                                <Select
                                    value={String(formData.bulan)}
                                    onValueChange={v => setFormData(p => ({
                                        ...p,
                                        bulan: parseInt(v),
                                        saldo_awal: parseInt(v) !== 1 ? null : p.saldo_awal,
                                    }))}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {NAMA_BULAN_KEUANGAN.slice(1).map((nama, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)}>{nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Saldo Awal — hanya tampil untuk Januari */}
                        {formData.bulan === 1 && (
                            <div className="space-y-1">
                                <Label>Saldo Awal Tahun (Rp)</Label>
                                <Input
                                    type="number" min="0"
                                    placeholder="Masukkan saldo awal tahun"
                                    value={formData.saldo_awal ?? ''}
                                    onChange={e => setFormData(p => ({
                                        ...p, saldo_awal: e.target.value ? parseInt(e.target.value) : null,
                                    }))}
                                />
                            </div>
                        )}

                        {/* Penerimaan & Pengeluaran */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Penerimaan (Rp)</Label>
                                <Input
                                    type="number" min="0" placeholder="0"
                                    value={formData.penerimaan ?? ''}
                                    onChange={e => setFormData(p => ({
                                        ...p, penerimaan: e.target.value ? parseInt(e.target.value) : null,
                                    }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Pengeluaran (Rp)</Label>
                                <Input
                                    type="number" min="0" placeholder="0"
                                    value={formData.pengeluaran ?? ''}
                                    onChange={e => setFormData(p => ({
                                        ...p, pengeluaran: e.target.value ? parseInt(e.target.value) : null,
                                    }))}
                                />
                            </div>
                        </div>

                        {/* Upload File */}
                        <div className="space-y-1">
                            <Label>Upload Dokumen (PDF/Gambar)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground">File akan diupload ke Google Drive. Format: PDF, Gambar. Maks 10MB.</p>
                        </div>

                        {/* URL Manual (opsional jika tidak upload file) */}
                        {!file && (
                            <div className="space-y-1">
                                <Label>Atau URL Manual</Label>
                                <Input
                                    type="text"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.url_detail ?? ''}
                                    onChange={e => setFormData(p => ({
                                        ...p, url_detail: e.target.value || null,
                                    }))}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={saving} className="gap-2">
                                <Save className="h-4 w-4" />
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Link href="/keuangan-perkara">
                                <Button variant="secondary" type="button">Batal</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
