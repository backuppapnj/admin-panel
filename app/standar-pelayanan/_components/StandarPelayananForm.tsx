'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createStandarPelayanan, updateStandarPelayanan, JENIS_LAYANAN_OPTIONS, type StandarPelayanan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Plus, Trash2, ArrowLeft, Save, Loader2, ShieldCheck,
    Clock, Banknote, ListChecks, BookOpen, Workflow, Package, Wrench, MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';

interface Props {
    initialData?: StandarPelayanan;
    mode: 'tambah' | 'edit';
}

type ArrayField = 'dasar_hukum' | 'persyaratan' | 'prosedur' | 'produk_layanan' | 'sarana_prasarana';

const EMPTY_FORM: Omit<StandarPelayanan, 'id' | 'created_at' | 'updated_at'> = {
    jenis_layanan: '',
    dasar_hukum: [''],
    persyaratan: [''],
    prosedur: [''],
    waktu_penyelesaian: '',
    biaya_tarif: '',
    produk_layanan: [''],
    sarana_prasarana: [''],
    penanganan_pengaduan: '',
    urutan: 0,
    published: true,
};

export default function StandarPelayananForm({ initialData, mode }: Props) {
    const router = useRouter();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        ...EMPTY_FORM,
        ...initialData,
        dasar_hukum: initialData?.dasar_hukum?.length ? initialData.dasar_hukum : [''],
        persyaratan: initialData?.persyaratan?.length ? initialData.persyaratan : [''],
        prosedur: initialData?.prosedur?.length ? initialData.prosedur : [''],
        produk_layanan: initialData?.produk_layanan?.length ? initialData.produk_layanan : [''],
        sarana_prasarana: initialData?.sarana_prasarana?.length ? initialData.sarana_prasarana : [''],
    });

    // ─── Array field helpers ───────────────────────────────────
    const updateArrayItem = useCallback((field: ArrayField, index: number, value: string) => {
        setForm(prev => {
            const arr = [...(prev[field] as string[])];
            arr[index] = value;
            return { ...prev, [field]: arr };
        });
    }, []);

    const addArrayItem = useCallback((field: ArrayField) => {
        setForm(prev => ({ ...prev, [field]: [...(prev[field] as string[]), ''] }));
    }, []);

    const removeArrayItem = useCallback((field: ArrayField, index: number) => {
        setForm(prev => {
            const arr = (prev[field] as string[]).filter((_, i) => i !== index);
            return { ...prev, [field]: arr.length ? arr : [''] };
        });
    }, []);

    // ─── Submit ────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.jenis_layanan) {
            toast({ title: 'Validasi', description: 'Jenis Layanan wajib dipilih.', variant: 'destructive' });
            return;
        }

        // Bersihkan array dari item kosong
        const cleanArray = (arr: string[]) => arr.filter(s => s.trim() !== '');

        const payload = {
            ...form,
            dasar_hukum: cleanArray(form.dasar_hukum as string[]),
            persyaratan: cleanArray(form.persyaratan as string[]),
            prosedur: cleanArray(form.prosedur as string[]),
            produk_layanan: cleanArray(form.produk_layanan as string[]),
            sarana_prasarana: cleanArray(form.sarana_prasarana as string[]),
        };

        setSaving(true);
        try {
            const result = mode === 'tambah'
                ? await createStandarPelayanan(payload)
                : await updateStandarPelayanan(initialData!.id!, payload);

            if (result.success) {
                toast({
                    title: 'Berhasil',
                    description: mode === 'tambah' ? 'Standar pelayanan berhasil ditambahkan.' : 'Standar pelayanan berhasil diperbarui.',
                });
                router.push('/standar-pelayanan');
                router.refresh();
            } else {
                toast({ title: 'Gagal', description: result.message || 'Terjadi kesalahan.', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Terjadi kesalahan server.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    // ─── Reusable dynamic list section ────────────────────────
    const DynamicList = ({
        field,
        label,
        placeholder,
        icon: Icon,
        numbered = false,
    }: {
        field: ArrayField;
        label: string;
        placeholder: string;
        icon: React.ElementType;
        numbered?: boolean;
    }) => (
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4 text-teal-600" />
                {label}
            </Label>
            <div className="space-y-2">
                {(form[field] as string[]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        {numbered && (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold mt-0.5">
                                {idx + 1}
                            </span>
                        )}
                        <Input
                            id={`${field}-${idx}`}
                            value={item}
                            onChange={e => updateArrayItem(field, idx, e.target.value)}
                            placeholder={`${placeholder} ${idx + 1}`}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => removeArrayItem(field, idx)}
                            disabled={(form[field] as string[]).length <= 1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-teal-600 border-teal-200 hover:bg-teal-50 hover:border-teal-300"
                    onClick={() => addArrayItem(field)}
                >
                    <Plus className="h-3.5 w-3.5" /> Tambah {label}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <BlurFade delay={0.1} inView>
                <div className="flex items-center gap-4">
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
                            <h1 className="text-2xl font-bold tracking-tight">
                                {mode === 'tambah' ? 'Tambah Standar Pelayanan' : 'Edit Standar Pelayanan'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {mode === 'tambah' ? 'Isi formulir berikut untuk menambah standar pelayanan baru.' : 'Perbarui informasi standar pelayanan.'}
                            </p>
                        </div>
                    </div>
                </div>
            </BlurFade>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identitas Layanan */}
                <BlurFade delay={0.15} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-teal-500" />
                                Identitas Layanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="jenis_layanan" className="font-semibold">
                                        Jenis Layanan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={form.jenis_layanan}
                                        onValueChange={v => setForm(p => ({ ...p, jenis_layanan: v }))}
                                    >
                                        <SelectTrigger id="jenis_layanan">
                                            <SelectValue placeholder="Pilih jenis layanan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {JENIS_LAYANAN_OPTIONS.map(j => (
                                                <SelectItem key={j} value={j}>{j}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="waktu_penyelesaian" className="flex items-center gap-2 font-semibold">
                                        <Clock className="h-4 w-4 text-teal-600" /> Waktu Penyelesaian
                                    </Label>
                                    <Input
                                        id="waktu_penyelesaian"
                                        placeholder="Contoh: 1 Hari Kerja"
                                        value={form.waktu_penyelesaian ?? ''}
                                        onChange={e => setForm(p => ({ ...p, waktu_penyelesaian: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="biaya_tarif" className="flex items-center gap-2 font-semibold">
                                        <Banknote className="h-4 w-4 text-teal-600" /> Biaya / Tarif
                                    </Label>
                                    <Input
                                        id="biaya_tarif"
                                        placeholder="Contoh: Gratis / Sesuai Panjar Perkara"
                                        value={form.biaya_tarif ?? ''}
                                        onChange={e => setForm(p => ({ ...p, biaya_tarif: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="urutan" className="font-semibold">Urutan Tampil</Label>
                                    <Input
                                        id="urutan"
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        value={form.urutan ?? 0}
                                        onChange={e => setForm(p => ({ ...p, urutan: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-semibold">Status Publikasi</Label>
                                    <div className="flex items-center gap-3 pt-1">
                                        <input
                                            id="published"
                                            type="checkbox"
                                            checked={form.published ?? true}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, published: e.target.checked }))}
                                            className="h-4 w-4 accent-teal-600 cursor-pointer"
                                        />
                                        <Label htmlFor="published" className="font-normal cursor-pointer text-sm">
                                            {form.published ? 'Aktif (tampil di publik)' : 'Draft (tidak tampil)'}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </BlurFade>

                {/* Dasar Hukum & Persyaratan */}
                <BlurFade delay={0.2} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Regulasi & Persyaratan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <DynamicList
                                field="dasar_hukum"
                                label="Dasar Hukum"
                                placeholder="Contoh: Perma No. 1 Tahun 2019"
                                icon={BookOpen}
                            />
                            <DynamicList
                                field="persyaratan"
                                label="Persyaratan"
                                placeholder="Contoh: Fotokopi KTP Pemohon"
                                icon={ListChecks}
                            />
                        </CardContent>
                    </Card>
                </BlurFade>

                {/* Prosedur & Produk */}
                <BlurFade delay={0.25} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Prosedur & Output</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <DynamicList
                                field="prosedur"
                                label="Prosedur Layanan"
                                placeholder="Contoh: Pemohon mendaftar ke meja pendaftaran"
                                icon={Workflow}
                                numbered={true}
                            />
                            <DynamicList
                                field="produk_layanan"
                                label="Produk Layanan"
                                placeholder="Contoh: Surat Gugatan Terdaftar"
                                icon={Package}
                            />
                        </CardContent>
                    </Card>
                </BlurFade>

                {/* Sarana & Pengaduan */}
                <BlurFade delay={0.3} inView>
                    <Card className="border-teal-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Sarana & Penanganan Pengaduan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <DynamicList
                                field="sarana_prasarana"
                                label="Sarana & Prasarana"
                                placeholder="Contoh: Meja pendaftaran, komputer"
                                icon={Wrench}
                            />
                            <div className="space-y-1.5">
                                <Label htmlFor="penanganan_pengaduan" className="flex items-center gap-2 font-semibold">
                                    <MessageSquare className="h-4 w-4 text-teal-600" /> Penanganan Pengaduan
                                </Label>
                                <Textarea
                                    id="penanganan_pengaduan"
                                    rows={4}
                                    placeholder="Jelaskan mekanisme penanganan pengaduan, termasuk kontak dan prosedur pengaduan..."
                                    value={form.penanganan_pengaduan ?? ''}
                                    onChange={e => setForm(p => ({ ...p, penanganan_pengaduan: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </BlurFade>

                {/* Action Buttons */}
                <BlurFade delay={0.35} inView>
                    <div className="flex justify-end gap-3 pb-6">
                        <Link href="/standar-pelayanan">
                            <Button type="button" variant="outline" disabled={saving}>
                                Batal
                            </Button>
                        </Link>
                        <Button
                            id="submit-form"
                            type="submit"
                            disabled={saving}
                            className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 gap-2 min-w-[140px]"
                        >
                            {saving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                            ) : (
                                <><Save className="h-4 w-4" /> {mode === 'tambah' ? 'Simpan Data' : 'Perbarui Data'}</>
                            )}
                        </Button>
                    </div>
                </BlurFade>
            </form>
        </div>
    );
}
