'use client';

import { MagicDeleteDialog } from '@/components/custom/magic-delete-dialog';
import { useState, useEffect } from 'react';
import { getAllLaporanPengaduan, deleteLaporanPengaduan, MATERI_PENGADUAN, type LaporanPengaduan } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Trash2, Edit, PlusCircle } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BULAN_SHORT = ['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nop','des'] as const;
const BULAN_LABEL: Record<string, string> = {
    jan:'Jan', feb:'Feb', mar:'Mar', apr:'Apr', mei:'Mei', jun:'Jun',
    jul:'Jul', agu:'Agu', sep:'Sep', okt:'Okt', nop:'Nop', des:'Des',
};

export default function LaporanPengaduanList() {
    const [allData, setAllData] = useState<LaporanPengaduan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>('all');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editRow, setEditRow] = useState<LaporanPengaduan | null>(null);
    const [addTahunOpen, setAddTahunOpen] = useState(false);
    const [addTahun, setAddTahun] = useState<string>(String(new Date().getFullYear() + 1));
    const [addingTahun, setAddingTahun] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            const tahun = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
            const result = await getAllLaporanPengaduan(tahun);
            if (result.success && result.data) {
                setAllData(result.data);
            } else {
                setAllData([]);
            }
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
            setAllData([]);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [filterTahun]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const result = await deleteLaporanPengaduan(deleteId);
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

    const handleAddTahun = async () => {
        const tahun = parseInt(addTahun);
        if (!tahun) return;
        setAddingTahun(true);
        let errors = 0;
        try {
            const { createLaporanPengaduan } = await import('@/lib/api');
            for (const materi of MATERI_PENGADUAN) {
                const result = await createLaporanPengaduan({ tahun, materi_pengaduan: materi as typeof MATERI_PENGADUAN[number] });
                if (!result.success) errors++;
            }
            if (errors === 0) {
                toast({ title: 'Sukses', description: `Data tahun ${tahun} berhasil ditambahkan!` });
                setAddTahunOpen(false);
                loadData();
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: `${errors} data gagal ditambahkan.` });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan.' });
        }
        setAddingTahun(false);
    };

    const handleSaveEdit = async () => {
        if (!editRow) return;
        try {
            const { updateLaporanPengaduan } = await import('@/lib/api');
            const result = await updateLaporanPengaduan(editRow.id!, editRow);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Data berhasil diperbarui!' });
                setEditRow(null);
                loadData();
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menyimpan.' });
        }
    };

    const tahunList = [...new Set(allData.map(d => d.tahun))].sort((a, b) => b - a);
    const displayedYears = filterTahun !== 'all' ? [parseInt(filterTahun)] : tahunList;

    const getRow = (tahun: number, materi: string) =>
        allData.find(d => d.tahun === tahun && d.materi_pengaduan === materi);

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Laporan Pengaduan</h2>
                        <p className="text-muted-foreground">Rekapitulasi pengaduan masyarakat per tahun.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-1" onClick={() => setAddTahunOpen(true)}>
                        <PlusCircle className="h-4 w-4" /> Tambah Tahun
                    </Button>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                    {getYearOptions(2022).map(y => (
                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : allData.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                {filterTahun !== 'all'
                                    ? `Belum ada data untuk tahun ${filterTahun}.`
                                    : 'Belum ada data. Jalankan seeder untuk mengisi data awal.'}
                            </div>
                        ) : (
                            <div className="space-y-8 overflow-x-auto">
                                {displayedYears.map(thn => (
                                    <div key={thn}>
                                        <h3 className="text-sm font-bold text-amber-700 mb-2 uppercase tracking-wide">
                                            Tahun {thn}
                                        </h3>
                                        <div className="rounded-md border">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="min-w-[280px]">Materi Pengaduan</TableHead>
                                                            {BULAN_SHORT.map(b => (
                                                                <TableHead key={b} className="text-center min-w-[50px]">{BULAN_LABEL[b]}</TableHead>
                                                            ))}
                                                            <TableHead className="text-center min-w-[60px]">Proses</TableHead>
                                                            <TableHead className="text-center min-w-[50px]">Sisa</TableHead>
                                                            <TableHead className="text-center w-[80px]">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {MATERI_PENGADUAN.map((materi, idx) => {
                                                            const row = getRow(thn, materi);
                                                            return (
                                                                <TableRow key={materi}>
                                                                    <TableCell className="font-medium text-xs max-w-[280px]">
                                                                        <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                                                                        {materi}
                                                                    </TableCell>
                                                                    {BULAN_SHORT.map(b => (
                                                                        <TableCell key={b} className="text-center text-xs">
                                                                            {row && (row as any)[b] !== null && (row as any)[b] !== undefined
                                                                                ? (row as any)[b]
                                                                                : '—'}
                                                                        </TableCell>
                                                                    ))}
                                                                    <TableCell className="text-center text-xs font-semibold">
                                                                        {row?.laporan_proses !== null && row?.laporan_proses !== undefined
                                                                            ? row.laporan_proses
                                                                            : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-center text-xs">
                                                                        {row?.sisa !== null && row?.sisa !== undefined
                                                                            ? row.sisa
                                                                            : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <div className="flex justify-center gap-1">
                                                                            {row ? (
                                                                                <>
                                                                                    <Button
                                                                                        variant="ghost" size="icon" className="h-7 w-7 hover:text-blue-600"
                                                                                        onClick={() => setEditRow({ ...row! })}
                                                                                    >
                                                                                        <Edit className="h-3.5 w-3.5" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost" size="icon" className="h-7 w-7 hover:text-red-600 hover:bg-red-50"
                                                                                        onClick={() => setDeleteId(row.id!)}
                                                                                    >
                                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                                    </Button>
                                                                                </>
                                                                            ) : (
                                                                                <span className="text-xs text-muted-foreground italic">—</span>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </BlurFade>

            <Dialog open={!!editRow} onOpenChange={open => !open && setEditRow(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Edit — {editRow?.materi_pengaduan}
                            <Badge variant="outline" className="ml-2">{editRow?.tahun}</Badge>
                        </DialogTitle>
                    </DialogHeader>
                    {editRow && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-6 gap-2">
                                {BULAN_SHORT.map(b => (
                                    <div key={b} className="space-y-1">
                                        <Label className="text-xs font-medium">{BULAN_LABEL[b]}</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={editRow[b] ?? 0}
                                            onChange={e => setEditRow(prev => prev ? { ...prev, [b]: parseInt(e.target.value) || 0 } : null)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Laporan Diproses</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editRow.laporan_proses ?? 0}
                                        onChange={e => setEditRow(prev => prev ? { ...prev, laporan_proses: parseInt(e.target.value) || 0 } : null)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Sisa</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editRow.sisa ?? 0}
                                        onChange={e => setEditRow(prev => prev ? { ...prev, sisa: parseInt(e.target.value) || 0 } : null)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setEditRow(null)}>Batal</Button>
                        <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveEdit}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <MagicDeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        description="Apakah Anda yakin ingin menghapus data ini? Tindakan tidak dapat dibatalkan."
      />

            <Dialog open={addTahunOpen} onOpenChange={setAddTahunOpen}>
                <DialogContent className="max-w-sm">
                    <DialogTitle>Tambah Tahun Baru</DialogTitle>
                    <div className="space-y-3 pt-2">
                        <p className="text-sm text-muted-foreground">
                            Akan menambahkan 7 baris data untuk tahun yang dipilih.
                        </p>
                        <div className="space-y-1">
                            <Label>Tahun</Label>
                            <Select value={addTahun} onValueChange={setAddTahun}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 5 - i).map(y => (
                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setAddTahunOpen(false)}>Batal</Button>
                        <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleAddTahun} disabled={addingTahun}>
                            {addingTahun ? 'Menambahkan...' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
