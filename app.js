/* ===========================================================
   秋秋记账 · 核心逻辑
   数据全部存在 localStorage，离线可用，无需服务器
   =========================================================== */

// ---------- 分类定义 ----------
const CATEGORIES = [
  { id: 'food',    name: '吃饭',    emoji: '🍚', color: '#e8896b' },
  { id: 'pet',     name: '宠物',    emoji: '🐱', color: '#6ab0d8' },
  { id: 'travel',  name: '出行',    emoji: '🚗', color: '#b48a5e' },
  { id: 'home',    name: '衣服家居', emoji: '👕', color: '#a07ab5' },
  { id: 'fun',     name: '娱乐',    emoji: '🎮', color: '#f0b840' },
  { id: 'social',  name: '社交',    emoji: '🎉', color: '#7bb47b' },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// ---------- 存储 ----------
const STORE_KEY = 'meowbook_records_v1';

function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function saveRecords(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

let records = loadRecords();
let selectedCat = null;

// ---------- 工具 ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function fmtMoney(n) {
  return '¥' + Number(n).toFixed(2);
}
function pad(n) { return String(n).padStart(2, '0'); }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

// ===========================================================
// 标签切换
// ===========================================================
$$('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab').forEach(b => b.classList.remove('active'));
    $$('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('#tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'stats') renderStats();
    if (btn.dataset.tab === 'list') renderList();
  });
});

// ===========================================================
// 记一笔
// ===========================================================
function renderCategoryGrid() {
  const grid = $('#categoryGrid');
  grid.innerHTML = CATEGORIES.map(c => `
    <div class="cat-item" data-id="${c.id}">
      <span class="cat-emoji">${c.emoji}</span>
      <span class="cat-name">${c.name}</span>
    </div>
  `).join('');
  grid.querySelectorAll('.cat-item').forEach(el => {
    el.addEventListener('click', () => {
      grid.querySelectorAll('.cat-item').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      selectedCat = el.dataset.id;
    });
  });
}

$('#dateInput').value = todayStr();
renderCategoryGrid();

$('#saveBtn').addEventListener('click', () => {
  const amt = parseFloat($('#amountInput').value);
  if (!amt || amt <= 0) { showToast('请输入金额喵～'); return; }
  if (!selectedCat) { showToast('选一下用途喵～'); return; }
  const rec = {
    id: Date.now(),
    amount: Math.round(amt * 100) / 100,
    category: selectedCat,
    note: $('#noteInput').value.trim(),
    date: $('#dateInput').value || todayStr(),
  };
  records.push(rec);
  saveRecords(records);
  // 重置表单
  $('#amountInput').value = '';
  $('#noteInput').value = '';
  $$('.cat-item').forEach(x => x.classList.remove('selected'));
  selectedCat = null;
  showToast('记下啦 🐾');
});

// ===========================================================
// 统计页
// ===========================================================
let currentRange = 'day';
let periodOffset = 0; // 0 = 当前，-1 = 上一期
let pieChart, barChart;

