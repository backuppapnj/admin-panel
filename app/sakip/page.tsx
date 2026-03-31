'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllSakip, deleteSakip, JENIS_DOKUMEN_SAKIP, type Sakip } from '@/lib/api';
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
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, RefreshCw, Trash2, Edit, ExternalLink } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

export default function SakipList() {
    const [data, setData] = useState<Sakip[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTahun, setFilterTahun] = useState<string>('all');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { toast } = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            const tahun = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
            const result = await getAllSakip(tahun);
            if (result.success && result.data) {
                setData(result.data);
            } else {
                setData([]);
            }
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal memuat data. Pastikan API terhubung.',
            });
            setData([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [filterTahun]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const result = await deleteSakip(deleteId);
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



    const tahunList = [...new Set(data.map(d => d.tahun))].sort((a, b) => b - a);

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                    <div>
                        <h2 className='text-3xl font-bold tracking-tight'>SAKIP</h2>
                        <p className='text-muted-foreground'>Sistem Akuntabilitas Kinerja Instansi Pemerintahan.</p>
                    </div>
                    <Link href='/sakip/tambah'>
                        <Button className='bg-indigo-600 hover:bg-indigo-700 shadow-md'>
                            <PlusCircle className='mr-2 h-4 w-4' /> Tambah Data
                        </Button>
                    </Link>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader className='space-y-4 pb-4'>
                        <div className='flex flex-row items-center justify-between'>
                            <CardTitle className='text-lg font-medium'>Daftar Dokumen SAKIP</CardTitle>
                            <Button variant='outline' size='icon' onClick={loadData}>
                                <RefreshCw className='h-4 w-4' />
                            </Button>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                                <SelectTrigger className='w-[180px]'>
                                    <SelectValue placeholder='Semua Tahun' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>Semua Tahun</SelectItem>
                                    {getYearOptions(2019).map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className='space-y-2'>
                                {[1, 2, 3].map(i => <Skeleton key={i} className='h-12 w-full' />)}
                            </div>
                        ) : data.length === 0 ? (
                            <div className='text-center py-12 text-muted-foreground'>
                                {filterTahun !== 'all'
                                    ? `Belum ada data SAKIP untuk tahun ${filterTahun}.`
                                    : 'Belum ada data SAKIP. Klik "Tambah Data" untuk memulai.'}
                            </div>
                        ) : (
                            <div className='space-y-6'>
                                {(filterTahun !== 'all' ? [parseInt(filterTahun)] : tahunList).map(thn => (
                                    <div key={thn}>
                                        <h3 className='text-sm font-bold text-indigo-700 mb-2 uppercase tracking-wide'>
                                            Tahun {thn}
                                        </h3>
                                        <div className='rounded-md border'>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className='w-[45px] text-center'>No</TableHead>
                                                        <TableHead>Jenis Dokumen</TableHead>
                                                        <TableHead>Uraian</TableHead>
                                                        <TableHead className='text-center w-[100px]'>Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {JENIS_DOKUMEN_SAKIP.map((jenis, idx) => {
                                                        const row = data.find(d => d.tahun === thn && d.jenis_dokumen === jenis);
                                                        return (
                                                            <TableRow key={jenis} className={!row ? 'opacity-50' : ''}>
                                                                <TableCell className='text-center'>{idx + 1}</TableCell>
                                                                <TableCell className='font-medium text-indigo-700 max-w-[200px]'>
                                                                    {jenis}
                                                                </TableCell>
                                                                <TableCell className='text-muted-foreground max-w-[400px]'>
                                                                    {row?.uraian || <span className='italic text-xs'>—</span>}
                                                                </TableCell>
                                                                <TableCell className='text-center'>
                                                                    <div className='flex justify-center gap-1'>
                                                                        {row?.link_dokumen ? (
                                                                            <a
                                                                                href={row.link_dokumen}
                                                                                target='_blank'
                                                                                rel='noopener noreferrer'
                                                                                className='inline-flex items-center justify-center h-8 w-8 hover:text-indigo-600'
                                                                                title='Lihat Dokumen'
                                                                            >
                                                                                <ExternalLink className='h-4 w-4' />
                                                                            </a>
                                                                        ) : (
                                                                            <span className='inline-flex items-center justify-center h-8 w-8 text-muted-foreground text-xs' title='Dokumen belum ada'>—</span>
                                                                        )}
                                                                        {row ? (
                                                                            <>
                                                                                <Link href={`/sakip/${row.id}/edit`}>
                                                                                    <Button variant='ghost' size='icon' className='h-8 w-8 hover:text-blue-600'>
                                                                                        <Edit className='h-4 w-4' />
                                                                                    </Button>
                                                                                </Link>
                                                                                <Button
                                                                                    variant='ghost'
                                                                                    size='icon'
                                                                                    className='h-8 w-8 hover:text-red-600 hover:bg-red-50'
                                                                                    onClick={() => setDeleteId(row.id!)}
                                                                                >
                                                                                    <Trash2 className='h-4 w-4' />
                                                                                </Button>
                                                                            </>
                                                                        ) : (
                                                                            <Link href={`/sakip/tambah?tahun=${thn}&jenis=${encodeURIComponent(jenis)}`}>
                                                                                <Button variant='ghost' size='icon' className='h-8 w-8 hover:text-green-600' title='Tambah dokumen'>
                                                                                    <PlusCircle className='h-4 w-4' />
                                                                                </Button>
                                                                            </Link>
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
                                ))}
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
                            className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
                        >
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
