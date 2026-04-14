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
    case 'Onboarding':
      return { score: 0, included: true };
    case 'On Hold':
      return { score: 0, included: true };
    case 'SW/Product Issue':
      return { score: 0, included: true };
    case 'Churned':
      return { score: 0, included: false };
    case 'Not Required':
      return { score: 0, included: false };
    default:
      // Unknown / null → excluded
      return { score: 0, included: false };
  }
}

// Determine restaurant lifecycle from its module statuses
// Returns: "Active" | "Onboarding" | "On Hold" | "Churned"
export function getLifecycle(moduleDetails) {
  let hasLive = false;
  let hasOnboarding = false;
  let hasOnHold = false;
  let hasSwIssue = false;
  let hasChurned = false;

  for (const mod of moduleDetails) {
    const s = mod.status?.trim();
    if (s === 'Live') hasLive = true;
    else if (s === 'Onboarding') hasOnboarding = true;
    else if (s === 'On Hold') hasOnHold = true;
    else if (s === 'SW/Product Issue') hasSwIssue = true;
    else if (s === 'Churned') hasChurned = true;
  }

  if (hasChurned && !hasLive && !hasOnboarding) return 'Churned';
  if (hasLive) return 'Active';
  if (hasOnboarding) return 'Onboarding';
  if (hasOnHold || hasSwIssue) return 'On Hold';
  return 'Active'; // all Not Required / null → still show as active
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

  const lifecycle = getLifecycle(moduleDetails);

  return {
    ...task,
    overall,
    health: getHealth(overall),
    categoryScores,
    moduleDetails,
    lifecycle,
  };
}

// Enrich all restaurants
export function enrichAll(tasks) {
  return tasks
    .filter(t => t.name && t.name.trim() !== '')
    .map(enrichRestaurant);
}
