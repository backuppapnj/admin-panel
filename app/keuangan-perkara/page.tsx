'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getAllKeuanganPerkara, deleteKeuanganPerkara, updateKeuanganPerkara,
    NAMA_BULAN_KEUANGAN, type KeuanganPerkara,
} from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Edit, PlusCircle, ExternalLink } from 'lucide-react';

function formatRupiah(val?: number | null) {
    if (val === null || val === undefined) return '—';
    return 'Rp ' + val.toLocaleString('id-ID');
}

export default function KeuanganPerkaraList() {
    const router = useRouter();
    const { toast } = useToast();

    const [data, setData] = useState<KeuanganPerkara[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>(String(new Date().getFullYear()));
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editRow, setEditRow] = useState<KeuanganPerkara | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const tahun = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
            const result = await getAllKeuanganPerkara(tahun);
            setData(result.success && result.data ? result.data : []);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
            setData([]);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [filterTahun]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const result = await deleteKeuanganPerkara(deleteId);
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

    const handleSaveEdit = async () => {
        if (!editRow?.id) return;
        try {
            const result = await updateKeuanganPerkara(editRow.id, {
                saldo_awal:  editRow.saldo_awal,
                penerimaan:  editRow.penerimaan,
                pengeluaran: editRow.pengeluaran,
                url_detail:  editRow.url_detail,
            });
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

    // Kelompokkan data berdasarkan tahun
    const tahunList = [...new Set(data.map(d => d.tahun))].sort((a, b) => b - a);
    const displayedYears = filterTahun !== 'all' ? [parseInt(filterTahun)] : tahunList;

    const getSaldoAwal = (tahun: number) =>
        data.find(d => d.tahun === tahun && d.bulan === 1)?.saldo_awal;

    const totalPenerimaan = (tahun: number) =>
        data.filter(d => d.tahun === tahun).reduce((s, d) => s + (d.penerimaan || 0), 0);

    const totalPengeluaran = (tahun: number) =>
        data.filter(d => d.tahun === tahun).reduce((s, d) => s + (d.pengeluaran || 0), 0);

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Keuangan Perkara</h2>
                        <p className="text-muted-foreground">Rekapitulasi penerimaan dan pengeluaran keuangan perkara.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Refresh
                        </Button>
                        <Button size="sm" className="gap-1" onClick={() => router.push('/keuangan-perkara/tambah')}>
                            <PlusCircle className="h-4 w-4" /> Tambah
                        </Button>
                    </div>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className="pb-4">
                        <Select value={filterTahun} onValueChange={setFilterTahun}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tahun</SelectItem>
                                {getYearOptions(2019).map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                {filterTahun !== 'all'
                                    ? `Belum ada data untuk tahun ${filterTahun}.`
                                    : 'Belum ada data. Jalankan seeder untuk mengisi data awal.'}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {displayedYears.map(thn => {
                                    const saldo = getSaldoAwal(thn);
                                    return (
                                        <div key={thn}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-sm font-bold uppercase tracking-wide text-blue-700">
                                                    Tahun {thn}
                                                </h3>
                                                {saldo !== undefined && saldo !== null && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Saldo Awal: {formatRupiah(saldo)}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="rounded-md border overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[40px] text-center">No</TableHead>
                                                            <TableHead>Bulan</TableHead>
                                                            <TableHead className="text-right">Penerimaan</TableHead>
                                                            <TableHead className="text-right">Pengeluaran</TableHead>
                                                            <TableHead className="text-center w-[80px]">Detail</TableHead>
                                                            <TableHead className="text-center w-[80px]">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {data
                                                            .filter(d => d.tahun === thn)
                                                            .sort((a, b) => a.bulan - b.bulan)
                                                            .map((row, idx) => (
                                                                <TableRow key={row.id}>
                                                                    <TableCell className="text-center text-xs">{idx + 1}</TableCell>
                                                                    <TableCell className="font-medium text-sm">
                                                                        {NAMA_BULAN_KEUANGAN[row.bulan]}
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-sm tabular-nums">
                                                                        {formatRupiah(row.penerimaan)}
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-sm tabular-nums">
                                                                        {formatRupiah(row.pengeluaran)}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        {row.url_detail ? (
                                                                            <a
                                                                                href={row.url_detail}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                                            >
                                                                                PDF <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                        ) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <div className="flex justify-center gap-1">
                                                                            <Button
                                                                                variant="ghost" size="icon"
                                                                                className="h-7 w-7 hover:text-blue-600"
                                                                                onClick={() => setEditRow({ ...row })}
                                                                            >
                                                                                <Edit className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost" size="icon"
                                                                                className="h-7 w-7 hover:text-red-600 hover:bg-red-50"
                                                                                onClick={() => setDeleteId(row.id!)}
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        {/* Baris total */}
                                                        <TableRow className="bg-muted/50 font-semibold">
                                                            <TableCell colSpan={2} className="text-right text-xs">Total</TableCell>
                                                            <TableCell className="text-right text-sm tabular-nums">{formatRupiah(totalPenerimaan(thn))}</TableCell>
                                                            <TableCell className="text-right text-sm tabular-nums">{formatRupiah(totalPengeluaran(thn))}</TableCell>
                                                            <TableCell colSpan={2} />
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </BlurFade>

            {/* Dialog Edit */}
            <Dialog open={!!editRow} onOpenChange={open => !open && setEditRow(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Edit — {editRow && NAMA_BULAN_KEUANGAN[editRow.bulan]}
                            <Badge variant="outline" className="ml-2">{editRow?.tahun}</Badge>
                        </DialogTitle>
                    </DialogHeader>
                    {editRow && (
                        <div className="space-y-4 pt-2">
                            {editRow.bulan === 1 && (
                                <div className="space-y-1">
                                    <Label>Saldo Awal Tahun (Rp)</Label>
                                    <Input
                                        type="number" min="0"
                                        value={editRow.saldo_awal ?? ''}
                                        onChange={e => setEditRow(p => p ? { ...p, saldo_awal: e.target.value ? parseInt(e.target.value) : null } : null)}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Penerimaan (Rp)</Label>
                                    <Input
                                        type="number" min="0"
                                        value={editRow.penerimaan ?? ''}
                                        onChange={e => setEditRow(p => p ? { ...p, penerimaan: e.target.value ? parseInt(e.target.value) : null } : null)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Pengeluaran (Rp)</Label>
                                    <Input
                                        type="number" min="0"
                                        value={editRow.pengeluaran ?? ''}
                                        onChange={e => setEditRow(p => p ? { ...p, pengeluaran: e.target.value ? parseInt(e.target.value) : null } : null)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>URL Detail (PDF)</Label>
                                <Input
                                    type="text"
                                    placeholder="https://... atau images/..."
                                    value={editRow.url_detail ?? ''}
                                    onChange={e => setEditRow(p => p ? { ...p, url_detail: e.target.value || null } : null)}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setEditRow(null)}>Batal</Button>
                        <Button onClick={handleSaveEdit}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Hapus */}
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
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
