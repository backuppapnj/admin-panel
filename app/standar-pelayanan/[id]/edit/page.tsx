'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getStandarPelayananById, type StandarPelayanan } from '@/lib/api';
import StandarPelayananForm from '../../_components/StandarPelayananForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function EditStandarPelayananPage() {
    const params = useParams<{ id: string }>();
    const [data, setData] = useState<StandarPelayanan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const id = parseInt(params.id);
        if (!id) { setError('ID tidak valid.'); setLoading(false); return; }

        getStandarPelayananById(id).then(result => {
            if (result.success && result.data) {
                setData(result.data);
            } else {
                setError(result.message || 'Data tidak ditemukan.');
            }
        }).catch(() => {
            setError('Gagal memuat data dari server.');
        }).finally(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-4">
                <Skeleton className="h-12 w-72" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
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

    return <StandarPelayananForm mode="edit" initialData={data} />;
}
