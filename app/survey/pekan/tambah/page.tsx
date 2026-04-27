'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSurveyPekan, type SurveyPekan } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';

interface IndikatorState {
    gambar_url: string;
    link_url: string;
    file: File | null;
}

const indikatorList = [
    { key: 'ikm',  label: 'IKM',  desc: 'Indeks Kepuasan Masyarakat',  color: 'fuchsia' },
    { key: 'ipkp', label: 'IPKP', desc: 'Indeks Persepsi Kualitas Pelayanan', color: 'amber' },
    { key: 'ipak', label: 'IPAK', desc: 'Indeks Persepsi Anti Korupsi', color: 'emerald' },
] as const;

export default function SurveyPekanTambah() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<SurveyPekan>>({
        tahun: new Date().getFullYear(),
        tanggal_mulai: '',
        tanggal_selesai: '',
    });

    const [indikator, setIndikator] = useState<Record<'ikm' | 'ipkp' | 'ipak', IndikatorState>>({
        ikm:  { gambar_url: '', link_url: '', file: null },
        ipkp: { gambar_url: '', link_url: '', file: null },
        ipak: { gambar_url: '', link_url: '', file: null },
    });

    const updateIndikator = (key: 'ikm' | 'ipkp' | 'ipak', field: keyof IndikatorState, val: any) => {
        setIndikator(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tanggal_mulai || !formData.tanggal_selesai) {
            toast({ title: 'Error', description: 'Tanggal mulai dan selesai wajib diisi.', variant: 'destructive' });
            return;
        }
        if (formData.tanggal_selesai < formData.tanggal_mulai) {
            toast({ title: 'Error', description: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            // Auto-derive tahun dari tanggal_mulai
            const derivedYear = new Date(formData.tanggal_mulai!).getFullYear();
            fd.append('tahun', String(derivedYear));
            fd.append('tanggal_mulai', formData.tanggal_mulai!);
            fd.append('tanggal_selesai', formData.tanggal_selesai!);

            for (const ind of indikatorList) {
                const data = indikator[ind.key];
                if (data.gambar_url) fd.append(`gambar_${ind.key}`, data.gambar_url);
                if (data.link_url) fd.append(`link_${ind.key}`, data.link_url);
                if (data.file) fd.append(`file_gambar_${ind.key}`, data.file);
            }

            const result = await createSurveyPekan(fd);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data pekan survei berhasil disimpan!' });
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
        <div className="max-w-3xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/survey"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Tambah Pekan Survei</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Pekan Survei</CardTitle>
                        <CardDescription>
                            Tambahkan snapshot mingguan IKM, IPKP, dan IPAK untuk satu periode survei.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Periode */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Mulai <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={formData.tanggal_mulai || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal Selesai <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={formData.tanggal_selesai || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, tanggal_selesai: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Indikator */}
                            {indikatorList.map(ind => {
                                const colorMap: Record<string, string> = {
                                    fuchsia: 'border-fuchsia-200 bg-fuchsia-50',
                                    amber: 'border-amber-200 bg-amber-50',
                                    emerald: 'border-emerald-200 bg-emerald-50',
                                };
                                const data = indikator[ind.key];
                                return (
                                    <div key={ind.key} className={`rounded-lg border p-4 space-y-3 ${colorMap[ind.color]}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm">{ind.label}</h3>
                                                <p className="text-xs text-muted-foreground">{ind.desc}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">URL Gambar</Label>
                                            <Input
                                                type="url"
                                                value={data.gambar_url}
                                                onChange={e => updateIndikator(ind.key, 'gambar_url', e.target.value)}
                                                placeholder="https://... (opsional)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Atau Upload Gambar</Label>
                                            <Input
                                                type="file"
                                                onChange={e => updateIndikator(ind.key, 'file', e.target.files?.[0] || null)}
                                                accept=".jpg,.jpeg,.png,.webp"
                                            />
                                            {data.file && (
                                                <p className="text-xs font-medium">File: {data.file.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Link Detail (opsional)</Label>
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
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
