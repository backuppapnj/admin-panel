'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMediasiSk, updateMediasiSk, type MediasiSk } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlurFade } from '@/components/ui/blur-fade';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Save, RefreshCw, FileUp, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditMediasiSk() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [data, setData] = useState<MediasiSk | null>(null);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getMediasiSk(id);
                if (result) {
                    setData(result);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Data tidak ditemukan.' });
                    router.push('/mediasi');
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
            } finally {
                setFetching(false);
            }
        }
        fetchData();
    }, [id, router, toast]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateMediasiSk(id, formData);
            if (result.success) {
                toast({ title: 'Sukses', description: 'SK Mediasi berhasil diperbarui!' });
                router.push('/mediasi');
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan sistem.' });
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/mediasi">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Edit SK Mediasi</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <form onSubmit={onSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Edit SK — Tahun {data?.tahun}</CardTitle>
                            <CardDescription>Perbarui file atau link SK untuk tahun {data?.tahun}.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tahun">Tahun</Label>
                                <Input type="number" id="tahun" name="tahun" defaultValue={data?.tahun} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-3 p-4 border rounded-lg bg-slate-50/50">
                                    <div className="flex items-center justify-between text-indigo-700 font-semibold">
                                        <div className="flex items-center gap-2"><FileUp className="h-4 w-4" /> SK Hakim</div>
                                        {data?.link_sk_hakim && (
                                            <a href={data.link_sk_hakim} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:underline">
                                                <ExternalLink className="h-3 w-3" /> View Current
                                            </a>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="file_sk_hakim">Ganti File PDF</Label>
                                        <Input type="file" id="file_sk_hakim" name="file_sk_hakim" accept=".pdf" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="link_sk_hakim">Ganti Link Google Drive</Label>
                                        <Input type="text" id="link_sk_hakim" name="link_sk_hakim" placeholder="https://drive.google.com/..." defaultValue={data?.link_sk_hakim || ''} />
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 border rounded-lg bg-slate-50/50">
                                    <div className="flex items-center justify-between text-indigo-700 font-semibold">
                                        <div className="flex items-center gap-2"><FileUp className="h-4 w-4" /> SK Non-Hakim</div>
                                        {data?.link_sk_non_hakim && (
                                            <a href={data.link_sk_non_hakim} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:underline">
                                                <ExternalLink className="h-3 w-3" /> View Current
                                            </a>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="file_sk_non_hakim">Ganti File PDF</Label>
                                        <Input type="file" id="file_sk_non_hakim" name="file_sk_non_hakim" accept=".pdf" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="link_sk_non_hakim">Ganti Link Google Drive</Label>
                                        <Input type="text" id="link_sk_non_hakim" name="link_sk_non_hakim" placeholder="https://drive.google.com/..." defaultValue={data?.link_sk_non_hakim || ''} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3">
                                <Link href="/mediasi">
                                    <Button variant="ghost" type="button">Batal</Button>
                                </Link>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-[150px]" disabled={loading}>
                                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </BlurFade>
        </div>
    );
}
