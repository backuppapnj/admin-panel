'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDipaPok, type DipaPok } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

export default function DipaPokAdd() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<DipaPok>>({
        thn_dipa: new Date().getFullYear(),
        tgl_dipa: new Date().toISOString().split('T')[0],
        alokasi_dipa: 0,
    });

    const [files, setFiles] = useState<Record<string, File | null>>({
        file_doc_dipa: null,
        file_doc_pok: null,
    });

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
            dataToSend.append('revisi_dipa', formData.revisi_dipa || '');
            dataToSend.append('jns_dipa', formData.jns_dipa || '');
            dataToSend.append('tgl_dipa', formData.tgl_dipa || '');
            dataToSend.append('alokasi_dipa', String(formData.alokasi_dipa || 0));

            if (files.file_doc_dipa) {
                dataToSend.append('file_doc_dipa', files.file_doc_dipa);
            }
            if (files.file_doc_pok) {
                dataToSend.append('file_doc_pok', files.file_doc_pok);
            }

            const result = await createDipaPok(dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Data DIPA/POK berhasil disimpan!" });
                router.push('/dipapok');
            } else {
                toast({ title: "Gagal", description: result.message || "Terjadi kesalahan", variant: "destructive" });
            }
        } catch (error) {
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
                                <Label htmlFor="revisi_dipa">Revisi DIPA *</Label>
                                <Input
                                    id="revisi_dipa"
                                    placeholder="Contoh: DIPA Pertama, DIPA Kedua..."
                                    value={formData.revisi_dipa || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, revisi_dipa: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jns_dipa">Jenis DIPA *</Label>
                                <Input
                                    id="jns_dipa"
                                    placeholder="Contoh: DIPA 01 - Belanja Pegawai..."
                                    value={formData.jns_dipa || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, jns_dipa: e.target.value }))}
                                    required
                                />
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
