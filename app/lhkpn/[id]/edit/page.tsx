'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLhkpn, updateLhkpn, type LhkpnReport } from '@/lib/api';
import pegawaiData from '@/app/data/pegawai.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Upload, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

export default function LhkpnEdit() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<Partial<LhkpnReport>>({});

    // File states
    const [fileTandaTerima, setFileTandaTerima] = useState<File | null>(null);
    const [fileDokumen, setFileDokumen] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getLhkpn(id);
                if (data) {
                    setFormData(data);
                } else {
                    toast({ title: "Error", description: "Data tidak ditemukan", variant: "destructive" });
                    router.push('/lhkpn');
                }
            } catch (error) {
                toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" });
            }
            setFetching(false);
        };
        fetchData();
    }, [id]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Use FormData for file uploads
            const dataToSend = new FormData();
            dataToSend.append('nip', formData.nip || '');
            dataToSend.append('nama', formData.nama || '');
            dataToSend.append('jabatan', formData.jabatan || '');
            dataToSend.append('tahun', String(formData.tahun || new Date().getFullYear()));
            dataToSend.append('jenis_laporan', formData.jenis_laporan || 'LHKPN');

            // Handle date format
            let tanggalLapor = formData.tanggal_lapor || '';
            if (tanggalLapor && tanggalLapor.includes('T')) {
                tanggalLapor = tanggalLapor.split('T')[0];
            }
            dataToSend.append('tanggal_lapor', tanggalLapor);

            // Add URL links if no new file uploaded
            if (!fileTandaTerima && formData.link_tanda_terima) {
                dataToSend.append('link_tanda_terima', formData.link_tanda_terima);
            }
            if (!fileDokumen && formData.link_dokumen_pendukung) {
                dataToSend.append('link_dokumen_pendukung', formData.link_dokumen_pendukung);
            }

            // Add files if selected
            if (fileTandaTerima) {
                dataToSend.append('file_tanda_terima', fileTandaTerima);
            }
            if (fileDokumen) {
                dataToSend.append('file_dokumen_pendukung', fileDokumen);
            }

            const result = await updateLhkpn(id, dataToSend);
            if (result.success) {
                toast({
                    title: "Sukses",
                    description: "Data laporan berhasil diperbarui!",
                });
                router.push('/lhkpn');
            } else {
                throw new Error(result.message || 'Gagal menyimpan');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Terjadi kesalahan saat menyimpan data.",
            });
        }
        setLoading(false);
    };

    if (fetching) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/lhkpn">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Laporan</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit LHKPN / SPT Tahunan</CardTitle>
                        <CardDescription>Perbarui data pegawai dan upload dokumen baru jika perlu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="space-y-2">
                                <Label>Pegawai</Label>
                                <Select onValueChange={handlePegawaiChange} defaultValue={
                                    pegawaiData.find(p => p.nip === formData.nip)?.id.toString()
                                }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Pegawai..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pegawaiData.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formData.nama && (
                                    <div className="p-3 bg-slate-50 rounded-md text-sm text-slate-600 mt-2 space-y-1 border">
                                        <p><span className="font-semibold">NIP:</span> {formData.nip}</p>
                                        <p><span className="font-semibold">Jabatan:</span> {formData.jabatan}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tahun Lapor</Label>
                                    <Input
                                        type="number"
                                        value={formData.tahun}
                                        onChange={e => setFormData(prev => ({ ...prev, tahun: parseInt(e.target.value) }))}
                                        min="2020" max="2030"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jenis Laporan</Label>
                                    <Select
                                        value={formData.jenis_laporan}
                                        onValueChange={(val: any) => setFormData(prev => ({ ...prev, jenis_laporan: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LHKPN">LHKPN</SelectItem>
                                            <SelectItem value="SPT Tahunan">SPT Tahunan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tanggal Lapor</Label>
                                <Input
                                    type="date"
                                    value={formData.tanggal_lapor ? (typeof formData.tanggal_lapor === 'string' ? formData.tanggal_lapor.split('T')[0] : '') : ''}
                                    onChange={e => setFormData(prev => ({ ...prev, tanggal_lapor: e.target.value }))}
                                />
                            </div>

                            {/* File Upload - Tanda Terima */}
                            <div className="space-y-2">
                                <Label htmlFor="file_tanda_terima">Upload Tanda Terima Baru (PDF/Gambar)</Label>
                                {formData.link_tanda_terima && (
                                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200 text-sm">
                                        <ExternalLink className="h-4 w-4 text-green-600" />
                                        <a href={formData.link_tanda_terima} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline truncate">
                                            Dokumen tersimpan (klik untuk lihat)
                                        </a>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="file_tanda_terima"
                                        type="file"
                                        onChange={e => setFileTandaTerima(e.target.files?.[0] || null)}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="cursor-pointer"
                                    />
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Upload file baru untuk mengganti dokumen yang ada. Format: PDF, DOC, Gambar. Max 5MB.
                                </p>
                            </div>

                            {/* File Upload - Dokumen Pendukung */}
                            <div className="space-y-2">
                                <Label htmlFor="file_dokumen">Upload Dokumen Pendukung Baru (Opsional)</Label>
                                {formData.link_dokumen_pendukung && (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200 text-sm">
                                        <ExternalLink className="h-4 w-4 text-blue-600" />
                                        <a href={formData.link_dokumen_pendukung} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline truncate">
                                            Dokumen tersimpan (klik untuk lihat)
                                        </a>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="file_dokumen"
                                        type="file"
                                        onChange={e => setFileDokumen(e.target.files?.[0] || null)}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="cursor-pointer"
                                    />
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Upload file baru untuk mengganti dokumen yang ada. Format: PDF, DOC, Gambar. Max 5MB.
                                </p>
                            </div>

                            {/* Alternative: Manual URL Input */}
                            <div className="border-t pt-4 mt-4">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Atau edit link Google Drive secara manual:
                                </p>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label>Link Tanda Terima</Label>
                                        <Input
                                            placeholder="https://drive.google.com/..."
                                            value={formData.link_tanda_terima || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, link_tanda_terima: e.target.value }))}
                                            disabled={!!fileTandaTerima}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Link Dokumen Pendukung</Label>
                                        <Input
                                            placeholder="https://drive.google.com/..."
                                            value={formData.link_dokumen_pendukung || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, link_dokumen_pendukung: e.target.value }))}
                                            disabled={!!fileDokumen}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/lhkpn">
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
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
