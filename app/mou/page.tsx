'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllMou, deleteMou, updateMou, type Mou } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Edit, PlusCircle, ExternalLink, Handshake } from 'lucide-react';

// Helper: Format tanggal ke format Indonesia (DD-MM-YYYY)
function formatTanggal(dateStr?: string | null) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Helper: Badge status dengan warna yang sesuai
function getStatusBadge(status?: string, sisaHari?: number | null) {
    switch (status) {
        case 'aktif':
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Aktif{sisaHari !== null && sisaHari !== undefined ? ` (${sisaHari} hari)` : ''}
                </Badge>
            );
        case 'kadaluarsa':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Kadaluarsa</Badge>;
        default:
            return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
}

export default function MouList() {
    const router = useRouter();
    const { toast } = useToast();

    const [data, setData] = useState<Mou[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>(String(new Date().getFullYear()));
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const tahun = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
            const result = await getAllMou(tahun);
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
            const result = await deleteMou(deleteId);
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

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Handshake className="h-8 w-8" /> MOU
                        </h2>
                        <p className="text-muted-foreground">Daftar Memorandum of Understanding (MOU) Pengadilan Agama Penajam.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Refresh
                        </Button>
                        <Button size="sm" className="gap-1" onClick={() => router.push('/mou/tambah')}>
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
                                {getYearOptions(2018).map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                {filterTahun !== 'all'
                                    ? `Belum ada data MOU untuk tahun ${filterTahun}.`
                                    : 'Belum ada data MOU. Klik tombol Tambah untuk menambahkan data baru.'}
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px] text-center">No</TableHead>
                                            <TableHead className="w-[120px]">Tanggal</TableHead>
                                            <TableHead>Instansi</TableHead>
                                            <TableHead className="max-w-[250px]">Tentang</TableHead>
                                            <TableHead className="w-[140px]">Status</TableHead>
                                            <TableHead className="w-[100px]">Dokumen</TableHead>
                                            <TableHead className="w-[120px] text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.map((row, idx) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="text-center text-sm">{idx + 1}</TableCell>
                                                <TableCell className="text-sm">{formatTanggal(row.tanggal)}</TableCell>
                                                <TableCell className="font-medium text-sm">{row.instansi}</TableCell>
                                                <TableCell className="text-sm max-w-[250px] truncate" title={row.tentang}>
                                                    {row.tentang}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(row.status, row.sisa_hari)}</TableCell>
                                                <TableCell>
                                                    {row.link_dokumen ? (
                                                        <a
                                                            href={row.link_dokumen}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                        >
                                                            Dokumen <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 hover:text-blue-600"
                                                            onClick={() => router.push(`/mou/${row.id}/edit`)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => setDeleteId(row.id!)}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </BlurFade>

            {/* Dialog Konfirmasi Hapus */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data MOU ini? Tindakan tidak dapat dibatalkan.
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
