'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAgenda, type AgendaPimpinan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

export default function TambahAgenda() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<AgendaPimpinan>({
    tanggal_agenda: '',
    isi_agenda: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await createAgenda({
        tanggal_agenda: formData.tanggal_agenda,
        isi_agenda: formData.isi_agenda,
      });

      if (result.success) {
        toast({ title: 'Sukses', description: 'Agenda berhasil disimpan!' });
        setTimeout(() => router.push('/agenda'), 1500);
      } else {
        toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Gagal menyimpan agenda.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan. Pastikan API terhubung.' });
    }

    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agenda">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Agenda</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Agenda Pimpinan</CardTitle>
          <CardDescription>Agenda ini akan ditampilkan di halaman website utama.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tanggal_agenda">Tanggal Agenda *</Label>
              <Input
                type="date"
                id="tanggal_agenda"
                name="tanggal_agenda"
                value={formData.tanggal_agenda}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isi_agenda">Isi Agenda *</Label>
              <Textarea
                id="isi_agenda"
                name="isi_agenda"
                value={formData.isi_agenda}
                onChange={handleChange}
                placeholder="Tulis agenda/kegiatan pimpinan..."
                rows={7}
                required
              />
              <p className="text-xs text-muted-foreground">Disarankan ringkas, jelas, dan tanpa format HTML.</p>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" className="w-full md:w-auto bg-red-600 hover:bg-red-700" disabled={saving}>
                {saving ? 'Menyimpan...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan
                  </>
                )}
              </Button>
              <Link href="/agenda">
                <Button variant="secondary" type="button" className="w-full md:w-auto">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
