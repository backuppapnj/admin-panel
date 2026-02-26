'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllAsetBmn, deleteAsetBmn, type AsetBmn } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, RefreshCw, Trash2, Edit, ExternalLink } from 'lucide-react';
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";

const SECTIONS: { title: string; prefix: string }[] = [
    { title: 'Laporan Posisi BMN Di Neraca', prefix: 'Laporan Posisi BMN Di Neraca' },
    { title: 'Laporan Barang Kuasa Pengguna (Persediaan)', prefix: 'Laporan Barang Kuasa Pengguna' },
    { title: 'Laporan Kondisi Barang', prefix: 'Laporan Kondisi Barang' },
];

export default function AsetBmnList() {
    const [data, setData] = useState<AsetBmn[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>(String(new Date().getFullYear()));
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { toast } = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            const year = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
            const result = await getAllAsetBmn(year);
            setData(result.success && result.data ? result.data : []);
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Gagal memuat data. Pastikan API terhubung.",
            });
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [filterTahun]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteAsetBmn(deleteId);
            toast({ title: "Sukses", description: "Data berhasil dihapus!" });
            setDeleteId(null);
            loadData();
        } catch {
            toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menghapus data." });
        }
    };

    const sectionData = (prefix: string) =>
        data.filter(d => d.jenis_laporan.startsWith(prefix));

    const yearOptions = getYearOptions(2018);

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Aset & Inventaris BMN</h2>
                        <p className="text-muted-foreground">Daftar Barang Milik Negara Pengadilan Agama Penajam</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={loadData}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Link href="/aset-bmn/tambah">
                            <Button className="bg-teal-600 hover:bg-teal-700">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Dokumen
                            </Button>
                        </Link>
                    </div>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className="text-base">Filter Tahun</CardTitle>
                        <div className="w-40">
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tahun..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                    {yearOptions.map(y => (
                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                </Card>
            </BlurFade>

            {loading ? (
                <Card>
                    <CardContent className="p-6 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </CardContent>
                </Card>
            ) : (
                SECTIONS.map((section, si) => {
                    const rows = sectionData(section.prefix);
                    return (
                        <BlurFade key={section.prefix} delay={0.2 + si * 0.05} inView>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-teal-700">{section.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Jenis Laporan</TableHead>
                                                <TableHead>Tahun</TableHead>
                                                <TableHead className="text-center">Link Dokumen</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                        Belum ada dokumen untuk kategori ini
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                rows.map(item => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium text-sm">{item.jenis_laporan}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{item.tahun}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.link_dokumen ? (
                                                                <a
                                                                    href={item.link_dokumen}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-teal-600 hover:underline text-sm"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                    Lihat
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs italic">Belum tersedia</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/aset-bmn/${item.id}/edit`}>
                                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                                        <Edit className="h-3 w-3" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => setDeleteId(item.id!)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </BlurFade>
                    );
                })
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Dokumen BMN?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data dokumen akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
