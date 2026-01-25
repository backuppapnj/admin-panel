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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
}

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
