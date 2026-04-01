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
import { ArrowLeft, Save } from 'lucide-react';

export default function EditKeuanganPerkara() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<KeuanganPerkara | null>(null);

    // Ambil data berdasarkan ID saat halaman dimuat
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
            const result = await updateKeuanganPerkara(formData.id, {
                saldo_awal:  formData.saldo_awal,
                penerimaan:  formData.penerimaan,
                pengeluaran: formData.pengeluaran,
                url_detail:  formData.url_detail,
            });
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
                            {/* Tahun & Bulan — read-only karena merupakan identifier */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Tahun</Label>
                                    <Select
                                        value={String(formData.tahun)}
                                        disabled
                                    >
                                        <SelectTrigger className="bg-muted/50">
                                            <SelectValue />
                                        </SelectTrigger>
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
                                    <Select
                                        value={String(formData.bulan)}
                                        disabled
                                    >
                                        <SelectTrigger className="bg-muted/50">
                                            <SelectValue />
                                        </SelectTrigger>
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
                                        type="number" min="0"
                                        placeholder="0"
                                        value={formData.penerimaan ?? ''}
                                        onChange={e => setFormData(p => p ? {
                                            ...p, penerimaan: e.target.value ? parseInt(e.target.value) : null,
                                        } : null)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Pengeluaran (Rp)</Label>
                                    <Input
                                        type="number" min="0"
                                        placeholder="0"
                                        value={formData.pengeluaran ?? ''}
                                        onChange={e => setFormData(p => p ? {
                                            ...p, pengeluaran: e.target.value ? parseInt(e.target.value) : null,
                                        } : null)}
                                    />
                                </div>
                            </div>

                            {/* URL Detail */}
                            <div className="space-y-1">
                                <Label>URL Detail (PDF)</Label>
                                <Input
                                    type="text"
                                    placeholder="https://... atau images/..."
                                    value={formData.url_detail ?? ''}
                                    onChange={e => setFormData(p => p ? {
                                        ...p, url_detail: e.target.value || null,
                                    } : null)}
                                />
                                <p className="text-xs text-muted-foreground">Opsional. Link ke dokumen PDF laporan bulanan.</p>
                            </div>

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
