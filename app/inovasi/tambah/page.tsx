'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInovasi, KATEGORI_INOVASI, type Inovasi } from '@/lib/api';
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

function InovasiForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Inovasi>>({
        urutan: 0,
    });

    const [fileDokumen, setFileDokumen] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama_inovasi || !formData.kategori || !formData.deskripsi) {
            toast({ title: 'Error', description: 'Nama Inovasi, Kategori, dan Deskripsi wajib diisi.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== null && val !== undefined) dataToSend.append(key, String(val));
            });
            if (fileDokumen) dataToSend.append('file_dokumen', fileDokumen);

            const result = await createInovasi(dataToSend);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil disimpan!' });
                router.push('/inovasi');
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan.' });
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Formulir Inovasi</CardTitle>
                <CardDescription>
                    Tambahkan data inovasi layanan pengadilan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>Nama Inovasi <span className='text-red-500'>*</span></Label>
                        <Input
                            value={formData.nama_inovasi || ''}
                            onChange={e => setFormData(prev => ({ ...prev, nama_inovasi: e.target.value }))}
                            placeholder='Masukkan nama inovasi...'
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>Kategori <span className='text-red-500'>*</span></Label>
                            <Select
                                value={formData.kategori || ''}
                                onValueChange={v => setFormData(prev => ({ ...prev, kategori: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Pilih Kategori' />
                                </SelectTrigger>
                                <SelectContent>
                                    {KATEGORI_INOVASI.map(k => (
                                        <SelectItem key={k} value={k}>{k}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Urutan</Label>
                            <Input
                                type='number'
                                value={formData.urutan || 0}
                                onChange={e => setFormData(prev => ({ ...prev, urutan: parseInt(e.target.value) || 0 }))}
                                placeholder='Urutan tampilan'
                            />
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label>Deskripsi <span className='text-red-500'>*</span></Label>
                        <Textarea
                            value={formData.deskripsi || ''}
                            onChange={e => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                            placeholder='Masukkan deskripsi inovasi...'
                            rows={4}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>Link Dokumen (URL)</Label>
                        <Input
                            value={formData.link_dokumen || ''}
                            onChange={e => setFormData(prev => ({ ...prev, link_dokumen: e.target.value }))}
                            placeholder='https://example.com/dokumen.pdf'
                        />
                        <p className='text-xs text-muted-foreground'>
                            Masukkan URL dokumen atau unggah file di bawah.
                        </p>
                    </div>

                    <div className='space-y-2'>
                        <Label>File Dokumen</Label>
                        <Input
                            type='file'
                            onChange={e => setFileDokumen(e.target.files?.[0] || null)}
                            accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                        />
                        <p className='text-xs text-muted-foreground'>
                            Format: PDF, DOC, DOCX, JPG, JPEG, PNG. Maks 20MB.
                        </p>
                        {fileDokumen && (
                            <p className='text-xs text-amber-600 font-medium'>
                                File dipilih: {fileDokumen.name}
                            </p>
                        )}
                    </div>

                    <div className='pt-4 flex justify-end gap-2'>
                        <Link href='/inovasi'><Button type='button' variant='outline'>Batal</Button></Link>
                        <Button type='submit' className='bg-amber-600 hover:bg-amber-700' disabled={loading}>
                            {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                            Simpan
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function InovasiTambah() {
    return (
        <div className='max-w-2xl mx-auto space-y-6'>
            <BlurFade delay={0.1} inView>
                <div className='flex items-center gap-4'>
                    <Link href='/inovasi'><Button variant='outline' size='icon'><ArrowLeft className='h-4 w-4' /></Button></Link>
                    <h2 className='text-2xl font-bold tracking-tight'>Tambah Inovasi</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Suspense fallback={
                    <Card>
                        <CardContent className='flex justify-center items-center h-48'>
                            <Loader2 className='h-8 w-8 animate-spin text-amber-600' />
                        </CardContent>
                    </Card>
                }>
                    <InovasiForm />
                </Suspense>
            </BlurFade>
        </div>
    );
}
