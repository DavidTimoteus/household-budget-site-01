// Lumbung Keluarga — data contoh + penyimpanan.
// Satu keluarga fiktif Indonesia (Keluarga Prasetyo, Malang): ayah bekerja,
// ibu berjualan kue, dua anak sekolah. Semua angka dihitung dari transaksi
// yang sama di setiap halaman, jadi total selalu konsisten.

export const STORAGE_KEY = 'lumbung-keluarga-v1';

export const CATEGORIES = [
  { id: 'makanan', name: 'Makanan & Belanja', color: '#1d5c38' },
  { id: 'transportasi', name: 'Transportasi', color: '#b45309' },
  { id: 'rumah', name: 'Rumah & Utilitas', color: '#1d4e89' },
  { id: 'pendidikan', name: 'Pendidikan', color: '#7c3aed' },
  { id: 'kesehatan', name: 'Kesehatan', color: '#b3261e' },
  { id: 'hiburan', name: 'Hiburan', color: '#0e7490' },
  { id: 'pakaian', name: 'Pakaian', color: '#9d174d' },
  { id: 'lainnya', name: 'Lainnya', color: '#6f675a' },
];

export function categoryName(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.name : 'Lainnya';
}
export function categoryColor(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.color : '#6f675a';
}

// Bulan berjalan relatif terhadap tanggal hari ini, supaya data contoh
// selalu jatuh di bulan ini dan dua bulan sebelumnya.
export function monthKey(offset) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}
export function monthShort(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
}
export function availableMonths() {
  return [monthKey(-2), monthKey(-1), monthKey(0)];
}
export function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

let uidCounter = 1000;
function uid() {
  uidCounter += 1;
  return 't' + uidCounter + '-' + Math.floor(Math.random() * 1e6).toString(36);
}

