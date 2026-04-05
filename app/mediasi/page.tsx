'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    getAllMediasiSk, 
    deleteMediasiSk, 
    getAllMediatorBanners, 
    deleteMediatorBanner,
    type MediasiSk,
    type MediatorBanner
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    PlusCircle, 
    RefreshCw, 
    Trash2, 
    Edit, 
    ExternalLink, 
    FileText, 
    Image as ImageIcon,
    LayoutGrid,
    Users
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MediasiPage() {
    const [skData, setSkData] = useState<MediasiSk[]>([]);
    const [bannerData, setBannerData] = useState<MediatorBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteSkId, setDeleteSkId] = useState<number | null>(null);
    const [deleteBannerId, setDeleteBannerId] = useState<number | null>(null);
    const { toast } = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            const [skResult, bannerResult] = await Promise.all([
                getAllMediasiSk(),
                getAllMediatorBanners()
            ]);

            if (skResult.success) setSkData(skResult.data || []);
            if (bannerResult.success) setBannerData(bannerResult.data || []);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal memuat data mediasi.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeleteSk = async () => {
        if (!deleteSkId) return;
        try {
            const result = await deleteMediasiSk(deleteSkId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'SK berhasil dihapus!' });
                loadData();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal menghapus SK.' });
        }
        setDeleteSkId(null);
    };

    const handleDeleteBanner = async () => {
        if (!deleteBannerId) return;
        try {
            const result = await deleteMediatorBanner(deleteBannerId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Banner berhasil dihapus!' });
                loadData();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal menghapus banner.' });
        }
        setDeleteBannerId(null);
    };

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Modul Mediasi</h2>
                        <p className="text-muted-foreground">Kelola SK Mediator Tahunan dan Banner Mediator.</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </BlurFade>

            <Tabs defaultValue="sk" className="w-full">
                <BlurFade delay={0.2} inView>
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                        <TabsTrigger value="sk" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" /> SK Tahunan
                        </TabsTrigger>
                        <TabsTrigger value="banner" className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Banner Mediator
                        </TabsTrigger>
                    </TabsList>
                </BlurFade>

                <TabsContent value="sk">
                    <BlurFade delay={0.3} inView>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Arsip SK Mediasi</CardTitle>
                                    <CardDescription>Daftar SK Hakim & Non-Hakim per tahun.</CardDescription>
                                </div>
                                <Link href="/mediasi/sk/tambah">
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah SK
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Tahun</TableHead>
                                                <TableHead>SK Hakim</TableHead>
                                                <TableHead>SK Non-Hakim</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                Array.from({ length: 3 }).map((_, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell>
                                                    </TableRow>
                                                ))
                                            ) : skData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                        Belum ada data SK.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                skData.map((sk) => (
                                                    <TableRow key={sk.id}>
                                                        <TableCell><Badge variant="outline" className="text-lg">{sk.tahun}</Badge></TableCell>
                                                        <TableCell>
                                                            {sk.link_sk_hakim ? (
                                                                <a href={sk.link_sk_hakim} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                                                                    <ExternalLink className="h-3 w-3" /> SK Hakim
                                                                </a>
                                                            ) : <span className="text-xs text-muted-foreground italic">Kosong</span>}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sk.link_sk_non_hakim ? (
                                                                <a href={sk.link_sk_non_hakim} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                                                                    <ExternalLink className="h-3 w-3" /> SK Non-Hakim
                                                                </a>
                                                            ) : <span className="text-xs text-muted-foreground italic">Kosong</span>}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/mediasi/sk/${sk.id}/edit`}>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => setDeleteSkId(sk.id!)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </BlurFade>
                </TabsContent>

                <TabsContent value="banner">
                    <BlurFade delay={0.3} inView>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Banner Mediator</CardTitle>
                                    <CardDescription>Kelola banner yang tampil di bagian atas halaman mediasi.</CardDescription>
                                </div>
                                <Link href="/mediasi/banners/tambah">
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Banner
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
                                    ) : bannerData.length === 0 ? (
                                        <div className="col-span-full h-32 flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground">
                                            Belum ada banner mediator.
                                        </div>
                                    ) : (
                                        bannerData.map((banner) => (
                                            <div key={banner.id} className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                                                <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                                                    <img 
                                                        src={banner.image_url} 
                                                        alt={banner.judul} 
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-semibold leading-none tracking-tight">{banner.judul}</h3>
                                                        <Badge variant={banner.type === 'hakim' ? 'default' : 'secondary'}>
                                                            {banner.type === 'hakim' ? 'Hakim' : 'Non-Hakim'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                                        <Link href={`/mediasi/banners/${banner.id}/edit`}>
                                                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                                                <Edit className="h-3 w-3" /> Edit
                                                            </Button>
                                                        </Link>
                                                        <Button variant="outline" size="sm" className="h-8 gap-1 text-red-600 hover:bg-red-50" onClick={() => setDeleteBannerId(banner.id!)}>
                                                            <Trash2 className="h-3 w-3" /> Hapus
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </BlurFade>
                </TabsContent>
            </Tabs>

            {/* Alert Conflict SK */}
            <AlertDialog open={!!deleteSkId} onOpenChange={() => setDeleteSkId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus SK?</AlertDialogTitle>
                        <AlertDialogDescription>Data SK tahun ini akan dihapus permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSk} className="bg-red-600">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Alert Conflict Banner */}
            <AlertDialog open={!!deleteBannerId} onOpenChange={() => setDeleteBannerId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
                        <AlertDialogDescription>Gambar banner mediator akan dihapus permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBanner} className="bg-red-600">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
