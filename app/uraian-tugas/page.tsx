'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    getAllUraianTugas,
    deleteUraianTugas,
    getAllKelompokJabatan,
    createKelompokJabatan,
    updateKelompokJabatan,
    deleteKelompokJabatan,
    getAllJenisPegawai,
    createJenisPegawai,
    updateJenisPegawai,
    deleteJenisPegawai,
    type UraianTugas,
    type KelompokJabatan,
    type JenisPegawai,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { BlurFade } from '@/components/ui/blur-fade';
import {
    PlusCircle, RefreshCw, Trash2, Edit, ExternalLink, Settings2,
    Search, Users2, GripVertical,
} from 'lucide-react';

// Warna badge jenis pegawai (fallback default)
const defaultJenisColor = 'bg-slate-100 text-slate-700';

export default function UraianTugasPage() {
    const [data, setData] = useState<UraianTugas[]>([]);
    const [kelompokList, setKelompokList] = useState<KelompokJabatan[]>([]);
    const [jenisList, setJenisList] = useState<JenisPegawai[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterKelompok, setFilterKelompok] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { toast } = useToast();

    // State Sheet kelola kelompok
    const [sheetOpen, setSheetOpen] = useState(false);
    const [kelompokForm, setKelompokForm] = useState<Partial<KelompokJabatan>>({ nama_kelompok: '', urutan: 0 });

    // State Sheet kelola jenis pegawai
    const [jenisSheetOpen, setJenisSheetOpen] = useState(false);
    const [jenisForm, setJenisForm] = useState<Partial<JenisPegawai>>({ nama: '', urutan: 0 });
    const [editJenisId, setEditJenisId] = useState<number | null>(null);
    const [savingJenis, setSavingJenis] = useState(false);
    const [deleteJenisId, setDeleteJenisId] = useState<number | null>(null);
    const [editKelompokId, setEditKelompokId] = useState<number | null>(null);
    const [savingKelompok, setSavingKelompok] = useState(false);
    const [deleteKelompokId, setDeleteKelompokId] = useState<number | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const kelompokId = (filterKelompok && filterKelompok !== 'all') ? parseInt(filterKelompok) : undefined;
            const q = searchQuery.trim() || undefined;
            const [tugasResult, kelompokResult, jenisResult] = await Promise.all([
                getAllUraianTugas(kelompokId, q),
                getAllKelompokJabatan(),
                getAllJenisPegawai(),
            ]);
            if (tugasResult.success) setData(tugasResult.data || []);
            if (kelompokResult.success) setKelompokList(kelompokResult.data || []);
            if (jenisResult.success) setJenisList(jenisResult.data || []);
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [filterKelompok]);

    useEffect(() => {
        const timer = setTimeout(() => loadData(), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ---- Hapus pegawai ----
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteUraianTugas(deleteId);
            toast({ title: 'Sukses', description: 'Data berhasil dihapus!' });
            setDeleteId(null);
            loadData();
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat menghapus data.' });
        }
    };

    // ---- Kelola Kelompok ----
    const resetKelompokForm = () => {
        setKelompokForm({ nama_kelompok: '', urutan: 0 });
        setEditKelompokId(null);
    };

    const handleSaveKelompok = async () => {
        if (!kelompokForm.nama_kelompok?.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nama kelompok wajib diisi.' });
            return;
        }
        setSavingKelompok(true);
        try {
            const result = editKelompokId
                ? await updateKelompokJabatan(editKelompokId, kelompokForm)
                : await createKelompokJabatan(kelompokForm);

            if (result.success) {
                toast({ title: 'Sukses', description: editKelompokId ? 'Kelompok diperbarui!' : 'Kelompok ditambahkan!' });
                resetKelompokForm();
                const kelompokResult = await getAllKelompokJabatan();
                if (kelompokResult.success) setKelompokList(kelompokResult.data || []);
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan.' });
        }
        setSavingKelompok(false);
    };

    const handleDeleteKelompok = async () => {
        if (!deleteKelompokId) return;
        try {
            const result = await deleteKelompokJabatan(deleteKelompokId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Kelompok berhasil dihapus!' });
                setDeleteKelompokId(null);
                const kelompokResult = await getAllKelompokJabatan();
                if (kelompokResult.success) setKelompokList(kelompokResult.data || []);
                if (filterKelompok === String(deleteKelompokId)) setFilterKelompok('all');
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Tidak dapat menghapus kelompok.' });
                setDeleteKelompokId(null);
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan.' });
        }
    };

    // ---- Kelola Jenis Pegawai ----
    const resetJenisForm = () => {
        setJenisForm({ nama: '', urutan: 0 });
        setEditJenisId(null);
    };

    const handleSaveJenis = async () => {
        if (!jenisForm.nama?.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nama jenis pegawai wajib diisi.' });
            return;
        }
        setSavingJenis(true);
        try {
            const result = editJenisId
                ? await updateJenisPegawai(editJenisId, jenisForm)
                : await createJenisPegawai(jenisForm);
            if (result.success) {
                toast({ title: 'Sukses', description: editJenisId ? 'Jenis pegawai diperbarui!' : 'Jenis pegawai ditambahkan!' });
                resetJenisForm();
                const jenisResult = await getAllJenisPegawai();
                if (jenisResult.success) setJenisList(jenisResult.data || []);
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Terjadi kesalahan.' });
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan.' });
        }
        setSavingJenis(false);
    };

    const handleDeleteJenis = async () => {
        if (!deleteJenisId) return;
        try {
            const result = await deleteJenisPegawai(deleteJenisId);
            if (result.success) {
                toast({ title: 'Sukses', description: 'Jenis pegawai berhasil dihapus!' });
                setDeleteJenisId(null);
                const jenisResult = await getAllJenisPegawai();
                if (jenisResult.success) setJenisList(jenisResult.data || []);
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Tidak dapat menghapus jenis pegawai.' });
                setDeleteJenisId(null);
            }
        } catch {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan.' });
        }
    };

    return (
        <div className="space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Uraian Tugas</h2>
                        <p className="text-muted-foreground">Kelola data pegawai dan uraian tugas jabatan.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={() => setSheetOpen(true)}>
                            <Settings2 className="mr-2 h-4 w-4" /> Kelola Kelompok
                        </Button>
                        <Button variant="outline" onClick={() => setJenisSheetOpen(true)}>
                            <Users2 className="mr-2 h-4 w-4" /> Kelola Jenis Pegawai
                        </Button>
                        <Link href="/uraian-tugas/tambah">
                            <Button className="bg-teal-600 hover:bg-teal-700 shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pegawai
                            </Button>
                        </Link>
                    </div>
                </div>
            </BlurFade>

            {/* Filter & Search */}
            <BlurFade delay={0.15} inView>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Cari nama, jabatan, atau NIP..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filterKelompok} onValueChange={setFilterKelompok}>
                        <SelectTrigger className="w-full md:w-56">
                            <SelectValue placeholder="Semua Kelompok" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kelompok</SelectItem>
                            {kelompokList.map(k => (
                                <SelectItem key={k.id} value={String(k.id)}>{k.nama_kelompok}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={loadData} size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </BlurFade>

            {/* Tabel Data */}
            <BlurFade delay={0.2} inView>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Daftar Pegawai
                            {!loading && <span className="ml-2 text-sm font-normal text-muted-foreground">({data.length} data)</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">Belum ada data pegawai.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-8">#</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Jabatan</TableHead>
                                            <TableHead>Kelompok</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>NIP</TableHead>
                                            <TableHead className="text-center">Dokumen</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.map((item, idx) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                                                <TableCell className="font-medium">
                                                    {item.nama || <span className="text-muted-foreground italic">—</span>}
                                                </TableCell>
                                                <TableCell>{item.jabatan}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {item.kelompok_jabatan?.nama_kelompok || '—'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {item.jenis_pegawai ? (
                                                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${defaultJenisColor}`}>
                                                            {item.jenis_pegawai.nama}
                                                        </span>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{item.nip || '—'}</TableCell>
                                                <TableCell className="text-center">
                                                    {item.link_dokumen ? (
                                                        <a href={item.link_dokumen} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="ghost" size="sm">
                                                                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Lihat
                                                            </Button>
                                                        </a>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={`/uraian-tugas/${item.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
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

            {/* Dialog Hapus Pegawai */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Pegawai?</AlertDialogTitle>
                        <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog Hapus Kelompok */}
            <AlertDialog open={!!deleteKelompokId} onOpenChange={() => setDeleteKelompokId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kelompok Jabatan?</AlertDialogTitle>
                        <AlertDialogDescription>Kelompok hanya bisa dihapus jika tidak ada pegawai di dalamnya.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteKelompok} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog Hapus Jenis Pegawai */}
            <AlertDialog open={!!deleteJenisId} onOpenChange={() => setDeleteJenisId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Jenis Pegawai?</AlertDialogTitle>
                        <AlertDialogDescription>Jenis pegawai hanya bisa dihapus jika tidak ada pegawai yang menggunakannya.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteJenis} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Sheet Kelola Kelompok */}
            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) resetKelompokForm(); }}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Kelola Kelompok Jabatan</SheetTitle>
                        <SheetDescription>Tambah, edit, atau hapus kelompok jabatan untuk pengelompokan pegawai.</SheetDescription>
                    </SheetHeader>

                    {/* Form tambah/edit kelompok */}
                    <div className="mt-6 space-y-4 border rounded-lg p-4 bg-muted/30">
                        <h4 className="font-semibold text-sm">
                            {editKelompokId ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}
                        </h4>
                        <div className="space-y-2">
                            <Label>Nama Kelompok <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Contoh: Pimpinan, Kepaniteraan..."
                                value={kelompokForm.nama_kelompok || ''}
                                onChange={e => setKelompokForm(prev => ({ ...prev, nama_kelompok: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Urutan Tampil</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={kelompokForm.urutan ?? 0}
                                onChange={e => setKelompokForm(prev => ({ ...prev, urutan: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                onClick={handleSaveKelompok}
                                disabled={savingKelompok}
                            >
                                {savingKelompok ? 'Menyimpan...' : editKelompokId ? 'Simpan Perubahan' : 'Tambah'}
                            </Button>
                            {editKelompokId && (
                                <Button variant="outline" onClick={resetKelompokForm}>Batal</Button>
                            )}
                        </div>
                    </div>

                    {/* Daftar kelompok yang ada */}
                    <div className="mt-6 space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                            Daftar Kelompok ({kelompokList.length})
                        </h4>
                        {kelompokList.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">Belum ada kelompok jabatan.</p>
                        ) : (
                            kelompokList.map(k => (
                                <div key={k.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{k.nama_kelompok}</p>
                                            <p className="text-xs text-muted-foreground">Urutan: {k.urutan}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditKelompokId(k.id);
                                                setKelompokForm({ nama_kelompok: k.nama_kelompok, urutan: k.urutan });
                                            }}
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteKelompokId(k.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Sheet Kelola Jenis Pegawai */}
            <Sheet open={jenisSheetOpen} onOpenChange={(open) => { setJenisSheetOpen(open); if (!open) resetJenisForm(); }}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Kelola Jenis Pegawai</SheetTitle>
                        <SheetDescription>Tambah, edit, atau hapus jenis pegawai (contoh: PNS, PPNPN, CASN).</SheetDescription>
                    </SheetHeader>

                    {/* Form tambah/edit jenis pegawai */}
                    <div className="mt-6 space-y-4 border rounded-lg p-4 bg-muted/30">
                        <h4 className="font-semibold text-sm">
                            {editJenisId ? 'Edit Jenis Pegawai' : 'Tambah Jenis Baru'}
                        </h4>
                        <div className="space-y-2">
                            <Label>Nama Jenis Pegawai <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Contoh: PNS, PPNPN, CASN..."
                                value={jenisForm.nama || ''}
                                onChange={e => setJenisForm(prev => ({ ...prev, nama: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Urutan Tampil</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={jenisForm.urutan ?? 0}
                                onChange={e => setJenisForm(prev => ({ ...prev, urutan: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                className="flex-1 bg-teal-600 hover:bg-teal-700"
                                onClick={handleSaveJenis}
                                disabled={savingJenis}
                            >
                                {savingJenis ? 'Menyimpan...' : editJenisId ? 'Simpan Perubahan' : 'Tambah'}
                            </Button>
                            {editJenisId && (
                                <Button variant="outline" onClick={resetJenisForm}>Batal</Button>
                            )}
                        </div>
                    </div>

                    {/* Daftar jenis pegawai */}
                    <div className="mt-6 space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                            Daftar Jenis Pegawai ({jenisList.length})
                        </h4>
                        {jenisList.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">Belum ada jenis pegawai.</p>
                        ) : (
                            jenisList.map(j => (
                                <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                    <div>
                                        <p className="text-sm font-medium">{j.nama}</p>
                                        <p className="text-xs text-muted-foreground">Urutan: {j.urutan}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditJenisId(j.id);
                                                setJenisForm({ nama: j.nama, urutan: j.urutan });
                                            }}
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteJenisId(j.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                        </Button>
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
