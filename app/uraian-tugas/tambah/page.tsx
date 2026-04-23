'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    createUraianTugas,
    getAllKelompokJabatan,
    type UraianTugas,
    type KelompokJabatan,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlurFade } from '@/components/ui/blur-fade';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';

export default function TambahUraianTugas() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [kelompokList, setKelompokList] = useState<KelompokJabatan[]>([]);

    const [formData, setFormData] = useState<Partial<UraianTugas>>({
        urutan: 0,
    });

    useEffect(() => {
        getAllKelompokJabatan().then(res => {
            if (res.success) setKelompokList(res.data || []);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.jabatan?.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Jabatan wajib diisi.' });
            return;
        }
        if (!formData.kelompok_jabatan_id) {
            toast({ variant: 'destructive', title: 'Error', description: 'Kelompok jabatan wajib dipilih.' });
            return;
        }

        setLoading(true);
        try {
            const result = await createUraianTugas(formData);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil disimpan!' });
                router.push('/uraian-tugas');
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan.' });
        }
        setLoading(false);
    };

    const set = (key: keyof UraianTugas, value: string | number | undefined) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/uraian-tugas">
                        <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Tambah Pegawai</h2>
                        <p className="text-muted-foreground">Tambah data pegawai dan uraian tugasnya.</p>
                    </div>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Formulir Uraian Tugas</CardTitle>
                            <CardDescription>Field bertanda * wajib diisi.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Jabatan */}
                            <div className="space-y-2">
                                <Label>Jabatan <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Contoh: Ketua, Hakim, Panitera..."
                                    value={formData.jabatan || ''}
                                    onChange={e => set('jabatan', e.target.value)}
                                />
                            </div>

                            {/* Kelompok Jabatan */}
                            <div className="space-y-2">
                                <Label>Kelompok Jabatan <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.kelompok_jabatan_id ? String(formData.kelompok_jabatan_id) : ''}
                                    onValueChange={val => set('kelompok_jabatan_id', parseInt(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kelompok..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kelompokList.map(k => (
                                            <SelectItem key={k.id} value={String(k.id)}>{k.nama_kelompok}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Nama */}
                            <div className="space-y-2">
                                <Label>Nama Pegawai <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                <Input
                                    placeholder="Nama lengkap pegawai..."
                                    value={formData.nama || ''}
                                    onChange={e => set('nama', e.target.value)}
                                />
                            </div>

                            {/* NIP & Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>NIP <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                    <Input
                                        placeholder="Nomor Induk Pegawai..."
                                        value={formData.nip || ''}
                                        onChange={e => set('nip', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status Kepegawaian</Label>
                                    <Select
                                        value={formData.status_kepegawaian || ''}
                                        onValueChange={val => set('status_kepegawaian', val as 'PNS' | 'PPNPN' | 'CASN')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PNS">PNS</SelectItem>
                                            <SelectItem value="PPNPN">PPNPN</SelectItem>
                                            <SelectItem value="CASN">CASN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* URL Foto */}
                            <div className="space-y-2">
                                <Label>URL Foto <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                <Input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.foto_url || ''}
                                    onChange={e => set('foto_url', e.target.value)}
                                />
                            </div>

                            {/* Link Dokumen */}
                            <div className="space-y-2">
                                <Label>Link Dokumen Uraian Tugas <span className="text-muted-foreground text-xs">(Google Drive URL)</span></Label>
                                <Input
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.link_dokumen || ''}
                                    onChange={e => set('link_dokumen', e.target.value)}
                                />
                            </div>

                            {/* Urutan */}
                            <div className="space-y-2">
                                <Label>Urutan Tampil</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={formData.urutan ?? 0}
                                    onChange={e => set('urutan', parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan
                                </Button>
                                <Link href="/uraian-tugas">
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </BlurFade>
        </div>
    );
}
