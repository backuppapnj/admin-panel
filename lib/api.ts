// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export interface Panggilan {
  id?: number;
  tahun_perkara: number;
  nomor_perkara: string;
  nama_dipanggil: string;
  alamat_asal?: string;
  panggilan_1?: string;
  panggilan_2?: string;
  panggilan_ikrar?: string;
  tanggal_sidang?: string;
  pip?: string;
  link_surat?: string;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItsbatNikah {
  id?: number;
  tahun_perkara: number;
  nomor_perkara: string;
  pemohon_1: string;
  pemohon_2: string;
  tanggal_pengumuman?: string;
  tanggal_sidang?: string;
  link_detail?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgendaPimpinan {
  id?: number;
  tanggal_agenda: string;
  isi_agenda: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
}

const normalizeApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const json = await response.json().catch(() => ({}));

  // Our APIs mostly use { success: boolean, ... }
  if (typeof json?.success === 'boolean') {
    return json as ApiResponse<T>;
  }

  // Agenda API currently uses { status: 'success' | 'error', ... }
  if (typeof json?.status === 'string') {
    const ok = json.status === 'success';
    return {
      success: ok,
      data: json.data as T | undefined,
      message: json.message,
      total: json.total,
      current_page: json.current_page,
      last_page: json.last_page,
      per_page: json.per_page,
    };
  }

  return {
    success: response.ok,
    data: json?.data as T | undefined,
    message: json?.message,
  };
};

