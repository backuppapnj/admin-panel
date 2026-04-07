'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllInovasi, deleteInovasi, KATEGORI_INOVASI, type Inovasi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, RefreshCw, Trash2, Edit, ExternalLink, Search } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 15;

export default function InovasiList() {
    const [allData, setAllData] = useState<Inovasi[]>([]);
    const [displayData, setDisplayData] = useState<Inovasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterKategori, setFilterKategori] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { toast } = useToast();

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const kategori = filterKategori !== 'all' ? filterKategori : undefined;
            const result = await getAllInovasi(kategori);
            if (result.success && result.data) {
                setAllData(result.data);
            } else {
                setAllData([]);
            }
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal memuat data. Pastikan API terhubung.',
            });
            setAllData([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [filterKategori]);

    useEffect(() => {
        const timer = setTimeout(() => {
            let filtered = allData;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(d =>
                    d.nama_inovasi.toLowerCase().includes(q) ||
                    (d.deskripsi && d.deskripsi.toLowerCase().includes(q))
                );
            }

            setPagination(prev => {
                const total = filtered.length;
                const last_page = Math.max(1, Math.ceil(total / PAGE_SIZE));
                const current_page = Math.min(prev.current_page, last_page);
                return { ...prev, current_page, last_page, total };
            });

            setDisplayData(filtered);
        }, 400);
        return () => clearTimeout(timer);
    }, [allData, searchQuery]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const result = await deleteInovasi(deleteId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil dihapus!' });
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menghapus.' });
        }
        setDeleteId(null);
        loadData();
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
                            onClick={() => setPagination(prev => ({ ...prev, current_page: i }))}
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

    const paginatedData = displayData.slice(
        (pagination.current_page - 1) * PAGE_SIZE,
        pagination.current_page * PAGE_SIZE
    );

    const truncateText = (text: string, maxLength: number = 80) => {
        if (!text) return <span className="italic text-xs">—</span>;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Inovasi</h2>
                        <p className="text-muted-foreground">Daftar inovasi layanan pengadilan.</p>
                    </div>
                    <Link href="/inovasi/tambah">
                        <Button className="bg-amber-600 hover:bg-amber-700 shadow-md">
                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
                        </Button>
                    </Link>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className="space-y-4 pb-4">
                        <div className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-medium">Daftar Inovasi</CardTitle>
                            <Button variant="outline" size="icon" onClick={loadData}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama inovasi atau deskripsi..."
                                    value={searchQuery}
                                    onChange={e => {
                                        setSearchQuery(e.target.value);
                                        setPagination(prev => ({ ...prev, current_page: 1 }));
                                    }}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={filterKategori} onValueChange={v => { setFilterKategori(v); setPagination(prev => ({ ...prev, current_page: 1 })); }}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {KATEGORI_INOVASI.map(k => (
                                        <SelectItem key={k} value={k}>{k}</SelectItem>
                                    ))}
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
                                        <TableHead>Nama Inovasi</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-center">Dokumen</TableHead>
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
                                    ) : paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                {allData.length === 0
                                                    ? 'Belum ada data Inovasi. Klik "Tambah Data" untuk memulai.'
                                                    : 'Tidak ada data yang cocok dengan filter.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center">
                                                    {(pagination.current_page - 1) * PAGE_SIZE + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-amber-700 max-w-[200px] truncate" title={item.nama_inovasi}>
                                                    {item.nama_inovasi}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.kategori}</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground max-w-[300px]" title={item.deskripsi || ''}>
                                                    {truncateText(item.deskripsi)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.link_dokumen ? (
                                                        <a
                                                            href={item.link_dokumen}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-amber-600 hover:underline text-sm"
                                                        >
                                                            <ExternalLink className="h-3 w-3" /> Lihat
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Belum tersedia</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/inovasi/${item.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => setDeleteId(item.id)}
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

                        {!loading && pagination.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }));
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
                                                    setPagination(prev => ({ ...prev, current_page: Math.min(prev.last_page, prev.current_page + 1) }));
                                                }}
                                                className={pagination.current_page === pagination.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Menampilkan {Math.min((pagination.current_page - 1) * PAGE_SIZE + 1, pagination.total)}–{Math.min(pagination.current_page * PAGE_SIZE, pagination.total)} dari {pagination.total} data
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </BlurFade>

            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data ini? Tindakan tidak dapat dibatalkan.
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
