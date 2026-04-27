'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSurveyPekan, updateSurveyPekan, type SurveyPekan } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, ImageOff, ExternalLink, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';

interface IndikatorState {
    gambar_url: string;
    link_url: string;
    nilai: string;
    file: File | null;
}

const indikatorList = [
    { key: 'ikm',  label: 'IKM',  desc: 'Indeks Kepuasan Masyarakat',         color: 'fuchsia' },
    { key: 'ipkp', label: 'IPKP', desc: 'Indeks Persepsi Kualitas Pelayanan', color: 'amber' },
    { key: 'ipak', label: 'IPAK', desc: 'Indeks Persepsi Anti Korupsi',       color: 'emerald' },
] as const;

const colorMap: Record<string, string> = {
    fuchsia: 'border-fuchsia-200 bg-fuchsia-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50',
};

// Helper format date dari ISO ke YYYY-MM-DD
function isoToInputDate(value?: string | null): string {
    if (!value) return '';
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
}

export default function SurveyPekanEdit() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [tanggalMulai, setTanggalMulai] = useState('');
    const [tanggalSelesai, setTanggalSelesai] = useState('');
    const [totalResponden, setTotalResponden] = useState<string>('');
    const [catatan, setCatatan] = useState<string>('');
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

    const [indikator, setIndikator] = useState<Record<'ikm' | 'ipkp' | 'ipak', IndikatorState>>({
        ikm:  { gambar_url: '', link_url: '', nilai: '', file: null },
        ipkp: { gambar_url: '', link_url: '', nilai: '', file: null },
        ipak: { gambar_url: '', link_url: '', nilai: '', file: null },
    });

    const updateIndikator = (key: 'ikm' | 'ipkp' | 'ipak', field: keyof IndikatorState, val: any) => {
        setIndikator(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSurveyPekan(id);
                if (data) {
                    setTanggalMulai(isoToInputDate(data.tanggal_mulai));
                    setTanggalSelesai(isoToInputDate(data.tanggal_selesai));
                    setTotalResponden(data.total_responden != null ? String(data.total_responden) : '');
                    setCatatan(data.catatan || '');
                    setIndikator({
                        ikm:  { gambar_url: data.gambar_ikm  || '', link_url: data.link_ikm  || '', nilai: data.nilai_ikm  != null ? String(data.nilai_ikm)  : '', file: null },
                        ipkp: { gambar_url: data.gambar_ipkp || '', link_url: data.link_ipkp || '', nilai: data.nilai_ipkp != null ? String(data.nilai_ipkp) : '', file: null },
                        ipak: { gambar_url: data.gambar_ipak || '', link_url: data.link_ipak || '', nilai: data.nilai_ipak != null ? String(data.nilai_ipak) : '', file: null },
                    });
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

        if (!tanggalMulai || !tanggalSelesai) {
            toast({ title: 'Error', description: 'Tanggal mulai dan selesai wajib diisi.', variant: 'destructive' });
            return;
        }
        if (tanggalSelesai < tanggalMulai) {
            toast({ title: 'Error', description: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            const derivedYear = new Date(tanggalMulai).getFullYear();
            fd.append('tahun', String(derivedYear));
            fd.append('tanggal_mulai', tanggalMulai);
            fd.append('tanggal_selesai', tanggalSelesai);

            for (const ind of indikatorList) {
                const data = indikator[ind.key];
                fd.append(`gambar_${ind.key}`, data.gambar_url || '');
                fd.append(`link_${ind.key}`, data.link_url || '');
                fd.append(`nilai_${ind.key}`, data.nilai || '');
                if (data.file) fd.append(`file_gambar_${ind.key}`, data.file);
            }
            fd.append('total_responden', totalResponden || '');
            fd.append('catatan', catatan || '');

            const result = await updateSurveyPekan(id, fd);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil diperbarui!' });
                // Invalidate Next.js Router Cache supaya halaman /survey
                // memuat data fresh dari API (bukan dari cache RSC).
                router.refresh();
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
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/survey"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Pekan Survei</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Periode {tanggalMulai} – {tanggalSelesai}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Mulai <span className="text-red-500">*</span></Label>
                                    <Input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal Selesai <span className="text-red-500">*</span></Label>
                                    <Input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)} required />
                                </div>
                            </div>

                            {/* Statistik umum pekan */}
                            <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                                    <h3 className="font-semibold text-sm text-indigo-700">Statistik Pekan</h3>
                                    <span className="text-xs text-muted-foreground">(opsional)</span>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Total Responden</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={totalResponden}
                                        onChange={e => setTotalResponden(e.target.value)}
                                        placeholder="35"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Catatan</Label>
                                    <Textarea
                                        rows={2}
                                        value={catatan}
                                        onChange={e => setCatatan(e.target.value)}
                                        placeholder="Catatan tambahan untuk pekan ini..."
                                    />
                                </div>
                            </div>

                            {indikatorList.map(ind => {
                                const data = indikator[ind.key];
                                const previewUrl = data.gambar_url;
                                const hasError = imgErrors[ind.key];
                                return (
                                    <div key={ind.key} className={`rounded-lg border p-4 space-y-3 ${colorMap[ind.color]}`}>
                                        <div>
                                            <h3 className="font-bold text-sm">{ind.label}</h3>
                                            <p className="text-xs text-muted-foreground">{ind.desc}</p>
                                        </div>

                                        {previewUrl && !hasError && (
                                            <div className="bg-white rounded p-2 border inline-block">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={previewUrl}
                                                    alt={ind.label}
                                                    className="h-28 w-28 object-cover rounded"
                                                    onError={() => setImgErrors(prev => ({ ...prev, [ind.key]: true }))}
                                                />
                                            </div>
                                        )}
                                        {(!previewUrl || hasError) && (
                                            <div className="bg-white rounded p-3 border inline-flex items-center gap-2 text-slate-400 text-xs">
                                                <ImageOff className="h-4 w-4" /> Tidak ada gambar
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-xs">Nilai Indeks {ind.label}</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                max={100}
                                                value={data.nilai}
                                                onChange={e => updateIndikator(ind.key, 'nilai', e.target.value)}
                                                placeholder="86.45"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">URL Gambar</Label>
                                            <Input
                                                type="url"
                                                value={data.gambar_url}
                                                onChange={e => { updateIndikator(ind.key, 'gambar_url', e.target.value); setImgErrors(prev => ({ ...prev, [ind.key]: false })); }}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Atau Upload Gambar Baru</Label>
                                            <Input
                                                type="file"
                                                onChange={e => updateIndikator(ind.key, 'file', e.target.files?.[0] || null)}
                                                accept=".jpg,.jpeg,.png,.webp"
                                            />
                                            {data.file && <p className="text-xs font-medium">File baru: {data.file.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Link Detail</Label>
                                            {data.link_url && (
                                                <a href={data.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                    <ExternalLink className="h-3 w-3" /> Buka link saat ini
                                                </a>
                                            )}
                                            <Input
                                                type="url"
                                                value={data.link_url}
                                                onChange={e => updateIndikator(ind.key, 'link_url', e.target.value)}
                                                placeholder="https://drive.google.com/..."
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/survey"><Button type="button" variant="outline">Batal</Button></Link>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
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