// [hari, deskripsi, kategori, jumlah] — pengeluaran.
// [hari, deskripsi, jumlah] — pemasukan.
function buildSeed() {
  const m0 = monthKey(0);
  const m1 = monthKey(-1);
  const m2 = monthKey(-2);
  const exp = (month, rows) => rows.map(([day, desc, cat, amount]) => ({
    id: uid(), date: month + '-' + String(day).padStart(2, '0'), desc, category: cat, type: 'expense', amount,
  }));
  const inc = (month, rows) => rows.map(([day, desc, amount]) => ({
    id: uid(), date: month + '-' + String(day).padStart(2, '0'), desc, category: 'lainnya', type: 'income', amount,
  }));

  const transactions = [
    ...inc(m0, [
      [1, 'Gaji bulanan — Ayah (kantor)', 9500000],
      [10, 'Jualan kue — Ibu (pesanan minggu ini)', 2000000],
      [15, 'Uang saku tambahan dari arisan', 1000000],
    ]),
    ...exp(m0, [
      [2, 'Belanja mingguan — Pasar Besar Malang', 'makanan', 685000],
      [3, 'Bensin motor — Pertalite', 'transportasi', 120000],
      [4, 'Makan siang keluarga — warung soto', 'makanan', 145000],
      [5, 'BPJS Kesehatan keluarga', 'kesehatan', 210000],
      [6, 'Buku & alat tulis anak', 'pendidikan', 185000],
      [7, 'SPP sekolah — anak pertama', 'pendidikan', 750000],
      [8, 'Belanja mingguan — supermarket', 'makanan', 720000],
      [9, 'Ojek online — antar anak les', 'transportasi', 96000],
      [10, 'Internet rumah — IndiHome', 'rumah', 350000],
      [11, 'Langganan film keluarga', 'hiburan', 99000],
      [12, 'Belanja sayur & lauk harian', 'makanan', 210000],
      [13, 'Servis motor ringan', 'transportasi', 275000],
      [14, 'Obat flu & vitamin', 'kesehatan', 132000],
      [15, 'Token listrik PLN', 'rumah', 450000],
      [16, 'Belanja mingguan — pasar', 'makanan', 640000],
      [17, 'Nonton bioskop keluarga', 'hiburan', 320000],
      [18, 'Air PDAM', 'rumah', 180000],
      [19, 'Seragam olahraga anak', 'pakaian', 260000],
      [20, 'Makan malam — ayam geprek', 'makanan', 118000],
      [21, 'Bensin motor — Pertalite', 'transportasi', 110000],
      [22, 'Iuran RT & kebersihan', 'rumah', 50000],
      [23, 'Belanja mingguan — supermarket', 'makanan', 695000],
      [24, 'Les privat matematika anak', 'pendidikan', 400000],
      [25, 'Cicilan motor — bulan ini', 'transportasi', 850000],
    ]),
    ...inc(m1, [
      [1, 'Gaji bulanan — Ayah (kantor)', 9500000],
      [9, 'Jualan kue — Ibu', 1850000],
      [18, 'Bonus lembur Ayah', 900000],
    ]),
    ...exp(m1, [
      [2, 'Belanja mingguan — pasar', 'makanan', 660000],
      [4, 'Bensin motor', 'transportasi', 115000],
      [6, 'Makan siang keluarga', 'makanan', 138000],
      [8, 'Belanja mingguan — supermarket', 'makanan', 705000],
      [10, 'Internet rumah', 'rumah', 350000],
      [12, 'Buku paket sekolah', 'pendidikan', 420000],
      [14, 'Periksa gigi anak', 'kesehatan', 250000],
      [15, 'Token listrik PLN', 'rumah', 430000],
      [17, 'Belanja mingguan — pasar', 'makanan', 630000],
      [19, 'Baju anak — ganti ukuran', 'pakaian', 310000],
      [21, 'Bensin motor', 'transportasi', 125000],
      [23, 'Belanja mingguan — supermarket', 'makanan', 690000],
      [25, 'Cicilan motor', 'transportasi', 850000],
      [27, 'Piknik keluarga — kebun apel', 'hiburan', 285000],
      [28, 'Air PDAM', 'rumah', 175000],
      [29, 'Iuran RT & kebersihan', 'rumah', 50000],
    ]),
    ...inc(m2, [
      [1, 'Gaji bulanan — Ayah (kantor)', 9500000],
      [11, 'Jualan kue — Ibu', 1750000],
      [20, 'Jual barang bekas layak pakai', 650000],
    ]),
    ...exp(m2, [
      [2, 'Belanja mingguan — pasar', 'makanan', 640000],
      [5, 'Bensin motor', 'transportasi', 110000],
      [7, 'SPP sekolah — anak pertama', 'pendidikan', 750000],
      [9, 'Belanja mingguan — supermarket', 'makanan', 680000],
      [10, 'Internet rumah', 'rumah', 350000],
      [13, 'Servis AC ruang keluarga', 'rumah', 380000],
      [15, 'Token listrik PLN', 'rumah', 445000],
      [16, 'Belanja mingguan — pasar', 'makanan', 625000],
      [18, 'Beli sepatu sekolah anak', 'pakaian', 350000],
      [20, 'Makan malam — ulang tahun Ibu', 'makanan', 240000],
      [22, 'Bensin motor', 'transportasi', 118000],
      [24, 'Belanja mingguan — supermarket', 'makanan', 670000],
      [25, 'Cicilan motor', 'transportasi', 850000],
      [27, 'Langganan film keluarga', 'hiburan', 99000],
      [28, 'Air PDAM', 'rumah', 170000],
      [29, 'Iuran RT & kebersihan', 'rumah', 50000],
    ]),
  ];

  return {
    version: 1,
    household: 'Keluarga Prasetyo',
    transactions,
    budgets: {
      makanan: 3000000,
      transportasi: 1200000,
      rumah: 1800000,
      pendidikan: 1500000,
      kesehatan: 600000,
      hiburan: 800000,
      pakaian: 400000,
      lainnya: 500000,
    },
    bills: [
      { id: 'b1', name: 'Token listrik PLN', amount: 450000, dueDay: 20, note: 'Dibayar tiap tanggal 20', paid: [m1, m2] },
      { id: 'b2', name: 'Air PDAM', amount: 180000, dueDay: 15, note: 'Dibayar tiap tanggal 15', paid: [m1, m2] },
      { id: 'b3', name: 'Internet rumah', amount: 350000, dueDay: 10, note: 'Dibayar tiap tanggal 10', paid: [m0, m1, m2] },
      { id: 'b4', name: 'BPJS Kesehatan keluarga', amount: 210000, dueDay: 5, note: 'Dibayar tiap tanggal 5', paid: [m0, m1, m2] },
      { id: 'b5', name: 'SPP sekolah — anak pertama', amount: 750000, dueDay: 7, note: 'Dibayar tiap tanggal 7', paid: [m0, m1, m2] },
      { id: 'b6', name: 'Iuran RT & kebersihan', amount: 50000, dueDay: 10, note: 'Dibayar tiap tanggal 10', paid: [m0, m1, m2] },
      { id: 'b7', name: 'Langganan film keluarga', amount: 99000, dueDay: 12, note: 'Dibayar tiap tanggal 12', paid: [m0, m1, m2] },
      { id: 'b8', name: 'Cicilan motor', amount: 850000, dueDay: 25, note: 'Dibayar tiap tanggal 25', paid: [m1, m2] },
    ],
    goals: [
      { id: 'g1', name: 'Dana darurat', target: 25000000, saved: 14250000, note: '6x pengeluaran bulanan — jaring pengaman keluarga' },
      { id: 'g2', name: 'Liburan keluarga ke pantai', target: 8000000, saved: 3400000, note: 'Berangkat saat libur sekolah semester depan' },
      { id: 'g3', name: 'Renovasi dapur', target: 12000000, saved: 5750000, note: 'Ganti meja dapur dan rak piring' },
      { id: 'g4', name: 'Tabungan pendidikan anak', target: 30000000, saved: 9000000, note: 'Untuk biaya masuk SMP tahun depan' },
    ],
  };
}

export function seedData() {
  return buildSeed();
}

// Muat dari localStorage; kalau tidak tersedia atau rusak, pakai data contoh di memori.
export function loadData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions) && parsed.budgets && parsed.bills && parsed.goals) {
        return { data: parsed, persisted: true };
      }
    }
  } catch (err) {
    // localStorage tidak tersedia (mis. mode privat) — lanjut dengan memori.
  }
  return { data: buildSeed(), persisted: false };
}

export function saveData(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

export function clearSavedData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // abaikan — data memori tetap dipakai
  }
}

export function formatRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}
export function formatRpShort(n) {
  if (Math.abs(n) >= 1000000) return 'Rp ' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (Math.abs(n) >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
  return formatRp(n);
}
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function monthOf(iso) {
  return iso.slice(0, 7);
}
