'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getMou, updateMou, type Mou } from '@/lib/api';
import { formatDateForInput } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Upload, ExternalLink } from 'lucide-react';

export default function EditMou() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Mou | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMou(parseInt(id));
        if (data) {
          setFormData({
            ...data,
            tanggal: formatDateForInput(data.tanggal),
            tanggal_berakhir: formatDateForInput(data.tanggal_berakhir),
          });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Data tidak ditemukan.' });
          router.push('/mou');
        }
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
        router.push('/mou');
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.id) return;
    setSaving(true);
    try {
      // Kirim FormData agar bisa menyertakan file upload
      const fd = new FormData();
      fd.append('tanggal', formData.tanggal);
      fd.append('instansi', formData.instansi);
      fd.append('tentang', formData.tentang);
      if (formData.tanggal_berakhir) fd.append('tanggal_berakhir', formData.tanggal_berakhir);
      if (file) fd.append('file_dokumen', file);

      const result = await updateMou(formData.id, fd);
      if (result.success) {
        toast({ title: 'Sukses', description: 'Data berhasil diperbarui!' });
        setTimeout(() => router.push('/mou'), 1200);
      } else {
        toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Gagal memperbarui data.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan saat menyimpan.' });
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit MOU</h2>
          {formData && (
            <p className="text-muted-foreground text-sm">{formData.instansi}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Edit Data MOU</CardTitle>
          <CardDescription>Perbarui data Memorandum of Understanding.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : formData ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tanggal */}
              <div className="space-y-1">
                <Label htmlFor="tanggal">Tanggal MOU *</Label>
                <Input
                  id="tanggal"
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={e => setFormData(p => p ? { ...p, tanggal: e.target.value } : null)}
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
                  onChange={e => setFormData(p => p ? { ...p, instansi: e.target.value } : null)}
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
                  onChange={e => setFormData(p => p ? { ...p, tentang: e.target.value } : null)}
                />
              </div>

              {/* Tanggal Berakhir */}
              <div className="space-y-1">
                <Label htmlFor="tanggal_berakhir">Tanggal Berakhir (Opsional)</Label>
                <Input
                  id="tanggal_berakhir"
                  type="date"
                  value={formData.tanggal_berakhir ?? ''}
                  onChange={e => setFormData(p => p ? { ...p, tanggal_berakhir: e.target.value } : null)}
                />
              </div>

              {/* Dokumen saat ini */}
              {formData.link_dokumen && !file && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                  <ExternalLink className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-blue-700 font-medium">Dokumen saat ini:</span>
                  <a
                    href={formData.link_dokumen}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    Lihat Dokumen
                  </a>
                </div>
              )}

              {/* Upload File Dokumen */}
              <div className="space-y-1">
                <Label>
                  {formData.link_dokumen ? 'Ganti Dokumen' : 'Upload Dokumen'}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.link_dokumen
                    ? 'Upload file baru akan menggantikan dokumen yang ada. Format: PDF, JPG, PNG. Maksimal 5MB.'
                    : 'Format: PDF, JPG, PNG. Maksimal 5MB.'}
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Link href="/mou">
                  <Button variant="secondary" type="button">Batal</Button>
                </Link>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
