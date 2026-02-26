'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAsetBmn, updateAsetBmn, JENIS_LAPORAN_BMN, type AsetBmn } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Upload, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

export default function AsetBmnEdit() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<Partial<AsetBmn>>({});
    const [file, setFile] = useState<File | null>(null);

    const yearOptions = getYearOptions(2018);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAsetBmn(id);
                if (data) {
                    setFormData(data);
                } else {
                    router.push('/aset-bmn');
                }
            } catch {
                toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" });
            }
            setFetching(false);
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tahun || !formData.jenis_laporan) {
            toast({ title: "Error", description: "Tahun dan jenis laporan wajib diisi", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== null && val !== undefined) dataToSend.append(key, String(val));
            });
            if (file) dataToSend.append('file_dokumen', file);

            const result = await updateAsetBmn(id, dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Data berhasil diperbarui!" });
                router.push('/aset-bmn');
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
                    <Link href="/aset-bmn">
                        <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Dokumen BMN</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Data Aset BMN</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tahun">Tahun *</Label>
                                    <Select
                                        value={formData.tahun ? String(formData.tahun) : ''}
                                        onValueChange={val => setFormData(prev => ({ ...prev, tahun: parseInt(val) }))}
                                    >
                                        <SelectTrigger id="tahun">
                                            <SelectValue placeholder="Pilih tahun..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map(y => (
                                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis_laporan">Jenis Laporan *</Label>
                                <Select
                                    value={formData.jenis_laporan || ''}
                                    onValueChange={val => setFormData(prev => ({ ...prev, jenis_laporan: val as AsetBmn['jenis_laporan'] }))}
                                >
                                    <SelectTrigger id="jenis_laporan">
                                        <SelectValue placeholder="Pilih jenis laporan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JENIS_LAPORAN_BMN.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file_dokumen" className="flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-teal-600" />
                                    Upload Dokumen Baru
                                </Label>
                                <Input
                                    id="file_dokumen"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                />
                                {formData.link_dokumen && (
                                    <a
                                        href={formData.link_dokumen}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-teal-600 hover:underline text-xs"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Buka dokumen yang tersimpan
                                    </a>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Upload file baru untuk mengganti dokumen yang ada. Kosongkan untuk mempertahankan dokumen lama.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/aset-bmn">
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Perbarui Data
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
