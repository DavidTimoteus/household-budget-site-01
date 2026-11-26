// Lumbung Keluarga — halaman-halaman aplikasi (HTML per rute hash).
import { CATEGORIES, categoryName, categoryColor, formatRp, formatRpShort, formatDate, monthOf, monthLabel, monthShort } from './data.js';
import { donutSVG, trendSVG, pct } from './charts.js';

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function monthSummary(data, month) {
  const tx = data.transactions.filter((t) => monthOf(t.date) === month);
  const income = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, rate: income ? Math.round(((income - expense) / income) * 100) : 0, tx };
}

export function spentByCategory(data, month) {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of data.transactions) {
    if (t.type === 'expense' && monthOf(t.date) === month) out[t.category] = (out[t.category] || 0) + t.amount;
  }
  return out;
}

function statCard(cls, label, value, delta) {
  return '<div class="card stat ' + cls + '"><div class="label">' + label + '</div><div class="value">' + value + '</div><div class="delta">' + delta + '</div></div>';
}

// ---------------- Dashboard ----------------
export function renderDashboard(data, month) {
  const s = monthSummary(data, month);
  const spent = spentByCategory(data, month);
  const totalBudget = Object.values(data.budgets).reduce((a, b) => a + b, 0);
  const segments = CATEGORIES.map((c) => ({ label: c.name, value: spent[c.id] || 0, color: c.color }));
  const topCats = [...segments].sort((a, b) => b.value - a.value).slice(0, 5);
  const recent = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const over = CATEGORIES.filter((c) => (spent[c.id] || 0) > (data.budgets[c.id] || 0));
  const unpaid = data.bills.filter((b) => !b.paid.includes(month));
  const unpaidTotal = unpaid.reduce((a, b) => a + b.amount, 0);
  const goalsSaved = data.goals.reduce((a, g) => a + g.saved, 0);
  const goalsTarget = data.goals.reduce((a, g) => a + g.target, 0);

  const alert = over.length
    ? '<div class="notice warn"><strong>Perhatian:</strong> anggaran ' + over.map((c) => esc(c.name)).join(', ') + ' sudah terlampaui bulan ini. Cek halaman <a href="#/anggaran">Anggaran</a> untuk menyesuaikan.</div>'
    : '<div class="notice"><strong>Anggaran terkendali.</strong> Semua kategori masih dalam batas bulan ' + esc(monthLabel(month)) + '.</div>';

  return '<div class="pagehead"><div><h1>Dashboard ' + esc(data.household) + '</h1>'
    + '<p>Ringkasan keuangan bulan ' + esc(monthLabel(month)) + '. Pemasukan bulan ini ' + formatRp(s.income) + ' — target keluarga Rp 12,5 jt.</p></div>'
    + '<a class="btn" href="#/transaksi">+ Catat transaksi</a></div>'
    + alert
    + '<div class="grid cols-4">'
    + statCard('income', 'Pemasukan', formatRp(s.income), 'Gaji + jualan kue + lain-lain')
    + statCard('expense', 'Pengeluaran', formatRp(s.expense), 'dari ' + s.tx.filter((t) => t.type === 'expense').length + ' transaksi bulan ini')
    + statCard('', 'Sisa bulan ini', formatRp(s.balance), s.balance >= 0 ? 'Masih tersisa untuk ditabung' : 'Pengeluaran melebihi pemasukan!')
    + statCard('saving', 'Tingkat tabungan', s.rate + '%', 'Sisa dibagi pemasukan — target keluarga 20%')
    + '</div>'
    + '<div class="grid cols-2wide" style="margin-top:16px">'
    + '<div class="card"><h2>Pengeluaran per kategori</h2><p class="sub">Bulan ' + esc(monthLabel(month)) + ' — total ' + formatRp(s.expense) + ' dari anggaran ' + formatRp(totalBudget) + '</p>'
    + '<div class="chart-wrap">' + donutSVG(segments, 190)
    + '<ul class="legend">' + topCats.map((c) => '<li><span><span class="dot" style="background:' + c.color + '"></span>' + esc(c.label) + '</span><strong>' + formatRpShort(c.value) + ' · ' + pct(c.value, s.expense) + '%</strong></li>').join('') + '</ul></div></div>'
    + '<div class="card"><h2>Yang perlu diperhatikan</h2>'
    + '<div class="rowline"><span>Tagihan belum lunas (' + unpaid.length + ' dari ' + data.bills.length + ')</span><strong class="num">' + formatRp(unpaidTotal) + '</strong></div>'
    + '<div class="rowline"><span>Target tabungan terkumpul</span><strong class="num">' + formatRpShort(goalsSaved) + ' / ' + formatRpShort(goalsTarget) + '</strong></div>'
    + '<div class="rowline"><span>Anggaran terpakai</span><strong class="num">' + pct(s.expense, totalBudget) + '% dari ' + formatRpShort(totalBudget) + '</strong></div>'
    + '<div class="progress"><span style="width:' + Math.min(100, pct(s.expense, totalBudget)) + '%"></span></div>'
    + '<p class="hint">Tagihan jatuh tempo terdekat: ' + esc(nextDueBill(data, month)) + '.</p>'
    + '<div class="btnrow"><a class="btn small secondary" href="#/tagihan">Lihat tagihan</a><a class="btn small secondary" href="#/target">Lihat target</a></div>'
    + '</div></div>'
    + '<div class="grid cols-2" style="margin-top:16px">'
    + '<div class="card"><h2>Transaksi terbaru</h2><p class="sub">Enam yang terakhir dicatat</p>'
    + recent.map((t) => '<div class="rowline"><span>' + esc(t.desc) + ' <span class="hint">· ' + formatDate(t.date) + ' · ' + esc(categoryName(t.category)) + '</span></span><span class="num ' + (t.type === 'income' ? 'in' : 'out') + '">' + (t.type === 'income' ? '+' : '−') + ' ' + formatRp(t.amount) + '</span></div>').join('')
    + '<p style="margin-top:12px"><a href="#/transaksi">Semua transaksi &rarr;</a></p></div>'
    + '<div class="card"><h2>Anggaran yang hampir habis</h2><p class="sub">Kategori dengan pemakaian tertinggi bulan ini</p>'
    + topCats.slice(0, 3).map((c) => {
        const cat = CATEGORIES.find((x) => x.name === c.label);
        const budget = data.budgets[cat.id] || 0;
        const p = pct(c.value, budget);
        const cls = p > 100 ? 'over' : p >= 80 ? 'warn' : '';
        return '<div style="margin-bottom:12px"><div class="rowline"><span>' + esc(c.label) + '</span><strong>' + formatRpShort(c.value) + ' / ' + formatRpShort(budget) + ' (' + p + '%)</strong></div><div class="progress"><span class="' + cls + '" style="width:' + Math.min(100, p) + '%"></span></div></div>';
      }).join('')
    + '<p><a href="#/anggaran">Kelola semua anggaran &rarr;</a></p></div>'
    + '</div>';
}

