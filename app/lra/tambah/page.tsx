'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createLra, type LraReport } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function TambahLra() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<LraReport>({
        tahun: new Date().getFullYear(),
        jenis_dipa: '',
        periode: '',
        judul: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.jenis_dipa) {
            toast({ variant: "destructive", title: "Validasi", description: "Jenis DIPA wajib dipilih." });
            return;
        }
        if (!formData.periode) {
            toast({ variant: "destructive", title: "Validasi", description: "Periode wajib dipilih." });
            return;
        }
        if (!file) {
            toast({ variant: "destructive", title: "Validasi", description: "File PDF wajib diupload." });
            return;
        }

        setLoading(true);

        try {
            const dataToSend = new FormData();
            dataToSend.append('tahun', String(formData.tahun));
            dataToSend.append('jenis_dipa', formData.jenis_dipa);
            dataToSend.append('periode', formData.periode);
            dataToSend.append('judul', formData.judul);
            dataToSend.append('file_upload', file);

            if (cover) {
                dataToSend.append('cover_upload', cover);
            }

            const result = await createLra(dataToSend);

            if (result.success) {
                toast({ title: "Sukses", description: "Data berhasil disimpan!" });
                setTimeout(() => router.push('/lra'), 1500);
            } else {
                toast({
                    variant: "destructive",
                    title: "Gagal",
                    description: result.message || 'Gagal menyimpan data.',
                });
            }
        } catch {
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
                <Link href="/lra">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Tambah Data</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Formulir LRA</CardTitle>
                    <CardDescription>Isi detail laporan realisasi anggaran per periode.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tahun">Tahun *</Label>
                                <Select
                                    value={formData.tahun.toString()}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, tahun: parseInt(val) }))}
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
                                <Label htmlFor="jenis_dipa">Jenis DIPA *</Label>
                                <Select
                                    value={formData.jenis_dipa}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, jenis_dipa: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih DIPA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DIPA 01">DIPA 01</SelectItem>
                                        <SelectItem value="DIPA 04">DIPA 04</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="periode">Periode *</Label>
                                <Select
                                    value={formData.periode}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, periode: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semester_1">Semester 1</SelectItem>
                                        <SelectItem value="semester_2">Semester 2</SelectItem>
                                        <SelectItem value="unaudited">Unaudited</SelectItem>
                                        <SelectItem value="audited">Audited</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="judul">Judul *</Label>
                            <Input
                                id="judul"
                                name="judul"
                                value={formData.judul}
                                onChange={handleChange}
                                placeholder="Contoh: LRA Semester 1 DIPA 01 Tahun 2025"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file_upload">File PDF *</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="file_upload"
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                                    }}
                                    accept=".pdf"
                                    className="cursor-pointer"
                                    required
                                />
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">File akan diupload ke Google Drive. Format: PDF. Max 5MB.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cover_upload">Cover Image (Opsional)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="cover_upload"
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) setCover(e.target.files[0]);
                                    }}
                                    accept=".jpg,.jpeg,.png,.webp"
                                    className="cursor-pointer"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">Gambar cover untuk tampilan publik. Format: JPG, PNG, WebP. Max 2MB.</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700" disabled={loading}>
                                {loading ? (
                                    <>Menyimpan...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Simpan Data</>
                                )}
                            </Button>
                            <Link href="/lra">
                                <Button variant="secondary" type="button" className="w-full md:w-auto">Batal</Button>
                            </Link>
                        </div>

                    </form>
                </CardContent>
            </Card>

        </div>
    );
}
