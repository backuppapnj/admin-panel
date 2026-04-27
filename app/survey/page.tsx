'use client';

import { MagicDeleteDialog } from '@/components/custom/magic-delete-dialog';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    getAllSurveyLaporan,
    deleteSurveyLaporan,
    getAllSurveyPekan,
    deleteSurveyPekan,
    KATEGORI_SURVEY_LAPORAN,
    type SurveyLaporan,
    type SurveyPekan,
    type KategoriSurveyLaporan,
} from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PlusCircle, RefreshCw, Trash2, Edit, ExternalLink, Search,
    Calendar, FileImage, ImageOff,
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 15;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggalRange(start?: string, end?: string): string {
    if (!start || !end) return '-';
    const sParts = String(start).split('T')[0].split('-');
    const eParts = String(end).split('T')[0].split('-');
    if (sParts.length < 3 || eParts.length < 3) return `${start} s/d ${end}`;
    const sY = parseInt(sParts[0], 10), sM = parseInt(sParts[1], 10) - 1, sD = parseInt(sParts[2], 10);
    const eY = parseInt(eParts[0], 10), eM = parseInt(eParts[1], 10) - 1, eD = parseInt(eParts[2], 10);
    if ([sY, sM, sD, eY, eM, eD].some(n => isNaN(n))) return `${start} s/d ${end}`;
    if (sY === eY && sM === eM) return `${sD} - ${eD} ${BULAN_ID[sM]} ${sY}`;
    if (sY === eY) return `${sD} ${BULAN_ID[sM]} - ${eD} ${BULAN_ID[eM]} ${sY}`;
    return `${sD} ${BULAN_ID[sM]} ${sY} - ${eD} ${BULAN_ID[eM]} ${eY}`;
}

