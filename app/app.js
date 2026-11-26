// Lumbung Keluarga — router hash, state, dan semua interaksi.
// Satu file yang mengikat data.js, views.js, dan charts.js menjadi aplikasi.
import {
  loadData, saveData, clearSavedData, seedData, availableMonths, monthKey,
  monthLabel, todayISO, formatRp,
} from './data.js';
import {
  renderDashboard, renderTransactions, renderBudgets, renderBills,
  renderGoals, renderReport,
} from './views.js';

const view = document.getElementById('view');
const monthSelect = document.getElementById('monthSelect');
const resetButton = document.getElementById('resetData');

let store = loadData();
let data = store.data;
let month = monthKey(0);
let txFilter = { q: '', cat: 'semua', type: 'semua', editingId: null };
let pendingDeleteId = null;
let pendingDeleteTimer = null;

// ---- pemilih bulan ----
const months = availableMonths();
monthSelect.innerHTML = months.map((m) => '<option value="' + m + '"' + (m === month ? ' selected' : '') + '>' + monthLabel(m) + '</option>').join('');
monthSelect.addEventListener('change', () => {
  month = monthSelect.value;
  txFilter.editingId = null;
  render();
});

function persist() {
  saveData(data);
}

function route() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return hash.split('/')[0] || '';
}

function render() {
  const r = route();
  document.querySelectorAll('.mainnav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === r);
  });
  if (r === 'transaksi') view.innerHTML = renderTransactions(data, month, txFilter);
  else if (r === 'anggaran') view.innerHTML = renderBudgets(data, month);
  else if (r === 'tagihan') view.innerHTML = renderBills(data, month);
  else if (r === 'target') view.innerHTML = renderGoals(data);
  else if (r === 'laporan') view.innerHTML = renderReport(data, months);
  else view.innerHTML = renderDashboard(data, month);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => {
  txFilter.editingId = null;
  render();
});

// ---- interaksi: didelegasikan dari <main> supaya tetap jalan setelah render ulang ----
view.addEventListener('input', (e) => {
  if (e.target.id === 'q') {
    txFilter.q = e.target.value;
    refreshTxList();
  }
});

view.addEventListener('change', (e) => {
  if (e.target.id === 'fCat') { txFilter.cat = e.target.value; refreshTxList(); }
  if (e.target.id === 'fType') { txFilter.type = e.target.value; refreshTxList(); }
});

function refreshTxList() {
  // Render ulang hanya daftar + ringkasan, tapi jaga fokus kolom pencarian.
  const q = document.getElementById('q');
  const pos = q ? q.selectionStart : null;
  const hadFocus = document.activeElement === q;
  render();
  const q2 = document.getElementById('q');
  if (q2 && hadFocus) {
    q2.focus();
    try { q2.setSelectionRange(pos, pos); } catch (err) { /* abaikan */ }
  }
}

view.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;

  if (form.id === 'txForm') {
    const type = form.querySelector('input[name="txType"]:checked').value;
    const date = form.txDate.value;
    const amount = Math.round(Number(form.txAmount.value));
    const desc = form.txDesc.value.trim();
    const cat = form.txCat.value;
    if (!date || !amount || amount <= 0 || !desc) return;
    if (txFilter.editingId) {
      const t = data.transactions.find((x) => x.id === txFilter.editingId);
      if (t) {
        t.type = type; t.date = date; t.amount = amount; t.desc = desc;
        t.category = type === 'income' ? 'lainnya' : cat;
      }
      txFilter.editingId = null;
    } else {
      data.transactions.push({
        id: 't' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
        date, desc, category: type === 'income' ? 'lainnya' : cat, type, amount,
      });
    }
    persist();
    month = date.slice(0, 7);
    monthSelect.value = month;
    render();
    return;
  }

  if (form.classList.contains('budgetForm')) {
    const cat = form.dataset.cat;
    const amount = Math.round(Number(form.amount.value));
    if (Number.isFinite(amount) && amount >= 0) {
      data.budgets[cat] = amount;
      persist();
      render();
    }
    return;
  }

  if (form.classList.contains('goalForm')) {
    const goal = data.goals.find((g) => g.id === form.dataset.goal);
    const amount = Math.round(Number(form.amount.value));
    if (goal && Number.isFinite(amount) && amount > 0) {
      goal.saved += amount;
      persist();
      render();
    }
    return;
  }

  if (form.id === 'goalForm') {
    const name = form.gName.value.trim();
    const target = Math.round(Number(form.gTarget.value));
    const note = form.gNote.value.trim() || 'Target baru keluarga Prasetyo';
    if (name && Number.isFinite(target) && target > 0) {
      data.goals.push({
        id: 'g' + Date.now().toString(36),
        name, target, saved: 0, note,
      });
      persist();
      render();
    }
  }
});

view.addEventListener('click', (e) => {
  const editBtn = e.target.closest('[data-edit]');
  if (editBtn) {
    txFilter.editingId = editBtn.dataset.edit;
    render();
    const desc = document.getElementById('txDesc');
    if (desc) desc.focus();
    return;
  }
  const cancelBtn = e.target.closest('[data-cancel-edit]');
  if (cancelBtn) {
    txFilter.editingId = null;
    render();
    return;
  }
  const delBtn = e.target.closest('[data-delete]');
  if (delBtn) {
    const id = delBtn.dataset.delete;
    if (pendingDeleteId === id) {
      clearTimeout(pendingDeleteTimer);
      pendingDeleteId = null;
      data.transactions = data.transactions.filter((t) => t.id !== id);
      persist();
      render();
    } else {
      if (pendingDeleteTimer) clearTimeout(pendingDeleteTimer);
      pendingDeleteId = id;
      delBtn.textContent = 'Yakin hapus?';
      delBtn.classList.add('active');
      pendingDeleteTimer = setTimeout(() => {
        pendingDeleteId = null;
        if (delBtn.isConnected) render();
      }, 3000);
    }
    return;
  }
  const billBtn = e.target.closest('[data-bill]');
  if (billBtn) {
    const bill = data.bills.find((b) => b.id === billBtn.dataset.bill);
    if (bill) {
      const i = bill.paid.indexOf(month);
      if (i === -1) bill.paid.push(month);
      else bill.paid.splice(i, 1);
      persist();
      render();
    }
  }
});

// ---- reset data contoh ----
resetButton.addEventListener('click', () => {
  clearSavedData();
  data = seedData();
  txFilter = { q: '', cat: 'semua', type: 'semua', editingId: null };
  month = monthKey(0);
  monthSelect.value = month;
  render();
});

if (!store.persisted) {
  // localStorage tidak tersedia: data contoh tetap dipakai dari memori.
  console.info('Lumbung Keluarga: penyimpanan lokal tidak tersedia, memakai data contoh di memori.');
}

render();
