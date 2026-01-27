'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAgenda, updateAgenda, type AgendaPimpinan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditAgenda() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AgendaPimpinan>({
    tanggal_agenda: '',
    isi_agenda: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getAgenda(id);
        if (!result) {
          toast({ variant: 'destructive', title: 'Gagal', description: 'Data tidak ditemukan.' });
          router.push('/agenda');
          return;
        }

        setFormData({
          id: result.id,
          tanggal_agenda: result.tanggal_agenda || '',
          isi_agenda: result.isi_agenda || '',
        });
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data.' });
      }
      setLoading(false);
    };

    if (id) load();
  }, [id, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateAgenda(id, {
        tanggal_agenda: formData.tanggal_agenda,
        isi_agenda: formData.isi_agenda,
      });

      if (result.success) {
        toast({ title: 'Sukses', description: 'Agenda berhasil diperbarui!' });
        setTimeout(() => router.push('/agenda'), 1500);
      } else {
        toast({ variant: 'destructive', title: 'Gagal', description: result.message || 'Gagal mengupdate agenda.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan.' });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agenda">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Edit Agenda</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Agenda Pimpinan</CardTitle>
          <CardDescription>Perbarui tanggal dan isi agenda.</CardDescription>
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
                rows={7}
                required
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700" disabled={saving}>
                {saving ? 'Menyimpan...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Update
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
