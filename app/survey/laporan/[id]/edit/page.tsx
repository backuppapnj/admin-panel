'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSurveyLaporan, updateSurveyLaporan, KATEGORI_SURVEY_LAPORAN, type SurveyLaporan, type KategoriSurveyLaporan } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, ExternalLink, ImageOff } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';

const PERIODE_PRESET = ['Triwulan I', 'Triwulan II', 'Triwulan III', 'Triwulan IV', 'Semester I', 'Semester II', 'Tahunan'];

export default function SurveyLaporanEdit() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<Partial<SurveyLaporan>>({});
    const [fileGambar, setFileGambar] = useState<File | null>(null);
    const [fileDokumen, setFileDokumen] = useState<File | null>(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSurveyLaporan(id);
                if (data) {
                    setFormData(data);
                } else {
                    toast({ title: 'Error', description: 'Data tidak ditemukan.', variant: 'destructive' });
                    router.push('/survey');
                }
            } catch {
                toast({ title: 'Error', description: 'Gagal memuat data.', variant: 'destructive' });
                router.push('/survey');
            }
            setFetching(false);
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== null && val !== undefined) dataToSend.append(key, String(val));
            });
            if (fileGambar) dataToSend.append('file_gambar', fileGambar);
            if (fileDokumen) dataToSend.append('file_dokumen', fileDokumen);

            const result = await updateSurveyLaporan(id, dataToSend);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil diperbarui!' });
                router.push('/survey');
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan.' });
        }
        setLoading(false);
    };

    if (fetching) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/survey"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Laporan Survey</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>{formData.periode} — Tahun {formData.tahun}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Kategori <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.kategori || ''}
                                    onValueChange={v => setFormData(prev => ({ ...prev, kategori: v as KategoriSurveyLaporan }))}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Periode <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={formData.periode || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, periode: e.target.value }))}
                                    list="periode-preset-edit"
                                />
                                <datalist id="periode-preset-edit">
                                    {PERIODE_PRESET.map(p => <option key={p} value={p} />)}
                                </datalist>
                            </div>

                            <div className="space-y-2">
                                <Label>Gambar saat ini</Label>
                                {formData.gambar_url && !imgError ? (
                                    <div className="border rounded-lg p-2 bg-slate-50 inline-block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={formData.gambar_url}
                                            alt="Preview"
                                            className="h-32 w-32 object-cover rounded"
                                            onError={() => setImgError(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="border rounded-lg p-4 bg-slate-50 inline-flex items-center gap-2 text-slate-400 text-sm">
                                        <ImageOff className="h-5 w-5" /> Tidak ada gambar
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>URL Gambar</Label>
                                <Input
                                    type="url"
                                    value={formData.gambar_url || ''}
                                    onChange={e => { setFormData(prev => ({ ...prev, gambar_url: e.target.value })); setImgError(false); }}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Atau Upload Gambar Baru</Label>
                                <Input
                                    type="file"
                                    onChange={e => setFileGambar(e.target.files?.[0] || null)}
                                    accept=".jpg,.jpeg,.png,.webp"
                                />
                                {fileGambar && (
                                    <p className="text-xs text-fuchsia-600 font-medium">File baru dipilih: {fileGambar.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Link Dokumen</Label>
                                {formData.link_dokumen && (
                                    <div className="mb-2">
                                        <a
                                            href={formData.link_dokumen}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-fuchsia-600 hover:underline"
                                        >
                                            <ExternalLink className="h-3 w-3" /> Dokumen saat ini
                                        </a>
                                    </div>
                                )}
                                <Input
                                    type="url"
                                    value={formData.link_dokumen || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, link_dokumen: e.target.value }))}
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Atau Upload File Dokumen Baru</Label>
                                <Input
                                    type="file"
                                    onChange={e => setFileDokumen(e.target.files?.[0] || null)}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                                {fileDokumen && (
                                    <p className="text-xs text-fuchsia-600 font-medium">File baru dipilih: {fileDokumen.name}</p>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/survey"><Button type="button" variant="outline">Batal</Button></Link>
                                <Button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-700" disabled={loading}>
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
