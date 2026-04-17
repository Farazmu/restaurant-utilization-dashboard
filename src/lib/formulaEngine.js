import { MODULE_CONFIG, CATEGORIES } from '../config/modules.js';

// Status → { score, included }
export function parseStatus(status) {
  if (!status || status.trim() === '') {
    return { score: 0, included: false };
  }
  const s = status.trim();
  switch (s) {
    case 'Live':
      return { score: 1, included: true };
    case 'In Progress':
      return { score: 0, included: true };
    case 'On Hold':
      return { score: 0, included: false };
    case 'SW/Product Issue':
      return { score: 0, included: true };
    case 'Churned':
      return { score: 0, included: false };
    case 'Not Required':
      return { score: 0, included: false };
    case 'Not Applicable':
      return { score: 0, included: false };
    case 'Pending':
      return { score: 0, included: true };
    default:
      // Unknown / null → excluded
      return { score: 0, included: true };
  }
}

// Section name in Asana that marks live/active restaurants
const LIVE_SECTION = 'Live Restaurants';

// Determine restaurant lifecycle from its Asana section
// Returns: "Active" | "Onboarding" | "Other"
export function getLifecycle(moduleDetails, section) {
  if (!section) return 'Other';

  const s = section.trim().toLowerCase();

  // Only restaurants under the "Live Restaurants" section are active
  if (s === LIVE_SECTION.toLowerCase()) return 'Active';

  // Restaurants under "Onboarding" section
  if (s.includes('onboarding')) return 'Onboarding';

  // Everything else (Churned, On Hold, etc.) is excluded
  return 'Other';
}

// Weighted utilization for a subset of modules + their statuses
// Returns value 0–1 or null if no included modules
export function calcUtilization(modules, moduleStatuses) {
  let numerator = 0;
  let denominator = 0;

  for (const mod of modules) {
    const status = moduleStatuses[mod.fieldGid] ?? null;
    const { score, included } = parseStatus(status);
    if (included) {
      numerator += mod.weight * score;
      denominator += mod.weight;
    }
  }

  if (denominator === 0) return null;
  return numerator / denominator;
}

// Health label from utilization score
export function getHealth(score) {
  if (score === null) return 'N/A';
  if (score >= 0.70) return 'Healthy';
  if (score >= 0.50) return 'Moderate';
  if (score >= 0.30) return 'At Risk';
  return 'Critical';
}

// Full enrichment for one restaurant task
export function enrichRestaurant(task) {
  const overall = calcUtilization(MODULE_CONFIG, task.moduleStatuses);

  const categoryScores = {};
  for (const cat of CATEGORIES) {
    const catModules = MODULE_CONFIG.filter(m => m.category === cat);
    categoryScores[cat] = calcUtilization(catModules, task.moduleStatuses);
  }

  // Build per-module detail
  const moduleDetails = MODULE_CONFIG.map(mod => ({
    ...mod,
    status: task.moduleStatuses[mod.fieldGid] ?? null,
    ...parseStatus(task.moduleStatuses[mod.fieldGid] ?? null),
  }));

  const lifecycle = getLifecycle(moduleDetails, task.section);

  return {
    ...task,
    overall,
    health: getHealth(overall),
    categoryScores,
    moduleDetails,
    lifecycle,
  };
}

// Weighted utilization across all Marketing (On) + Marketing (Off) modules
// Returns 0–1 or null if no included modules
export function calcMarketingScore(restaurant) {
  const marketingModules = restaurant.moduleDetails.filter(
    m => m.category === 'Marketing (On)' || m.category === 'Marketing (Off)'
  );
  let numerator = 0;
  let denominator = 0;
  for (const m of marketingModules) {
    if (m.included) {
      numerator += m.weight * m.score;
      denominator += m.weight;
    }
  }
  return denominator === 0 ? null : numerator / denominator;
}

// Enrich all restaurants
export function enrichAll(tasks) {
  return tasks
    .filter(t => t.name && t.name.trim() !== '')
    .map(enrichRestaurant);
}
