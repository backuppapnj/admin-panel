'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLhkpn, updateLhkpn, type LhkpnReport } from '@/lib/api';
import pegawaiData from '@/app/data/pegawai.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, FileText } from 'lucide-react';
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
    const [files, setFiles] = useState<Record<string, File | null>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getLhkpn(id);
                if (data) setFormData(data);
                else router.push('/lhkpn');
            } catch (e) { toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" }); }
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
            Object.entries(files).forEach(([key, file]) => {
                if (file) dataToSend.append(key, file);
            });

            const result = await updateLhkpn(id, dataToSend);
            if (result.success) {
                toast({ title: "Sukses", description: "Data berhasil diperbarui!" });
                router.push('/lhkpn');
            }
        } catch (e) { toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan" }); }
        setLoading(false);
    };

    if (fetching) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/lhkpn"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Laporan</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader><CardTitle>Edit LHKPN / SPT</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Pegawai</Label>
                                <Select value={pegawaiData.find(p => p.nip === formData.nip)?.id.toString()} onValueChange={(v) => {
                                    const p = pegawaiData.find(x => x.id.toString() === v);
                                    if (p) setFormData(prev => ({ ...prev, nip: p.nip, nama: p.nama, jabatan: p.jabatan }));
                                }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                            <SelectItem value="LHKPN">LHKPN</SelectItem>
                                            <SelectItem value="SPT Tahunan">SPT Tahunan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                {[
                                    { label: 'Tanda Terima', file: 'file_tanda_terima', link: 'link_tanda_terima' },
                                    { label: 'Pengumuman', file: 'file_pengumuman', link: 'link_pengumuman' },
                                    { label: 'SPT', file: 'file_spt', link: 'link_spt' },
                                    { label: 'Lainnya', file: 'file_dokumen_pendukung', link: 'link_dokumen_pendukung' },
                                ].map(item => (
                                    <div key={item.file} className="space-y-2">
                                        <Label>{item.label} {formData[item.link as keyof LhkpnReport] && <span className="text-[10px] text-emerald-600">(Sudah ada)</span>}</Label>
                                        <Input type="file" onChange={e => setFiles(prev => ({ ...prev, [item.file]: e.target.files?.[0] || null }))} />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Link href="/lhkpn"><Button type="button" variant="outline">Batal</Button></Link>
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