'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMediatorBanner, updateMediatorBanner, type MediatorBanner } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlurFade } from '@/components/ui/blur-fade';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Save, RefreshCw, ImageIcon, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditMediatorBanner() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [data, setData] = useState<MediatorBanner | null>(null);
    const [type, setType] = useState<'hakim' | 'non-hakim'>('hakim');
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getMediatorBanner(id);
                if (result) {
                    setData(result);
                    setType(result.type);
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
        formData.append('type', type);

        try {
            const result = await updateMediatorBanner(id, formData);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Banner mediator berhasil diperbarui!' });
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
                    <h2 className="text-3xl font-bold tracking-tight">Edit Banner Mediator</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <form onSubmit={onSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Edit Banner</CardTitle>
                            <CardDescription>Perbarui gambar atau label banner mediator.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="judul">Label Banner (Judul Alt)</Label>
                                <Input type="text" id="judul" name="judul" defaultValue={data?.judul} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type-select">Kategori Mediator</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger id="type-select">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hakim">Mediator Hakim</SelectItem>
                                        <SelectItem value="non-hakim">Mediator Non-Hakim</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 p-4 border rounded-lg bg-slate-50/50 mt-6">
                                <div className="flex items-center justify-between text-indigo-700 font-semibold">
                                    <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image Source</div>
                                    {data?.image_url && (
                                        <a href={data.image_url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:underline">
                                            <ExternalLink className="h-3 w-3" /> View Current
                                        </a>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image_file">Ganti Gambar</Label>
                                    <Input type="file" id="image_file" name="image_file" accept="image/*" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image_url">Ganti Link Image URL</Label>
                                    <Input type="text" id="image_url" name="image_url" placeholder="https://example.com/image.jpg" defaultValue={data?.image_url} />
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
