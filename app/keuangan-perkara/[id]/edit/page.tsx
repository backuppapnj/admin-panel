'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    getKeuanganPerkara, updateKeuanganPerkara, NAMA_BULAN_KEUANGAN, type KeuanganPerkara,
} from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Upload, ExternalLink } from 'lucide-react';

export default function EditKeuanganPerkara() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<KeuanganPerkara | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getKeuanganPerkara(parseInt(id));
                if (data) {
                    setFormData(data);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Data tidak ditemukan.' });
                    router.push('/keuangan-perkara');
                }
            } catch {
                toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
                router.push('/keuangan-perkara');
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData?.id) return;
        setSaving(true);
        try {
            let payload: FormData | Partial<KeuanganPerkara>;

            if (file) {
                // Ada file baru — kirim sebagai FormData
                const fd = new FormData();
                if (formData.saldo_awal != null) fd.append('saldo_awal', String(formData.saldo_awal));
                if (formData.penerimaan != null) fd.append('penerimaan', String(formData.penerimaan));
                if (formData.pengeluaran != null) fd.append('pengeluaran', String(formData.pengeluaran));
                fd.append('file_upload', file);
                payload = fd;
            } else {
                // Tidak ada file — kirim JSON biasa
                payload = {
                    saldo_awal:  formData.saldo_awal,
                    penerimaan:  formData.penerimaan,
                    pengeluaran: formData.pengeluaran,
                    url_detail:  formData.url_detail,
                };
            }

            const result = await updateKeuanganPerkara(formData.id, payload);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil diperbarui!' });
                setTimeout(() => router.push('/keuangan-perkara'), 1200);
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Gagal memperbarui data.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan saat menyimpan.' });
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
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Keuangan Perkara</h2>
                    {formData && (
                        <p className="text-muted-foreground text-sm">
                            {NAMA_BULAN_KEUANGAN[formData.bulan]} {formData.tahun}
                        </p>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Formulir Edit Data Keuangan Perkara</CardTitle>
                    <CardDescription>Perbarui data penerimaan dan pengeluaran bulan ini.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : formData ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Tahun & Bulan — read-only, merupakan identifier unik */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Tahun</Label>
                                    <Select value={String(formData.tahun)} disabled>
                                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {getYearOptions(2019).map(y => (
                                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Tidak dapat diubah.</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Bulan</Label>
                                    <Select value={String(formData.bulan)} disabled>
                                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {NAMA_BULAN_KEUANGAN.slice(1).map((nama, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1)}>{nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Tidak dapat diubah.</p>
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
                                        onChange={e => setFormData(p => p ? {
                                            ...p, saldo_awal: e.target.value ? parseInt(e.target.value) : null,
                                        } : null)}
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
                                        onChange={e => setFormData(p => p ? {
                                            ...p, penerimaan: e.target.value ? parseInt(e.target.value) : null,
                                        } : null)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Pengeluaran (Rp)</Label>
                                    <Input
                                        type="number" min="0" placeholder="0"
                                        value={formData.pengeluaran ?? ''}
                                        onChange={e => setFormData(p => p ? {
                                            ...p, pengeluaran: e.target.value ? parseInt(e.target.value) : null,
                                        } : null)}
                                    />
                                </div>
                            </div>

                            {/* Dokumen saat ini */}
                            {formData.url_detail && !file && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                                    <ExternalLink className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span className="text-blue-700 font-medium">Dokumen saat ini:</span>
                                    <a
                                        href={formData.url_detail}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline truncate"
                                    >
                                        Lihat PDF
                                    </a>
                                </div>
                            )}

                            {/* Upload file baru */}
                            <div className="space-y-1">
                                <Label>
                                    {formData.url_detail ? 'Ganti Dokumen (PDF/Gambar)' : 'Upload Dokumen (PDF/Gambar)'}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                        className="cursor-pointer"
                                    />
                                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formData.url_detail
                                        ? 'Upload file baru akan menggantikan dokumen yang ada. Format: PDF, Gambar. Maks 10MB.'
                                        : 'File akan diupload ke Google Drive. Format: PDF, Gambar. Maks 10MB.'}
                                </p>
                            </div>

                            {/* URL manual — hanya tampil jika tidak ada file dipilih */}
                            {!file && (
                                <div className="space-y-1">
                                    <Label>Atau URL Manual</Label>
                                    <Input
                                        type="text"
                                        placeholder="https://drive.google.com/..."
                                        value={formData.url_detail ?? ''}
                                        onChange={e => setFormData(p => p ? {
                                            ...p, url_detail: e.target.value || null,
                                        } : null)}
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={saving} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                                <Link href="/keuangan-perkara">
                                    <Button variant="secondary" type="button">Batal</Button>
                                </Link>
                            </div>
                        </form>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