const KATEGORI_BADGE: Record<KategoriSurveyLaporan, { label: string; class: string }> = {
    IKM:           { label: 'IKM',           class: 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-100' },
    IPAK:          { label: 'IPAK',          class: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
    TINDAK_LANJUT: { label: 'Tindak Lanjut', class: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
};

// Pemetaan kategori mutu ke kelas warna badge.
const MUTU_BADGE: Record<string, string> = {
    A: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
    B: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
    C: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200',
    D: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
};

function formatNilai(n?: number | null, digits = 2): string {
    if (n === null || n === undefined || isNaN(Number(n))) return '—';
    return Number(n).toFixed(digits);
}

// ─────────────────────────────────────────────
// Komponen Utama
// ─────────────────────────────────────────────
export default function SurveyPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'laporan' | 'pekan'>('laporan');

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Data Survey</h2>
                    <p className="text-muted-foreground">
                        Kelola laporan IKM, IPAK, Tindak Lanjut, dan snapshot Pekan Survei untuk halaman publik.
                    </p>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'laporan' | 'pekan')}>
                    <TabsList className="grid w-full grid-cols-2 md:w-[480px] mb-4">
                        <TabsTrigger value="laporan" className="gap-2">
                            <FileImage className="h-4 w-4" /> Laporan Tahunan
                        </TabsTrigger>
                        <TabsTrigger value="pekan" className="gap-2">
                            <Calendar className="h-4 w-4" /> Pekan Survei
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="laporan">
                        <LaporanSection toast={toast} />
                    </TabsContent>
                    <TabsContent value="pekan">
                        <PekanSection toast={toast} />
                    </TabsContent>
                </Tabs>
            </BlurFade>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// SECTION: Laporan Tahunan (IKM / IPAK / Tindak Lanjut)
// ════════════════════════════════════════════════════════════
function LaporanSection({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) {
    const [allData, setAllData] = useState<SurveyLaporan[]>([]);
    const [displayData, setDisplayData] = useState<SurveyLaporan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>('all');
    const [filterKategori, setFilterKategori] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const tahun = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
            const kategori = filterKategori !== 'all' ? (filterKategori as KategoriSurveyLaporan) : undefined;
            const result = await getAllSurveyLaporan({ tahun, kategori });
            setAllData(result.success && result.data ? result.data : []);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data laporan. Pastikan API terhubung.' });
            setAllData([]);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [filterTahun, filterKategori]);

    useEffect(() => {
        const timer = setTimeout(() => {
            let filtered = allData;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(d =>
                    d.periode.toLowerCase().includes(q) ||
                    String(d.tahun).includes(q) ||
                    (KATEGORI_BADGE[d.kategori]?.label || '').toLowerCase().includes(q)
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
            const result = await deleteSurveyLaporan(deleteId);
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
        const items: React.ReactNode[] = [];
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

    return (
        <Card>
            <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-row items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg font-medium">Laporan Survey (IKM / IPAK / Tindak Lanjut)</CardTitle>
                        <CardDescription>Daftar laporan triwulan / semester per kategori.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={loadData}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Link href="/survey/laporan/tambah">
                            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Laporan
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari periode, tahun, atau kategori..."
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className="pl-9"
                        />
                    </div>
                    <Select value={filterTahun} onValueChange={v => { setFilterTahun(v); setPagination(prev => ({ ...prev, current_page: 1 })); }}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Semua Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tahun</SelectItem>
                            {getYearOptions(2019).map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterKategori} onValueChange={v => { setFilterKategori(v); setPagination(prev => ({ ...prev, current_page: 1 })); }}>
                        <SelectTrigger className="w-full sm:w-[230px]">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {KATEGORI_SURVEY_LAPORAN.map(k => (
                                <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
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
                                <TableHead className="w-[70px] text-center">Tahun</TableHead>
                                <TableHead className="w-[130px]">Kategori</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead className="w-[80px] text-right">Nilai</TableHead>
                                <TableHead className="w-[70px] text-center">Mutu</TableHead>
                                <TableHead className="w-[80px] text-right">Resp.</TableHead>
                                <TableHead className="w-[70px] text-center">Gambar</TableHead>
                                <TableHead className="w-[100px] text-center">Dokumen</TableHead>
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={10}><Skeleton className="h-12 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-24 text-center">
                                        {allData.length === 0
                                            ? 'Belum ada data laporan. Klik "Tambah Laporan" untuk memulai.'
                                            : 'Tidak ada data yang cocok dengan filter.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-center">
                                            {(pagination.current_page - 1) * PAGE_SIZE + index + 1}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{item.tahun}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={KATEGORI_BADGE[item.kategori]?.class || ''}>
                                                {KATEGORI_BADGE[item.kategori]?.label || item.kategori}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium" title={item.periode}>
                                            {item.periode}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {item.nilai_indeks != null
                                                ? <span className="font-semibold text-fuchsia-700">{formatNilai(item.nilai_indeks)}</span>
                                                : <span className="text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.kategori_mutu ? (
                                                <Badge variant="outline" className={MUTU_BADGE[item.kategori_mutu] || ''}>
                                                    {item.kategori_mutu}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {item.jumlah_responden != null
                                                ? item.jumlah_responden.toLocaleString('id-ID')
                                                : <span className="text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <ThumbCell url={item.gambar_url} alt={item.periode} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.link_dokumen ? (
                                                <a
                                                    href={item.link_dokumen}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-fuchsia-600 hover:underline text-sm"
                                                >
                                                    <ExternalLink className="h-3 w-3" /> Lihat
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/survey/laporan/${item.id}/edit`}>
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

            <MagicDeleteDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Laporan Survey"
                description="Yakin ingin menghapus laporan ini? Tindakan tidak dapat dibatalkan."
            />
        </Card>
    );
}

// ════════════════════════════════════════════════════════════
// SECTION: Pekan Survei
// ════════════════════════════════════════════════════════════
function PekanSection({ toast }: { toast: ReturnType<typeof useToast>['toast'] }) {
    const [allData, setAllData] = useState<SurveyPekan[]>([]);
    const [displayData, setDisplayData] = useState<SurveyPekan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const tahun = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
            const result = await getAllSurveyPekan(tahun);
            setAllData(result.success && result.data ? result.data : []);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data pekan survei. Pastikan API terhubung.' });
            setAllData([]);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [filterTahun]);

    useEffect(() => {
        const timer = setTimeout(() => {
            let filtered = allData;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(d =>
                    String(d.tahun).includes(q) ||
                    (d.tanggal_mulai || '').toLowerCase().includes(q) ||
                    (d.tanggal_selesai || '').toLowerCase().includes(q) ||
                    formatTanggalRange(d.tanggal_mulai, d.tanggal_selesai).toLowerCase().includes(q)
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
            const result = await deleteSurveyPekan(deleteId);
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
        const items: React.ReactNode[] = [];
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

    return (
        <Card>
            <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-row items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg font-medium">Pekan Survei (Snapshot Mingguan)</CardTitle>
                        <CardDescription>Snapshot tiga indikator (IKM, IPKP, IPAK) per pekan.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={loadData}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Link href="/survey/pekan/tambah">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pekan
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari tanggal atau tahun..."
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className="pl-9"
                        />
                    </div>
                    <Select value={filterTahun} onValueChange={v => { setFilterTahun(v); setPagination(prev => ({ ...prev, current_page: 1 })); }}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Semua Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tahun</SelectItem>
                            {getYearOptions(2019).map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
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
                                <TableHead className="w-[70px] text-center">Tahun</TableHead>
                                <TableHead>Periode Survei</TableHead>
                                <TableHead className="w-[80px] text-right">Resp.</TableHead>
                                <TableHead className="w-[110px] text-center">IKM</TableHead>
                                <TableHead className="w-[110px] text-center">IPKP</TableHead>
                                <TableHead className="w-[110px] text-center">IPAK</TableHead>
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={8}><Skeleton className="h-12 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        {allData.length === 0
                                            ? 'Belum ada data pekan survei. Klik "Tambah Pekan" untuk memulai.'
                                            : 'Tidak ada data yang cocok dengan filter.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-center">
                                            {(pagination.current_page - 1) * PAGE_SIZE + index + 1}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{item.tahun}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatTanggalRange(item.tanggal_mulai, item.tanggal_selesai)}
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {item.total_responden != null
                                                ? item.total_responden.toLocaleString('id-ID')
                                                : <span className="text-muted-foreground">—</span>}
                                        </TableCell>
                                        <ScoreThumbCell nilai={item.nilai_ikm} url={item.gambar_ikm} link={item.link_ikm} colorClass="text-fuchsia-700" alt="IKM" />
                                        <ScoreThumbCell nilai={item.nilai_ipkp} url={item.gambar_ipkp} link={item.link_ipkp} colorClass="text-amber-700" alt="IPKP" />
                                        <ScoreThumbCell nilai={item.nilai_ipak} url={item.gambar_ipak} link={item.link_ipak} colorClass="text-emerald-700" alt="IPAK" />
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/survey/pekan/${item.id}/edit`}>
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

            <MagicDeleteDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Pekan Survei"
                description="Yakin ingin menghapus data pekan survei ini? Tindakan tidak dapat dibatalkan."
            />
        </Card>
    );
}

// ════════════════════════════════════════════════════════════
// Komponen kecil: Thumbnail cell di tabel
// ════════════════════════════════════════════════════════════
function ThumbCell({ url, link, alt }: { url?: string | null; link?: string | null; alt?: string }) {
    const [imgError, setImgError] = useState(false);

    if (!url || imgError) {
        return (
            <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-slate-100 text-slate-400" title="Tidak ada gambar">
                <ImageOff className="h-4 w-4" />
            </div>
        );
    }

    const target = link || url;
    return (
        <a
            href={target}
            target="_blank"
            rel="noopener noreferrer"
            title={alt || 'Lihat gambar'}
            className="inline-block group"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={url}
                alt={alt || ''}
                className="w-10 h-10 rounded object-cover ring-1 ring-slate-200 group-hover:ring-fuchsia-400 transition"
                onError={() => setImgError(true)}
            />
        </a>
    );
}

// ════════════════════════════════════════════════════════════
// Komponen kecil: Cell skor + thumbnail kecil (Pekan Survei)
// Menampilkan nilai numerik di atas, dan thumbnail kecil yg
// bisa diklik untuk buka link/gambar.
// ════════════════════════════════════════════════════════════
function ScoreThumbCell({
    nilai,
    url,
    link,
    colorClass,
    alt,
}: {
    nilai?: number | null;
    url?: string | null;
    link?: string | null;
    colorClass: string;
    alt: string;
}) {
    return (
        <TableCell className="text-center">
            <div className="flex flex-col items-center gap-1">
                <span className={`font-mono font-semibold text-sm ${nilai != null ? colorClass : 'text-muted-foreground'}`}>
                    {nilai != null ? formatNilai(nilai) : '—'}
                </span>
                <ThumbCell url={url} link={link} alt={alt} />
            </div>
        </TableCell>
    );
}
