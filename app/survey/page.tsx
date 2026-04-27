'use client';

import { MagicDeleteDialog } from '@/components/custom/magic-delete-dialog';
import { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PlusCircle, RefreshCw, Trash2, Edit, ExternalLink, Search,
    Calendar, FileImage, ImageOff, SmilePlus, Award, ClipboardCheck,
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ─────────────────────────────────────────────
// Helper: format date range Indonesia
// ─────────────────────────────────────────────
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggalRange(start?: string, end?: string): string {
    if (!start || !end) return '-';
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return '-';

    const sD = s.getDate();
    const sM = s.getMonth();
    const sY = s.getFullYear();
    const eD = e.getDate();
    const eM = e.getMonth();
    const eY = e.getFullYear();

    if (sY === eY && sM === eM) {
        return `${sD} - ${eD} ${BULAN_ID[sM]} ${sY}`;
    }
    if (sY === eY) {
        return `${sD} ${BULAN_ID[sM]} - ${eD} ${BULAN_ID[eM]} ${sY}`;
    }
    return `${sD} ${BULAN_ID[sM]} ${sY} - ${eD} ${BULAN_ID[eM]} ${eY}`;
}

const KATEGORI_META: Record<KategoriSurveyLaporan, { label: string; short: string; icon: any; color: string; bg: string; border: string }> = {
    IKM: {
        label: 'Survei Kepuasan Masyarakat',
        short: 'IKM',
        icon: SmilePlus,
        color: 'text-fuchsia-700',
        bg: 'bg-fuchsia-50',
        border: 'border-fuchsia-200',
    },
    IPAK: {
        label: 'Indeks Persepsi Anti Korupsi',
        short: 'IPAK',
        icon: Award,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
    },
    TINDAK_LANJUT: {
        label: 'Tindak Lanjut Hasil Survei',
        short: 'Tindak Lanjut',
        icon: ClipboardCheck,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
    },
};

// ─────────────────────────────────────────────
// Komponen Utama
// ─────────────────────────────────────────────
export default function SurveyPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'laporan' | 'pekan'>('laporan');

    // ── Data state ──
    const [laporan, setLaporan] = useState<SurveyLaporan[]>([]);
    const [pekan, setPekan] = useState<SurveyPekan[]>([]);
    const [loadingLaporan, setLoadingLaporan] = useState(true);
    const [loadingPekan, setLoadingPekan] = useState(true);

    // ── Filter state laporan ──
    const [filterTahunLaporan, setFilterTahunLaporan] = useState<string>('all');
    const [filterKategori, setFilterKategori] = useState<string>('all');
    const [searchLaporan, setSearchLaporan] = useState<string>('');

    // ── Filter state pekan ──
    const [filterTahunPekan, setFilterTahunPekan] = useState<string>('all');
    const [searchPekan, setSearchPekan] = useState<string>('');

    // ── Delete state ──
    const [deleteLaporanId, setDeleteLaporanId] = useState<number | null>(null);
    const [deletePekanId, setDeletePekanId] = useState<number | null>(null);

    // ── Loaders ──
    const loadLaporan = async () => {
        setLoadingLaporan(true);
        try {
            const tahun = filterTahunLaporan !== 'all' ? parseInt(filterTahunLaporan) : undefined;
            const kategori = filterKategori !== 'all' ? (filterKategori as KategoriSurveyLaporan) : undefined;
            const result = await getAllSurveyLaporan({ tahun, kategori });
            setLaporan(result.success && result.data ? result.data : []);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data laporan.' });
            setLaporan([]);
        }
        setLoadingLaporan(false);
    };

    const loadPekan = async () => {
        setLoadingPekan(true);
        try {
            const tahun = filterTahunPekan !== 'all' ? parseInt(filterTahunPekan) : undefined;
            const result = await getAllSurveyPekan(tahun);
            setPekan(result.success && result.data ? result.data : []);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data pekan survei.' });
            setPekan([]);
        }
        setLoadingPekan(false);
    };

    useEffect(() => { loadLaporan(); }, [filterTahunLaporan, filterKategori]);
    useEffect(() => { loadPekan(); }, [filterTahunPekan]);

    // ── Search filtering ──
    const laporanFiltered = useMemo(() => {
        if (!searchLaporan.trim()) return laporan;
        const q = searchLaporan.toLowerCase();
        return laporan.filter(r =>
            r.periode.toLowerCase().includes(q) ||
            String(r.tahun).includes(q) ||
            (KATEGORI_META[r.kategori]?.label || '').toLowerCase().includes(q)
        );
    }, [laporan, searchLaporan]);

    const pekanFiltered = useMemo(() => {
        if (!searchPekan.trim()) return pekan;
        const q = searchPekan.toLowerCase();
        return pekan.filter(r =>
            String(r.tahun).includes(q) ||
            (r.tanggal_mulai || '').toLowerCase().includes(q) ||
            (r.tanggal_selesai || '').toLowerCase().includes(q) ||
            formatTanggalRange(r.tanggal_mulai, r.tanggal_selesai).toLowerCase().includes(q)
        );
    }, [pekan, searchPekan]);

    // ── Group laporan by tahun → kategori ──
    const laporanGrouped = useMemo(() => {
        const map = new Map<number, Map<KategoriSurveyLaporan, SurveyLaporan[]>>();
        for (const item of laporanFiltered) {
            if (!map.has(item.tahun)) map.set(item.tahun, new Map());
            const yearMap = map.get(item.tahun)!;
            if (!yearMap.has(item.kategori)) yearMap.set(item.kategori, []);
            yearMap.get(item.kategori)!.push(item);
        }
        // Sort tahun desc
        return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
    }, [laporanFiltered]);

    // ── Delete handlers ──
    const handleDeleteLaporan = async () => {
        if (!deleteLaporanId) return;
        try {
            const result = await deleteSurveyLaporan(deleteLaporanId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil dihapus!' });
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan.' });
        }
        setDeleteLaporanId(null);
        loadLaporan();
    };

    const handleDeletePekan = async () => {
        if (!deletePekanId) return;
        try {
            const result = await deleteSurveyPekan(deletePekanId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil dihapus!' });
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan.' });
        }
        setDeletePekanId(null);
        loadPekan();
    };

    // ─────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Data Survey</h2>
                        <p className="text-muted-foreground">
                            Kelola laporan IKM, IPAK, Tindak Lanjut, dan snapshot Pekan Survei untuk halaman publik.
                        </p>
                    </div>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'laporan' | 'pekan')}>
                    <TabsList className="grid w-full grid-cols-2 md:w-[480px]">
                        <TabsTrigger value="laporan" className="gap-2">
                            <FileImage className="h-4 w-4" /> Laporan Tahunan
                        </TabsTrigger>
                        <TabsTrigger value="pekan" className="gap-2">
                            <Calendar className="h-4 w-4" /> Pekan Survei
                        </TabsTrigger>
                    </TabsList>

                    {/* ── TAB: LAPORAN TAHUNAN ─────────────────────── */}
                    <TabsContent value="laporan" className="space-y-4">
                        <Card>
                            <CardHeader className="space-y-4 pb-4">
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <CardTitle className="text-lg font-medium">Laporan Survey (IKM / IPAK / Tindak Lanjut)</CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={loadLaporan}>
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
                                            value={searchLaporan}
                                            onChange={e => setSearchLaporan(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={filterTahunLaporan} onValueChange={setFilterTahunLaporan}>
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
                                    <Select value={filterKategori} onValueChange={setFilterKategori}>
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
                                {loadingLaporan ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <Skeleton key={i} className="h-72 w-full rounded-xl" />
                                        ))}
                                    </div>
                                ) : laporanGrouped.length === 0 ? (
                                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                                        {laporan.length === 0
                                            ? 'Belum ada data laporan. Klik "Tambah Laporan" untuk memulai.'
                                            : 'Tidak ada data yang cocok dengan filter.'}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {laporanGrouped.map(([tahun, perKategori]) => (
                                            <div key={tahun} className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold tracking-tight">Tahun {tahun}</h3>
                                                    <div className="flex-1 h-px bg-slate-200" />
                                                </div>
                                                {Array.from(perKategori.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([kategori, items]) => {
                                                    const meta = KATEGORI_META[kategori];
                                                    const Icon = meta.icon;
                                                    return (
                                                        <div key={kategori} className="space-y-3">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color} ${meta.border} border`}>
                                                                <Icon className="h-3.5 w-3.5" />
                                                                {meta.label}
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                                {items
                                                                    .slice()
                                                                    .sort((a, b) => a.urutan - b.urutan)
                                                                    .map(item => (
                                                                        <LaporanCard
                                                                            key={item.id}
                                                                            item={item}
                                                                            onDelete={() => setDeleteLaporanId(item.id!)}
                                                                        />
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── TAB: PEKAN SURVEI ─────────────────────────── */}
                    <TabsContent value="pekan" className="space-y-4">
                        <Card>
                            <CardHeader className="space-y-4 pb-4">
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <CardTitle className="text-lg font-medium">Pekan Survei (Snapshot Mingguan)</CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={loadPekan}>
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
                                            value={searchPekan}
                                            onChange={e => setSearchPekan(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={filterTahunPekan} onValueChange={setFilterTahunPekan}>
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
                                {loadingPekan ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <Skeleton key={i} className="h-80 w-full rounded-xl" />
                                        ))}
                                    </div>
                                ) : pekanFiltered.length === 0 ? (
                                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                                        {pekan.length === 0
                                            ? 'Belum ada data pekan survei. Klik "Tambah Pekan" untuk memulai.'
                                            : 'Tidak ada data yang cocok dengan filter.'}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {pekanFiltered.map(item => (
                                            <PekanCard
                                                key={item.id}
                                                item={item}
                                                onDelete={() => setDeletePekanId(item.id!)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </BlurFade>

            <MagicDeleteDialog
                isOpen={!!deleteLaporanId}
                onClose={() => setDeleteLaporanId(null)}
                onConfirm={handleDeleteLaporan}
                title="Hapus Laporan Survey"
                description="Yakin ingin menghapus laporan ini? Tindakan tidak dapat dibatalkan."
            />
            <MagicDeleteDialog
                isOpen={!!deletePekanId}
                onClose={() => setDeletePekanId(null)}
                onConfirm={handleDeletePekan}
                title="Hapus Pekan Survei"
                description="Yakin ingin menghapus data pekan survei ini? Tindakan tidak dapat dibatalkan."
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// Subkomponen: Card untuk satu item laporan
// ─────────────────────────────────────────────
function LaporanCard({ item, onDelete }: { item: SurveyLaporan; onDelete: () => void }) {
    const meta = KATEGORI_META[item.kategori];
    const [imgError, setImgError] = useState(false);

    return (
        <div className={`group relative rounded-xl border ${meta.border} bg-white overflow-hidden hover:shadow-lg transition-shadow`}>
            {/* Image */}
            <div className={`aspect-square ${meta.bg} flex items-center justify-center relative overflow-hidden`}>
                {item.gambar_url && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.gambar_url}
                        alt={item.periode}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                        <ImageOff className="h-10 w-10" />
                        <span className="text-xs">Tidak ada gambar</span>
                    </div>
                )}
                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link href={`/survey/laporan/${item.id}/edit`}>
                        <Button size="icon" variant="secondary" className="h-9 w-9">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button size="icon" variant="destructive" className="h-9 w-9" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {/* Body */}
            <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{meta.short}</Badge>
                    <span className="text-xs text-slate-500">#{item.urutan}</span>
                </div>
                <p className="font-semibold text-sm leading-tight" title={item.periode}>{item.periode}</p>
                <p className="text-xs text-muted-foreground">Tahun {item.tahun}</p>
                {item.link_dokumen ? (
                    <a
                        href={item.link_dokumen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs font-medium ${meta.color} hover:underline`}
                    >
                        <ExternalLink className="h-3 w-3" /> Lihat dokumen
                    </a>
                ) : (
                    <span className="text-xs italic text-slate-400">Belum ada link dokumen</span>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Subkomponen: Card untuk satu pekan survei
// ─────────────────────────────────────────────
function PekanCard({ item, onDelete }: { item: SurveyPekan; onDelete: () => void }) {
    const range = formatTanggalRange(item.tanggal_mulai, item.tanggal_selesai);

    const indicators = [
        { label: 'IKM',  gambar: item.gambar_ikm,  link: item.link_ikm,  color: 'text-fuchsia-600' },
        { label: 'IPKP', gambar: item.gambar_ipkp, link: item.link_ipkp, color: 'text-amber-600' },
        { label: 'IPAK', gambar: item.gambar_ipak, link: item.link_ipak, color: 'text-emerald-600' },
    ];

    return (
        <div className="group rounded-xl border bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4 border-b bg-slate-50/60">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-[11px] uppercase font-semibold tracking-wider text-slate-500">Periode Survei</p>
                        <p className="font-bold text-sm leading-tight mt-0.5">{range}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{item.tahun}</Badge>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-slate-100">
                {indicators.map(ind => (
                    <PekanThumbnail key={ind.label} {...ind} />
                ))}
            </div>
            <div className="p-3 flex items-center justify-end gap-2 border-t">
                <Link href={`/survey/pekan/${item.id}/edit`}>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                </Link>
                <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                </Button>
            </div>
        </div>
    );
}

function PekanThumbnail({ label, gambar, link, color }: { label: string; gambar?: string | null; link?: string | null; color: string }) {
    const [imgError, setImgError] = useState(false);
    const imageEl = gambar && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={gambar}
            alt={label}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
        />
    ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2">
            <ImageOff className="h-6 w-6" />
            <span className="text-[10px]">No image</span>
        </div>
    );

    const wrapper = (
        <div className="aspect-square bg-white flex items-center justify-center overflow-hidden relative group/thumb">
            {imageEl}
            <div className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 ${color}`}>
                {label}
            </div>
        </div>
    );

    return link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" title={`Lihat ${label}`} className="hover:opacity-80 transition-opacity">
            {wrapper}
        </a>
    ) : wrapper;
}
