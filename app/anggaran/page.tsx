'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllAnggaran, deleteAnggaran, type RealisasiAnggaran } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, RefreshCw, Trash2, Edit, FileText } from 'lucide-react';
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";

const NAMA_BULAN = ["Summary", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function AnggaranList() {
    const [data, setData] = useState<RealisasiAnggaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>(new Date().getFullYear().toString());
    const [filterDipa, setFilterDipa] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { toast } = useToast();

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    const loadData = async (page = 1) => {
        setLoading(true);
        try {
            const year = (filterTahun && filterTahun !== "all") ? parseInt(filterTahun) : undefined;
            const dipa = (filterDipa && filterDipa !== "all") ? filterDipa : undefined;
            
            const result = await getAllAnggaran(year, dipa, undefined, page);
            
            if (result.success && result.data) {
                setData(result.data);
                setPagination({
                    current_page: result.current_page || 1,
                    last_page: result.last_page || 1,
                    total: result.total || 0
                });
            } else {
                setData([]);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Gagal memuat data. Pastikan API terhubung.",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData(1);
    }, [filterTahun, filterDipa]);

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteAnggaran(deleteId);
            toast({
                title: "Sukses",
                description: "Data berhasil dihapus!",
            });
            setDeleteId(null);
            loadData(pagination.current_page);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Terjadi kesalahan saat menghapus data.",
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Generate pagination items
    const renderPaginationItems = () => {
        const { current_page, last_page } = pagination;
        const items = [];
        const delta = 2;

        for (let i = 1; i <= last_page; i++) {
            if (
                i === 1 ||
                i === last_page ||
                (i >= current_page - delta && i <= current_page + delta)
            ) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={current_page === i}
                            onClick={() => loadData(i)}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            } else if (
                items.length > 0 &&
                (items[items.length - 1] as any)?.key &&
                !String((items[items.length - 1] as any).key).startsWith('ellipsis')
            ) {
                items.push(<PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>);
            }
        }
        return items;
    };

    return (
        <div className="space-y-6">

            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Realisasi Anggaran</h2>
                        <p className="text-muted-foreground">Kelola data realisasi anggaran DIPA 01 dan DIPA 04.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/anggaran/pagu">
                            <Button variant="outline" className="border-slate-300 shadow-sm">
                                <PlusCircle className="mr-2 h-4 w-4" /> Atur Pagu
                            </Button>
                        </Link>
                        <Link href="/anggaran/tambah">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Input Realisasi
                            </Button>
                        </Link>
                    </div>
                </div>
            </BlurFade>

            <BlurFade delay={0.3} inView>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-lg font-medium">Daftar Anggaran</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={filterDipa} onValueChange={setFilterDipa}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Semua DIPA" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua DIPA</SelectItem>
                                    <SelectItem value="DIPA 01">DIPA 01</SelectItem>
                                    <SelectItem value="DIPA 04">DIPA 04</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getYearOptions().map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" onClick={() => loadData(pagination.current_page)}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="w-[50px] text-center">No</TableHead>
                                        <TableHead>DIPA</TableHead>
                                        <TableHead>Bulan</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Pagu</TableHead>
                                        <TableHead className="text-right">Realisasi</TableHead>
                                        <TableHead className="text-center">%</TableHead>
                                        <TableHead className="text-center">Doc</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={9}><Skeleton className="h-12 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center">
                                                Tidak ada data ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center">
                                                    {(pagination.current_page - 1) * 15 + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="whitespace-nowrap">{item.dipa}</Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {NAMA_BULAN[item.bulan || 0]}
                                                </TableCell>
                                                <TableCell>{item.kategori}</TableCell>
                                                <TableCell className="text-right text-xs font-mono">{formatCurrency(item.pagu)}</TableCell>
                                                <TableCell className="text-right text-emerald-600 font-medium font-mono">
                                                    {formatCurrency(item.realisasi)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-xs font-bold">{item.persentase?.toFixed(1)}%</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.link_dokumen ? (
                                                        <a href={item.link_dokumen} target="_blank" rel="noopener noreferrer" title="Buka Dokumen">
                                                            <FileText className="h-4 w-4 mx-auto text-blue-600" />
                                                        </a>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/anggaran/${item.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => setDeleteId(item.id!)}
                                                        >
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

                        {/* Pagination Section */}
                        {!loading && pagination.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (pagination.current_page > 1) loadData(pagination.current_page - 1);
                                                }}
                                                className={pagination.current_page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (pagination.current_page < pagination.last_page) loadData(pagination.current_page + 1);
                                                }}
                                                className={pagination.current_page === pagination.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Menampilkan halaman {pagination.current_page} dari {pagination.last_page} (Total {pagination.total} data)
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </BlurFade>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data realisasi ini?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}