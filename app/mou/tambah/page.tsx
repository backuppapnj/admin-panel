'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createMou, type Mou } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function TambahMou() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Partial<Mou>>({
    tanggal: new Date().toISOString().split('T')[0],
    instansi: '',
    tentang: '',
    tanggal_berakhir: '',
    link_dokumen: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Kirim FormData agar bisa menyertakan file upload
      const fd = new FormData();
      fd.append('tanggal', formData.tanggal || '');
      fd.append('instansi', formData.instansi || '');
      fd.append('tentang', formData.tentang || '');
      if (formData.tanggal_berakhir) fd.append('tanggal_berakhir', formData.tanggal_berakhir);
      if (file) fd.append('file_dokumen', file);

      const result = await createMou(fd);
      if (result.success) {
        toast({ title: 'Sukses', description: 'Data MOU berhasil disimpan!' });
        setTimeout(() => router.push('/mou'), 1200);
      } else {
        toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Gagal menyimpan data MOU.' });
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Terjadi kesalahan. Pastikan API terhubung.'
      });
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mou">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Tambah MOU</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Data MOU</CardTitle>
          <CardDescription>Isi data Memorandum of Understanding baru.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tanggal */}
            <div className="space-y-1">
              <Label htmlFor="tanggal">Tanggal MOU *</Label>
              <Input
                id="tanggal"
                type="date"
                required
                value={formData.tanggal}
                onChange={e => setFormData(p => ({ ...p, tanggal: e.target.value }))}
              />
            </div>

            {/* Instansi */}
            <div className="space-y-1">
              <Label htmlFor="instansi">Nama Instansi *</Label>
              <Input
                id="instansi"
                type="text"
                required
                placeholder="Masukkan nama instansi"
                value={formData.instansi}
                onChange={e => setFormData(p => ({ ...p, instansi: e.target.value }))}
              />
            </div>

            {/* Tentang */}
            <div className="space-y-1">
              <Label htmlFor="tentang">Tentang *</Label>
              <textarea
                id="tentang"
                required
                placeholder="Jelaskan isi perjanjian kerja sama"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                value={formData.tentang}
                onChange={e => setFormData(p => ({ ...p, tentang: e.target.value }))}
              />
            </div>

            {/* Tanggal Berakhir */}
            <div className="space-y-1">
              <Label htmlFor="tanggal_berakhir">Tanggal Berakhir (Opsional)</Label>
              <Input
                id="tanggal_berakhir"
                type="date"
                value={formData.tanggal_berakhir}
                onChange={e => setFormData(p => ({ ...p, tanggal_berakhir: e.target.value }))}
              />
            </div>

            {/* Upload File Dokumen */}
            <div className="space-y-1">
              <Label>Upload Dokumen (Opsional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground">Format: PDF, JPG, PNG. Maksimal 5MB.</p>
            </div>

            {/* Link Manual — tampil hanya jika TIDAK ada file yang dipilih */}
            {!file && (
              <div className="space-y-1">
                <Label htmlFor="link_dokumen">Atau Link Dokumen (Opsional)</Label>
                <Input
                  id="link_dokumen"
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={formData.link_dokumen || ''}
                  onChange={e => setFormData(p => ({ ...p, link_dokumen: e.target.value || null }))}
                />
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Link href="/mou">
                <Button variant="secondary" type="button">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
