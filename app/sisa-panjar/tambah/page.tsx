'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSisaPanjar, type SisaPanjar, type StatusSisaPanjar, NAMA_BULAN } from '@/lib/api';
import { getYearOptions } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

const STATUS_OPTIONS: { value: StatusSisaPanjar; label: string }[] = [
  { value: 'belum_diambil', label: 'Belum Diambil' },
  { value: 'disetor_kas_negara', label: 'Disetor Kas Negara' },
];

const BULAN_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: NAMA_BULAN[i + 1],
}));

export default function TambahSisaPanjar() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<SisaPanjar>({
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    nomor_perkara: '',
    nama_penggugat_pemohon: '',
    jumlah_sisa_panjar: 0,
    status: 'belum_diambil',
    tanggal_setor_kas_negara: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'jumlah_sisa_panjar') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue ? parseInt(numericValue) : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleYearChange = (value: string) => {
    setFormData(prev => ({ ...prev, tahun: parseInt(value) }));
  };

  const handleBulanChange = (value: string) => {
    setFormData(prev => ({ ...prev, bulan: parseInt(value) }));
  };

  const handleStatusChange = (value: StatusSisaPanjar) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        tanggal_setor_kas_negara: formData.status === 'disetor_kas_negara' && formData.tanggal_setor_kas_negara 
          ? formData.tanggal_setor_kas_negara 
          : null,
      };

      const result = await createSisaPanjar(dataToSend);

      if (result.success) {
        toast({
          title: "Sukses",
          description: "Data sisa panjar berhasil disimpan!",
        });
        setTimeout(() => router.push('/sisa-panjar'), 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.message || 'Gagal menyimpan data.',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan. Pastikan API terhubung.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sisa-panjar">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Data</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Sisa Panjar</CardTitle>
          <CardDescription>Isi detail data sisa panjar perkara.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun *</Label>
                <Select
                  value={formData.tahun.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {getYearOptions().map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulan">Bulan *</Label>
                <Select
                  value={formData.bulan.toString()}
                  onValueChange={handleBulanChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {BULAN_OPTIONS.map(bulan => (
                      <SelectItem key={bulan.value} value={bulan.value.toString()}>{bulan.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomor_perkara">Nomor Perkara *</Label>
              <Input
                id="nomor_perkara"
                name="nomor_perkara"
                value={formData.nomor_perkara}
                onChange={handleChange}
                placeholder="Contoh: 279/Pdt.G/2025/PA.Pnj"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_penggugat_pemohon">Nama Penggugat/Pemohon *</Label>
              <Input
                id="nama_penggugat_pemohon"
                name="nama_penggugat_pemohon"
                value={formData.nama_penggugat_pemohon}
                onChange={handleChange}
                placeholder="Nama lengkap penggugat/pemohon"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jumlah_sisa_panjar">Jumlah Sisa Panjar (Rp) *</Label>
                <Input
                  id="jumlah_sisa_panjar"
                  name="jumlah_sisa_panjar"
                  type="text"
                  inputMode="numeric"
                  value={formData.jumlah_sisa_panjar > 0 ? formData.jumlah_sisa_panjar.toString() : ''}
                  onChange={handleChange}
                  placeholder="Contoh: 427000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.status === 'disetor_kas_negara' && (
              <div className="space-y-2">
                <Label htmlFor="tanggal_setor_kas_negara">Tanggal Setor ke Kas Negara</Label>
                <Input
                  type="date"
                  id="tanggal_setor_kas_negara"
                  name="tanggal_setor_kas_negara"
                  value={formData.tanggal_setor_kas_negara || ''}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? (
                  <>Menyimpan...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Simpan Data</>
                )}
              </Button>
              <Link href="/sisa-panjar">
                <Button variant="secondary" type="button" className="w-full md:w-auto">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
