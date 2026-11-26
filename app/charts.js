// Lumbung Keluarga — grafik SVG murni, tanpa pustaka eksternal.

export function donutSVG(segments, size) {
  // segments: [{label, value, color}] — nilai nol dilewati.
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  if (total <= 0) {
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="Belum ada pengeluaran"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#e6dcc8" stroke-width="26"/></svg>';
  }
  let offset = 0;
  const rings = segments.filter((s) => s.value > 0).map((s) => {
    const frac = s.value / total;
    const dash = Math.max(frac * c - 2, 1);
    const gap = c - dash;
    const out = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="26" stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '" stroke-dashoffset="' + (-offset).toFixed(2) + '"/>';
    offset += frac * c;
    return out;
  }).join('');
  const mid = '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="15" fill="#6f675a">Total</text>'
    + '<text x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#211d16">' + shortMoney(total) + '</text>';
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="Pengeluaran per kategori">' + rings + mid + '</svg>';
}

function shortMoney(n) {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  return 'Rp ' + Math.round(n / 1000) + ' rb';
}

export function trendSVG(months) {
  // months: [{label, income, expense}] — dua batang per bulan.
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));
  const W = 640;
  const H = 260;
  const padB = 28;
  const padT = 14;
  const plotH = H - padT - padB;
  const groupW = W / months.length;
  const barW = Math.min(34, groupW / 3.2);
  let bars = '';
  let labels = '';
  months.forEach((m, i) => {
    const cx = groupW * (i + 0.5);
    const hIn = Math.max(2, (m.income / max) * plotH);
    const hOut = Math.max(2, (m.expense / max) * plotH);
    const yBase = padT + plotH;
    bars += '<rect x="' + (cx - barW - 4).toFixed(1) + '" y="' + (yBase - hIn).toFixed(1) + '" width="' + barW + '" height="' + hIn.toFixed(1) + '" rx="4" fill="#1d5c38"><title>Pemasukan ' + m.label + ': ' + m.income.toLocaleString('id-ID') + '</title></rect>';
    bars += '<rect x="' + (cx + 4).toFixed(1) + '" y="' + (yBase - hOut).toFixed(1) + '" width="' + barW + '" height="' + hOut.toFixed(1) + '" rx="4" fill="#b45309"><title>Pengeluaran ' + m.label + ': ' + m.expense.toLocaleString('id-ID') + '</title></rect>';
    labels += '<text x="' + cx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="13" fill="#6f675a">' + m.label + '</text>';
  });
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = padT + plotH * (1 - f);
    return '<line x1="0" y1="' + y.toFixed(1) + '" x2="' + W + '" y2="' + y.toFixed(1) + '" stroke="#e6dcc8" stroke-width="1"/><text x="0" y="' + (y - 4).toFixed(1) + '" font-size="11" fill="#6f675a">' + shortMoney(max * f) + '</text>';
  }).join('');
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Tren pemasukan dan pengeluaran tiga bulan terakhir">' + grid + bars + labels + '</svg>';
}

export function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}
