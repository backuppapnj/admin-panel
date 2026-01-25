'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllPanggilanEcourt, deletePanggilanEcourt, type PanggilanEcourt } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, FileText, MonitorPlay } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function PanggilanEcourtPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [data, setData] = useState<PanggilanEcourt[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Delete Dialog State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        fetchData(year, currentPage);
    }, [year, currentPage]);

    const fetchData = async (selectedYear: number, page: number) => {
        setLoading(true);
        try {
            const result = await getAllPanggilanEcourt(selectedYear, page);
            if (result.success && result.data) {
                setData(result.data);
                setTotalPages(result.last_page || 1);
                setTotalItems(result.total || 0);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Gagal memuat data dari server.",
            });
        }
        setLoading(false);
    };

    const handleYearChange = (value: string) => {
        setYear(parseInt(value));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await deletePanggilanEcourt(deleteId);
                toast({
                    title: "Sukses",
                    description: "Data berhasil dihapus.",
                });
                fetchData(year, currentPage);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Gagal",
                    description: "Gagal menghapus data.",
                });
            }
        }
        setOpenDeleteDialog(false);
    };

    // Client-side filtering for specific search (jika API belum support search query)
    // Idealnya search dilakukan di server-side jika data besar.
    // Untuk saat ini kita filter data page yang aktif saja atau server-side search jika diimplementasikan.
    // Kita gunakan mixed approach: Filter yang tampil.
    const filteredData = data.filter(item =>
        item.nama_dipanggil.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomor_perkara.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Panggilan e-Court</h2>
                    <p className="text-muted-foreground">Kelola data panggilan sidang elektronik.</p>
                </div>
                <Link href="/panggilan-ecourt/tambah">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Data
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-background p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={year.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {getYearOptions().map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama atau nomor perkara..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center">No</TableHead>
                            <TableHead>Nomor Perkara</TableHead>
                            <TableHead>Nama Dipanggil</TableHead>
                            <TableHead>Panggilan 1</TableHead>
                            <TableHead>Panggilan 2</TableHead>
                            <TableHead>Panggilan 3</TableHead>
                            <TableHead>Tanggal Sidang</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <span className="animate-spin">⏳</span> Memuat data...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    Tidak ada data ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-center">
                                        {(currentPage - 1) * 10 + index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-blue-600">
                                        {item.nomor_perkara}
                                    </TableCell>
                                    <TableCell>{item.nama_dipanggil}</TableCell>
                                    <TableCell>{item.panggilan_1 ? new Date(item.panggilan_1).toLocaleDateString('id-ID') : '-'}</TableCell>
                                    <TableCell>{item.panggilan_2 ? new Date(item.panggilan_2).toLocaleDateString('id-ID') : '-'}</TableCell>
                                    <TableCell>{item.panggilan_3 ? new Date(item.panggilan_3).toLocaleDateString('id-ID') : '-'}</TableCell>
                                    <TableCell className="font-semibold text-green-600">
                                        {item.tanggal_sidang ? new Date(item.tanggal_sidang).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        }) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {item.link_surat ? (
                                            <a href={item.link_surat} target="_blank" rel="noopener noreferrer">
                                                <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">
                                                    <FileText className="h-3 w-3 mr-1" /> Lihat
                                                </Badge>
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/panggilan-ecourt/${item.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500"
                                                onClick={() => item.id && handleDeleteClick(item.id)}
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

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        {/* Simple Pagination Logic for brevity */}
                        <PaginationItem>
                            <span className="flex items-center justify-center px-4 text-sm font-medium">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
