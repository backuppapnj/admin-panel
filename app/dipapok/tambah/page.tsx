'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createDipaPok, getAllDipaPok, type DipaPok } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

const JENIS_DIPA_OPTIONS = [
    'Badan Urusan Administrasi - MARI',
    'Direktorat Jendral Badan Peradilan Agama',
];

const SEMUA_REVISI = [
    'Dipa Awal',
    ...Array.from({ length: 20 }, (_, i) => `Revisi ${i + 1}`),
];

export default function DipaPokAdd() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingRevisi, setLoadingRevisi] = useState(false);
    const [revisiOptions, setRevisiOptions] = useState<string[]>(SEMUA_REVISI);
    const [formData, setFormData] = useState<Partial<DipaPok>>({
        thn_dipa: new Date().getFullYear(),
        tgl_dipa: new Date().toISOString().split('T')[0],
        alokasi_dipa: 0,
    });

    const [files, setFiles] = useState<Record<string, File | null>>({
        file_doc_dipa: null,
        file_doc_pok: null,
    });

    useEffect(() => {
        if (formData.thn_dipa) {
            loadRevisiOptions(formData.thn_dipa);
        }
    }, [formData.thn_dipa]);

    const loadRevisiOptions = async (tahun: number) => {
        setLoadingRevisi(true);
        setFormData(prev => ({ ...prev, revisi_dipa: undefined }));
        try {
            const result = await getAllDipaPok(tahun, 1);
            const existing = (result.data || []).map((d: DipaPok) => d.revisi_dipa);
            const available = SEMUA_REVISI.filter(r => !existing.includes(r));
            setRevisiOptions(available);
        } catch {
            setRevisiOptions(SEMUA_REVISI);
        }
        setLoadingRevisi(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.thn_dipa || !formData.revisi_dipa || !formData.jns_dipa || !formData.tgl_dipa) {
            toast({ title: "Error", description: "Lengkapi semua field yang wajib diisi", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('thn_dipa', String(formData.thn_dipa));
            dataToSend.append('revisi_dipa', formData.revisi_dipa);
            dataToSend.append('jns_dipa', formData.jns_dipa);
            dataToSend.append('tgl_dipa', formData.tgl_dipa);
            dataToSend.append('alokasi_dipa', String(formData.alokasi_dipa || 0));

            if (files.file_doc_dipa) dataToSend.append('file_doc_dipa', files.file_doc_dipa);
            if (files.file_doc_pok) dataToSend.append('file_doc_pok', files.file_doc_pok);

            const result = await createDipaPok(dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Data DIPA/POK berhasil disimpan!" });
                router.push('/dipapok');
            } else {
                toast({ title: "Gagal", description: result.message || "Terjadi kesalahan", variant: "destructive" });
            }
        } catch {
            toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan" });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/dipapok"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Tambah DIPA/POK</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Data DIPA/POK</CardTitle>
                        <CardDescription>
                            Petikan DIPA dan Rincian Kertas Kerja Pengadilan Agama Penajam
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="thn_dipa">Tahun DIPA *</Label>
                                    <Input
                                        id="thn_dipa"
                                        type="number"
                                        value={formData.thn_dipa}
                                        onChange={e => setFormData(prev => ({ ...prev, thn_dipa: parseInt(e.target.value) || 0 }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tgl_dipa">Tanggal DIPA *</Label>
                                    <Input
                                        id="tgl_dipa"
                                        type="date"
                                        value={formData.tgl_dipa}
                                        onChange={e => setFormData(prev => ({ ...prev, tgl_dipa: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jns_dipa">Jenis DIPA *</Label>
                                <Select
                                    value={formData.jns_dipa || ''}
                                    onValueChange={val => setFormData(prev => ({ ...prev, jns_dipa: val }))}
                                >
                                    <SelectTrigger id="jns_dipa">
                                        <SelectValue placeholder="Pilih jenis DIPA..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JENIS_DIPA_OPTIONS.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="revisi_dipa">Revisi DIPA *</Label>
                                <Select
                                    value={formData.revisi_dipa || ''}
                                    onValueChange={val => setFormData(prev => ({ ...prev, revisi_dipa: val }))}
                                    disabled={loadingRevisi || revisiOptions.length === 0}
                                >
                                    <SelectTrigger id="revisi_dipa">
                                        <SelectValue placeholder={
                                            loadingRevisi ? "Memuat..." :
                                            revisiOptions.length === 0 ? "Semua revisi sudah terisi" :
                                            "Pilih revisi..."
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {revisiOptions.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {revisiOptions.length === 0 && !loadingRevisi && (
                                    <p className="text-xs text-amber-600">Semua revisi untuk tahun ini sudah tersimpan.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alokasi_dipa">Alokasi (Rp) *</Label>
                                <Input
                                    id="alokasi_dipa"
                                    type="number"
                                    value={formData.alokasi_dipa || 0}
                                    onChange={e => setFormData(prev => ({ ...prev, alokasi_dipa: parseFloat(e.target.value) || 0 }))}
                                    required
                                />
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <Label className="text-blue-700 font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Dokumen
                                </Label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                    <div className="space-y-2">
                                        <Label>File Dokumen DIPA (PDF)</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => setFiles(prev => ({ ...prev, file_doc_dipa: e.target.files?.[0] || null }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>File Dokumen POK (PDF)</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => setFiles(prev => ({ ...prev, file_doc_pok: e.target.files?.[0] || null }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/dipapok"><Button type="button" variant="outline">Batal</Button></Link>
                                <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Data
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
