'use client';

import { MagicDeleteDialog } from '@/components/custom/magic-delete-dialog';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllPanggilanEcourt, deletePanggilanEcourt, type PanggilanEcourt } from '@/lib/api';
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
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, RefreshCw, Trash2, Edit, FileText } from 'lucide-react';
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";

export default function PanggilanEcourtList() {
    const [data, setData] = useState<PanggilanEcourt[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>(new Date().getFullYear().toString());
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
            const result = await getAllPanggilanEcourt(year || 0, page);
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
    }, [filterTahun]);

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deletePanggilanEcourt(deleteId);
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
                        <h2 className="text-3xl font-bold tracking-tight">Panggilan e-Court</h2>
                        <p className="text-muted-foreground">Kelola daftar panggilan sidang elektronik.</p>
                    </div>
                    <Link href="/panggilan-ecourt/tambah">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
                        </Button>
                    </Link>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-lg font-medium">Daftar Panggilan</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
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
                                        <TableHead>Nomor Perkara</TableHead>
                                        <TableHead>Nama Dipanggil</TableHead>
                                        <TableHead>Sidang</TableHead>
                                        <TableHead className="text-center">File</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Tidak ada data ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center">
                                                    {(pagination.current_page - 1) * 10 + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.nomor_perkara}</TableCell>
                                                <TableCell>{item.nama_dipanggil}</TableCell>
                                                <TableCell>{item.tanggal_sidang ? new Date(item.tanggal_sidang).toLocaleDateString('id-ID') : '-'}</TableCell>
                                                <TableCell className="text-center">
                                                    {item.link_surat ? (
                                                        <a href={item.link_surat} target="_blank" rel="noopener noreferrer">
                                                            <Badge variant="secondary" className="cursor-pointer">
                                                                <FileText className="h-3 w-3 mr-1" /> PDF
                                                            </Badge>
                                                        </a>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/panggilan-ecourt/${item.id}/edit`}>
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
            <MagicDeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        description="Apakah Anda yakin ingin menghapus data panggilan ini? Tindakan ini tidak dapat dibatalkan."
      />

        </div>
    );
}