'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDipaPok, updateDipaPok, getAllDipaPok, type DipaPok } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, FileText, ExternalLink } from 'lucide-react';
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

export default function DipaPokEdit() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [loadingRevisi, setLoadingRevisi] = useState(false);
    const [revisiOptions, setRevisiOptions] = useState<string[]>(SEMUA_REVISI);
    const [originalRevisi, setOriginalRevisi] = useState<string>('');
    const [formData, setFormData] = useState<Partial<DipaPok>>({});
    const [files, setFiles] = useState<Record<string, File | null>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDipaPok(id);
                if (data) {
                    setFormData(data);
                    setOriginalRevisi(data.revisi_dipa || '');
                    if (data.thn_dipa) {
                        await loadRevisiOptions(data.thn_dipa, data.revisi_dipa || '', data.jns_dipa);
                    }
                } else {
                    router.push('/dipapok');
                }
            } catch {
                toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" });
            }
            setFetching(false);
        };
        fetchData();
    }, [id]);

    const loadRevisiOptions = async (tahun: number, currentRevisi: string, jnsDipa?: string) => {
        setLoadingRevisi(true);
        try {
            const result = await getAllDipaPok(tahun, 1);
            const existing = (result.data || [])
                .filter((d: DipaPok) => !jnsDipa || d.jns_dipa === jnsDipa)
                .map((d: DipaPok) => d.revisi_dipa);
            const available = SEMUA_REVISI.filter(r => !existing.includes(r) || r === currentRevisi);
            setRevisiOptions(available);
        } catch {
            setRevisiOptions(SEMUA_REVISI);
        }
        setLoadingRevisi(false);
    };

    const handleTahunChange = async (tahun: number) => {
        setFormData(prev => ({ ...prev, thn_dipa: tahun, revisi_dipa: undefined }));
        setOriginalRevisi('');
        await loadRevisiOptions(tahun, '', formData.jns_dipa);
    };

    const handleJenisDipaChange = async (val: string) => {
        setFormData(prev => ({ ...prev, jns_dipa: val, revisi_dipa: undefined }));
        if (formData.thn_dipa) {
            await loadRevisiOptions(formData.thn_dipa, originalRevisi, val);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = new FormData();

            Object.entries(formData).forEach(([key, val]) => {
                if (val !== null && val !== undefined) {
                    dataToSend.append(key, String(val));
                }
            });

            Object.entries(files).forEach(([key, file]) => {
                if (file) dataToSend.append(key, file);
            });

            const result = await updateDipaPok(id, dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Data berhasil diperbarui!" });
                router.push('/dipapok');
            } else {
                toast({ title: "Gagal", description: result.message || "Terjadi kesalahan", variant: "destructive" });
            }
        } catch {
            toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan" });
        }
        setLoading(false);
    };

    if (fetching) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/dipapok"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Edit DIPA/POK</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader><CardTitle>Edit Data DIPA/POK</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="thn_dipa">Tahun DIPA *</Label>
                                    <Input
                                        id="thn_dipa"
                                        type="number"
                                        value={formData.thn_dipa || ''}
                                        onChange={e => handleTahunChange(parseInt(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tgl_dipa">Tanggal DIPA *</Label>
                                    <Input
                                        id="tgl_dipa"
                                        type="date"
                                        value={formData.tgl_dipa || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, tgl_dipa: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jns_dipa">Jenis DIPA *</Label>
                                <Select
                                    value={formData.jns_dipa || ''}
                                    onValueChange={handleJenisDipaChange}
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
                                        <Label>
                                            File Dokumen DIPA (PDF)
                                            {formData.doc_dipa && (
                                                <span className="ml-2 text-xs text-emerald-600">
                                                    (<a href={formData.doc_dipa} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-800 flex items-center gap-1 inline-flex">
                                                        Lihat <ExternalLink className="h-3 w-3" />
                                                    </a>)
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => setFiles(prev => ({ ...prev, file_doc_dipa: e.target.files?.[0] || null }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            File Dokumen POK (PDF)
                                            {formData.doc_pok && (
                                                <span className="ml-2 text-xs text-emerald-600">
                                                    (<a href={formData.doc_pok} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-800 flex items-center gap-1 inline-flex">
                                                        Lihat <ExternalLink className="h-3 w-3" />
                                                    </a>)
                                                </span>
                                            )}
                                        </Label>
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
