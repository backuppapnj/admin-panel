'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteAgenda, getAllAgenda, type AgendaPimpinan } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BlurFade } from '@/components/ui/blur-fade';
import { CalendarDays, Edit, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';

function formatTanggalISO(iso: string | undefined) {
  if (!iso) return '-';
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return iso;

  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function truncateText(text: string, max = 140) {
  const s = String(text || '').trim();
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + '...';
}

export default function AgendaList() {
  const { toast } = useToast();
  const [data, setData] = useState<AgendaPimpinan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTahun, setFilterTahun] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const year = filterTahun !== 'all' ? parseInt(filterTahun) : undefined;
      const result = await getAllAgenda(year, undefined, page);

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
    loadData(1);
  }, [filterTahun]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const result = await deleteAgenda(deleteId);
      if (result.success) {
        toast({ title: 'Sukses', description: 'Agenda berhasil dihapus!' });
        setDeleteId(null);
        await loadData(pagination.current_page);
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan saat menghapus data.' });
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
            <PaginationLink isActive={current_page === i} onClick={() => loadData(i)} className="cursor-pointer">
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
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarDays className="h-7 w-7 text-red-600" /> Agenda Pimpinan
            </h2>
            <p className="text-muted-foreground">Kelola agenda pimpinan yang ditampilkan di website.</p>
          </div>
          <Link href="/agenda/tambah">
            <Button className="bg-red-600 hover:bg-red-700 shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Agenda
            </Button>
          </Link>
        </div>
      </BlurFade>

      <BlurFade delay={0.2} inView>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Data Agenda</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterTahun} onValueChange={setFilterTahun}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {getYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => loadData(pagination.current_page)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-[50px] text-center">No</TableHead>
                    <TableHead className="w-[200px]">Tanggal</TableHead>
                    <TableHead>Agenda</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[520px]" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20 float-right" /></TableCell>
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Tidak ada agenda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{(pagination.current_page - 1) * 10 + idx + 1}</TableCell>
                        <TableCell className="font-medium">{formatTanggalISO(item.tanggal_agenda)}</TableCell>
                        <TableCell className="text-muted-foreground">{truncateText(item.isi_agenda)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/agenda/${item.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteId(item.id!)}
                              disabled={!item.id}
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
                          if (pagination.current_page > 1) loadData(pagination.current_page - 1);
                        }}
                        className={pagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                        className={pagination.current_page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus agenda ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}