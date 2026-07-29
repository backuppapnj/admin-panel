'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStandarPelayananById, deleteStandarPelayanan, type StandarPelayanan } from '@/lib/api';
import { MagicDeleteDialog } from '@/components/custom/magic-delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft, Edit, Trash2, ShieldCheck, Clock, Banknote,
    ListChecks, BookOpen, Workflow, Package, Wrench, MessageSquare,
    CheckCircle2, XCircle, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

const JENIS_COLORS: Record<string, string> = {
    'Pendaftaran Perkara': 'bg-violet-100 text-violet-700 border-violet-200',
    'Pengambilan Produk Pengadilan': 'bg-blue-100 text-blue-700 border-blue-200',
    'Layanan Informasi Perkara': 'bg-sky-100 text-sky-700 border-sky-200',
    'Mediasi': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Bantuan Hukum (Posbakum)': 'bg-orange-100 text-orange-700 border-orange-200',
    'Layanan e-Court': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Layanan Sidang Keliling / Pelayanan Terpadu': 'bg-pink-100 text-pink-700 border-pink-200',
    'Legalisasi Dokumen': 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function DetailStandarPelayananPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();

    const [data, setData] = useState<StandarPelayanan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const id = parseInt(params.id);
        if (!id) { setError('ID tidak valid.'); setLoading(false); return; }

        getStandarPelayananById(id).then(result => {
            if (result.success && result.data) {
                setData(result.data);
            } else {
                setError(result.message || 'Data tidak ditemukan.');
            }
        }).catch(() => setError('Gagal memuat data.')).finally(() => setLoading(false));
    }, [params.id]);

    const handleDelete = async () => {
        if (!data?.id) return;
        setIsDeleting(true);
        try {
            const result = await deleteStandarPelayanan(data.id);
            if (result.success) {
                toast({ title: 'Berhasil', description: 'Standar pelayanan berhasil dihapus.' });
                router.push('/standar-pelayanan');
            } else {
                toast({ title: 'Gagal', description: result.message || 'Terjadi kesalahan.', variant: 'destructive' });
                setShowDelete(false);
            }
        } catch {
            toast({ title: 'Error', description: 'Terjadi kesalahan server.', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-4">
                <Skeleton className="h-12 w-80" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Card className="border-red-200">
                    <CardContent className="flex items-center gap-3 p-6 text-red-600">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>{error ?? 'Data tidak ditemukan.'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <MagicDeleteDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Hapus Standar Pelayanan"
                description={`Yakin hapus standar pelayanan "${data.jenis_layanan}"? Tindakan ini tidak dapat dibatalkan.`}
            />

            {/* Header */}
            <BlurFade delay={0.1} inView>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Link href="/standar-pelayanan">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-900/20">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold tracking-tight">Detail Standar Pelayanan</h1>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${JENIS_COLORS[data.jenis_layanan] ?? 'bg-gray-100 text-gray-700'}`}
                                    >
                                        {data.jenis_layanan}
                                    </Badge>
                                    {data.published ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Aktif
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs gap-1">
                                            <XCircle className="h-3 w-3" /> Draft
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/standar-pelayanan/${data.id}/edit`}>
                            <Button id="edit-button" variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                                <Edit className="h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button
                            id="delete-button"
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => setShowDelete(true)}
                        >
                            <Trash2 className="h-4 w-4" /> Hapus
                        </Button>
                    </div>
                </div>
            </BlurFade>

            {/* Info Grid */}
            <BlurFade delay={0.15} inView>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-teal-100 bg-gradient-to-br from-teal-50 to-white">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
                                <Clock className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Waktu Penyelesaian</p>
                                <p className="font-bold text-sm mt-0.5">{data.waktu_penyelesaian || '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                                <Banknote className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Biaya / Tarif</p>
                                <p className="font-bold text-sm mt-0.5">{data.biaya_tarif || '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                <ListChecks className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Persyaratan</p>
                                <p className="font-bold text-sm mt-0.5">{data.persyaratan?.length ?? 0} Item</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </BlurFade>

            {/* Dasar Hukum */}
            {data.dasar_hukum && data.dasar_hukum.length > 0 && (
                <BlurFade delay={0.2} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-teal-600" />
                                Dasar Hukum
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-2">
                                {data.dasar_hukum.map((hk, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm leading-relaxed">{hk}</span>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </BlurFade>
            )}

            {/* Persyaratan */}
            {data.persyaratan && data.persyaratan.length > 0 && (
                <BlurFade delay={0.25} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-teal-600" />
                                Persyaratan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {data.persyaratan.map((syarat, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                                        <span className="text-sm leading-relaxed">{syarat}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </BlurFade>
            )}

            {/* Prosedur */}
            {data.prosedur && data.prosedur.length > 0 && (
                <BlurFade delay={0.3} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Workflow className="h-4 w-4 text-teal-600" />
                                Prosedur Layanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.prosedur.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex flex-col items-center shrink-0">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-xs font-bold shadow-sm shadow-teal-200">
                                                {i + 1}
                                            </span>
                                            {i < data.prosedur!.length - 1 && (
                                                <div className="w-0.5 h-4 bg-teal-200 mt-1" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <p className="text-sm leading-relaxed pt-1.5">{step}</p>
                                        </div>
                                        {i < data.prosedur!.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-teal-300 shrink-0 mt-2 hidden sm:block" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </BlurFade>
            )}

            {/* Produk & Sarana */}
            <BlurFade delay={0.35} inView>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.produk_layanan && data.produk_layanan.length > 0 && (
                        <Card className="border-teal-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4 text-teal-600" />
                                    Produk Layanan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {data.produk_layanan.map((p, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {data.sarana_prasarana && data.sarana_prasarana.length > 0 && (
                        <Card className="border-teal-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-teal-600" />
                                    Sarana & Prasarana
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-1.5">
                                    {data.sarana_prasarana.map((s, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </BlurFade>

            {/* Penanganan Pengaduan */}
            {data.penanganan_pengaduan && (
                <BlurFade delay={0.4} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-teal-600" />
                                Penanganan Pengaduan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                {data.penanganan_pengaduan}
                            </p>
                        </CardContent>
                    </Card>
                </BlurFade>
            )}

            {/* Meta */}
            <BlurFade delay={0.45} inView>
                <p className="text-xs text-muted-foreground text-center pb-4">
                    Urutan: {data.urutan ?? 0} · Dibuat: {data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '—'}
                    {data.updated_at && ` · Diperbarui: ${new Date(data.updated_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}`}
                </p>
            </BlurFade>
        </div>
    );
}