$$('.range-btn').forEach(b => {
  b.addEventListener('click', () => {
    $$('.range-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    currentRange = b.dataset.range;
    periodOffset = 0;
    renderStats();
  });
});
$('#prevPeriod').addEventListener('click', () => { periodOffset--; renderStats(); });
$('#nextPeriod').addEventListener('click', () => { if (periodOffset < 0) { periodOffset++; renderStats(); } });

// 计算当前期间的开始/结束日期 + 标签
function getPeriod() {
  const now = new Date();
  let start, end, label;
  if (currentRange === 'day') {
    const d = new Date(now); d.setDate(d.getDate() + periodOffset);
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    label = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
  } else if (currentRange === 'week') {
    const d = new Date(now); d.setDate(d.getDate() + periodOffset * 7);
    const day = d.getDay() || 7; // 周一为1
    start = new Date(d); start.setDate(d.getDate() - day + 1); start.setHours(0,0,0,0);
    end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    label = `${pad(start.getMonth()+1)}/${pad(start.getDate())} - ${pad(end.getMonth()+1)}/${pad(end.getDate())}`;
  } else if (currentRange === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
    start = d;
    end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    label = `${start.getFullYear()}年${pad(start.getMonth()+1)}月`;
  } else {
    const y = now.getFullYear() + periodOffset;
    start = new Date(y, 0, 1);
    end = new Date(y, 11, 31, 23, 59, 59);
    label = `${y}年`;
  }
  return { start, end, label };
}

function renderStats() {
  const { start, end, label } = getPeriod();
  $('#periodLabel').textContent = label;

  // 筛选
  const inRange = records.filter(r => {
    const t = new Date(r.date).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

  const total = inRange.reduce((s, r) => s + r.amount, 0);
  $('#totalAmount').textContent = fmtMoney(total);

  // 分类聚合
  const byCat = {};
  CATEGORIES.forEach(c => byCat[c.id] = 0);
  inRange.forEach(r => { byCat[r.category] = (byCat[r.category] || 0) + r.amount; });

  // 分类列表
  const listEl = $('#categoryList');
  listEl.innerHTML = CATEGORIES.map(c => {
    const amt = byCat[c.id] || 0;
    const pct = total > 0 ? (amt / total * 100) : 0;
    return `
      <div class="cat-row">
        <span class="dot" style="background:${c.color}"></span>
        <span class="name">${c.emoji} ${c.name}</span>
        <span class="pct">${pct.toFixed(1)}%</span>
        <span class="amt">${fmtMoney(amt)}</span>
      </div>
    `;
  }).join('');

  // 饼图
  const pieData = {
    labels: CATEGORIES.map(c => c.name),
    datasets: [{
      data: CATEGORIES.map(c => byCat[c.id] || 0),
      backgroundColor: CATEGORIES.map(c => c.color),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };
  if (pieChart) pieChart.destroy();
  pieChart = new Chart($('#pieChart'), {
    type: 'doughnut',
    data: pieData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label}: ${fmtMoney(ctx.raw)}` }
        }
      },
      cutout: '60%',
    },
  });

  // 柱状图：当前期间内每个时间单元的支出
  const barData = buildBarData(inRange, start, end);
  if (barChart) barChart.destroy();
  barChart = new Chart($('#barChart'), {
    type: 'bar',
    data: {
      labels: barData.labels,
      datasets: [{
        label: '支出',
        data: barData.values,
        backgroundColor: '#8b5e3c',
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8a7560', font: { size: 10 } } },
        y: { beginAtZero: true, ticks: { color: '#8a7560', font: { size: 10 } } },
      },
    },
  });
}

function buildBarData(list, start, end) {
  // 根据范围决定 X 轴粒度
  let buckets = [];
  if (currentRange === 'day') {
    // 按 6 小时分 4 段
    buckets = [
      { label: '凌晨', from: 0, to: 6 },
      { label: '上午', from: 6, to: 12 },
      { label: '下午', from: 12, to: 18 },
      { label: '晚上', from: 18, to: 24 },
    ].map(b => ({ ...b, value: 0 }));
    list.forEach(r => {
      const h = new Date(r.id).getHours();
      const b = buckets.find(x => h >= x.from && h < x.to);
      if (b) b.value += r.amount;
    });
  } else if (currentRange === 'week') {
    buckets = ['一','二','三','四','五','六','日'].map((n, i) => ({ label: '周'+n, dayIdx: i, value: 0 }));
    list.forEach(r => {
      const d = new Date(r.date);
      const idx = (d.getDay() || 7) - 1;
      buckets[idx].value += r.amount;
    });
  } else if (currentRange === 'month') {
    const days = end.getDate();
    buckets = Array.from({length: days}, (_, i) => ({ label: String(i+1), value: 0 }));
    list.forEach(r => {
      const d = new Date(r.date);
      buckets[d.getDate()-1].value += r.amount;
    });
  } else {
    buckets = Array.from({length: 12}, (_, i) => ({ label: (i+1)+'月', value: 0 }));
    list.forEach(r => {
      const d = new Date(r.date);
      buckets[d.getMonth()].value += r.amount;
    });
  }
  return { labels: buckets.map(b => b.label), values: buckets.map(b => b.value) };
}

// ===========================================================
// 明细列表
// ===========================================================
function renderList() {
  const el = $('#recordList');
  if (records.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <img src="icons/cat-sleep.svg" alt="" />
        <p>还没有记录喵～</p>
        <p>去"记一笔"开始吧</p>
      </div>`;
    return;
  }
  const sorted = [...records].sort((a, b) => b.id - a.id);
  el.innerHTML = sorted.map(r => {
    const c = CAT_MAP[r.category] || { emoji:'❓', name:'未知' };
    return `
      <div class="record-item">
        <span class="record-emoji">${c.emoji}</span>
        <div class="record-mid">
          <div class="record-cat">${c.name} <span style="color:#8a7560;font-weight:400;font-size:12px">· ${r.date}</span></div>
          ${r.note ? `<div class="record-note">${escapeHtml(r.note)}</div>` : ''}
        </div>
        <div class="record-amt">${fmtMoney(r.amount)}</div>
        <button class="record-del" data-id="${r.id}" title="删除">×</button>
      </div>
    `;
  }).join('');
  el.querySelectorAll('.record-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      if (confirm('删除这条记录吗？')) {
        records = records.filter(r => r.id !== id);
        saveRecords(records);
        renderList();
      }
    });
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
