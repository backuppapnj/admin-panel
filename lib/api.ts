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

export async function getAllAgenda(tahun?: number, bulan?: string, page = 1): Promise<ApiResponse<AgendaPimpinan[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
  if (bulan) qs.push(`bulan=${encodeURIComponent(bulan)}`);
  qs.push(`page=${page}`);
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

export async function getAllLhkpn(tahun?: number, page = 1): Promise<ApiResponse<LhkpnReport[]>> {
  const qs: string[] = [];
  if (tahun) qs.push(`tahun=${encodeURIComponent(String(tahun))}`);
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

