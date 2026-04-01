'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getLra, updateLra, type LraReport } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Upload, FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function EditLra() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<LraReport>({
        tahun: new Date().getFullYear(),
        jenis_dipa: '',
        periode: '',
        judul: '',
    });

    const [file, setFile] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await getLra(id);
                if (result) {
                    setFormData({
                        ...result,
                        jenis_dipa: result.jenis_dipa || '',
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Gagal",
                        description: "Data tidak ditemukan.",
                    });
                    router.push('/lra');
                }
            } catch {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Gagal memuat data.",
                });
            }
            setLoading(false);
        };

        if (id) loadData();
    }, [id, router, toast]);

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

        setSaving(true);

        try {
            const dataToSend = new FormData();
            dataToSend.append('tahun', String(formData.tahun));
            dataToSend.append('jenis_dipa', formData.jenis_dipa);
            dataToSend.append('periode', formData.periode);
            dataToSend.append('judul', formData.judul);

            if (file) {
                dataToSend.append('file_upload', file);
            }
            if (cover) {
                dataToSend.append('cover_upload', cover);
            }

            const result = await updateLra(id, dataToSend);

            if (result.success) {
                toast({ title: "Sukses", description: "Data berhasil diupdate!" });
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
                description: "Terjadi kesalahan.",
            });
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 p-6">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            <div className="flex items-center gap-4">
                <Link href="/lra">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Data</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit LRA</CardTitle>
                    <CardDescription>Perbarui data laporan realisasi anggaran.</CardDescription>
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
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file_upload">File PDF</Label>

                            {formData.file_url && (
                                <div className="mb-2">
                                    <a
                                        href={formData.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <FileText className="h-4 w-4" /> Lihat File Saat Ini <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Input
                                    id="file_upload"
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                                    }}
                                    accept=".pdf"
                                    className="cursor-pointer"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">Upload file baru untuk mengganti file lama. Max 5MB.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cover_upload">Cover Image</Label>

                            {formData.cover_url && (
                                <div className="mb-2">
                                    <a
                                        href={formData.cover_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src={formData.cover_url}
                                            alt="Cover saat ini"
                                            className="h-20 w-20 object-cover rounded border"
                                        />
                                        <span className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                            <ImageIcon className="h-4 w-4" /> Lihat Cover <ExternalLink className="h-3 w-3" />
                                        </span>
                                    </a>
                                </div>
                            )}

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
                            <p className="text-xs text-muted-foreground">Upload cover baru untuk mengganti cover lama. Max 2MB.</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700" disabled={saving}>
                                {saving ? (
                                    <>Menyimpan...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Update Data</>
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
