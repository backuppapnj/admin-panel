'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAnggaran, updateAnggaran, type RealisasiAnggaran } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

const BULAN_OPTIONS = [
    { value: "0", label: "Tahunan (Summary)" },
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const KATEGORI_BY_DIPA: Record<string, string[]> = {
    'DIPA 01': ['Belanja Pegawai', 'Belanja Barang', 'Belanja Modal'],
    'DIPA 04': ['POSBAKUM', 'Pembebasan Biaya Perkara', 'Sidang Di Luar Gedung'],
};

export default function AnggaranEdit() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<Partial<RealisasiAnggaran>>({});
    const [stats, setStats] = useState({ sisa: 0, persentase: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAnggaran(id);
                if (data) {
                    setFormData(data);
                } else {
                    toast({ title: "Error", description: "Data tidak ditemukan", variant: "destructive" });
                    router.push('/anggaran');
                }
            } catch (error) {
                toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" });
            }
            setFetching(false);
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const pagu = Number(formData.pagu) || 0;
        const realisasi = Number(formData.realisasi) || 0;
        const sisa = pagu - realisasi;
        const persentase = pagu > 0 ? (realisasi / pagu) * 100 : 0;
        setStats({ sisa, persentase });
    }, [formData.pagu, formData.realisasi]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updateAnggaran(id, formData);
            if (result.success) {
                toast({
                    title: "Sukses",
                    description: "Data anggaran berhasil diperbarui!",
                });
                router.push('/anggaran');
            } else {
                throw new Error(result.message || 'Gagal menyimpan');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Terjadi kesalahan saat menyimpan data.",
            });
        }
        setLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (fetching) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/anggaran">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Anggaran</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Edit Anggaran</CardTitle>
                        <CardDescription>Perbarui data pagu dan realisasi belanja.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>DIPA</Label>
                                    <Select
                                        value={formData.dipa}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, dipa: val, kategori: '' }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DIPA 01">DIPA 01 (BUA)</SelectItem>
                                            <SelectItem value="DIPA 04">DIPA 04 (BADILAG)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tahun Anggaran</Label>
                                    <Input
                                        type="number"
                                        value={formData.tahun}
                                        onChange={e => setFormData(prev => ({ ...prev, tahun: parseInt(e.target.value) }))}
                                        min="2020" max="2030"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Bulan</Label>
                                    <Select
                                        value={formData.bulan?.toString()}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, bulan: parseInt(val) }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BULAN_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Kategori / Jenis Belanja</Label>
                                    <Select
                                        value={formData.kategori}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, kategori: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Kategori..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {KATEGORI_BY_DIPA[formData.dipa || 'DIPA 01'].map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                            {/* Fallback jika kategori lama tidak ada di list baru */}
                                            {formData.kategori && !KATEGORI_BY_DIPA[formData.dipa || 'DIPA 01'].includes(formData.kategori) && (
                                                <SelectItem value={formData.kategori}>{formData.kategori}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pagu Anggaran (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.pagu}
                                        onChange={e => setFormData(prev => ({ ...prev, pagu: parseFloat(e.target.value) }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Realisasi (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.realisasi}
                                        onChange={e => setFormData(prev => ({ ...prev, realisasi: parseFloat(e.target.value) }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border flex flex-col gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Sisa Anggaran:</span>
                                    <span className={`font-bold ${stats.sisa < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                        {formatCurrency(stats.sisa)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Persentase Realisasi:</span>
                                    <span className="font-bold text-emerald-600">
                                        {stats.persentase.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Link Dokumen (Google Drive)</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="https://drive.google.com/..."
                                        value={formData.link_dokumen || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, link_dokumen: e.target.value }))}
                                        className="pl-9"
                                    />
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Keterangan (Opsional)</Label>
                                <Textarea
                                    placeholder="Tambahkan catatan jika diperlukan..."
                                    value={formData.keterangan || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                                    rows={2}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/anggaran">
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Perubahan
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
