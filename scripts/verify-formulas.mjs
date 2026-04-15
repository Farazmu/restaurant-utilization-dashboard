/**
 * verify-formulas.mjs
 *
 * Clean-room reference implementation of the utilization formula.
 * Fetches live Asana data and verifies against known-correct values.
 *
 * Usage:  node scripts/verify-formulas.mjs
 */

const PAT = '2/1212068356194686/1214056328538977:f08707e168001bf874eed7e6408393c4';
const PROJECT_GID = '1214070935734743';
const BASE = 'https://app.asana.com/api/1.0';

const HEADERS = {
  Authorization: `Bearer ${PAT}`,
  Accept: 'application/json',
};

// ── Module config (copied verbatim from src/config/modules.js) ──────────────
const MODULE_CONFIG = [
  { name: 'POS',              weight: 0.1500,   category: 'Order & Pay',     fieldGid: '1214056330314166' },
  { name: 'POS - CFD',        weight: 0.0125,   category: 'Order & Pay',     fieldGid: '1214056388850355' },
  { name: 'mPOS',             weight: 0.0200,   category: 'Order & Pay',     fieldGid: '1214056388850365' },
  { name: 'KDS',              weight: 0.0125,   category: 'Order & Pay',     fieldGid: '1214056330367507' },
  { name: 'Kiosk',            weight: 0.0750,   category: 'Order & Pay',     fieldGid: '1214056466084630' },
  { name: 'Online Ordering',  weight: 0.0800,   category: 'Order & Pay',     fieldGid: '1214052916439063' },
  { name: 'QR',               weight: 0.0200,   category: 'Order & Pay',     fieldGid: '1214056330233149' },
  { name: '3PO',              weight: 0.0700,   category: 'Order & Pay',     fieldGid: '1214053092138593' },
  { name: '3PD',              weight: 0.0175,   category: 'Order & Pay',     fieldGid: '1214056330372332' },
  { name: 'Catering',         weight: 0.0175,   category: 'Order & Pay',     fieldGid: '1214053092140779' },
  { name: 'Breaks',           weight: 0.0125,   category: 'Order & Pay',     fieldGid: '1214056195867316' },
  { name: 'Tableside AI',     weight: 0.0125,   category: 'Order & Pay',     fieldGid: '1214056196054425' },
  { name: 'Guestbook/CRM',    weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056439967697' },
  { name: 'Emailers',         weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056388910588' },
  { name: 'Campaigns',        weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056196032085' },
  { name: 'Journeys',         weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056439925549' },
  { name: 'Deals',            weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056330253815' },
  { name: 'ARM',              weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056388973462' },
  { name: 'Loyalty',          weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214053092140761' },
  { name: 'Gift Cards',       weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214053128168011' },
  { name: 'Brandbook',        weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056330324642' },
  { name: 'Website Builder',  weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056195955523' },
  { name: 'Menuboards',       weight: 0.010909, category: 'Marketing (On)',  fieldGid: '1214056480045911' },
  { name: 'SM Marketing',     weight: 0.0400,   category: 'Marketing (Off)', fieldGid: '1214056388985193' },
  { name: 'CAMP',             weight: 0.0400,   category: 'Marketing (Off)', fieldGid: '1214053092140803' },
  { name: 'Payroll',          weight: 0.2500,   category: 'Payroll',         fieldGid: '1214052863237389' },
  { name: 'Shift Scheduler',  weight: 0.0100,   category: 'MoM',             fieldGid: '1214056466153122' },
  { name: 'Time Cards',       weight: 0.0100,   category: 'MoM',             fieldGid: '1214053092140678' },
  { name: 'AIO Intelligence', weight: 0.0100,   category: 'Tips + Office',   fieldGid: '1214056330314189' },
  { name: 'Tip Pooling',      weight: 0.0100,   category: 'Tips + Office',   fieldGid: '1214056330297171' },
  { name: 'Reports',          weight: 0.0100,   category: 'Tips + Office',   fieldGid: '1214056466022698' },
];

const CATEGORIES = [
  'Order & Pay',
  'Marketing (On)',
  'Marketing (Off)',
  'Payroll',
  'MoM',
  'Tips + Office',
];

// ── Clean-room formula implementation ───────────────────────────────────────

function parseStatus(status) {
  if (!status || status.trim() === '') return { score: 0, included: false };
  const s = status.trim();
  switch (s) {
    case 'Live':             return { score: 1, included: true };
    case 'Onboarding':       return { score: 0, included: true };
    case 'On Hold':          return { score: 0, included: true };
    case 'SW/Product Issue':  return { score: 0, included: true };
    case 'Not Required':     return { score: 0, included: false };
    case 'Churned':          return { score: 0, included: false };
    default:                 return { score: 0, included: false };
  }
}

function calcUtilization(modules, statuses) {
  let numerator = 0;
  let denominator = 0;
  for (const mod of modules) {
    const raw = statuses[mod.fieldGid] ?? null;
    const { score, included } = parseStatus(raw);
    if (included) {
      numerator += mod.weight * score;
      denominator += mod.weight;
    }
  }
  return denominator === 0 ? null : numerator / denominator;
}

// ── Asana fetch helpers ─────────────────────────────────────────────────────

async function fetchPage(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAllTasks() {
  const fields = [
    'name',
    'custom_fields.gid',
    'custom_fields.enum_value.name',
    'custom_fields.display_value',
    'custom_fields.name',
    'custom_fields.type',
  ].join(',');

  let all = [];
  let url = `${BASE}/projects/${PROJECT_GID}/tasks?opt_fields=${encodeURIComponent(fields)}&limit=100`;
  while (url) {
    const data = await fetchPage(url);
    all = all.concat(data.data || []);
    url = data.next_page?.uri || null;
  }
  return all;
}

// ── Main ────────────────────────────────────────────────────────────────────

const EXPECTED = [
  { search: 'flights vegas',  expected: 0.9766 },
  { search: 'tacos el compa', expected: 0.3072 },
  { search: 'laughing monk',  expected: 1.0000 },
];

async function main() {
  console.log('Fetching tasks from Asana...');
  const tasks = await fetchAllTasks();
  console.log(`Fetched ${tasks.length} tasks.\n`);

  let allPass = true;

  for (const { search, expected } of EXPECTED) {
    // Find task by case-insensitive substring
    const task = tasks.find(t =>
      (t.name || '').toLowerCase().includes(search)
    );

    if (!task) {
      console.log(`FAIL: "${search}" not found among ${tasks.length} tasks.`);
      allPass = false;
      continue;
    }

    // Build fieldGid -> status map
    const statuses = {};
    const cfMap = {};
    for (const cf of task.custom_fields || []) {
      if (cf.gid) {
        cfMap[cf.gid] = cf.enum_value?.name ?? cf.display_value ?? null;
      }
    }
    for (const mod of MODULE_CONFIG) {
      statuses[mod.fieldGid] = cfMap[mod.fieldGid] ?? null;
    }

    // Overall
    const overall = calcUtilization(MODULE_CONFIG, statuses);

    // Category sub-scores
    const catScores = {};
    for (const cat of CATEGORIES) {
      const catMods = MODULE_CONFIG.filter(m => m.category === cat);
      catScores[cat] = calcUtilization(catMods, statuses);
    }

    // Print module details
    console.log(`=== ${task.name} ===`);
    console.log('Module'.padEnd(20) + 'Status'.padEnd(20) + 'Score  Incl   Weight   W*Score');
    console.log('-'.repeat(85));

    let runNum = 0, runDen = 0;
    for (const mod of MODULE_CONFIG) {
      const raw = statuses[mod.fieldGid] ?? '(null)';
      const { score, included } = parseStatus(statuses[mod.fieldGid] ?? null);
      if (included) {
        runNum += mod.weight * score;
        runDen += mod.weight;
      }
      console.log(
        mod.name.padEnd(20) +
        String(raw).padEnd(20) +
        String(score).padEnd(7) +
        String(included).padEnd(7) +
        mod.weight.toFixed(6).padEnd(9) +
        (included ? (mod.weight * score).toFixed(6) : '-')
      );
    }

    console.log('-'.repeat(85));
    console.log(`Numerator: ${runNum.toFixed(6)}  Denominator: ${runDen.toFixed(6)}`);
    console.log(`Overall: ${overall !== null ? overall.toFixed(4) : 'N/A'}  Expected: ${expected.toFixed(4)}`);

    // Sub-category scores
    console.log('\nCategory Sub-Scores:');
    for (const cat of CATEGORIES) {
      const cs = catScores[cat];
      console.log(`  ${cat.padEnd(20)} ${cs !== null ? cs.toFixed(4) : 'N/A'}`);
    }

    // PASS / FAIL
    const diff = overall !== null ? Math.abs(overall - expected) : Infinity;
    const pass = diff < 0.0005;
    const label = pass ? 'PASS' : `FAIL (diff ${diff.toFixed(4)})`;
    console.log(`\nResult: ${label}\n`);

    if (!pass) allPass = false;
  }

  console.log(allPass ? 'All verifications PASSED.' : 'Some verifications FAILED.');
  process.exit(allPass ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
