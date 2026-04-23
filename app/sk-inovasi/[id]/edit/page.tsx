'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSkInovasi, updateSkInovasi, type SkInovasi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';

export default function SkInovasiEdit() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState<Partial<SkInovasi>>({
        tahun: currentYear,
        is_active: true,
    });

    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            try {
                const result = await getSkInovasi(id);
                if (result) {
                    setFormData(result);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Data tidak ditemukan.' });
                    router.push('/sk-inovasi');
                }
            } catch {
                toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
                router.push('/sk-inovasi');
            }
            setFetching(false);
        };
        if (id) fetchData();
    }, [id, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tahun || !formData.nomor_sk || !formData.tentang) {
            toast({ title: 'Error', description: 'Tahun, Nomor SK, dan Tentang wajib diisi.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('tahun', String(formData.tahun));
            dataToSend.append('nomor_sk', formData.nomor_sk || '');
            dataToSend.append('tentang', formData.tentang || '');
            dataToSend.append('is_active', formData.is_active ? '1' : '0');

            if (formData.file_url) {
                dataToSend.append('file_url', formData.file_url);
            }

            if (file) {
                dataToSend.append('file', file);
            }

            const result = await updateSkInovasi(id, dataToSend);
            if (result.success) {
                toast({ title: 'Sukses', description: 'SK berhasil diupdate!' });
                router.push('/sk-inovasi');
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan.' });
        }
        setLoading(false);
    };

    if (fetching) {
        return (
            <div className='max-w-2xl mx-auto space-y-6'>
                <BlurFade delay={0.1} inView>
                    <div className='flex items-center gap-4'>
                        <Link href='/sk-inovasi'><Button variant='outline' size='icon'><ArrowLeft className='h-4 w-4' /></Button></Link>
                        <h2 className='text-2xl font-bold tracking-tight'>Edit SK Inovasi</h2>
                    </div>
                </BlurFade>
                <Card>
                    <CardContent className='flex justify-center items-center h-48'>
                        <Loader2 className='h-8 w-8 animate-spin text-amber-600' />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='max-w-2xl mx-auto space-y-6'>
            <BlurFade delay={0.1} inView>
                <div className='flex items-center gap-4'>
                    <Link href='/sk-inovasi'><Button variant='outline' size='icon'><ArrowLeft className='h-4 w-4' /></Button></Link>
                    <h2 className='text-2xl font-bold tracking-tight'>Edit SK Inovasi</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit SK Inovasi</CardTitle>
                        <CardDescription>
                            Ubah data Surat Keputusan penetapan inovasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>Tahun <span className='text-red-500'>*</span></Label>
                                    <Input
                                        type='number'
                                        value={formData.tahun || currentYear}
                                        onChange={e => setFormData(prev => ({ ...prev, tahun: parseInt(e.target.value) || currentYear }))}
                                        placeholder='2026'
                                        min={2000}
                                        max={2100}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.is_active ? 'true' : 'false'}
                                        onValueChange={v => setFormData(prev => ({ ...prev, is_active: v === 'true' }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Pilih Status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='true'>Aktif</SelectItem>
                                            <SelectItem value='false'>Nonaktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label>Nomor SK <span className='text-red-500'>*</span></Label>
                                <Input
                                    value={formData.nomor_sk || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, nomor_sk: e.target.value }))}
                                    placeholder='1297/KPA.W17-A8/OT1.6/XII/2025'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Tentang <span className='text-red-500'>*</span></Label>
                                <Textarea
                                    value={formData.tentang || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, tentang: e.target.value }))}
                                    placeholder='Penetapan Inovasi dan Aplikasi Tahun 2026 pada Pengadilan Agama Penajam'
                                    rows={3}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>URL Dokumen (Google Drive / External)</Label>
                                <Input
                                    value={formData.file_url || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                                    placeholder='https://drive.google.com/file/d/...'
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Masukkan URL dokumen dari Google Drive atau sumber lainnya.
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <Label>Upload File Baru (Opsional)</Label>
                                <Input
                                    type='file'
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    accept='.pdf,.doc,.docx'
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Format: PDF, DOC, DOCX. Maks 5MB. Upload file akan mengoverride URL jika diisi.
                                </p>
                                {formData.file_url && !file && (
                                    <p className='text-xs text-blue-600'>
                                        URL saat ini: {formData.file_url}
                                    </p>
                                )}
                                {file && (
                                    <p className='text-xs text-amber-600 font-medium'>
                                        File baru dipilih: {file.name}
                                    </p>
                                )}
                            </div>

                            <div className='pt-4 flex justify-end gap-2'>
                                <Link href='/sk-inovasi'><Button type='button' variant='outline'>Batal</Button></Link>
                                <Button type='submit' className='bg-amber-600 hover:bg-amber-700' disabled={loading}>
                                    {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                                    Update
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