function nextDueBill(data, month) {
  const unpaid = data.bills.filter((b) => !b.paid.includes(month)).sort((a, b) => a.dueDay - b.dueDay);
  if (!unpaid.length) return 'semua tagihan bulan ini sudah lunas';
  const b = unpaid[0];
  return b.name + ' ' + formatRp(b.amount) + ' (tgl ' + b.dueDay + ')';
}

// ---------------- Transaksi ----------------
export function renderTransactions(data, month, filter) {
  const f = filter || { q: '', cat: 'semua', type: 'semua' };
  let list = data.transactions.filter((t) => monthOf(t.date) === month);
  if (f.cat !== 'semua') list = list.filter((t) => t.category === f.cat);
  if (f.type !== 'semua') list = list.filter((t) => t.type === f.type);
  if (f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    list = list.filter((t) => t.desc.toLowerCase().includes(q) || categoryName(t.category).toLowerCase().includes(q));
  }
  list = [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const s = monthSummary(data, month);
  const editing = filter && filter.editingId ? data.transactions.find((t) => t.id === filter.editingId) : null;

  const rows = list.length ? list.map((t) => '<tr>'
    + '<td>' + formatDate(t.date) + '</td>'
    + '<td>' + esc(t.desc) + '</td>'
    + '<td class="cat">' + (t.type === 'income' ? 'Pemasukan' : esc(categoryName(t.category))) + '</td>'
    + '<td class="num ' + (t.type === 'income' ? 'in' : 'out') + '">' + (t.type === 'income' ? '+' : '−') + ' ' + formatRp(t.amount) + '</td>'
    + '<td class="actions"><button type="button" class="btn small secondary" data-edit="' + t.id + '">Ubah</button>'
    + '<button type="button" class="btn small danger" data-delete="' + t.id + '">Hapus</button></td></tr>').join('')
    : '<tr><td colspan="5"><div class="empty">Tidak ada transaksi yang cocok dengan filter ini.</div></td></tr>';

  return '<div class="pagehead"><div><h1>Transaksi</h1>'
    + '<p>Semua pemasukan dan pengeluaran bulan ' + esc(monthLabel(month)) + '. Tambah, ubah, atau hapus — total di Dashboard, Anggaran, dan Laporan ikut berubah.</p></div></div>'
    + '<div class="grid cols-2wide">'
    + '<div class="card"><h2>' + (editing ? 'Ubah transaksi' : 'Catat transaksi baru') + '</h2>'
    + '<form id="txForm">'
    + '<fieldset class="typepick"><legend>Jenis</legend>'
    + '<label><input type="radio" name="txType" value="expense" ' + (!editing || editing.type === 'expense' ? 'checked' : '') + '> Pengeluaran</label>'
    + '<label><input type="radio" name="txType" value="income" ' + (editing && editing.type === 'income' ? 'checked' : '') + '> Pemasukan</label></fieldset>'
    + '<div class="formrow"><div class="field"><label for="txDate">Tanggal</label><input type="date" id="txDate" name="txDate" required value="' + (editing ? editing.date : month + '-26') + '"></div>'
    + '<div class="field"><label for="txAmount">Jumlah (Rp)</label><input type="number" id="txAmount" name="txAmount" min="1000" step="500" required placeholder="cth. 250000" value="' + (editing ? editing.amount : '') + '"></div></div>'
    + '<div class="field"><label for="txDesc">Keterangan</label><input type="text" id="txDesc" name="txDesc" required maxlength="80" placeholder="cth. Belanja mingguan — pasar" value="' + (editing ? esc(editing.desc) : '') + '"></div>'
    + '<div class="field"><label for="txCat">Kategori</label><select id="txCat" name="txCat">'
    + CATEGORIES.map((c) => '<option value="' + c.id + '"' + (editing && editing.category === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('')
    + '</select><span class="hint">Kategori hanya dipakai untuk pengeluaran; pemasukan selalu tercatat sebagai pemasukan.</span></div>'
    + '<div class="btnrow"><button class="btn" type="submit">' + (editing ? 'Simpan perubahan' : 'Tambah transaksi') + '</button>'
    + (editing ? '<button class="btn secondary" type="button" data-cancel-edit>Batal</button>' : '')
    + '</div></form></div>'
    + '<div class="card"><h2>Ringkasan bulan ini</h2>'
    + '<div class="rowline"><span>Pemasukan</span><strong class="num in">+ ' + formatRp(s.income) + '</strong></div>'
    + '<div class="rowline"><span>Pengeluaran</span><strong class="num out">− ' + formatRp(s.expense) + '</strong></div>'
    + '<div class="rowline"><span>Sisa</span><strong>' + formatRp(s.balance) + '</strong></div>'
    + '<div class="rowline"><span>Jumlah transaksi tampil</span><strong>' + list.length + ' dari ' + s.tx.length + '</strong></div>'
    + '<p class="hint">Data tersimpan otomatis di perangkat ini. Menghapus transaksi tidak bisa dibatalkan — gunakan tombol Hapus dua kali untuk mengonfirmasi.</p></div>'
    + '</div>'
    + '<div class="card" style="margin-top:16px"><h2>Daftar transaksi</h2>'
    + '<div class="toolbar">'
    + '<div class="field grow"><label for="q">Cari keterangan / kategori</label><input type="search" id="q" placeholder="cth. pasar, bensin, SPP" value="' + esc(f.q) + '"></div>'
    + '<div class="field"><label for="fCat">Kategori</label><select id="fCat"><option value="semua">Semua kategori</option>'
    + CATEGORIES.map((c) => '<option value="' + c.id + '"' + (f.cat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select></div>'
    + '<div class="field"><label for="fType">Jenis</label><select id="fType"><option value="semua">Semua</option><option value="income"' + (f.type === 'income' ? ' selected' : '') + '>Pemasukan</option><option value="expense"' + (f.type === 'expense' ? ' selected' : '') + '>Pengeluaran</option></select></div>'
    + '</div>'
    + '<div style="overflow-x:auto"><table class="tx"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

// ---------------- Anggaran ----------------
export function renderBudgets(data, month) {
  const spent = spentByCategory(data, month);
  const totalBudget = Object.values(data.budgets).reduce((a, b) => a + b, 0);
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);
  const cards = CATEGORIES.map((c) => {
    const b = data.budgets[c.id] || 0;
    const s = spent[c.id] || 0;
    const p = pct(s, b);
    const cls = p > 100 ? 'over' : p >= 80 ? 'warn' : '';
    const badge = p > 100 ? '<span class="badge over">Lewat ' + formatRpShort(s - b) + '</span>' : p >= 80 ? '<span class="badge warn">Hampir habis</span>' : '<span class="badge">Aman</span>';
    return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><h3><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name) + '</h3>' + badge + '</div>'
      + '<div class="rowline"><span>Terpakai</span><strong>' + formatRp(s) + ' dari ' + formatRp(b) + '</strong></div>'
      + '<div class="progress"><span class="' + cls + '" style="width:' + Math.min(100, p) + '%"></span></div>'
      + '<div class="rowline"><span>Sisa anggaran</span><strong>' + (b - s >= 0 ? formatRp(b - s) : '− ' + formatRp(s - b)) + ' (' + p + '%)</strong></div>'
      + '<form class="budgetForm" data-cat="' + c.id + '" style="margin-top:10px"><div class="addfunds"><label class="hint" for="b-' + c.id + '" style="align-self:center">Ubah anggaran</label>'
      + '<input type="number" id="b-' + c.id + '" name="amount" min="0" step="50000" value="' + b + '" aria-label="Anggaran ' + esc(c.name) + '">'
      + '<button class="btn small" type="submit">Simpan</button></div></form></div>';
  }).join('');

  return '<div class="pagehead"><div><h1>Anggaran</h1>'
    + '<p>Anggaran bulanan per kategori untuk bulan ' + esc(monthLabel(month)) + '. Ubah angka anggaran kapan saja — progress bar langsung mengikuti pemakaian dari halaman Transaksi.</p></div></div>'
    + '<div class="grid cols-3" style="margin-bottom:16px">'
    + statCard('', 'Total anggaran', formatRp(totalBudget), 'Untuk 8 kategori belanja keluarga')
    + statCard('expense', 'Terpakai bulan ini', formatRp(totalSpent), pct(totalSpent, totalBudget) + '% dari total anggaran')
    + statCard('saving', 'Sisa anggaran', formatRp(totalBudget - totalSpent), 'Ruang belanja yang masih tersedia')
    + '</div>'
    + '<div class="grid cols-3">' + cards + '</div>'
    + '<div class="card" style="margin-top:16px"><h2>Cara keluarga ini memakai anggaran</h2>'
    + '<p>Anggaran disusun di awal bulan dari gaji Rp 9,5 jt ditambah jualan kue sekitar Rp 2 jt. Makanan mendapat porsi terbesar (Rp 3 jt) karena belanja pasar mingguan untuk empat orang. Kalau satu kategori lewat, keluarga menutupnya dari sisa kategori lain — bukan dari dana darurat.</p></div>';
}

// ---------------- Tagihan ----------------
export function renderBills(data, month) {
  const total = data.bills.reduce((a, b) => a + b.amount, 0);
  const unpaid = data.bills.filter((b) => !b.paid.includes(month));
  const unpaidTotal = unpaid.reduce((a, b) => a + b.amount, 0);
  const paidTotal = total - unpaidTotal;
  const rows = [...data.bills].sort((a, b) => a.dueDay - b.dueDay).map((b) => {
    const isPaid = b.paid.includes(month);
    return '<div class="bill"><div class="who"><strong>' + esc(b.name) + '</strong><span>' + esc(b.note) + '</span></div>'
      + '<div class="amt"><strong>' + formatRp(b.amount) + '</strong>' + (isPaid ? '<span class="badge">Lunas</span>' : '<span class="badge warn">Belum lunas</span>') + '</div>'
      + '<button type="button" class="btn small ' + (isPaid ? 'secondary' : '') + '" data-bill="' + b.id + '">' + (isPaid ? 'Batalkan lunas' : 'Tandai lunas') + '</button></div>';
  }).join('');

  return '<div class="pagehead"><div><h1>Tagihan rutin</h1>'
    + '<p>Tagihan yang datang setiap bulan untuk bulan ' + esc(monthLabel(month)) + '. Tandai lunas begitu dibayar — status tersimpan dan ikut ke bulan berikutnya sebagai riwayat.</p></div></div>'
    + '<div class="grid cols-3" style="margin-bottom:16px">'
    + statCard('', 'Total tagihan / bulan', formatRp(total), data.bills.length + ' tagihan rutin')
    + statCard('income', 'Sudah lunas', formatRp(paidTotal), (data.bills.length - unpaid.length) + ' dari ' + data.bills.length + ' tagihan')
    + statCard('expense', 'Belum lunas', formatRp(unpaidTotal), unpaid.length + ' tagihan menunggu dibayar')
    + '</div>'
    + '<div class="card"><h2>Daftar tagihan</h2>' + rows + '</div>'
    + '<div class="card" style="margin-top:16px"><h2>Tips keluarga Prasetyo</h2>'
    + '<p>Semua tagihan dijadwalkan tanggal 5–25, setelah gajian tanggal 1. Listrik dan cicilan motor adalah dua tagihan terbesar; keduanya dibayar paling lambat tanggal 25 supaya tidak kena denda. Dana tagihan dipisah di awal bulan ke rekening khusus, jadi uang belanja tidak pernah terpakai untuk tagihan.</p></div>';
}

// ---------------- Target tabungan ----------------
export function renderGoals(data) {
  const totalSaved = data.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = data.goals.reduce((a, g) => a + g.target, 0);
  const cards = data.goals.map((g) => {
    const p = pct(g.saved, g.target);
    return '<div class="card goal"><div class="top"><strong>' + esc(g.name) + '</strong><span class="badge ' + (p >= 100 ? '' : 'plain') + '">' + p + '% tercapai</span></div>'
      + '<p class="sub">' + esc(g.note) + '</p>'
      + '<div class="rowline"><span>Terkumpul</span><strong>' + formatRp(g.saved) + ' dari ' + formatRp(g.target) + '</strong></div>'
      + '<div class="progress"><span style="width:' + Math.min(100, p) + '%"></span></div>'
      + '<div class="rowline"><span>Kekurangan</span><strong>' + formatRp(Math.max(0, g.target - g.saved)) + '</strong></div>'
      + '<form class="goalForm" data-goal="' + g.id + '"><div class="addfunds"><input type="number" name="amount" min="10000" step="10000" placeholder="Tambah dana (Rp)" required aria-label="Tambah dana ' + esc(g.name) + '"><button class="btn small" type="submit">Tambah dana</button></div></form></div>';
  }).join('');

  return '<div class="pagehead"><div><h1>Target tabungan</h1>'
    + '<p>Empat hal yang sedang ditabung keluarga Prasetyo. Sisa uang di akhir bulan langsung dialihkan ke sini — mulai dari dana darurat, baru liburan dan renovasi.</p></div></div>'
    + '<div class="grid cols-3" style="margin-bottom:16px">'
    + statCard('saving', 'Total terkumpul', formatRp(totalSaved), pct(totalSaved, totalTarget) + '% dari semua target')
    + statCard('', 'Total target', formatRp(totalTarget), data.goals.length + ' target aktif')
    + statCard('income', 'Kekurangan', formatRp(totalTarget - totalSaved), 'Terus menabung sedikit demi sedikit')
    + '</div>'
    + '<div class="grid cols-2">' + cards + '</div>'
    + '<div class="card" style="margin-top:16px"><h2>Buat target baru</h2>'
    + '<form id="goalForm"><div class="formrow"><div class="field"><label for="gName">Nama target</label><input type="text" id="gName" name="gName" required maxlength="60" placeholder="cth. Beli sepeda anak"></div>'
    + '<div class="field"><label for="gTarget">Jumlah target (Rp)</label><input type="number" id="gTarget" name="gTarget" min="100000" step="50000" required placeholder="cth. 3000000"></div></div>'
    + '<div class="field"><label for="gNote">Catatan (opsional)</label><input type="text" id="gNote" name="gNote" maxlength="120" placeholder="cth. Untuk hadiah ulang tahun"></div>'
    + '<div class="btnrow"><button class="btn" type="submit">Buat target</button></div></form></div>';
}

// ---------------- Laporan ----------------
export function renderReport(data, months) {
  const summaries = months.map((m) => ({ key: m, label: monthShort(m), ...monthSummary(data, m) }));
  const cur = summaries[summaries.length - 1];
  const spent = spentByCategory(data, cur.key);
  const segments = CATEGORIES.map((c) => ({ label: c.name, value: spent[c.id] || 0, color: c.color }));
  const top = [...segments].sort((a, b) => b.value - a.value).slice(0, 5);
  const avgIncome = Math.round(summaries.reduce((a, s) => a + s.income, 0) / summaries.length);
  const avgExpense = Math.round(summaries.reduce((a, s) => a + s.expense, 0) / summaries.length);
  const bestMonth = [...summaries].sort((a, b) => b.balance - a.balance)[0];
  const biggest = [...data.transactions].filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 5);

  return '<div class="pagehead"><div><h1>Laporan</h1>'
    + '<p>Tren tiga bulan terakhir keluarga Prasetyo: pemasukan stabil di kisaran Rp 12,5 jt, pengeluaran dijaga di bawah Rp 10 jt, dan sisanya masuk tabungan.</p></div></div>'
    + '<div class="grid cols-3" style="margin-bottom:16px">'
    + statCard('income', 'Rata-rata pemasukan', formatRp(avgIncome), 'Per bulan, 3 bulan terakhir')
    + statCard('expense', 'Rata-rata pengeluaran', formatRp(avgExpense), 'Per bulan, 3 bulan terakhir')
    + statCard('saving', 'Bulan paling hemat', monthLabel(bestMonth.key), 'Sisa ' + formatRp(bestMonth.balance) + ' (' + bestMonth.rate + '% ditabung)')
    + '</div>'
    + '<div class="grid cols-2wide">'
    + '<div class="card"><h2>Tren pemasukan vs pengeluaran</h2><p class="sub">Hijau = pemasukan, kunyit = pengeluaran</p>'
    + trendSVG(summaries)
    + '<div class="rowline"><span>' + esc(monthLabel(cur.key)) + ' — pemasukan</span><strong class="num in">+ ' + formatRp(cur.income) + '</strong></div>'
    + '<div class="rowline"><span>' + esc(monthLabel(cur.key)) + ' — pengeluaran</span><strong class="num out">− ' + formatRp(cur.expense) + '</strong></div>'
    + '<div class="rowline"><span>' + esc(monthLabel(cur.key)) + ' — sisa ditabung</span><strong>' + formatRp(cur.balance) + ' (' + cur.rate + '%)</strong></div></div>'
    + '<div class="card"><h2>Pengeluaran terbesar bulan ini</h2><p class="sub">Lima pengeluaran per kategori bulan ' + esc(monthLabel(cur.key)) + '</p>'
    + top.map((c) => '<div class="rowline"><span><span class="dot" style="background:' + c.color + '"></span>' + esc(c.label) + '</span><strong>' + formatRp(c.value) + ' · ' + pct(c.value, cur.expense) + '%</strong></div>').join('')
    + '<p class="hint" style="margin-top:10px">Makanan selalu jadi pos terbesar — wajar untuk keluarga empat orang yang masak di rumah.</p></div>'
    + '</div>'
    + '<div class="card" style="margin-top:16px"><h2>Pengeluaran tunggal terbesar</h2><p class="sub">Lima transaksi pengeluaran terbesar sepanjang tiga bulan terakhir</p>'
    + biggest.map((t) => '<div class="rowline"><span>' + esc(t.desc) + ' <span class="hint">· ' + formatDate(t.date) + ' · ' + esc(categoryName(t.category)) + '</span></span><strong class="num out">' + formatRp(t.amount) + '</strong></div>').join('')
    + '<p class="hint">Cicilan motor Rp 850.000 muncul tiap bulan — tagihan tetap terbesar setelah belanja makanan.</p></div>';
}
