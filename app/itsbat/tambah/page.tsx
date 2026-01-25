'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createItsbat, type ItsbatNikah } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function TambahItsbat() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<ItsbatNikah>({
        tahun_perkara: new Date().getFullYear(),
        nomor_perkara: '',
        pemohon_1: '',
        pemohon_2: '',
        tanggal_pengumuman: '',
        tanggal_sidang: '',
        link_detail: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleYearChange = (value: string) => {
        setFormData(prev => ({ ...prev, tahun_perkara: parseInt(value) }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = new FormData();
            dataToSend.append('tahun_perkara', String(formData.tahun_perkara));
            dataToSend.append('nomor_perkara', formData.nomor_perkara);
            dataToSend.append('pemohon_1', formData.pemohon_1);
            dataToSend.append('pemohon_2', formData.pemohon_2);
            dataToSend.append('tanggal_pengumuman', formData.tanggal_pengumuman || '');
            dataToSend.append('tanggal_sidang', formData.tanggal_sidang || '');

            if (file) {
                dataToSend.append('file_upload', file);
            }

            const result = await createItsbat(dataToSend);

            if (result.success) {
                toast({
                    title: "Sukses",
                    description: "Data berhasil disimpan!",
                });
                setTimeout(() => router.push('/itsbat'), 1500);
            } else {
                toast({
                    variant: "destructive",
                    title: "Gagal",
                    description: result.message || 'Gagal menyimpan data.',
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Terjadi kesalahan. Pastikan API terhubung.",
            });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            <div className="flex items-center gap-4">
                <Link href="/itsbat">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Tambah Data</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Formulir Itsbat Nikah</CardTitle>
                    <CardDescription>Isi detail perkara dan informasi para pemohon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Informasi Perkara */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tahun_perkara">Tahun Perkara *</Label>
                                <Select
                                    value={formData.tahun_perkara.toString()}
                                    onValueChange={handleYearChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getYearOptions().map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomor_perkara">Nomor Perkara *</Label>
                                <Input
                                    id="nomor_perkara"
                                    name="nomor_perkara"
                                    value={formData.nomor_perkara}
                                    onChange={handleChange}
                                    placeholder="Contoh: 123/Pdt.P/2025/PA.Pnj"
                                    required
                                />
                            </div>
                        </div>

                        {/* Identitas Pemohon */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pemohon_1">Pemohon I (Suami) *</Label>
                                <Input
                                    id="pemohon_1"
                                    name="pemohon_1"
                                    value={formData.pemohon_1}
                                    onChange={handleChange}
                                    placeholder="Nama Lengkap Suami"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pemohon_2">Pemohon II (Istri) *</Label>
                                <Input
                                    id="pemohon_2"
                                    name="pemohon_2"
                                    value={formData.pemohon_2}
                                    onChange={handleChange}
                                    placeholder="Nama Lengkap Istri"
                                    required
                                />
                            </div>
                        </div>

                        {/* Jadwal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tanggal_pengumuman">Tanggal Pengumuman</Label>
                                <Input
                                    type="date"
                                    id="tanggal_pengumuman"
                                    name="tanggal_pengumuman"
                                    value={formData.tanggal_pengumuman || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tanggal_sidang">Tanggal Sidang *</Label>
                                <Input
                                    type="date"
                                    id="tanggal_sidang"
                                    name="tanggal_sidang"
                                    value={formData.tanggal_sidang || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Dokumen */}
                        <div className="space-y-2">
                            <Label htmlFor="file_upload">Upload File (PDF/Gambar) - Optional</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="file_upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="cursor-pointer"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">File akan diupload ke Google Drive. Format: PDF, DOC, Gambar. Max 5MB.</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700" disabled={loading}>
                                {loading ? (
                                    <>Menyimpan...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Simpan Data</>
                                )}
                            </Button>
                            <Link href="/itsbat">
                                <Button variant="secondary" type="button" className="w-full md:w-auto">Batal</Button>
                            </Link>
                        </div>

                    </form>
                </CardContent>
            </Card>

        </div>
    );
}
