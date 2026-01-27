'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";
import { ArrowRight, Megaphone, Gavel, PlusCircle, Calendar, CalendarDays, FileText } from 'lucide-react';
import { BlurFade } from "@/components/ui/blur-fade";

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">

      {/* Background Globe */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <Globe className="top-20" />
      </div>

      <div className="relative z-10 p-8 space-y-8 max-w-7xl mx-auto">

        {/* Welcome Section */}
        <BlurFade delay={0.1} inView>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Dashboard Admin
              </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Selamat datang di Panel Admin Pengadilan Agama Penajam. Kelola data Panggilan, Itsbat Nikah, Panggilan e-Court, dan Agenda Pimpinan.
                </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 backdrop-blur-sm border px-4 py-2 rounded-full shadow-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{currentDate}</span>
            </div>
          </div>
        </BlurFade>

        {/* Quick Stats / Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Panggilan Ghaib Card */}
          <BlurFade delay={0.2} inView>
            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-violet-500 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-violet-500" />
                  Panggilan Ghaib
                </CardTitle>
                <CardDescription>Kelola data panggilan sidang ghaib.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-6">
                  Akses daftar lengkap panggilan, cari data, dan kelola pemanggilan pihak yang tidak diketahui keberadaannya.
                </div>
                <div className="flex gap-3">
                  <Link href="/panggilan" className="w-full">
                    <Button variant="outline" className="w-full group">
                      Lihat Data <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/panggilan/tambah" className="w-full">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200">
                      <PlusCircle className="mr-2 h-4 w-4" /> Baru
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Itsbat Nikah Card */}
          <BlurFade delay={0.3} inView>
            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-pink-600 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-pink-600" />
                  Itsbat Nikah
                </CardTitle>
                <CardDescription>Kelola pelayanan terpadu.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-6">
                  Manajemen data permohonan itsbat nikah, jadwal sidang, dan pengumuman untuk masyarakat.
                </div>
                <div className="flex gap-3">
                  <Link href="/itsbat" className="w-full">
                    <Button variant="outline" className="w-full group">
                      Lihat Data <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/itsbat/tambah" className="w-full">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200">
                      <PlusCircle className="mr-2 h-4 w-4" /> Baru
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Panduan Card */}
          <BlurFade delay={0.4} inView>
            <Card className="hover:shadow-xl transition-all duration-300 bg-slate-50/80 backdrop-blur-sm border-dashed h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-500" />
                  Panduan Singkat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="bg-slate-200 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Pastikan koneksi internet stabil saat upload file.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-slate-200 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Format upload: PDF/Gambar (Max 5MB).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-slate-200 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Gunakan filter tahun untuk mencari data arsip lama.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </BlurFade>

        </div>

        {/* Agenda + eCourt row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Panggilan e-Court Card */}
          <BlurFade delay={0.5} inView>
            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-emerald-500 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-emerald-500" />
                  Panggilan e-Court
                </CardTitle>
                <CardDescription>Kelola panggilan e-Court.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-6">
                  Manajemen data panggilan/pemberitahuan melalui e-Court.
                </div>
                <div className="flex gap-3">
                  <Link href="/panggilan-ecourt" className="w-full">
                    <Button variant="outline" className="w-full group">
                      Lihat Data <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/panggilan-ecourt/tambah" className="w-full">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                      <PlusCircle className="mr-2 h-4 w-4" /> Baru
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Agenda Pimpinan Card */}
          <BlurFade delay={0.6} inView>
            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-red-600 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-red-600" />
                  Agenda Pimpinan
                </CardTitle>
                <CardDescription>Kelola agenda pimpinan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-6">
                  Data agenda untuk ditampilkan di website (sidebar + halaman agenda).
                </div>
                <div className="flex gap-3">
                  <Link href="/agenda" className="w-full">
                    <Button variant="outline" className="w-full group">
                      Lihat Data <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/agenda/tambah" className="w-full">
                    <Button className="w-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200">
                      <PlusCircle className="mr-2 h-4 w-4" /> Baru
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

        </div>
      </div>
    </div>
  );
}