// Headers dengan API Key
const getHeaders = (isFormData = false) => {
  const headers: Record<string, string> = {
    'X-API-Key': API_KEY,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// ==========================================
// API PANGGILAN GHAIB
// ==========================================

// GET - Ambil semua data
export async function getAllPanggilan(tahun?: number, page = 1): Promise<ApiResponse<Panggilan[]>> {
  let url = `${API_URL}/panggilan?page=${page}`;
  if (tahun) {
    url += `&tahun=${tahun}`;
  }
  const response = await fetch(url, { cache: 'no-store' });
  return response.json();
}

// GET - Ambil satu data
export async function getPanggilan(id: number): Promise<Panggilan | null> {
  const response = await fetch(`${API_URL}/panggilan/${id}`);
  const result: ApiResponse<Panggilan> = await response.json();
  return result.data || null;
}

// POST - Tambah data baru
export async function createPanggilan(data: Panggilan | FormData): Promise<ApiResponse<Panggilan>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/panggilan`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// PUT - Update data
export async function updatePanggilan(id: number, data: Panggilan | FormData): Promise<ApiResponse<Panggilan>> {
  const isFormData = data instanceof FormData;

  const method = isFormData ? 'POST' : 'PUT';
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }

  const response = await fetch(`${API_URL}/panggilan/${id}`, {
    method: method,
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// DELETE - Hapus data
export async function deletePanggilan(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/panggilan/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}

// ==========================================
// API ITSBAT NIKAH
// ==========================================

// GET - Ambil semua data Itsbat
export async function getAllItsbat(tahun?: number, page = 1): Promise<ApiResponse<ItsbatNikah[]>> {
  let url = `${API_URL}/itsbat?page=${page}`;
  if (tahun) {
    url += `&tahun=${tahun}`;
  }
  const response = await fetch(url, { cache: 'no-store' });
  return response.json();
}

// GET - Ambil satu data Itsbat
export async function getItsbat(id: number): Promise<ItsbatNikah | null> {
  const response = await fetch(`${API_URL}/itsbat/${id}`);
  const result: ApiResponse<ItsbatNikah> = await response.json();
  return result.data || null;
}

// POST - Tambah data Itsbat
export async function createItsbat(data: ItsbatNikah | FormData): Promise<ApiResponse<ItsbatNikah>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/itsbat`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// PUT - Update data Itsbat
export async function updateItsbat(id: number, data: ItsbatNikah | FormData): Promise<ApiResponse<ItsbatNikah>> {
  const isFormData = data instanceof FormData;
  // NOTE: For file uploads with method PUT/PATCH, some servers might have issues parsing multipart/form-data directly.
  // Laravel/Lumen usually handles POST with _method=PUT better for file uploads.
  // We will force POST and add _method=PUT if it's FormData

  const method = isFormData ? 'POST' : 'PUT';
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }

  const response = await fetch(`${API_URL}/itsbat/${id}`, {
    method: method,
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// DELETE - Hapus data Itsbat
export async function deleteItsbat(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/itsbat/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}

// ==========================================
// API PANGGILAN E-COURT
// ==========================================

export interface PanggilanEcourt {
  id?: number;
  tahun_perkara: number;
  nomor_perkara: string;
  nama_dipanggil: string;
  alamat_asal?: string;
  panggilan_1?: string;
  panggilan_2?: string;
  panggilan_3?: string;
  panggilan_ikrar?: string;
  tanggal_sidang?: string;
  pip?: string;
  link_surat?: string;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

// GET - Ambil semua data
export async function getAllPanggilanEcourt(tahun?: number, page = 1): Promise<ApiResponse<PanggilanEcourt[]>> {
  let url = `${API_URL}/panggilan-ecourt?page=${page}`;
  if (tahun) {
    url += `&tahun=${tahun}`;
  }
  const response = await fetch(url, { cache: 'no-store' });
  return response.json();
}

// GET - Ambil satu data
export async function getPanggilanEcourt(id: number): Promise<PanggilanEcourt | null> {
  const response = await fetch(`${API_URL}/panggilan-ecourt/${id}`);
  const result: ApiResponse<PanggilanEcourt> = await response.json();
  return result.data || null;
}

// POST - Tambah data baru
export async function createPanggilanEcourt(data: PanggilanEcourt | FormData): Promise<ApiResponse<PanggilanEcourt>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/panggilan-ecourt`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// PUT - Update data
export async function updatePanggilanEcourt(id: number, data: PanggilanEcourt | FormData): Promise<ApiResponse<PanggilanEcourt>> {
  const isFormData = data instanceof FormData;

  const method = isFormData ? 'POST' : 'PUT';
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }

  const response = await fetch(`${API_URL}/panggilan-ecourt/${id}`, {
    method: method,
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// DELETE - Hapus data
export async function deletePanggilanEcourt(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/panggilan-ecourt/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}

// ==========================================
// API AGENDA PIMPINAN
// ==========================================

export async function getAllAgenda(tahun?: number, bulan?: string, page = 1, perPage: number | 'all' = 10): Promise<ApiResponse<AgendaPimpinan[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  if (bulan) qs.push(`bulan=${encodeURIComponent(bulan)}`);
  qs.push(`page=${page}`);
  qs.push(`per_page=${encodeURIComponent(String(perPage))}`);
  const url = `${API_URL}/agenda?${qs.join('&')}`;

  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<AgendaPimpinan[]>(response);
}

export async function getAgenda(id: number): Promise<AgendaPimpinan | null> {
  const response = await fetch(`${API_URL}/agenda/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<AgendaPimpinan>(response);
  return result.data || null;
}

export async function createAgenda(data: AgendaPimpinan): Promise<ApiResponse<AgendaPimpinan>> {
  const response = await fetch(`${API_URL}/agenda`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeApiResponse<AgendaPimpinan>(response);
}

export async function updateAgenda(id: number, data: Partial<AgendaPimpinan>): Promise<ApiResponse<AgendaPimpinan>> {
  const response = await fetch(`${API_URL}/agenda/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeApiResponse<AgendaPimpinan>(response);
}

export async function deleteAgenda(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/agenda/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API LHKPN
// ==========================================

export interface LhkpnReport {
  id?: number;
  nip: string;
  nama: string;
  jabatan: string;
  tahun: number;
  jenis_laporan: 'LHKPN' | 'SPT Tahunan';
  tanggal_lapor?: string;
  link_tanda_terima?: string; // URL
  link_pengumuman?: string; // URL
  link_spt?: string; // URL
  link_dokumen_pendukung?: string; // URL
  created_at?: string;
  updated_at?: string;
}

export interface RealisasiAnggaran {
  id?: number;
  dipa: string;
  kategori: string;
  bulan?: number;
  pagu: number;
  realisasi: number;
  sisa?: number;
  persentase?: number;
  tahun: number;
  keterangan?: string;
  link_dokumen?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAllLhkpn(tahun?: number, page = 1, q?: string, jenis?: string): Promise<ApiResponse<LhkpnReport[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  if (q) qs.push(`q=${encodeURIComponent(q)}`);
  if (jenis) qs.push(`jenis=${encodeURIComponent(jenis)}`);
  qs.push(`page=${page}`);
  const url = `${API_URL}/lhkpn?${qs.join('&')}`;

  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<LhkpnReport[]>(response);
}

export async function getLhkpn(id: number): Promise<LhkpnReport | null> {
  const response = await fetch(`${API_URL}/lhkpn/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<LhkpnReport>(response);
  return result.data || null;
}

export async function createLhkpn(data: LhkpnReport | FormData): Promise<ApiResponse<LhkpnReport>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/lhkpn`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return normalizeApiResponse<LhkpnReport>(response);
}

export async function updateLhkpn(id: number, data: Partial<LhkpnReport> | FormData): Promise<ApiResponse<LhkpnReport>> {
  const isFormData = data instanceof FormData;

  // For file uploads, use POST with _method=PUT
  const method = isFormData ? 'POST' : 'PUT';
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }

  const response = await fetch(`${API_URL}/lhkpn/${id}`, {
    method: method,
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return normalizeApiResponse<LhkpnReport>(response);
}

export async function deleteLhkpn(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/lhkpn/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API REALISASI ANGGARAN
// ==========================================

export async function getAllAnggaran(tahun?: number, dipa?: string, bulan?: number, page = 1): Promise<ApiResponse<RealisasiAnggaran[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  if (dipa) qs.push(`dipa=${encodeURIComponent(dipa)}`);
  if (bulan) qs.push(`bulan=${encodeURIComponent(String(bulan))}`);
  qs.push(`page=${page}`);
  const url = `${API_URL}/anggaran?${qs.join('&')}`;

  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<RealisasiAnggaran[]>(response);
}

export async function getAnggaran(id: number): Promise<RealisasiAnggaran | null> {
  const response = await fetch(`${API_URL}/anggaran/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<RealisasiAnggaran>(response);
  return result.data || null;
}

export async function createAnggaran(data: RealisasiAnggaran): Promise<ApiResponse<RealisasiAnggaran>> {
  const response = await fetch(`${API_URL}/anggaran`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeApiResponse<RealisasiAnggaran>(response);
}

export async function updateAnggaran(id: number, data: Partial<RealisasiAnggaran>): Promise<ApiResponse<RealisasiAnggaran>> {
  const response = await fetch(`${API_URL}/anggaran/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeApiResponse<RealisasiAnggaran>(response);
}

export async function deleteAnggaran(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/anggaran/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API PAGU ANGGARAN
// ==========================================

export interface PaguAnggaran {
  id?: number;
  dipa: string;
  kategori: string;
  jumlah_pagu: number;
  tahun: number;
}

export interface DipaPok {
  id?: number;
  kode_dipa?: number;
  thn_dipa: number;
  revisi_dipa: string;
  jns_dipa: string;
  tgl_dipa: string;
  alokasi_dipa: number;
  doc_dipa?: string;
  doc_pok?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAllPagu(tahun?: number, dipa?: string): Promise<ApiResponse<PaguAnggaran[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  if (dipa) qs.push(`dipa=${encodeURIComponent(dipa)}`);
  const url = qs.length ? `${API_URL}/pagu?${qs.join('&')}` : `${API_URL}/pagu`;
  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<PaguAnggaran[]>(response);
}

export async function updatePagu(data: PaguAnggaran): Promise<ApiResponse<PaguAnggaran>> {
  const response = await fetch(`${API_URL}/pagu`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeApiResponse<PaguAnggaran>(response);
}

export async function deletePagu(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/pagu/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API DIPA POK
// ==========================================

export async function getAllDipaPok(tahun?: number, page = 1, q?: string): Promise<ApiResponse<DipaPok[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  if (q) qs.push(`q=${encodeURIComponent(q)}`);
  qs.push(`page=${page}`);
  const url = `${API_URL}/dipapok?${qs.join('&')}`;

  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<DipaPok[]>(response);
}

export async function getDipaPok(id: number): Promise<DipaPok | null> {
  const response = await fetch(`${API_URL}/dipapok/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<DipaPok>(response);
  return result.data || null;
}

export async function createDipaPok(data: DipaPok | FormData): Promise<ApiResponse<DipaPok>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/dipapok`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return normalizeApiResponse<DipaPok>(response);
}

export async function updateDipaPok(id: number, data: Partial<DipaPok> | FormData): Promise<ApiResponse<DipaPok>> {
  const isFormData = data instanceof FormData;

  const method = isFormData ? 'POST' : 'PUT';
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }

  const response = await fetch(`${API_URL}/dipapok/${id}`, {
    method: method,
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return normalizeApiResponse<DipaPok>(response);
}

export async function deleteDipaPok(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/dipapok/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API ASET BMN
// ==========================================

export const JENIS_LAPORAN_BMN = [
  'Laporan Posisi BMN Di Neraca - Semester I',
  'Laporan Posisi BMN Di Neraca - Semester II',
  'Laporan Posisi BMN Di Neraca - Tahunan',
  'Laporan Barang Kuasa Pengguna - Persediaan - Semester I',
  'Laporan Barang Kuasa Pengguna - Persediaan - Semester II',
  'Laporan Kondisi Barang - Tahunan',
] as const;

export type JenisLaporanBmn = typeof JENIS_LAPORAN_BMN[number];

export interface AsetBmn {
  id?: number;
  tahun: number;
  jenis_laporan: JenisLaporanBmn;
  link_dokumen?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getAllAsetBmn(tahun?: number): Promise<ApiResponse<AsetBmn[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  const url = qs.length ? `${API_URL}/aset-bmn?${qs.join('&')}` : `${API_URL}/aset-bmn`;
  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<AsetBmn[]>(response);
}

export async function getAsetBmn(id: number): Promise<AsetBmn | null> {
  const response = await fetch(`${API_URL}/aset-bmn/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<AsetBmn>(response);
  return result.data || null;
}

export async function createAsetBmn(data: FormData | AsetBmn): Promise<ApiResponse<AsetBmn>> {
  const isFormData = data instanceof FormData;
  const method = isFormData ? 'POST' : 'POST';
  const body = isFormData ? data : JSON.stringify(data);
  const headers = isFormData ? getHeaders() : { ...getHeaders(), 'Content-Type': 'application/json' };

  const response = await fetch(`${API_URL}/aset-bmn`, {
    method,
    headers,
    body,
  });
  return normalizeApiResponse<AsetBmn>(response);
}

export async function updateAsetBmn(id: number, data: FormData | Partial<AsetBmn>): Promise<ApiResponse<AsetBmn>> {
  const isFormData = data instanceof FormData;
  const method = isFormData ? 'POST' : 'PUT';
  const body = isFormData ? (() => { data.append('_method', 'PUT'); return data; })() : JSON.stringify(data);
  const headers = isFormData ? getHeaders() : { ...getHeaders(), 'Content-Type': 'application/json' };

  const response = await fetch(`${API_URL}/aset-bmn/${id}`, {
    method,
    headers,
    body,
  });
  return normalizeApiResponse<AsetBmn>(response);
}

export async function deleteAsetBmn(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/aset-bmn/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API SAKIP
// ==========================================

export const JENIS_DOKUMEN_SAKIP = [
  'Indikator Kinerja Utama',
  'Rencana Strategis',
  'Program Kerja',
  'Rencana Kinerja Tahunan',
  'Perjanjian Kinerja',
  'Rencana Aksi',
  'Laporan Kinerja Instansi Pemerintah',
] as const;

export type JenisDokumenSakip = typeof JENIS_DOKUMEN_SAKIP[number];

export interface Sakip {
  id?: number;
  tahun: number;
  jenis_dokumen: JenisDokumenSakip;
  uraian?: string | null;
  link_dokumen?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getAllSakip(tahun?: number): Promise<ApiResponse<Sakip[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  const url = qs.length ? `${API_URL}/sakip?${qs.join('&')}` : `${API_URL}/sakip`;
  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<Sakip[]>(response);
}

export async function getSakip(id: number): Promise<Sakip | null> {
  const response = await fetch(`${API_URL}/sakip/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<Sakip>(response);
  return result.data || null;
}

export async function createSakip(data: FormData | Sakip): Promise<ApiResponse<Sakip>> {
  const isFormData = data instanceof FormData;
  const body = isFormData ? data : JSON.stringify(data);

  const response = await fetch(`${API_URL}/sakip`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body,
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err?.errors && typeof err.errors === 'object') {
        const firstField = Object.keys(err.errors)[0];
        msg = err.errors[firstField]?.[0] || err?.message || msg;
      } else {
        msg = err?.message || msg;
      }
    } catch { /* body kosong atau non-JSON */ }
    return { success: false, message: msg };
  }

  return normalizeApiResponse<Sakip>(response);
}

export async function updateSakip(id: number, data: FormData | Partial<Sakip>): Promise<ApiResponse<Sakip>> {
  const isFormData = data instanceof FormData;
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }

  const response = await fetch(`${API_URL}/sakip/${id}`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err?.errors && typeof err.errors === 'object') {
        const firstField = Object.keys(err.errors)[0];
        msg = err.errors[firstField]?.[0] || err?.message || msg;
      } else {
        msg = err?.message || msg;
      }
    } catch { /* body kosong atau non-JSON */ }
    return { success: false, message: msg };
  }

  return normalizeApiResponse<Sakip>(response);
}

export async function deleteSakip(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/sakip/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API LAPORAN PENGADUAN
// ==========================================

export const MATERI_PENGADUAN = [
  'Pelanggaran Terhadap Kode Etik Atau Pedoman Perilaku Hakim',
  'Penyalahgunaan Wewenang / Jabatan',
  'Pelanggaran Terhadap Disiplin PNS',
  'Perbuatan Tercela',
  'Pelanggaran Hukum Acara',
  'Kekeliruan Administrasi',
  'Pelayanan Publik Yang Tidak Memuaskan',
] as const;

export const BULAN_LAPORAN = ['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nop','des'] as const;
export const BULAN_LABELS: Record<string, string> = {
  jan:'Jan', feb:'Feb', mar:'Mar', apr:'Apr', mei:'Mei', jun:'Jun',
  jul:'Jul', agu:'Agu', sep:'Sep', okt:'Okt', nop:'Nop', des:'Des',
};

export type LaporanPengaduan = {
  id?: number;
  tahun: number;
  materi_pengaduan: typeof MATERI_PENGADUAN[number];
  jan?: number; feb?: number; mar?: number; apr?: number; mei?: number; jun?: number;
  jul?: number; agu?: number; sep?: number; okt?: number; nop?: number; des?: number;
  laporan_proses?: number; sisa?: number;
  created_at?: string; updated_at?: string;
};

export async function getAllLaporanPengaduan(tahun?: number): Promise<ApiResponse<LaporanPengaduan[]>> {
  const qs = tahun ? `?tahun=${encodeURIComponent(String(tahun))}` : '';
  const response = await fetch(`${API_URL}/laporan-pengaduan${qs}`, { cache: 'no-store' });
  return normalizeApiResponse<LaporanPengaduan[]>(response);
}

export async function getLaporanPengaduan(id: number): Promise<LaporanPengaduan | null> {
  const response = await fetch(`${API_URL}/laporan-pengaduan/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<LaporanPengaduan>(response);
  return result.data || null;
}

export async function createLaporanPengaduan(data: LaporanPengaduan): Promise<ApiResponse<LaporanPengaduan>> {
  const response = await fetch(`${API_URL}/laporan-pengaduan`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err?.errors && typeof err.errors === 'object') {
        const firstField = Object.keys(err.errors)[0];
        msg = err.errors[firstField]?.[0] || err?.message || msg;
      } else {
        msg = err?.message || msg;
      }
    } catch { /* body kosong atau non-JSON */ }
    return { success: false, message: msg };
  }
  return normalizeApiResponse<LaporanPengaduan>(response);
}

export async function updateLaporanPengaduan(id: number, data: Partial<LaporanPengaduan>): Promise<ApiResponse<LaporanPengaduan>> {
  const response = await fetch(`${API_URL}/laporan-pengaduan/${id}`, {
    method: 'PUT',
    headers: getHeaders(false),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err?.errors && typeof err.errors === 'object') {
        const firstField = Object.keys(err.errors)[0];
        msg = err.errors[firstField]?.[0] || err?.message || msg;
      } else {
        msg = err?.message || msg;
      }
    } catch { /* body kosong atau non-JSON */ }
    return { success: false, message: msg };
  }
  return normalizeApiResponse<LaporanPengaduan>(response);
}

export async function deleteLaporanPengaduan(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/laporan-pengaduan/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API KEUANGAN PERKARA
// ==========================================

export interface KeuanganPerkara {
  id?: number;
  tahun: number;
  bulan: number;
  saldo_awal?: number | null;
  penerimaan?: number | null;
  pengeluaran?: number | null;
  url_detail?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const NAMA_BULAN_KEUANGAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

export async function getAllKeuanganPerkara(tahun?: number): Promise<ApiResponse<KeuanganPerkara[]>> {
  const qs = tahun ? `?tahun=${encodeURIComponent(String(tahun))}` : '';
  const response = await fetch(`${API_URL}/keuangan-perkara${qs}`, { cache: 'no-store' });
  return normalizeApiResponse<KeuanganPerkara[]>(response);
}

export async function getKeuanganPerkara(id: number): Promise<KeuanganPerkara | null> {
  const response = await fetch(`${API_URL}/keuangan-perkara/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<KeuanganPerkara>(response);
  return result.data || null;
}

async function handleKeuanganResponse(response: Response): Promise<ApiResponse<KeuanganPerkara>> {
  console.log('API Response status:', response.status, response.statusText);
  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const text = await response.text();
      console.log('Error response body:', text);
      const err = JSON.parse(text);
      if (err?.errors && typeof err.errors === 'object') {
        const firstField = Object.keys(err.errors)[0];
        msg = err.errors[firstField]?.[0] || err?.message || msg;
      } else {
        msg = err?.message || msg;
      }
    } catch (e) { 
      console.log('Failed to parse error response:', e);
      /* body kosong atau non-JSON */ 
    }
    return { success: false, message: msg };
  }
  return normalizeApiResponse<KeuanganPerkara>(response);
}

export async function createKeuanganPerkara(data: KeuanganPerkara | FormData): Promise<ApiResponse<KeuanganPerkara>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/keuangan-perkara`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleKeuanganResponse(response);
}

export async function updateKeuanganPerkara(id: number, data: Partial<KeuanganPerkara> | FormData): Promise<ApiResponse<KeuanganPerkara>> {
  const isFormData = data instanceof FormData;
  if (isFormData) (data as FormData).append('_method', 'PUT');
  const response = await fetch(`${API_URL}/keuangan-perkara/${id}`, {
    method: isFormData ? 'POST' : 'PUT',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleKeuanganResponse(response);
}

export async function deleteKeuanganPerkara(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/keuangan-perkara/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API SISA PANJAR
// ==========================================

export type StatusSisaPanjar = 'belum_diambil' | 'disetor_kas_negara';

export interface SisaPanjar {
  id?: number;
  tahun: number;
  bulan: number;
  nomor_perkara: string;
  nama_penggugat_pemohon: string;
  jumlah_sisa_panjar: number;
  status: StatusSisaPanjar;
  tanggal_setor_kas_negara?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const NAMA_BULAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

export async function getAllSisaPanjar(
  tahun?: number,
  status?: StatusSisaPanjar,
  bulan?: number,
  page = 1
): Promise<ApiResponse<SisaPanjar[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  if (status) qs.push(`status=${encodeURIComponent(status)}`);
  if (bulan) qs.push(`bulan=${encodeURIComponent(String(bulan))}`);
  qs.push(`page=${page}`);
  const url = `${API_URL}/sisa-panjar?${qs.join('&')}`;

  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<SisaPanjar[]>(response);
}

export async function getSisaPanjar(id: number): Promise<SisaPanjar | null> {
  const response = await fetch(`${API_URL}/sisa-panjar/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<SisaPanjar>(response);
  return result.data || null;
}

export async function createSisaPanjar(data: SisaPanjar): Promise<ApiResponse<SisaPanjar>> {
  const response = await fetch(`${API_URL}/sisa-panjar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeApiResponse<SisaPanjar>(response);
}

export async function updateSisaPanjar(id: number, data: Partial<SisaPanjar>): Promise<ApiResponse<SisaPanjar>> {
  const response = await fetch(`${API_URL}/sisa-panjar/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeApiResponse<SisaPanjar>(response);
}

export async function deleteSisaPanjar(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/sisa-panjar/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API MOU
// ==========================================

export interface Mou {
  id?: number;
  tanggal: string;
  instansi: string;
  tentang: string;
  tanggal_berakhir?: string | null;
  link_dokumen?: string | null;
  tahun: number;
  status?: string;
  sisa_hari?: number | null;
  created_at?: string;
  updated_at?: string;
}

export async function getAllMou(tahun?: number, page = 1): Promise<ApiResponse<Mou[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  qs.push(`page=${page}`);
  const url = `${API_URL}/mou?${qs.join('&')}`;
  const response = await fetch(url, { cache: 'no-store' });
  return normalizeApiResponse<Mou[]>(response);
}

export async function getMou(id: number): Promise<Mou | null> {
  const response = await fetch(`${API_URL}/mou/${id}`, { cache: 'no-store' });
  const result = await normalizeApiResponse<Mou>(response);
  return result.data || null;
}

export async function createMou(data: Mou | FormData): Promise<ApiResponse<Mou>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/mou`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return normalizeApiResponse<Mou>(response);
}

export async function updateMou(id: number, data: Partial<Mou> | FormData): Promise<ApiResponse<Mou>> {
  const isFormData = data instanceof FormData;
  const method = isFormData ? 'POST' : 'PUT';
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }
  const response = await fetch(`${API_URL}/mou/${id}`, {
    method,
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return normalizeApiResponse<Mou>(response);
}

export async function deleteMou(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/mou/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return normalizeApiResponse<null>(response);
}

// ==========================================
// API LRA (LAPORAN REALISASI ANGGARAN)
// ==========================================

export interface LraReport {
  id?: number;
  tahun: number;
  jenis_dipa: string;
  periode: string;
  judul: string;
  file_url?: string;
  cover_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// GET - Ambil semua data LRA
export async function getAllLra(tahun?: number, page = 1): Promise<ApiResponse<LraReport[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  qs.push(`page=${page}`);
  const url = `${API_URL}/lra?${qs.join('&')}`;
  const response = await fetch(url, { cache: 'no-store' });
  return response.json();
}

// GET - Ambil satu data LRA
export async function getLra(id: number): Promise<LraReport | null> {
  const response = await fetch(`${API_URL}/lra/${id}`);
  const result: ApiResponse<LraReport> = await response.json();
  return result.data || null;
}

// POST - Tambah data LRA baru
export async function createLra(data: LraReport | FormData): Promise<ApiResponse<LraReport>> {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/lra`, {
    method: 'POST',
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// PUT - Update data LRA
export async function updateLra(id: number, data: Partial<LraReport> | FormData): Promise<ApiResponse<LraReport>> {
  const isFormData = data instanceof FormData;
  const method = isFormData ? 'POST' : 'PUT';
  if (isFormData) {
    (data as FormData).append('_method', 'PUT');
  }
  const response = await fetch(`${API_URL}/lra/${id}`, {
    method,
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
}

// DELETE - Hapus data LRA
export async function deleteLra(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_URL}/lra/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}


