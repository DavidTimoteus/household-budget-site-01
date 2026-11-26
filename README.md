[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/DavidTimoteus/household-budget-site-01/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/DavidTimoteus/household-budget-site-01/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

# Lumbung Keluarga — Anggaran Rumah Tangga

Entri untuk bounty make.fun **best-household-budget-site-20261126-1457**
("Make the best household budget site").

**Lumbung Keluarga** adalah aplikasi anggaran rumah tangga berbahasa Indonesia
yang berjalan penuh dari file statis, tanpa satu pun permintaan jaringan.
Keluarga contohnya fiktif — Keluarga Prasetyo dari Malang — dengan pemasukan
bulanan sekitar Rp 12,5 jt. Semua angka dihitung dari transaksi yang sama di
setiap halaman, jadi total selalu konsisten.

## Halaman (hash route, masing-masing dicapai lewat tautan)

- **Dashboard** (`#/`): ringkasan bulanan, pemasukan vs pengeluaran, tingkat
  tabungan, donat pengeluaran per kategori, tagihan yang belum lunas.
- **Transaksi** (`#/transaksi`): tambah / ubah / hapus transaksi, filter
  kategori & jenis, pencarian teks. Perubahan langsung mengubah total dan
  grafik di semua halaman.
- **Anggaran** (`#/anggaran`): anggaran per kategori dengan progress bar dan
  status aman / hampir habis / lewat; angka anggaran bisa diubah.
- **Tagihan** (`#/tagihan`): tagihan rutin bulanan dengan tanggal jatuh tempo
  dan tombol tandai lunas.
- **Target** (`#/target`): target tabungan dengan progress, tambah dana, dan
  buat target baru.
- **Laporan** (`#/laporan`): grafik tren pemasukan vs pengeluaran tiga bulan,
  kategori terbesar, dan pengeluaran tunggal terbesar.

## Cara kerja

- Data contoh dimuat dari `app/data.js`; perubahan pengguna tersimpan di
  `localStorage` (kunci `lumbung-keluarga-v1`). Kalau penyimpanan tidak
  tersedia, aplikasi tetap jalan dengan data contoh di memori.
- Grafik digambar sebagai SVG murni (`app/charts.js`) — tanpa pustaka
  eksternal, tanpa CDN, tanpa font eksternal. Semua file lokal.
- Tidak ada build step: buka `app/index.html` lewat server statis apa pun.

## Struktur

```
main.ts            program penyerahan (Node 22, pustaka standar)
vendor/            makefun-frontend.ts dari kit (tanpa diubah)
app/
  index.html       kerangka + navigasi
  style.css        gaya asli (krem hangat, hijau lumbung, kunyit)
  data.js          data contoh + penyimpanan + format Rupiah
  charts.js        grafik SVG (donat, tren)
  views.js         halaman-halaman aplikasi
  app.js           router hash + interaksi
screenshots/      4 render asli dari kode situs ini
```

## Menjalankan lokal

```sh
python3 -m http.server 8080 --directory app
```

Lalu buka `http://localhost:8080` di desktop dan di ukuran HP.

## Menyerahkan

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` menyalin `app/` dan `screenshots/` ke direktori keluaran dan
menulis `dossier.json` lewat `buildDossier` dari
`vendor/makefun-frontend.ts`.
