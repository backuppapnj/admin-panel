'use client';

import { useState, useEffect } from 'react';
import { getAllPagu, updatePagu, type PaguAnggaran } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, ArrowLeft, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from "@/components/ui/blur-fade";

const KATEGORI_DIPA = {
    'DIPA 01': ['Belanja Pegawai', 'Belanja Barang', 'Belanja Modal'],
    'DIPA 04': ['POSBAKUM', 'Pembebasan Biaya Perkara', 'Sidang Di Luar Gedung'],
};

export default function PaguConfig() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [paguList, setPaguList] = useState<PaguAnggaran[]>([]);

    const loadPagu = async () => {
        setFetching(true);
        try {
            const res = await getAllPagu(tahun);
            if (res.success) setPaguList(res.data || []);
        } catch (e) {
            toast({ title: "Error", description: "Gagal memuat data pagu", variant: "destructive" });
        }
        setFetching(false);
    };

    useEffect(() => { loadPagu(); }, [tahun]);

    const handleSave = async (dipa: string, kategori: string, val: string) => {
        setLoading(true);
        try {
            const res = await updatePagu({
                dipa,
                kategori,
                tahun,
                jumlah_pagu: parseFloat(val) || 0
            });
            if (res.success) {
                toast({ title: "Berhasil", description: `Pagu ${kategori} diperbarui.` });
                loadPagu();
            }
        } catch (e) {
            toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan", variant: "destructive" });
        }
        setLoading(false);
    };

    const getPaguValue = (dipa: string, kategori: string) => {
        return paguList.find(p => p.dipa === dipa && p.kategori === kategori)?.jumlah_pagu || 0;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <BlurFade delay={0.1} inView>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/anggaran">
                            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight">Konfigurasi Pagu Anggaran</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>Tahun:</Label>
                        <Input 
                            type="number" 
                            className="w-24" 
                            value={tahun} 
                            onChange={(e) => setTahun(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </BlurFade>

            {fetching ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <div className="grid gap-6">
                    {Object.entries(KATEGORI_DIPA).map(([dipa, categories]) => (
                        <BlurFade key={dipa} delay={0.2} inView>
                            <Card>
                                <CardHeader className="bg-slate-50">
                                    <CardTitle>{dipa}</CardTitle>
                                    <CardDescription>Atur batas anggaran (Pagu) untuk {dipa} tahun {tahun}.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {categories.map(cat => (
                                        <div key={cat} className="flex flex-col md:flex-row md:items-center gap-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex-1">
                                                <Label className="text-base font-semibold">{cat}</Label>
                                                <p className="text-xs text-muted-foreground">Pagu tetap untuk kategori ini.</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-muted-foreground text-sm">Rp</span>
                                                    <Input 
                                                        type="number" 
                                                        className="w-48 pl-9" 
                                                        defaultValue={getPaguValue(dipa, cat)}
                                                        onBlur={(e) => handleSave(dipa, cat, e.target.value)}
                                                    />
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-emerald-600">
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </BlurFade>
                    ))}
                </div>
            )}
            
            <p className="text-center text-sm text-muted-foreground italic flex items-center justify-center gap-2">
                <Settings2 className="h-4 w-4" /> Data Pagu akan otomatis tersimpan saat kursor meninggalkan kotak input (blur).
            </p>
        </div>
    );
}
