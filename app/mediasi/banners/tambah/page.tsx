'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMediatorBanner } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlurFade } from '@/components/ui/blur-fade';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Save, RefreshCw, ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AddMediatorBanner() {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'hakim' | 'non-hakim'>('hakim');
    const router = useRouter();
    const { toast } = useToast();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('type', type);

        try {
            const result = await createMediatorBanner(formData);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Banner mediator berhasil ditambahkan!' });
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

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
                    <Link href="/mediasi">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Tambah Banner Mediator</h2>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <form onSubmit={onSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Detail Banner</CardTitle>
                            <CardDescription>Upload gambar banner untuk kategori Hakim atau Non-Hakim.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="judul">Label Banner (Judul Alt)</Label>
                                <Input type="text" id="judul" name="judul" placeholder="Contoh: Banner Mediator Hakim PA-Pnj" required />
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
                                <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                                    <ImageIcon className="h-4 w-4" /> Image Source
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image_file">Upload Gambar</Label>
                                    <Input type="file" id="image_file" name="image_file" accept="image/*" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image_url">Atau Link Image URL</Label>
                                    <Input type="text" id="image_url" name="image_url" placeholder="https://example.com/image.jpg" />
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
