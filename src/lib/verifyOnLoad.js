/**
 * verifyOnLoad.js
 *
 * Console verification report for formula engine.
 * Runs once on the first successful enrichAll, DEV mode only.
 */

let verified = false;

const EXPECTED = [
  { search: 'flights vegas',  expected: 0.9766 },
  { search: 'tacos el compa', expected: 0.3072 },
  { search: 'laughing monk',  expected: 1.0000 },
];

/**
 * Call after enrichAll completes with the enriched restaurant list.
 * Logs a verification table to the console (dev only, runs once).
 */
export function runFormulaVerification(restaurants) {
  if (verified) return;
  if (!import.meta.env.DEV) return;
  verified = true;

  console.group('%c[Formula Verification]', 'color:#6366f1;font-weight:bold');

  let found = 0;
  let passed = 0;

  for (const { search, expected } of EXPECTED) {
    const r = restaurants.find(
      rest => (rest.name || '').toLowerCase().includes(search)
    );

    if (!r) {
      console.log(
        `${search} | Not found in dataset | Expected: ${expected.toFixed(4)} | \u274c FAIL (missing)`
      );
      continue;
    }

    found++;
    const calc = r.overall;
    const diff = calc !== null ? Math.abs(calc - expected) : Infinity;
    const pass = diff < 0.0005;

    if (pass) {
      passed++;
      console.log(
        `${r.name} | Calculated: ${calc.toFixed(4)} | Expected: ${expected.toFixed(4)} | \u2705 PASS`
      );
    } else {
      console.log(
        `${r.name} | Calculated: ${calc !== null ? calc.toFixed(4) : 'N/A'} | Expected: ${expected.toFixed(4)} | \u274c FAIL (diff ${diff.toFixed(4)})`
      );
    }
  }

  const total = EXPECTED.length;
  const status = passed === total ? 'HEALTHY' : 'BROKEN';
  console.log(
    `Verified ${found}/${total} restaurants, formula engine: ${status}`
  );

  console.groupEnd();
}
