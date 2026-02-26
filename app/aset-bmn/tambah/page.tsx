'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAsetBmn, JENIS_LAPORAN_BMN, type AsetBmn } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

export default function AsetBmnAdd() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<AsetBmn>>({
        tahun: new Date().getFullYear(),
    });
    const [file, setFile] = useState<File | null>(null);

    const yearOptions = getYearOptions(2018);

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

            const result = await createAsetBmn(dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Dokumen BMN berhasil disimpan!" });
                router.push('/aset-bmn');
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
                    <Link href="/aset-bmn">
                        <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Tambah Dokumen BMN</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Dokumen Aset BMN</CardTitle>
                        <CardDescription>
                            Pilih tahun dan jenis laporan, lalu upload dokumen (PDF, DOC, XLS, max 10MB).
                        </CardDescription>
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
                                    Upload Dokumen
                                </Label>
                                <Input
                                    id="file_dokumen"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Kosongkan jika dokumen belum tersedia. Dapat diupload kemudian.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/aset-bmn">
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Dokumen
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
