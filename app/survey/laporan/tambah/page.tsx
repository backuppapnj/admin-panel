'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSurveyLaporan, KATEGORI_SURVEY_LAPORAN, type SurveyLaporan, type KategoriSurveyLaporan } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';

const PERIODE_PRESET = ['Triwulan I', 'Triwulan II', 'Triwulan III', 'Triwulan IV', 'Semester I', 'Semester II', 'Tahunan'];

function SurveyLaporanForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<SurveyLaporan>>({
        tahun: new Date().getFullYear(),
        urutan: 1,
    });

    const [fileGambar, setFileGambar] = useState<File | null>(null);
    const [fileDokumen, setFileDokumen] = useState<File | null>(null);

    useEffect(() => {
        const k = searchParams.get('kategori');
        if (k) setFormData(prev => ({ ...prev, kategori: k as KategoriSurveyLaporan }));
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kategori || !formData.tahun || !formData.periode) {
            toast({ title: 'Error', description: 'Kategori, Tahun, dan Periode wajib diisi.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== null && val !== undefined) dataToSend.append(key, String(val));
            });
            if (fileGambar) dataToSend.append('file_gambar', fileGambar);
            if (fileDokumen) dataToSend.append('file_dokumen', fileDokumen);

            const result = await createSurveyLaporan(dataToSend);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil disimpan!' });
                router.push('/survey');
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan.' });
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Formulir Laporan Survey</CardTitle>
                <CardDescription>
                    Tambahkan laporan survey (IKM / IPAK / Tindak Lanjut) untuk ditampilkan di halaman publik.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Kategori <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.kategori || ''}
                            onValueChange={v => setFormData(prev => ({ ...prev, kategori: v as KategoriSurveyLaporan }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Kategori Laporan" />
                            </SelectTrigger>
                            <SelectContent>
                                {KATEGORI_SURVEY_LAPORAN.map(k => (
                                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tahun <span className="text-red-500">*</span></Label>
                            <Select
                                value={String(formData.tahun || '')}
                                onValueChange={v => setFormData(prev => ({ ...prev, tahun: parseInt(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getYearOptions(2019).map(y => (
                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Urutan</Label>
                            <Input
                                type="number"
                                min={1}
                                max={99}
                                value={formData.urutan || 1}
                                onChange={e => setFormData(prev => ({ ...prev, urutan: parseInt(e.target.value) || 1 }))}
                                placeholder="1"
                            />
                            <p className="text-xs text-muted-foreground">Urutan tampil dalam tahun (1 = paling awal).</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Periode <span className="text-red-500">*</span></Label>
                        <Input
                            type="text"
                            value={formData.periode || ''}
                            onChange={e => setFormData(prev => ({ ...prev, periode: e.target.value }))}
                            placeholder="Contoh: Triwulan I"
                            list="periode-preset"
                        />
                        <datalist id="periode-preset">
                            {PERIODE_PRESET.map(p => <option key={p} value={p} />)}
                        </datalist>
                        <p className="text-xs text-muted-foreground">Bebas isi: Triwulan I/II/III/IV, Semester, atau periode lain.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>URL Gambar</Label>
                        <Input
                            type="url"
                            value={formData.gambar_url || ''}
                            onChange={e => setFormData(prev => ({ ...prev, gambar_url: e.target.value }))}
                            placeholder="https://... (opsional, atau upload di bawah)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Upload Gambar (opsional)</Label>
                        <Input
                            type="file"
                            onChange={e => setFileGambar(e.target.files?.[0] || null)}
                            accept=".jpg,.jpeg,.png,.webp"
                        />
                        <p className="text-xs text-muted-foreground">Format: JPG, JPEG, PNG, WEBP. Maks 5MB. Akan menggantikan URL Gambar di atas.</p>
                        {fileGambar && (
                            <p className="text-xs text-fuchsia-600 font-medium">File dipilih: {fileGambar.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Link Dokumen (Google Drive / URL)</Label>
                        <Input
                            type="url"
                            value={formData.link_dokumen || ''}
                            onChange={e => setFormData(prev => ({ ...prev, link_dokumen: e.target.value }))}
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Atau Upload File Dokumen</Label>
                        <Input
                            type="file"
                            onChange={e => setFileDokumen(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-muted-foreground">Format: PDF, DOC, DOCX, JPG, JPEG, PNG. Maks 20MB. Akan menggantikan Link Dokumen di atas.</p>
                        {fileDokumen && (
                            <p className="text-xs text-fuchsia-600 font-medium">File dipilih: {fileDokumen.name}</p>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Link href="/survey"><Button type="button" variant="outline">Batal</Button></Link>
                        <Button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-700" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Simpan
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function SurveyLaporanTambah() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/survey"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Tambah Laporan Survey</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Suspense fallback={
                    <Card>
                        <CardContent className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600" />
                        </CardContent>
                    </Card>
                }>
                    <SurveyLaporanForm />
                </Suspense>
            </BlurFade>
        </div>
    );
}
