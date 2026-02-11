'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllLhkpn, deleteLhkpn, type LhkpnReport } from '@/lib/api';
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
import { PlusCircle, RefreshCw, Trash2, Edit, ExternalLink, FileText, Search } from 'lucide-react';
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';

export default function LhkpnList() {
    const [data, setData] = useState<LhkpnReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>("all");
    const [filterJenis, setFilterJenis] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
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
            const jenis = (filterJenis && filterJenis !== "all") ? filterJenis : undefined;
            const q = searchQuery.trim() || undefined;
            const result = await getAllLhkpn(year, page, q, jenis);
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
    }, [filterTahun, filterJenis]);

    useEffect(() => {
        const timer = setTimeout(() => loadData(1), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteLhkpn(deleteId);
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

    const formatDate = (date: string | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderPaginationItems = () => {
        const { current_page, last_page } = pagination;
        const items = [];
        const delta = 2;

        for (let i = 1; i <= last_page; i++) {
            if (i === 1 || i === last_page || (i >= current_page - delta && i <= current_page + delta)) {
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
                        <h2 className="text-3xl font-bold tracking-tight">LHKPN & SPT Tahunan</h2>
                        <p className="text-muted-foreground">Kelola laporan harta kekayaan dan pajak tahunan pegawai.</p>
                    </div>
                    <Link href="/lhkpn/tambah">
                        <Button className="bg-violet-600 hover:bg-violet-700 shadow-md">
                            <PlusCircle className="mr-2 h-4 w-4" /> Lapor Baru
                        </Button>
                    </Link>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className="space-y-4 pb-4">
                        <div className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-medium">Daftar Laporan</CardTitle>
                            <Button variant="outline" size="icon" onClick={() => loadData(pagination.current_page)}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau NIP..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                    {getYearOptions().map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterJenis} onValueChange={setFilterJenis}>
                                <SelectTrigger className="w-full sm:w-[170px]">
                                    <SelectValue placeholder="Semua Jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Jenis</SelectItem>
                                    <SelectItem value="LHKPN">LHKPN</SelectItem>
                                    <SelectItem value="SPT Tahunan">SPT Tahunan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center">No</TableHead>
                                        <TableHead>Nama Pegawai</TableHead>
                                        <TableHead>Jabatan</TableHead>
                                        <TableHead>Tahun</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead>Tanggal Lapor</TableHead>
                                        <TableHead>Bukti</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={8}><Skeleton className="h-12 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                Tidak ada data laporan ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center">
                                                    {(pagination.current_page - 1) * 15 + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.nama}</div>
                                                    <div className="text-xs text-muted-foreground">{item.nip}</div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={item.jabatan}>
                                                    {item.jabatan}
                                                </TableCell>
                                                <TableCell>{item.tahun}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.jenis_laporan === 'LHKPN' ? 'default' : 'secondary'}>
                                                        {item.jenis_laporan}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(item.tanggal_lapor)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {item.link_tanda_terima && (
                                                            <a href={item.link_tanda_terima} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                                <FileText className="h-3 w-3" /> Tanda Terima
                                                            </a>
                                                        )}
                                                        {item.link_pengumuman && (
                                                            <a href={item.link_pengumuman} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                                                                <FileText className="h-3 w-3" /> Pengumuman
                                                            </a>
                                                        )}
                                                        {item.link_spt && (
                                                            <a href={item.link_spt} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline flex items-center gap-1">
                                                                <FileText className="h-3 w-3" /> SPT
                                                            </a>
                                                        )}
                                                        {item.link_dokumen_pendukung && (
                                                            <a href={item.link_dokumen_pendukung} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline flex items-center gap-1">
                                                                <ExternalLink className="h-3 w-3" /> Dokumen
                                                            </a>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/lhkpn/${item.id}/edit`}>
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
                            Apakah Anda yakin ingin menghapus data laporan ini? Tindakan ini tidak dapat dibatalkan.
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