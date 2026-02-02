'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLhkpn, type LhkpnReport } from '@/lib/api';
import pegawaiData from '@/app/data/pegawai.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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

    const handlePegawaiChange = (value: string) => {
        const selectedPegawai = pegawaiData.find(p => p.id.toString() === value || p.nip === value);
        if (selectedPegawai) {
            // Find if user selected by index or unique ID if collisions exist, but assuming ID/NIP is unique enough
            // In the JSON, ID is unique. NIP is also unique.
            // Let's assume value is the ID from the Select
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
        if (!formData.nip || !formData.nama) {
            toast({ title: "Error", description: "Silakan pilih pegawai", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const result = await createLhkpn(formData as LhkpnReport);
            if (result.success) {
                toast({
                    title: "Sukses",
                    description: "Data laporan berhasil disimpan!",
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

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/lhkpn">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Input Laporan Baru</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir LHKPN / SPT Tahunan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="space-y-2">
                                <Label>Pegawai</Label>
                                <Select onValueChange={handlePegawaiChange}>
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
                                    value={formData.tanggal_lapor}
                                    onChange={e => setFormData(prev => ({ ...prev, tanggal_lapor: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Link Tanda Terima (Google Drive)</Label>
                                <Input
                                    placeholder="https://drive.google.com/..."
                                    value={formData.link_tanda_terima || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, link_tanda_terima: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Link Dokumen Pendukung (Opsional)</Label>
                                <Input
                                    placeholder="https://drive.google.com/..."
                                    value={formData.link_dokumen_pendukung || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, link_dokumen_pendukung: e.target.value }))}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/lhkpn">
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
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
