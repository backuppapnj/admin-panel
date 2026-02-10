'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLhkpn, type LhkpnReport } from '@/lib/api';
import pegawaiData from '@/app/data/pegawai.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
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

    const [files, setFiles] = useState<Record<string, File | null>>({});

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
        if (!formData.nip) {
            toast({ title: "Error", description: "Pilih pegawai", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.entries(formData).forEach(([key, val]) => dataToSend.append(key, String(val)));
            Object.entries(files).forEach(([key, file]) => { if (file) dataToSend.append(key, file); });

            const result = await createLhkpn(dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Laporan berhasil disimpan!" });
                router.push('/lhkpn');
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
                    <Link href="/lhkpn"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Input Laporan Baru</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Pelaporan</CardTitle>
                        <CardDescription>Pilih jenis laporan sesuai jabatan (LHKPN untuk Pejabat, SPT Tahunan untuk Pegawai).</CardDescription>
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
                                    <Input type="number" value={formData.tahun} onChange={e => setFormData(prev => ({ ...prev, tahun: parseInt(e.target.value) }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jenis Laporan</Label>
                                    <Select value={formData.jenis_laporan} onValueChange={(val: any) => setFormData(prev => ({ ...prev, jenis_laporan: val }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LHKPN">LHKPN (Penyelenggara Negara)</SelectItem>
                                            <SelectItem value="SPT Tahunan">SPT Tahunan (Pegawai ASN)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tanggal Lapor</Label>
                                <Input type="date" value={formData.tanggal_lapor} onChange={e => setFormData(prev => ({ ...prev, tanggal_lapor: e.target.value }))} />
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <Label className="text-blue-700 font-bold flex items-center gap-2">
                                    <Info className="h-4 w-4" /> Dokumen Bukti
                                </Label>
                                
                                {formData.jenis_laporan === 'LHKPN' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                        <div className="space-y-2">
                                            <Label>File Tanda Terima LHKPN</Label>
                                            <Input type="file" onChange={e => setFiles(prev => ({ ...prev, file_tanda_terima: e.target.files?.[0] || null }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>File Pengumuman LHKPN</Label>
                                            <Input type="file" onChange={e => setFiles(prev => ({ ...prev, file_pengumuman: e.target.files?.[0] || null }))} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>File SPT Tahunan (Bukti Pajak)</Label>
                                            <Input type="file" onChange={e => setFiles(prev => ({ ...prev, file_spt: e.target.files?.[0] || null }))} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                                        <div className="space-y-2">
                                            <Label>File Bukti Pelaporan (SPT Tahunan)</Label>
                                            <Input type="file" onChange={e => setFiles(prev => ({ ...prev, file_spt: e.target.files?.[0] || null }))} />
                                            <p className="text-[10px] text-emerald-700 font-medium italic">* Bagi ASN, laporan SPT Tahunan merupakan pemenuhan kewajiban pelaporan.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/lhkpn"><Button type="button" variant="outline">Batal</Button></Link>
                                <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Laporan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
