'use client';

import { MagicDeleteDialog } from '@/components/custom/magic-delete-dialog';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    getAllStandarPelayanan,
    deleteStandarPelayanan,
    JENIS_LAYANAN_OPTIONS,
    type StandarPelayanan,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PlusCircle, RefreshCw, Trash2, Edit, Eye, Search, ShieldCheck,
    Clock, Banknote, CheckCircle, XCircle,
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

const PAGE_SIZE = 15;

// Warna badge per jenis layanan
const JENIS_COLORS: Record<string, string> = {
    'Pendaftaran Perkara': 'bg-violet-100 text-violet-700 border-violet-200',
    'Pengambilan Produk Pengadilan': 'bg-blue-100 text-blue-700 border-blue-200',
    'Layanan Informasi Perkara': 'bg-sky-100 text-sky-700 border-sky-200',
    'Mediasi': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Bantuan Hukum (Posbakum)': 'bg-orange-100 text-orange-700 border-orange-200',
    'Layanan e-Court': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Layanan Sidang Keliling / Pelayanan Terpadu': 'bg-pink-100 text-pink-700 border-pink-200',
    'Legalisasi Dokumen': 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function StandarPelayananList() {
    const [allData, setAllData] = useState<StandarPelayanan[]>([]);
    const [displayData, setDisplayData] = useState<StandarPelayanan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterJenis, setFilterJenis] = useState<string>('all');
    const [filterPublished, setFilterPublished] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    const totalPages = Math.ceil(displayData.length / PAGE_SIZE);
    const pagedData = displayData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAllStandarPelayanan();
            if (result.success && result.data) {
                setAllData(result.data);
            }
        } catch {
            toast({ title: 'Error', description: 'Gagal memuat data.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadData(); }, [loadData]);

    // Filter & search lokal
    useEffect(() => {
        let filtered = [...allData];

        if (filterJenis !== 'all') {
            filtered = filtered.filter(d => d.jenis_layanan === filterJenis);
        }
        if (filterPublished !== 'all') {
            filtered = filtered.filter(d => d.published === (filterPublished === 'true'));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(d =>
                d.jenis_layanan.toLowerCase().includes(q) ||
                d.waktu_penyelesaian?.toLowerCase().includes(q) ||
                d.biaya_tarif?.toLowerCase().includes(q)
            );
        }

        setDisplayData(filtered);
        setCurrentPage(1);
    }, [allData, filterJenis, filterPublished, searchQuery]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const result = await deleteStandarPelayanan(deleteId);
            if (result.success) {
                toast({ title: 'Berhasil', description: 'Standar pelayanan berhasil dihapus.' });
                setAllData(prev => prev.filter(d => d.id !== deleteId));
            } else {
                toast({ title: 'Gagal', description: result.message || 'Terjadi kesalahan.', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Terjadi kesalahan server.', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const deleteTarget = allData.find(d => d.id === deleteId);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <MagicDeleteDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Hapus Standar Pelayanan"
                description={`Yakin hapus standar pelayanan "${deleteTarget?.jenis_layanan}"? Tindakan ini tidak dapat dibatalkan.`}
            />

            {/* Header */}
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-900/20">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Standar Pelayanan</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola standar pelayanan publik Pengadilan Agama Penajam
                            </p>
                        </div>
                    </div>
                    <Link href="/standar-pelayanan/tambah">
                        <Button className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Tambah Layanan
                        </Button>
                    </Link>
                </div>
            </BlurFade>

            {/* Filter Bar */}
            <BlurFade delay={0.15} inView>
                <Card className="border-teal-100">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search-standar-pelayanan"
                                    placeholder="Cari jenis layanan, waktu, biaya..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterJenis} onValueChange={setFilterJenis}>
                                <SelectTrigger id="filter-jenis-layanan" className="w-full sm:w-[220px]">
                                    <SelectValue placeholder="Semua Jenis Layanan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Jenis Layanan</SelectItem>
                                    {JENIS_LAYANAN_OPTIONS.map(j => (
                                        <SelectItem key={j} value={j}>{j}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterPublished} onValueChange={setFilterPublished}>
                                <SelectTrigger id="filter-status" className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="true">Aktif</SelectItem>
                                    <SelectItem value="false">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                id="refresh-button"
                                variant="outline"
                                size="icon"
                                onClick={loadData}
                                disabled={loading}
                                title="Refresh data"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </BlurFade>

            {/* Table */}
            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-teal-500" />
                            Daftar Standar Pelayanan
                            <Badge variant="secondary" className="ml-auto">
                                {displayData.length} data
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="w-12 text-center">No</TableHead>
                                        <TableHead>Jenis Layanan</TableHead>
                                        <TableHead className="w-[130px]">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" /> Waktu
                                            </span>
                                        </TableHead>
                                        <TableHead className="w-[160px]">
                                            <span className="flex items-center gap-1">
                                                <Banknote className="h-3.5 w-3.5" /> Biaya
                                            </span>
                                        </TableHead>
                                        <TableHead className="w-[100px]">Persyaratan</TableHead>
                                        <TableHead className="w-[80px] text-center">Status</TableHead>
                                        <TableHead className="w-[100px] text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 7 }).map((_, j) => (
                                                    <TableCell key={j}>
                                                        <Skeleton className="h-5 w-full" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : pagedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                                                <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium">Tidak ada data standar pelayanan</p>
                                                <p className="text-sm mt-1">
                                                    {searchQuery || filterJenis !== 'all' ? 'Coba ubah filter pencarian.' : 'Klik "Tambah Layanan" untuk menambah data baru.'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pagedData.map((item, idx) => (
                                            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="text-center text-sm text-muted-foreground font-mono">
                                                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs font-medium ${JENIS_COLORS[item.jenis_layanan] ?? 'bg-gray-100 text-gray-700'}`}
                                                    >
                                                        {item.jenis_layanan}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {item.waktu_penyelesaian ?? <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {item.biaya_tarif ?? <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.persyaratan?.length ? (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {item.persyaratan.length} item
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.published ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                            <CheckCircle className="h-3.5 w-3.5" /> Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                                            <XCircle className="h-3.5 w-3.5" /> Draft
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link href={`/standar-pelayanan/${item.id}`}>
                                                            <Button id={`view-${item.id}`} variant="ghost" size="icon" className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/standar-pelayanan/${item.id}/edit`}>
                                                            <Button id={`edit-${item.id}`} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            id={`delete-${item.id}`}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Halaman {currentPage} dari {totalPages} ({displayData.length} data)
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                    >
                                        Berikutnya
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
