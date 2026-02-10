'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLhkpn, type LhkpnReport } from '@/lib/api';
import pegawaiData from '@/app/data/pegawai.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

export default function LhkpnAdd() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<LhkpnReport>>({
        tahun: new Date().getFullYear(),
        jenis_laporan: 'LHKPN',
        tanggal_lapor: new Date().toISOString().split('T')[0],
    });

    const [files, setFiles] = useState<Record<string, File | null>>({
        file_tanda_terima: null,
        file_pengumuman: null,
        file_spt: null,
        file_dokumen_pendukung: null,
    });

    const handlePegawaiChange = (value: string) => {
        const selectedPegawai = pegawaiData.find(p => p.id.toString() === value || p.nip === value);
        if (selectedPegawai) {
            setFormData(prev => ({
                ...prev,
                nip: selectedPegawai.nip,
                nama: selectedPegawai.nama,
                jabatan: selectedPegawai.jabatan,
            }));
        }
    };

    const handleFileChange = (field: string, file: File | null) => {
        setFiles(prev => ({ ...prev, [field]: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nip) {
            toast({ title: "Error", description: "Silakan pilih pegawai", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('nip', formData.nip || '');
            dataToSend.append('nama', formData.nama || '');
            dataToSend.append('jabatan', formData.jabatan || '');
            dataToSend.append('tahun', String(formData.tahun || new Date().getFullYear()));
            dataToSend.append('jenis_laporan', formData.jenis_laporan || 'LHKPN');
            dataToSend.append('tanggal_lapor', formData.tanggal_lapor || '');

            if (formData.link_tanda_terima) dataToSend.append('link_tanda_terima', formData.link_tanda_terima);
            if (formData.link_pengumuman) dataToSend.append('link_pengumuman', formData.link_pengumuman);
            if (formData.link_spt) dataToSend.append('link_spt', formData.link_spt);
            if (formData.link_dokumen_pendukung) dataToSend.append('link_dokumen_pendukung', formData.link_dokumen_pendukung);

            Object.entries(files).forEach(([key, file]) => {
                if (file) dataToSend.append(key, file);
            });

            const result = await createLhkpn(dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Data laporan berhasil disimpan!" });
                router.push('/lhkpn');
            } else {
                throw new Error(result.message || 'Gagal menyimpan');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan data." });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/lhkpn"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Input Laporan Baru</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Pelaporan</CardTitle>
                        <CardDescription>Isi data pelaporan Harta Kekayaan atau SPT Tahunan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Pegawai</Label>
                                <Select onValueChange={handlePegawaiChange}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Pegawai..." /></SelectTrigger>
                                    <SelectContent>
                                        {pegawaiData.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tahun</Label>
                                    <Input type="number" value={formData.tahun} onChange={e => setFormData(prev => ({ ...prev, tahun: parseInt(e.target.value) }))} min="2019" max="2030" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jenis Laporan</Label>
                                    <Select value={formData.jenis_laporan} onValueChange={(val: any) => setFormData(prev => ({ ...prev, jenis_laporan: val }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LHKPN">LHKPN (Pejabat)</SelectItem>
                                            <SelectItem value="SPT Tahunan">SPT Tahunan (ASN)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tanggal Lapor</Label>
                                <Input type="date" value={formData.tanggal_lapor} onChange={e => setFormData(prev => ({ ...prev, tanggal_lapor: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label>File Tanda Terima</Label>
                                    <Input type="file" onChange={e => handleFileChange('file_tanda_terima', e.target.files?.[0] || null)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>File Pengumuman (KPK)</Label>
                                    <Input type="file" onChange={e => handleFileChange('file_pengumuman', e.target.files?.[0] || null)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>File SPT</Label>
                                    <Input type="file" onChange={e => handleFileChange('file_spt', e.target.files?.[0] || null)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>File Lainnya</Label>
                                    <Input type="file" onChange={e => handleFileChange('file_dokumen_pendukung', e.target.files?.[0] || null)} />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/lhkpn"><Button type="button" variant="outline">Batal</Button></Link>
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