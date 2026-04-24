'use client';

import { MagicDeleteDialog } from '@/components/custom/magic-delete-dialog';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    getAllInovasi, deleteInovasi, KATEGORI_INOVASI, type Inovasi,
    getAllSkInovasi, createSkInovasi, updateSkInovasi, deleteSkInovasi, getSkInovasi, type SkInovasi,
} from '@/lib/api';
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
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis
} from '@/components/ui/pagination';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, RefreshCw, Trash2, Edit, ExternalLink, Search, Settings2, Loader2 } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 15;

const CURRENT_YEAR = new Date().getFullYear();
const SK_FORM_DEFAULT: Partial<SkInovasi> = { tahun: CURRENT_YEAR, is_active: true };

export default function InovasiList() {
    const [allData, setAllData] = useState<Inovasi[]>([]);
    const [displayData, setDisplayData] = useState<Inovasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterKategori, setFilterKategori] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { toast } = useToast();

    // State Sheet SK Inovasi
    const [skSheetOpen, setSkSheetOpen] = useState(false);
    const [skList, setSkList] = useState<SkInovasi[]>([]);
    const [skLoading, setSkLoading] = useState(false);
    const [skForm, setSkForm] = useState<Partial<SkInovasi>>(SK_FORM_DEFAULT);
    const [skFile, setSkFile] = useState<File | null>(null);
    const [editSkId, setEditSkId] = useState<number | null>(null);
    const [savingSk, setSavingSk] = useState(false);
    const [deleteSkId, setDeleteSkId] = useState<number | null>(null);

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

    // ---- SK Inovasi ----
    const loadSkList = async () => {
        setSkLoading(true);
        try {
            const result = await getAllSkInovasi();
            if (result.success) setSkList(result.data || []);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data SK.' });
        }
        setSkLoading(false);
    };

    const resetSkForm = () => {
        setSkForm(SK_FORM_DEFAULT);
        setSkFile(null);
        setEditSkId(null);
    };

    const handleOpenSkSheet = () => {
        setSkSheetOpen(true);
        loadSkList();
    };

    const handleEditSk = async (id: number) => {
        try {
            const result = await getSkInovasi(id);
            if (result) {
                setSkForm(result);
                setEditSkId(id);
            }
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data SK.' });
        }
    };

    const handleSaveSk = async () => {
        if (!skForm.tahun || !skForm.nomor_sk?.trim() || !skForm.tentang?.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Tahun, Nomor SK, dan Tentang wajib diisi.' });
            return;
        }
        setSavingSk(true);
        try {
            const fd = new FormData();
            fd.append('tahun', String(skForm.tahun));
            fd.append('nomor_sk', skForm.nomor_sk || '');
            fd.append('tentang', skForm.tentang || '');
            fd.append('is_active', skForm.is_active ? '1' : '0');
            if (skForm.file_url) fd.append('file_url', skForm.file_url);
            if (skFile) fd.append('file', skFile);

            const result = editSkId
                ? await updateSkInovasi(editSkId, fd)
                : await createSkInovasi(fd);

            if (result.success) {
                toast({ title: 'Sukses', description: editSkId ? 'SK berhasil diperbarui!' : 'SK berhasil ditambahkan!' });
                resetSkForm();
                loadSkList();
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan.' });
        }
        setSavingSk(false);
    };

    const handleDeleteSk = async () => {
        if (!deleteSkId) return;
        try {
            const result = await deleteSkInovasi(deleteSkId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'SK berhasil dihapus!' });
                setDeleteSkId(null);
                loadSkList();
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
                setDeleteSkId(null);
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menghapus.' });
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
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleOpenSkSheet}>
                            <Settings2 className="mr-2 h-4 w-4" /> Kelola SK Inovasi
                        </Button>
                        <Link href="/inovasi/tambah">
                            <Button className="bg-amber-600 hover:bg-amber-700 shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
                            </Button>
                        </Link>
                    </div>
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

            <MagicDeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        description="Apakah Anda yakin ingin menghapus data ini? Tindakan tidak dapat dibatalkan."
      />

            {/* AlertDialog Hapus SK */}
            <MagicDeleteDialog
        isOpen={!!deleteSkId}
        onClose={() => setDeleteSkId(null)}
        onConfirm={handleDeleteSk}
        title="Hapus SK Inovasi?"
        description="SK Inovasi yang dihapus tidak dapat dikembalikan."
      />

            {/* Sheet Kelola SK Inovasi */}
            <Sheet open={skSheetOpen} onOpenChange={(open) => { setSkSheetOpen(open); if (!open) resetSkForm(); }}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Kelola SK Inovasi</SheetTitle>
                        <SheetDescription>Tambah, edit, atau hapus Surat Keputusan penetapan inovasi tahunan.</SheetDescription>
                    </SheetHeader>

                    {/* Form tambah / edit SK */}
                    <div className="mt-6 space-y-4 border rounded-lg p-4 bg-muted/30">
                        <h4 className="font-semibold text-sm">
                            {editSkId ? 'Edit SK' : 'Tambah SK Baru'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Tahun <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min={2000}
                                    max={2100}
                                    value={skForm.tahun || CURRENT_YEAR}
                                    onChange={e => setSkForm(prev => ({ ...prev, tahun: parseInt(e.target.value) || CURRENT_YEAR }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={skForm.is_active ? 'true' : 'false'}
                                    onValueChange={v => setSkForm(prev => ({ ...prev, is_active: v === 'true' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Aktif</SelectItem>
                                        <SelectItem value="false">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nomor SK <span className="text-red-500">*</span></Label>
                            <Input
                                value={skForm.nomor_sk || ''}
                                onChange={e => setSkForm(prev => ({ ...prev, nomor_sk: e.target.value }))}
                                placeholder="1297/KPA.W17-A8/OT1.6/XII/2025"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tentang <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={skForm.tentang || ''}
                                onChange={e => setSkForm(prev => ({ ...prev, tentang: e.target.value }))}
                                placeholder="Penetapan Inovasi dan Aplikasi Tahun 2026..."
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>URL Dokumen</Label>
                            <Input
                                value={skForm.file_url || ''}
                                onChange={e => setSkForm(prev => ({ ...prev, file_url: e.target.value }))}
                                placeholder="https://drive.google.com/file/d/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Upload File (Opsional)</Label>
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={e => setSkFile(e.target.files?.[0] || null)}
                            />
                            {skFile && <p className="text-xs text-amber-600">File dipilih: {skFile.name}</p>}
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleSaveSk} disabled={savingSk}>
                                {savingSk ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editSkId ? 'Update SK' : 'Tambah SK'}
                            </Button>
                            {editSkId && (
                                <Button variant="outline" onClick={resetSkForm}>Batal</Button>
                            )}
                        </div>
                    </div>

                    {/* Daftar SK */}
                    <div className="mt-6 space-y-3">
                        <h4 className="font-semibold text-sm">Daftar SK ({skList.length})</h4>
                        {skLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : skList.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6 italic">Belum ada SK. Tambahkan menggunakan form di atas.</p>
                        ) : (
                            skList.map(sk => (
                                <div key={sk.id} className="border rounded-lg p-3 space-y-1 bg-background">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-xs font-bold">{sk.tahun}</Badge>
                                                {sk.is_active
                                                    ? <Badge className="bg-green-600 hover:bg-green-700 text-xs">Aktif</Badge>
                                                    : <Badge variant="secondary" className="text-xs">Nonaktif</Badge>
                                                }
                                            </div>
                                            <p className="text-sm font-medium text-amber-700 mt-1 truncate" title={sk.nomor_sk}>{sk.nomor_sk}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{sk.tentang}</p>
                                            {sk.file_url && (
                                                <a href={sk.file_url} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline mt-1">
                                                    <ExternalLink className="h-3 w-3" /> Lihat Dokumen
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-blue-600"
                                                onClick={() => handleEditSk(sk.id)}>
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteSkId(sk.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
